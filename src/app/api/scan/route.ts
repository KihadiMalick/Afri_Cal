import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Requête invalide. Réessayez avec une photo plus petite." },
        { status: 400 }
      );
    }

    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Image requise" }, { status: 400 });
    }

    // Check base64 size (~33% overhead)
    const estimatedSizeMB = (imageBase64.length * 0.75) / (1024 * 1024);
    if (estimatedSizeMB > 4) {
      return NextResponse.json(
        { error: "Image trop grande (max 4MB). La photo a été compressée — réessayez." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY manquante. Allez sur Vercel > Settings > Environment Variables et ajoutez GEMINI_API_KEY avec votre clé Google AI Studio.",
        },
        { status: 500 }
      );
    }

    const prompt = `Tu es un expert en nutrition spécialisé dans la cuisine africaine.
Tu analyses des photos de repas pour estimer les calories, le poids et les ingrédients.
Tu connais très bien les plats d'Afrique de l'Ouest, Centrale et de l'Est.

Analyse cette photo de repas et réponds UNIQUEMENT avec ce JSON (sans markdown, sans texte avant ou après) :
{"dish_name":"nom du plat en français","ingredients":["ingrédient1","ingrédient2"],"estimated_weight_grams":300,"estimated_calories":450,"confidence":0.8}

Règles :
- dish_name : utilise le nom africain traditionnel si identifié (Thiéboudienne, Attiéké, Mafé, Fufu, Jollof...)
- estimated_weight_grams : poids total visible dans l'assiette en grammes
- estimated_calories : calories totales pour la portion visible
- confidence : ta certitude entre 0 et 1
- Si tu ne peux pas identifier le plat, donne ta meilleure estimation avec confidence faible`;

    // Call Gemini 1.5 Flash (most stable for vision tasks)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      let errorDetail = `HTTP ${geminiResponse.status}`;
      try {
        const errJson = await geminiResponse.json();
        errorDetail = errJson?.error?.message || errorDetail;
      } catch {
        errorDetail = (await geminiResponse.text().catch(() => errorDetail)) || errorDetail;
      }

      console.error("Gemini API error:", geminiResponse.status, errorDetail);

      if (geminiResponse.status === 400) {
        return NextResponse.json(
          { error: `Gemini a rejeté l'image : ${errorDetail}` },
          { status: 502 }
        );
      }
      if (geminiResponse.status === 401 || geminiResponse.status === 403) {
        return NextResponse.json(
          {
            error:
              "Clé API Gemini invalide ou expirée. Vérifiez GEMINI_API_KEY sur Vercel.",
          },
          { status: 502 }
        );
      }
      if (geminiResponse.status === 429) {
        return NextResponse.json(
          { error: "Quota Gemini dépassé. Attendez 1 minute et réessayez." },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: `Erreur Gemini ${geminiResponse.status} : ${errorDetail}` },
        { status: 502 }
      );
    }

    const data = await geminiResponse.json();

    // Check if response was blocked by safety filters
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === "SAFETY" || finishReason === "RECITATION") {
      return NextResponse.json(
        {
          error:
            "L'image a été bloquée par les filtres de sécurité Gemini. Essayez avec une photo de plat plus claire.",
        },
        { status: 502 }
      );
    }

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      const blockReason = data.promptFeedback?.blockReason;
      if (blockReason) {
        return NextResponse.json(
          { error: `Prompt bloqué par Gemini (${blockReason}). Réessayez avec une autre photo.` },
          { status: 502 }
        );
      }
      return NextResponse.json(
        { error: "Réponse IA vide. Réessayez avec une photo plus claire du plat." },
        { status: 502 }
      );
    }

    // Parse JSON from Gemini response
    let scanResult;
    try {
      let jsonText = textContent.trim();

      // Remove markdown code blocks if present
      const mdMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (mdMatch) {
        jsonText = mdMatch[1].trim();
      }

      // Extract JSON object
      const start = jsonText.indexOf("{");
      const end = jsonText.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        jsonText = jsonText.slice(start, end + 1);
      }

      scanResult = JSON.parse(jsonText);
    } catch {
      console.error("JSON parse error. Raw Gemini response:", textContent);
      return NextResponse.json(
        {
          error:
            "L'IA n'a pas renvoyé de données exploitables. Réessayez avec une photo de plat bien éclairée.",
        },
        { status: 502 }
      );
    }

    const result = {
      dish_name: String(scanResult.dish_name || "Plat non identifié"),
      ingredients: Array.isArray(scanResult.ingredients)
        ? scanResult.ingredients.map(String).slice(0, 15)
        : [],
      estimated_weight_grams:
        Math.round(Number(scanResult.estimated_weight_grams)) || 300,
      estimated_calories: Math.round(Number(scanResult.estimated_calories)) || 0,
      confidence: Math.min(1, Math.max(0, Number(scanResult.confidence) || 0.5)),
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Scan route crash:", message);
    return NextResponse.json(
      { error: `Erreur interne : ${message}` },
      { status: 500 }
    );
  }
}
