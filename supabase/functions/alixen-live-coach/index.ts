import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phase, context } = await req.json();
    const ctx = context || {};

    const distStr = (ctx.distance || 0) < 1000
      ? (ctx.distance || 0) + ' mètres'
      : (Math.round((ctx.distance || 0) / 100) / 10) + ' kilomètres';
    const durStr = Math.floor((ctx.duration || 0) / 60) + ' minutes';
    const remainCal = Math.max(0, (ctx.totalEaten || 0) - (ctx.totalBurnedBefore || 0) - (ctx.calories || 0) - (ctx.dailyTarget || 2000));

    const systemPrompt = `Tu es ALIXEN, coach sportif IA dans l'app LIXUM. Tu parles à l'utilisateur pendant son effort physique en temps réel.
Ton message sera LU À VOIX HAUTE via synthèse vocale, donc :
- Maximum 2 phrases courtes (30 mots max total).
- Ton encourageant, dynamique, jamais condescendant.
- Tutoie l'utilisateur.
- Utilise les données concrètes (distance, calories, objectif).
- Ne mets PAS d'emojis (c'est lu à voix haute).
- Ne commence pas par "Bravo" ou "Super" à chaque fois, varie les accroches.
- Si le caractère actif a un nom, mentionne-le occasionnellement comme compagnon.
- Réponds UNIQUEMENT le message à dire, rien d'autre. Pas de guillemets.`;

    const userPrompt = `Phase : ${phase}
Distance : ${distStr}
Durée : ${durStr}
Calories brûlées : ${ctx.calories || 0} kcal
Eau perdue : ${ctx.water || 0} ml
Vitesse actuelle : ${ctx.speed || 0} km/h
Vitesse moyenne : ${ctx.avgSpeed || 0} km/h
Zone d'intensité : ${ctx.zone || 'Marche'}
Répartition : ${ctx.walkPercent || 100}% marche, ${ctx.runPercent || 0}% course
Poids : ${ctx.userWeight || 70} kg
Objectif calorique journalier : ${ctx.dailyTarget || 2000} kcal
Calories mangées aujourd'hui : ${ctx.totalEaten || 0} kcal
Calories restantes à brûler pour l'objectif : ${remainCal} kcal
${ctx.userMood ? 'Humeur : ' + ctx.userMood : ''}
${ctx.charName && ctx.charName !== 'ALIXEN' ? 'Caractère actif : ' + ctx.charName : ''}
${ctx.milestone ? 'Milestone atteint : ' + ctx.milestone : ''}
${ctx.zoneFrom ? 'Changement zone : ' + ctx.zoneFrom + ' → ' + ctx.zoneTo : ''}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    let message = "";
    if (data?.content?.[0]?.text) {
      message = data.content[0].text.trim();
      // Nettoyer les guillemets si Haiku en ajoute
      message = message.replace(/^["']|["']$/g, "");
    }

    return new Response(
      JSON.stringify({ message, phase }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ALIXEN live coach error:", error);
    return new Response(
      JSON.stringify({ message: "", error: "internal" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
