import { NextRequest, NextResponse } from "next/server";

// Increase serverless function timeout (requires Vercel Pro for >10s)
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Image trop grande ou requête invalide. Réessayez avec une photo plus petite." },
        { status: 400 }
      );
    }

    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image requise" },
        { status: 400 }
      );
    }

    // Check base64 size (rough estimate: base64 is ~33% larger than binary)
    const estimatedSizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
    if (estimatedSizeMB > 5) {
      return NextResponse.json(
        { error: "Image trop grande (max 5MB). Prenez une photo en mode normal." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API Claude non configurée. Ajoutez ANTHROPIC_API_KEY dans les variables d'environnement Vercel." },
        { status: 500 }
      );
    }

    // ============================================
    // PROMPT IA - Modifiable ici pour ajuster
    // ============================================
    const systemPrompt = `Tu es un expert en nutrition spécialisé dans la cuisine africaine.
Tu analyses des photos de repas pour estimer les calories, le poids et les ingrédients.
Tu connais très bien les plats d'Afrique de l'Ouest, Centrale et de l'Est.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`;

    const userPrompt = `Analyse cette photo de repas et donne-moi les informations suivantes en JSON :
{
  "dish_name": "nom du plat identifié (en français)",
  "ingredients": ["liste", "des", "ingrédients", "visibles"],
  "estimated_weight_grams": nombre_en_grammes,
  "estimated_calories": nombre_calories_total,
  "confidence": nombre_entre_0_et_1
}

Règles :
- Si tu reconnais un plat africain, utilise son nom traditionnel (Thiéboudienne, Attiéké, Mafé, etc.)
- Estime le poids total du plat visible dans l'assiette
- Calcule les calories totales pour la portion visible
- Le score de confiance reflète ta certitude (0.9 = très sûr, 0.5 = incertain)
- Si tu ne peux pas identifier le plat, donne ta meilleure estimation
- Réponds UNIQUEMENT en JSON valide`;

    // Use Haiku for faster responses (avoids Vercel 10s timeout on free plan)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
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
                  media_type: mimeType || "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: userPrompt,
              },
            ],
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);

      // Give user-friendly error messages
      if (response.status === 401) {
        return NextResponse.json(
          { error: "Clé API Claude invalide. Vérifiez ANTHROPIC_API_KEY dans Vercel." },
          { status: 502 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Trop de requêtes. Attendez quelques secondes et réessayez." },
          { status: 502 }
        );
      }
      if (response.status === 400) {
        // Parse error for more detail
        let detail = "Image non supportée.";
        try {
          const errJson = JSON.parse(errorText);
          detail = errJson?.error?.message || detail;
        } catch { /* ignore */ }
        return NextResponse.json(
          { error: `Erreur API: ${detail}` },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: `Erreur API Claude (${response.status}). Réessayez.` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textContent = data.content?.find(
      (c: { type: string }) => c.type === "text"
    );

    if (!textContent?.text) {
      return NextResponse.json(
        { error: "Réponse IA vide. Réessayez avec une photo plus claire." },
        { status: 502 }
      );
    }

    // Parse JSON from Claude response
    let scanResult;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = textContent.text.trim();
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
      scanResult = JSON.parse(jsonText);
    } catch {
      console.error("JSON parse error:", textContent.text);
      return NextResponse.json(
        { error: "Réponse IA non valide. Réessayez." },
        { status: 502 }
      );
    }

    // Validate and sanitize response
    const result = {
      dish_name: String(scanResult.dish_name || "Plat non identifié"),
      ingredients: Array.isArray(scanResult.ingredients)
        ? scanResult.ingredients.map(String)
        : [],
      estimated_weight_grams: Number(scanResult.estimated_weight_grams) || 300,
      estimated_calories: Number(scanResult.estimated_calories) || 0,
      confidence: Math.min(1, Math.max(0, Number(scanResult.confidence) || 0.5)),
    };

    return NextResponse.json(result);
  } catch (error) {
    // Return actual error details to help debugging
    const message = error instanceof Error ? error.message : String(error);
    console.error("Scan API error:", message);
    return NextResponse.json(
      { error: `Erreur: ${message}` },
      { status: 500 }
    );
  }
}
