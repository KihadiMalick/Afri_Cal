import { NextResponse } from "next/server";

export const maxDuration = 30;

// GET /api/test-gemini
// Diagnostic endpoint: checks if GEMINI_API_KEY is set and if Gemini API is reachable
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "ERROR",
      problem: "GEMINI_API_KEY manquante",
      solution:
        "1. Allez sur aistudio.google.com → Get API key → Create API key\n2. Copiez la clé (commence par AIza...)\n3. Vercel → votre projet → Settings → Environment Variables\n4. Ajoutez GEMINI_API_KEY avec la valeur copiée\n5. Redéployez le projet",
    });
  }

  // Test Gemini connectivity with a simple text request (no image)
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Réponds uniquement avec le mot: OK" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    );

    if (!response.ok) {
      let errDetail = `HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        errDetail = errJson?.error?.message || errDetail;
      } catch {
        /* ignore */
      }

      if (response.status === 400) {
        return NextResponse.json({
          status: "ERROR",
          problem: `Gemini rejette la requête (400): ${errDetail}`,
          apiKeyConfigured: true,
          solution: "La clé API est configurée mais la requête est invalide. Vérifiez le format de la clé.",
        });
      }
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          status: "ERROR",
          problem: "Clé API invalide ou sans permissions (401/403)",
          apiKeyConfigured: true,
          keyPreview: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
          solution:
            "Votre GEMINI_API_KEY est invalide. Regénérez une nouvelle clé sur aistudio.google.com.",
        });
      }
      if (response.status === 429) {
        return NextResponse.json({
          status: "WARNING",
          problem: "Quota dépassé (429) — trop de requêtes",
          apiKeyConfigured: true,
          solution: "Attendez 1 minute avant de réessayer. Le quota gratuit est limité.",
        });
      }

      return NextResponse.json({
        status: "ERROR",
        problem: `Gemini HTTP ${response.status}: ${errDetail}`,
        apiKeyConfigured: true,
      });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "(vide)";

    return NextResponse.json({
      status: "OK",
      message: "Gemini API fonctionne correctement !",
      apiKeyConfigured: true,
      keyPreview: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
      geminiReply: replyText,
      model: "gemini-1.5-flash",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: "ERROR",
      problem: `Impossible de contacter Gemini : ${message}`,
      apiKeyConfigured: true,
      solution:
        "Vérifiez que Vercel peut faire des appels HTTP sortants. Essayez de redéployer.",
    });
  }
}
