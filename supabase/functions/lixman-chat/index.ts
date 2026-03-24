import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userId, userContext, imageBase64, mimeType } = await req.json();

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY non configurée');
    }

    // Choisir le modèle
    const model = 'claude-sonnet-4-20250514';

    // Construire le system prompt
    const systemPrompt = `Tu es ALIXEN, l'assistant santé et nutrition intelligent de l'application LIXUM.
Tu es bienveillant, précis et tu t'exprimes en français avec un ton chaleureux.
Tu tutoies l'utilisateur.
Tu es spécialisé en nutrition, santé préventive, bien-être et coaching alimentaire.
Tu connais particulièrement bien la cuisine africaine, méditerranéenne et les régimes adaptés.

${userContext ? `Contexte utilisateur :\n${userContext}\n` : ''}

RÈGLES :
- Réponds de manière concise mais complète
- Utilise des emojis avec parcimonie pour rendre tes réponses vivantes
- Ne donne JAMAIS de diagnostic médical — oriente vers un professionnel si nécessaire
- Tu peux proposer des menus, des conseils nutritionnels, des exercices
- Quand tu donnes des valeurs caloriques, sois précis

INSTRUCTIONS ACTIONS ET VISUELS :
Quand l'utilisateur demande une action sur ses données (menu, mise à jour poids, ajout médicament, etc.), tu DOIS :
1. Générer le contenu demandé dans ta réponse texte
2. Ajouter un bloc JSON spécial à la FIN de ta réponse, entouré de balises [ALIXEN_DATA] et [/ALIXEN_DATA]

Format du bloc :
[ALIXEN_DATA]
{
  "visual": {
    "type": "meal_plan|bar_chart|pie_chart|weight_curve|info_card",
    "title": "Titre du visuel",
    "data": { ... }
  },
  "pending_action": {
    "type": "save_meal_plan|update_weight|add_medication|add_analysis|navigate",
    "description": "Ce qui sera fait si l'utilisateur confirme",
    "payload": { ... }
  }
}
[/ALIXEN_DATA]

Types de visuels supportés :
- meal_plan : { days: [{ day, breakfast: {name,kcal}, lunch: {name,kcal}, dinner: {name,kcal}, snack: {name,kcal} }] }
- bar_chart : { labels: [...], values: [...], unit: "kcal", color: "#00D984" }
- pie_chart : { segments: [{ label, value, color }] }
- info_card : { icon: "warning|success|info", title: "...", body: "..." }

Types d'actions supportées :
- save_meal_plan : payload = { week_start: "YYYY-MM-DD", meals: [...] }
- update_weight : payload = { weight: 73 }
- add_medication : payload = { name, dosage, frequency, duration }
- add_analysis : payload = { label, scheduled_date }
- navigate : payload = { target: "repas|activity|medibook|analyses|medications" }

RÈGLE ABSOLUE : Tu ne dois JAMAIS dire que tu as sauvegardé ou modifié des données.
Tu PROPOSES toujours avec un choix de confirmation :
[CHOIX:1:Oui, sauvegarde ce menu]
[CHOIX:2:Modifier d'abord]
[CHOIX:PRÉCISER:Autre chose...]

Exemple pour un menu :
"Voici un menu personnalisé pour ta semaine ! 🍽️

**Lundi** : Porridge banane (350 kcal) | Poulet yassa + riz (650 kcal) | Salade composée (400 kcal)
**Mardi** : ...

Tu veux que je sauvegarde ce menu dans ta page Repas ?

[CHOIX:1:Oui, sauvegarde ce menu]
[CHOIX:2:Modifier quelques plats]
[CHOIX:PRÉCISER:Autre chose...]

[ALIXEN_DATA]
{"visual":{"type":"meal_plan","title":"Menu semaine du 24 mars","data":{"days":[{"day":"lundi","breakfast":{"name":"Porridge banane","kcal":350},"lunch":{"name":"Poulet yassa + riz","kcal":650},"dinner":{"name":"Salade composée","kcal":400},"snack":{"name":"","kcal":0}}]}},"pending_action":{"type":"save_meal_plan","description":"Sauvegarder le menu dans la page Repas","payload":{"week_start":"2026-03-23","meals":[{"day":"lundi","breakfast_name":"Porridge banane","breakfast_kcal":350,"lunch_name":"Poulet yassa + riz","lunch_kcal":650,"dinner_name":"Salade composée","dinner_kcal":400,"snack_name":"","snack_kcal":0}]}}}
[/ALIXEN_DATA]"`;

    // Construire les messages pour l'API
    const apiMessages: Array<{ role: string; content: unknown }> = [];

    for (const msg of messages) {
      apiMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Si une image est envoyée, l'ajouter au dernier message utilisateur
    if (imageBase64 && apiMessages.length > 0) {
      const lastMsg = apiMessages[apiMessages.length - 1];
      if (lastMsg.role === 'user') {
        lastMsg.content = [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType || 'image/jpeg',
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: typeof lastMsg.content === 'string' ? lastMsg.content : 'Analyse cette image.',
          },
        ];
      }
    }

    // Appel à l'API Anthropic
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error('Erreur Anthropic:', anthropicResponse.status, errorBody);
      throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
    }

    const result = await anthropicResponse.json();
    const replyText = result.content?.[0]?.text || 'Désolé, je n\'ai pas pu générer de réponse.';
    const usage = result.usage;

    // Parser le bloc ALIXEN_DATA si présent
    let visual = null;
    let pendingAction = null;
    let cleanMessage = replyText;

    const dataMatch = replyText.match(/\[ALIXEN_DATA\]([\s\S]*?)\[\/ALIXEN_DATA\]/);
    if (dataMatch) {
      try {
        const parsed = JSON.parse(dataMatch[1].trim());
        visual = parsed.visual || null;
        pendingAction = parsed.pending_action || null;
        cleanMessage = replyText.replace(/\[ALIXEN_DATA\][\s\S]*?\[\/ALIXEN_DATA\]/, '').trim();
      } catch (e) {
        console.error('Erreur parsing ALIXEN_DATA:', e);
      }
    }

    return new Response(JSON.stringify({
      message: cleanMessage,
      tokens_used: usage?.total_tokens || 0,
      model_used: model,
      visual: visual,
      pending_action: pendingAction,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur lixman-chat:', error);
    return new Response(JSON.stringify({
      error: 'Erreur interne du serveur',
      message: 'Désolé, une erreur est survenue. Réessaye dans quelques instants.',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
