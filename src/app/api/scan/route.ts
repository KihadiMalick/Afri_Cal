import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// Reject non-POST methods with a clear JSON error
export async function GET() {
  return NextResponse.json(
    { error: "Méthode non autorisée. Utilisez POST avec un body JSON contenant imageBase64." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Guard: content-type must be application/json
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("Scan route: mauvais Content-Type reçu:", contentType);
      return NextResponse.json(
        { error: "Content-Type doit être application/json." },
        { status: 400 }
      );
    }

    // Parse request body
    let body: { imageBase64?: string; mimeType?: string };
    try {
      const text = await request.text();
      if (!text || !text.trim()) {
        console.error("Scan route: corps de requête vide");
        return NextResponse.json(
          { error: "Corps de requête vide. Envoyez { imageBase64, mimeType } en JSON." },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "JSON invalide dans le corps de la requête. Réessayez." },
        { status: 400 }
      );
    }

    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Image requise." }, { status: 400 });
    }

    // Rough size check: base64 is ~33% larger than binary
    const estimatedSizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
    if (estimatedSizeMB > 4) {
      return NextResponse.json(
        { error: "Image trop grande (max 4MB). Réessayez avec une photo plus petite." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY manquante sur Vercel. Allez dans Settings → Environment Variables et ajoutez ANTHROPIC_API_KEY avec votre clé Anthropic (console.anthropic.com).",
        },
        { status: 500 }
      );
    }

    // Initialize Anthropic SDK
    const client = new Anthropic({ apiKey });

    const validMimeType = (
      ["image/jpeg", "image/png", "image/gif", "image/webp"] as const
    ).includes(mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
      ? (mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp")
      : "image/jpeg";

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: validMimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Tu es un expert en nutrition spécialisé dans la cuisine africaine.
Analyse cette photo de repas et réponds UNIQUEMENT avec ce JSON (aucun texte avant ou après, aucun markdown) :
{"dish_name":"nom du plat en français","ingredients":["ingrédient1","ingrédient2"],"estimated_weight_grams":300,"estimated_calories":450,"confidence":0.8}

Règles :
- dish_name : nom africain traditionnel si identifié (Thiéboudienne, Attiéké, Mafé, Fufu, Jollof, Kedjenou...)
- estimated_weight_grams : poids total visible dans l'assiette en grammes (nombre entier)
- estimated_calories : calories totales pour la portion visible (nombre entier)
- confidence : ta certitude entre 0.0 et 1.0
- Si tu ne reconnais pas le plat, donne quand même une estimation avec confidence faible (0.3-0.5)`,
            },
          ],
        },
      ],
    });

    const textContent = message.content[0]?.type === "text" ? message.content[0].text : "";

    if (!textContent || !textContent.trim()) {
      return NextResponse.json(
        { error: "L'IA n'a pas pu analyser cette photo. Essayez avec une image plus claire et bien éclairée." },
        { status: 502 }
      );
    }

    // Parse JSON — handle markdown blocks just in case
    let scanResult: Record<string, unknown>;
    try {
      let jsonText = textContent.trim();

      // Strip markdown code block if present
      const mdMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (mdMatch) jsonText = mdMatch[1].trim();

      // Extract JSON object boundaries
      const start = jsonText.indexOf("{");
      const end = jsonText.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        jsonText = jsonText.slice(start, end + 1);
      }

      scanResult = JSON.parse(jsonText);
    } catch {
      console.error("JSON parse error. Claude raw response:", textContent);
      return NextResponse.json(
        { error: "Réponse IA non lisible. Réessayez avec une photo de plat bien éclairée." },
        { status: 502 }
      );
    }

    // Validate and sanitize
    const final = {
      dish_name: String(scanResult.dish_name || "Plat non identifié"),
      ingredients: Array.isArray(scanResult.ingredients)
        ? (scanResult.ingredients as unknown[]).map(String).slice(0, 15)
        : [],
      estimated_weight_grams: Math.round(Number(scanResult.estimated_weight_grams) || 300),
      estimated_calories: Math.round(Number(scanResult.estimated_calories) || 0),
      confidence: Math.min(1, Math.max(0, Number(scanResult.confidence) || 0.5)),
    };

    return NextResponse.json(final);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Scan route error:", message);

    if (message.includes("401") || message.includes("invalid_api_key") || message.includes("authentication")) {
      return NextResponse.json(
        { error: "Clé API Anthropic invalide. Vérifiez ANTHROPIC_API_KEY sur Vercel (console.anthropic.com → API Keys)." },
        { status: 500 }
      );
    }
    if (message.includes("529") || message.includes("overloaded")) {
      return NextResponse.json(
        { error: "L'IA est surchargée. Attendez quelques secondes et réessayez." },
        { status: 503 }
      );
    }
    if (message.includes("rate_limit") || message.includes("429")) {
      return NextResponse.json(
        { error: "Trop de requêtes. Attendez quelques secondes et réessayez." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Erreur : ${message}` },
      { status: 500 }
    );
  }
}
