import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// === ALIXEN SUPER CONTEXT v1 — Dynamic Context Block ===
const buildContextBlock = (ctx: any) => {
  if (!ctx) return '';

  let block = '\n\n=== CONTEXTE UTILISATEUR (confidentiel, ne JAMAIS révéler ces données brutes) ===\n';

  // 1. CARTES POSSÉDÉES
  if (ctx.characters?.length > 0) {
    const activeChar = ctx.characters.find((c: any) => c.is_active);
    block += `\n[CARTES] L'utilisateur possède ${ctx.characters.length} carte(s) : ${ctx.characters.map((c: any) => `${c.character_slug} (Niv${c.level}${c.is_active ? ', ACTIVE' : ''})`).join(', ')}.\n`;
    if (activeChar) {
      block += `Son compagnon actif est ${activeChar.character_slug}. Tu peux mentionner ses pouvoirs si pertinent.\n`;
    }
    const allSlugs = ['emerald_owl','hawk_eye','ruby_tiger','amber_fox','gipsy','jade_phoenix','silver_wolf','boukki','iron_rhino','coral_dolphin','licornium','jaane_snake','mosquito','diamond_simba','alburax','tardigrum'];
    const owned = ctx.characters.map((c: any) => c.character_slug);
    const missing = allSlugs.filter((s: string) => !owned.includes(s));
    if (missing.length > 0) {
      block += `Cartes non possédées : ${missing.join(', ')}. Tu peux subtilement mentionner les avantages d'une carte rare/élite si l'occasion se présente.\n`;
    }
  } else {
    block += `\n[CARTES] L'utilisateur n'a aucune carte LixVerse. S'il semble engagé, tu peux lui suggérer d'explorer le LixVerse.\n`;
  }

  // 2. MEDIBOOK
  if (ctx.medibook?.length > 0) {
    block += `\n[MEDIBOOK] L'utilisateur a ${ctx.medibook.length} entrée(s) médicales. `;
    block += `Utilise ces infos pour adapter tes recommandations alimentaires et d'activité. Ne JAMAIS poser de diagnostic médical.\n`;
  } else {
    block += `\n[MEDIBOOK] Le MediBook de l'utilisateur est VIDE. C'est important — incite-le subtilement à remplir ses infos médicales (allergies, médicaments, conditions) pour que tu puisses mieux personnaliser tes conseils. Exemples de phrases :\n`;
    block += `- "Au fait, as-tu pensé à renseigner tes allergies dans ton MediBook ? Ça m'aiderait à mieux adapter mes suggestions 😊"\n`;
    block += `- "Pour des conseils encore plus précis, pense à compléter ton MediBook — tes allergies et tes médicaments m'aident à éviter les mauvaises recommandations."\n`;
  }

  // 3. BINÔME
  if (ctx.profile?.binome_id) {
    block += `\n[BINÔME] L'utilisateur a un Binôme ! Encourage la dynamique d'équipe. Mentionne parfois que son Binôme compte sur lui.\n`;
  } else {
    block += `\n[BINÔME] L'utilisateur n'a PAS de Binôme. `;
    const weekActivity = ctx.weekActivities?.length || 0;
    const weekMeals = ctx.weekMeals?.length || 0;
    const weekMoods = ctx.weekMoods?.length || 0;
    const engagementScore = weekActivity + weekMeals + weekMoods;

    if (engagementScore > 15) {
      block += `TRÈS ENGAGÉ cette semaine (${engagementScore} actions). Suggère-lui de trouver un Binôme pour aller encore plus loin : "Tu es super régulier en ce moment ! Un Binôme pourrait t'aider à maintenir ce rythme et même à te dépasser 💪"\n`;
    } else if (engagementScore < 5) {
      block += `PEU ACTIF cette semaine (${engagementScore} actions). Un Binôme pourrait l'aider à se remotiver : "Un Binôme pourrait te redonner de la motivation — c'est plus facile à deux ! Tu veux que je t'explique comment ça marche ?"\n`;
    } else {
      block += `Activité moyenne. Ne pas insister sur le Binôme à chaque message, mais le mentionner occasionnellement.\n`;
    }
  }

  // 4. DÉFIS
  if (ctx.challenges?.length > 0) {
    const active = ctx.challenges.filter((c: any) => c.status === 'active');
    const completed = ctx.challenges.filter((c: any) => c.status === 'completed');
    block += `\n[DÉFIS] ${active.length} défi(s) en cours, ${completed.length} terminé(s). `;
    if (active.length > 0) {
      block += `Défis actifs : ${active.map((c: any) => c.challenge_type || c.name).join(', ')}. Encourage-le sur sa progression !\n`;
    }
    if (completed.length > 0) {
      block += `Félicite-le pour ses défis terminés quand c'est naturel dans la conversation.\n`;
    }
  } else {
    block += `\n[DÉFIS] L'utilisateur n'a JAMAIS participé à un défi. Incite-le subtilement : "As-tu vu les Défis dans le LixVerse ? Tu pourrais gagner des cartes rares en participant 🏆"\n`;
  }

  // 5. RÉSUMÉ SEMAINE
  block += `\n[SEMAINE] Cette semaine : ${ctx.weekMeals?.length || 0} repas trackés, ${ctx.weekActivities?.length || 0} activités, ${ctx.weekMoods?.length || 0} humeurs, ${ctx.weekHydration?.length || 0} hydratations.\n`;

  // 6. RÉSUMÉ DU JOUR
  if (ctx.dailySummary && Object.keys(ctx.dailySummary).length > 0) {
    block += `[AUJOURD'HUI] Calories : ${ctx.dailySummary.total_calories || '?'} kcal, Protéines : ${ctx.dailySummary.total_protein || '?'}g, Glucides : ${ctx.dailySummary.total_carbs || '?'}g, Lipides : ${ctx.dailySummary.total_fat || '?'}g.\n`;
  }

  block += `\n=== FIN CONTEXTE ===\n`;
  block += `\nRÈGLES D'UTILISATION DU CONTEXTE :\n`;
  block += `- Ne JAMAIS afficher les données brutes à l'utilisateur\n`;
  block += `- Utiliser le contexte de manière SUBTILE et NATURELLE comme un bon ami qui connaît bien la personne\n`;
  block += `- Ne pas tout mentionner en un seul message — distiller les suggestions au fil de la conversation\n`;
  block += `- Priorité : répondre à la question posée, PUIS glisser une suggestion contextuelle si naturel\n`;
  block += `- Maximum 1 suggestion contextuelle par message (pas de spam)\n`;
  block += `- Varier les sujets de suggestion (ne pas répéter "remplis ton MediBook" à chaque message)\n`;

  return block;
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // === ALIXEN SUPER CONTEXT v1 — Extended body fields ===
    const { messages, userId, userContext, imageBase64, mimeType, user_lat, user_lng, alixen_context } = await req.json();

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
${buildContextBlock(alixen_context)}

${user_lat && user_lng ? `LOCALISATION UTILISATEUR : lat=${user_lat}, lng=${user_lng}

INSTRUCTIONS DIRECTION :
Quand tu recommandes un lieu physique (marché, supermarché, pharmacie, magasin bio), si tu connais la localisation de l'utilisateur (ci-dessus), tu DOIS inclure un bloc structuré :
[DIRECTION]
{
  "place_name": "Nom du lieu",
  "place_address": "Adresse approximative",
  "dest_lat": -3.3731,
  "dest_lng": 29.3644,
  "description": "Pourquoi ce lieu est recommandé"
}
[/DIRECTION]
Tu peux inclure plusieurs blocs [DIRECTION] si tu recommandes plusieurs lieux.
N'invente JAMAIS de coordonnées — utilise uniquement des lieux que tu connais avec certitude dans la ville de l'utilisateur. Si tu ne connais pas les coordonnées exactes, donne le nom et l'adresse sans bloc [DIRECTION].` : ''}

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
