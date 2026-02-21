import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide. Réessayez." },
      { status: 400 }
    );
  }

  const { imageBase64, mimeType } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "Image requise." }, { status: 400 });
  }

  // 2. Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Clé manquante : ajoutez GEMINI_API_KEY dans Vercel > Settings > Environment Variables (obtenez la clé sur aistudio.google.com).",
      },
      { status: 500 }
    );
  }

  // 3. Build prompt
  const prompt = `Tu es un expert en nutrition africaine. Analyse cette photo de repas.
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après :
{"dish_name":"nom du plat","ingredients":["ing1","ing2"],"estimated_weight_grams":300,"estimated_calories":450,"confidence":0.8}
- dish_name en français (nom africain si possible : Thiéboudienne, Attiéké, Mafé, Fufu, Jollof...)
- estimated_weight_grams : poids visible en grammes
- estimated_calories : calories totales de la portion
- confidence : entre 0.0 et 1.0`;

  // 4. Call Gemini REST API
  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );
  } catch (networkErr) {
    const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
    return NextResponse.json(
      { error: `Impossible de contacter Gemini : ${msg}` },
      { status: 502 }
    );
  }

  // 5. Handle Gemini error responses
  if (!geminiRes.ok) {
    let detail = `HTTP ${geminiRes.status}`;
    try {
      const errBody = await geminiRes.json();
      detail = errBody?.error?.message ?? detail;
    } catch { /* ignore */ }

    if (geminiRes.status === 400) {
      return NextResponse.json(
        { error: `Gemini a rejeté la requête (400) : ${detail}` },
        { status: 502 }
      );
    }
    if (geminiRes.status === 401 || geminiRes.status === 403) {
      return NextResponse.json(
        { error: "Clé API Gemini invalide ou sans permission. Vérifiez GEMINI_API_KEY sur Vercel." },
        { status: 502 }
      );
    }
    if (geminiRes.status === 429) {
      return NextResponse.json(
        { error: "Quota Gemini dépassé. Attendez 1 minute et réessayez." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: `Erreur Gemini ${geminiRes.status} : ${detail}` },
      { status: 502 }
    );
  }

  // 6. Extract text from response
  let geminiData: Record<string, unknown>;
  try {
    geminiData = await geminiRes.json();
  } catch {
    return NextResponse.json(
      { error: "Réponse Gemini illisible. Réessayez." },
      { status: 502 }
    );
  }

  // Check for safety block
  const finishReason = (geminiData as { candidates?: { finishReason?: string }[] })
    ?.candidates?.[0]?.finishReason;
  if (finishReason === "SAFETY") {
    return NextResponse.json(
      { error: "Photo bloquée par les filtres Gemini. Essayez avec une autre image." },
      { status: 502 }
    );
  }

  const rawText = (
    geminiData as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    }
  )?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText?.trim()) {
    return NextResponse.json(
      { error: "L'IA n'a pas pu analyser cette photo. Prenez une photo plus claire et bien éclairée." },
      { status: 502 }
    );
  }

  // 7. Parse JSON from Gemini text
  let scanResult: Record<string, unknown>;
  try {
    let jsonText = rawText.trim();
    // Strip markdown code blocks if present
    const mdMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (mdMatch) jsonText = mdMatch[1].trim();
    // Find JSON object boundaries
    const s = jsonText.indexOf("{");
    const e = jsonText.lastIndexOf("}");
    if (s !== -1 && e !== -1) jsonText = jsonText.slice(s, e + 1);
    scanResult = JSON.parse(jsonText);
  } catch {
    return NextResponse.json(
      { error: "Réponse IA non structurée. Réessayez avec une photo de repas bien visible." },
      { status: 502 }
    );
  }

  // 8. Sanitize and return
  return NextResponse.json({
    dish_name: String(scanResult.dish_name || "Plat non identifié"),
    ingredients: Array.isArray(scanResult.ingredients)
      ? (scanResult.ingredients as unknown[]).map(String).slice(0, 15)
      : [],
    estimated_weight_grams: Math.round(Number(scanResult.estimated_weight_grams) || 300),
    estimated_calories: Math.round(Number(scanResult.estimated_calories) || 0),
    confidence: Math.min(1, Math.max(0, Number(scanResult.confidence) || 0.5)),
  });
}
