import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const maxDuration = 60;

// Reject non-POST methods with a clear JSON error (prevents empty 405 from infra)
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY manquante sur Vercel. Allez dans Settings → Environment Variables et ajoutez GEMINI_API_KEY avec votre clé Google AI Studio (aistudio.google.com).",
        },
        { status: 500 }
      );
    }

    // Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    });

    const prompt = `Tu es un expert en nutrition spécialisé dans la cuisine africaine.
Analyse cette photo de repas et réponds UNIQUEMENT avec ce JSON (aucun texte avant ou après, aucun markdown) :
{"dish_name":"nom du plat en français","ingredients":["ingrédient1","ingrédient2"],"estimated_weight_grams":300,"estimated_calories":450,"confidence":0.8}

Règles :
- dish_name : nom africain traditionnel si identifié (Thiéboudienne, Attiéké, Mafé, Fufu, Jollof, Kedjenou...)
- estimated_weight_grams : poids total visible dans l'assiette en grammes (nombre entier)
- estimated_calories : calories totales pour la portion visible (nombre entier)
- confidence : ta certitude entre 0.0 et 1.0
- Si tu ne reconnais pas le plat, donne quand même une estimation avec confidence faible (0.3-0.5)`;

    // Call Gemini with the image
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: (mimeType as "image/jpeg" | "image/png" | "image/webp") || "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const textContent = response.text();

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
      console.error("JSON parse error. Gemini raw response:", textContent);
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

    // Give user-friendly messages for common SDK errors
    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json(
        { error: "Clé API Gemini invalide. Vérifiez GEMINI_API_KEY sur Vercel (aistudio.google.com → Get API key)." },
        { status: 500 }
      );
    }
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Quota Gemini dépassé. Attendez 1 minute et réessayez." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Erreur : ${message}` },
      { status: 500 }
    );
  }
}
