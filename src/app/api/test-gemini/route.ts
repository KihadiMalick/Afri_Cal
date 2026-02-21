import { NextResponse } from "next/server";

export const maxDuration = 30;

// GET /api/test-gemini — Diagnostic, ouvrez dans le navigateur
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "ERREUR",
      probleme: "GEMINI_API_KEY manquante sur Vercel",
      solution: [
        "1. aistudio.google.com → Se connecter",
        "2. 'Get API key' → 'Create API key' → Copier la clé (AIza...)",
        "3. vercel.com → votre projet → Settings → Environment Variables",
        "4. Ajouter: Name=GEMINI_API_KEY, Value=AIza...",
        "5. Cocher Production + Preview + Development → Save",
        "6. Deployments → ... → Redeploy",
      ],
    });
  }

  // Test with a simple text request (no image)
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Réponds uniquement avec le mot FONCTIONNE" }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    );
  } catch (err) {
    return NextResponse.json({
      status: "ERREUR",
      probleme: `Impossible de joindre Gemini : ${err instanceof Error ? err.message : err}`,
      cle_presente: true,
    });
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j?.error?.message ?? detail;
    } catch { /* ignore */ }

    return NextResponse.json({
      status: "ERREUR",
      probleme: detail,
      cle_presente: true,
      apercu_cle: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
      solution:
        res.status === 401 || res.status === 403
          ? "La clé API est invalide. Régénérez-en une sur aistudio.google.com."
          : "Vérifiez votre clé et réessayez.",
    });
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(vide)";

  return NextResponse.json({
    status: "OK",
    message: "Gemini fonctionne ! Le scan devrait marcher.",
    cle_presente: true,
    apercu_cle: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
    reponse_gemini: reply.trim(),
  });
}
