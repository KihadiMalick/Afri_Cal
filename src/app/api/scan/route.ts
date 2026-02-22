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

    // ─── AfriCalo Vision AI prompt: priority dish recognition ───
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
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
              text: `Tu es AfriCalo Vision AI, specialiste cuisine africaine. JSON STRICT, rien d'autre.

Etape 1: Qualite image. Si floue/sombre/coupee: {"image_quality":"insufficient"} et STOP.
Etape 2: Reconnais le PLAT GLOBALEMENT (dressage, sauce, huile, couleur riz, decoupes, regroupements, indices regionaux).
Etape 3: Extrais les ingredients VISIBLES uniquement (max 8).
Etape 4: Analyse visuelle (huile, sauce, friture, grillades).
Etape 5: Estime portion et remplissage assiette.

Format:
{"image_quality":"good","dish_name":"nom|null","confidence":0,"country_guess":"pays|null","ingredients":[{"name":"","estimated_quantity_grams":0,"confidence":0}],"visual_properties":{"oil_level":"low|medium|high","sauce_presence":false,"fried_elements":false,"grilled_elements":false},"portion_size":"small|medium|large","plate_fill_percentage":0}

Regles:
- dish_name: nom africain/local si reconnu, null si confidence<60
- confidence: 0-100
- country_guess: Senegal, Cote d'Ivoire, Cameroun, Mali, Nigeria, Guinee, Burkina, Togo, Benin, Congo, Ghana, ou null
- ingredients: VISIBLES uniquement, francais simple, max 8
- estimated_quantity_grams: grammes par ingredient
- Jamais de calories/macros dans la reponse
- Aucun texte hors JSON`,
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

    // ─── Handle insufficient image quality early return ───
    const imageQuality = scanResult.image_quality === "insufficient" ? "insufficient" : "good";
    if (imageQuality === "insufficient") {
      return NextResponse.json({
        image_quality: "insufficient",
        dish_name: null,
        confidence: 0,
        country_guess: null,
        ingredients: [],
        visual_properties: {
          oil_level: "low",
          sauce_presence: false,
          fried_elements: false,
          grilled_elements: false,
        },
        portion_size: "medium",
        plate_fill_percentage: 0,
      });
    }

    // ─── Validate and sanitize the structured result ───

    const rawIngredients = Array.isArray(scanResult.ingredients)
      ? (scanResult.ingredients as Record<string, unknown>[])
      : [];

    const ingredients = rawIngredients
      .slice(0, 8)
      .map((ing) => ({
        name: String(ing.name || "inconnu"),
        estimated_quantity_grams: Math.max(5, Math.round(Number(ing.estimated_quantity_grams) || 30)),
        confidence: Math.min(100, Math.max(0, Math.round(Number(ing.confidence) || 50))),
      }));

    const dishConfidence = Math.min(
      100,
      Math.max(0, Math.round(Number(scanResult.confidence) || 0))
    );

    const dishName =
      dishConfidence >= 60 && typeof scanResult.dish_name === "string" && scanResult.dish_name.trim()
        ? scanResult.dish_name.trim()
        : null;

    const countryGuess =
      typeof scanResult.country_guess === "string" && scanResult.country_guess.trim()
        ? scanResult.country_guess.trim()
        : null;

    // Validate visual_properties
    const rawVisual = (scanResult.visual_properties || {}) as Record<string, unknown>;
    const oilLevel = ["low", "medium", "high"].includes(String(rawVisual.oil_level))
      ? (String(rawVisual.oil_level) as "low" | "medium" | "high")
      : "low";

    const visualProperties = {
      oil_level: oilLevel,
      sauce_presence: rawVisual.sauce_presence === true,
      fried_elements: rawVisual.fried_elements === true,
      grilled_elements: rawVisual.grilled_elements === true,
    };

    // Validate portion_size
    const portionSize = ["small", "medium", "large"].includes(String(scanResult.portion_size))
      ? (String(scanResult.portion_size) as "small" | "medium" | "large")
      : "medium";

    const plateFillPercentage = Math.min(
      100,
      Math.max(0, Math.round(Number(scanResult.plate_fill_percentage) || 50))
    );

    const final = {
      image_quality: "good" as const,
      dish_name: dishName,
      confidence: dishConfidence,
      country_guess: countryGuess,
      ingredients,
      visual_properties: visualProperties,
      portion_size: portionSize,
      plate_fill_percentage: plateFillPercentage,
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
