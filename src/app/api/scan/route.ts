import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image requise" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API Claude non configurée" },
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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
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
      console.error("Claude API error:", errorText);
      return NextResponse.json(
        { error: "Erreur API Claude Vision" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textContent = data.content?.find(
      (c: { type: string }) => c.type === "text"
    );

    if (!textContent?.text) {
      return NextResponse.json(
        { error: "Réponse IA vide" },
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
        { error: "Réponse IA non valide" },
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
    console.error("Scan API error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
