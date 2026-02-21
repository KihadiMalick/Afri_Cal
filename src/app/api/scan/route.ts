import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// Reject non-POST methods with a clear JSON error
export async function GET() {
  return NextResponse.json(
    { error: "Methode non autorisee. Utilisez POST avec un body JSON contenant imageBase64." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Guard: content-type must be application/json
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.error("Scan route: mauvais Content-Type recu:", contentType);
      return NextResponse.json(
        { error: "Content-Type doit etre application/json." },
        { status: 400 }
      );
    }

    // Parse request body
    let body: { imageBase64?: string; mimeType?: string };
    try {
      const text = await request.text();
      if (!text || !text.trim()) {
        console.error("Scan route: corps de requete vide");
        return NextResponse.json(
          { error: "Corps de requete vide. Envoyez { imageBase64, mimeType } en JSON." },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "JSON invalide dans le corps de la requete. Reessayez." },
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
        { error: "Image trop grande (max 4MB). Reessayez avec une photo plus petite." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ANTHROPIC_API_KEY manquante sur Vercel. Allez dans Settings > Environment Variables et ajoutez ANTHROPIC_API_KEY.",
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
      max_tokens: 1024,
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
              text: `Tu es un expert en nutrition specialise dans la cuisine africaine et internationale.
Analyse cette photo de repas et reponds UNIQUEMENT avec ce JSON (aucun texte avant ou apres, aucun markdown) :

{
  "detected_meal_name": "nom du plat",
  "ingredients_detected": [
    {
      "name": "nom ingredient en francais",
      "confidence": 0.85,
      "estimated_ratio": 0.4,
      "texture_type": "dry"
    }
  ],
  "estimated_total_weight_grams": 350,
  "portion_size": "medium",
  "confidence": 0.8
}

Regles strictes :
- detected_meal_name : nom africain traditionnel si identifie (Thieboudienne, Attieke, Mafe, Fufu, Jollof, Kedjenou, Ndole, Yassa...) sinon nom generique en francais
- ingredients_detected : TOUS les ingredients visibles, chacun avec :
  - name : nom en francais simple (ex: "riz blanc", "poulet", "oignon", "huile de palme", "tomate")
  - confidence : ta certitude 0.0-1.0 pour cet ingredient
  - estimated_ratio : fraction du plat total occupee par cet ingredient (0.0-1.0, la somme doit etre proche de 1.0)
  - texture_type : "oily" (frit/huileux), "dry" (sec/grille), "saucy" (en sauce/liquide), "mixed" (melange)
- estimated_total_weight_grams : poids total visible en grammes (nombre entier)
- portion_size : "small" (< 250g), "medium" (250-400g), "large" (> 400g)
- confidence : ta certitude globale 0.0-1.0
- Si huile/beurre/friture visible, TOUJOURS inclure un ingredient huile/beurre avec sa portion
- Si sauce visible, inclure la sauce comme ingredient
- Minimum 3 ingredients, maximum 12
- Les ratios doivent totaliser approximativement 1.0`,
            },
          ],
        },
      ],
    });

    const textContent = message.content[0]?.type === "text" ? message.content[0].text : "";

    if (!textContent || !textContent.trim()) {
      return NextResponse.json(
        { error: "L'IA n'a pas pu analyser cette photo. Essayez avec une image plus claire." },
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
        { error: "Reponse IA non lisible. Reessayez avec une photo de plat bien eclairee." },
        { status: 502 }
      );
    }

    // Validate and sanitize the structured result
    const rawIngredients = Array.isArray(scanResult.ingredients_detected)
      ? (scanResult.ingredients_detected as Record<string, unknown>[])
      : [];

    const ingredients = rawIngredients
      .slice(0, 12)
      .map((ing) => ({
        name: String(ing.name || "inconnu"),
        confidence: Math.min(1, Math.max(0, Number(ing.confidence) || 0.5)),
        estimated_ratio: Math.min(1, Math.max(0, Number(ing.estimated_ratio) || 0.1)),
        texture_type: (["oily", "dry", "saucy", "mixed"] as const).includes(
          ing.texture_type as "oily" | "dry" | "saucy" | "mixed"
        )
          ? (ing.texture_type as "oily" | "dry" | "saucy" | "mixed")
          : "mixed" as const,
      }));

    // Normalize ratios so they sum to 1.0
    const ratioSum = ingredients.reduce((s, i) => s + i.estimated_ratio, 0);
    if (ratioSum > 0) {
      for (const ing of ingredients) {
        ing.estimated_ratio = ing.estimated_ratio / ratioSum;
      }
    }

    const portionSize = (["small", "medium", "large"] as const).includes(
      scanResult.portion_size as "small" | "medium" | "large"
    )
      ? (scanResult.portion_size as "small" | "medium" | "large")
      : "medium" as const;

    const final = {
      detected_meal_name: String(scanResult.detected_meal_name || "Plat non identifie"),
      ingredients_detected: ingredients,
      estimated_total_weight_grams: Math.round(
        Number(scanResult.estimated_total_weight_grams) || 300
      ),
      portion_size: portionSize,
      confidence: Math.min(1, Math.max(0, Number(scanResult.confidence) || 0.5)),
    };

    return NextResponse.json(final);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Scan route error:", message);

    if (message.includes("401") || message.includes("invalid_api_key") || message.includes("authentication")) {
      return NextResponse.json(
        { error: "Cle API Anthropic invalide. Verifiez ANTHROPIC_API_KEY sur Vercel." },
        { status: 500 }
      );
    }
    if (message.includes("529") || message.includes("overloaded")) {
      return NextResponse.json(
        { error: "L'IA est surchargee. Attendez quelques secondes et reessayez." },
        { status: 503 }
      );
    }
    if (message.includes("rate_limit") || message.includes("429")) {
      return NextResponse.json(
        { error: "Trop de requetes. Attendez quelques secondes et reessayez." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Erreur : ${message}` },
      { status: 500 }
    );
  }
}
