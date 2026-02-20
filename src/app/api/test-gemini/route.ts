import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

// GET /api/test-gemini
// Visite cette URL dans le navigateur pour diagnostiquer la configuration Gemini
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "❌ ERREUR",
      probleme: "GEMINI_API_KEY manquante",
      solution: [
        "1. Allez sur https://aistudio.google.com",
        "2. Cliquez 'Get API key' → 'Create API key'",
        "3. Copiez la clé (commence par AIza...)",
        "4. Vercel → votre projet → Settings → Environment Variables",
        "5. Ajoutez: GEMINI_API_KEY = AIza...",
        "6. Redéployez: Deployments → ... → Redeploy",
      ],
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent("Réponds uniquement avec le mot: FONCTIONNE");
    const text = result.response.text();

    return NextResponse.json({
      status: "✅ OK",
      message: "Gemini API fonctionne correctement ! Le scan devrait marcher.",
      cle_configuree: true,
      apercu_cle: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
      reponse_gemini: text.trim(),
      modele: "gemini-1.5-flash",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("API_KEY_INVALID") || message.includes("API key")) {
      return NextResponse.json({
        status: "❌ ERREUR",
        probleme: "Clé API invalide",
        cle_configuree: true,
        apercu_cle: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
        solution: "Régénérez une nouvelle clé sur aistudio.google.com et mettez-la à jour sur Vercel.",
      });
    }
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json({
        status: "⚠️ QUOTA",
        probleme: "Quota dépassé - trop de requêtes",
        cle_configuree: true,
        solution: "Attendez 1 minute et réessayez. Le plan gratuit a des limites par minute.",
      });
    }

    return NextResponse.json({
      status: "❌ ERREUR",
      probleme: message,
      cle_configuree: true,
    });
  }
}
