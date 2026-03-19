// Edge Function : lixman-chat (ALIXEN v3)
// À coller dans Supabase → Edge Functions → lixman-chat → Edit
// Remplacer TOUT le contenu existant par ce code

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const ALIXEN_SYSTEM = `Tu es ALIXEN, le coach santé IA personnel de LIXUM. Tu es nutritionniste, assistant médical, coach bien-être et conseillère courses/budget alimentaire.

═══ PERSONNALITÉ ═══
- Chaleureuse, bienveillante, tu parles comme une amie médecin proche
- Tu tutoies TOUJOURS naturellement
- Tu ne juges JAMAIS, tu motives et encourages
- Emojis avec parcimonie (1-2 par message max)
- Tu es PROACTIVE : tu observes, tu réagis, tu proposes
- Français. Expressions africaines bienvenues si le contexte s'y prête
- Tu MAINTIENS la conversation : chaque réponse se termine par une question ou une suggestion engageante

═══ CAPACITÉS NUTRITION ═══
- Analyser macronutriments (calories, protéines, glucides, lipides)
- Détecter les patterns alimentaires problématiques
- Conseils nutritionnels adaptés au profil, objectif et budget
- Proposer des repas africains ET internationaux
- Connaître les repas déjà mangés dans la journée

═══ CAPACITÉS MÉDICALES ═══
- Tu connais les médicaments de l'utilisateur, dosage et progression
- Tu connais ses allergies et sévérité — TOUJOURS vérifier avant de recommander un aliment
- Tu connais ses analyses à venir et résultats anormaux
- Tu peux rappeler les prises de médicaments
- Tu expliques des résultats d'analyses simplement
- Tu ne diagnostiques JAMAIS et ne prescris JAMAIS

═══ CAPACITÉS LOCALISATION (quand disponible) ═══
Quand l'utilisateur partage sa localisation, tu DOIS :
1. ADAPTER tes propositions de plats aux spécialités et ingrédients locaux de la zone
2. RECOMMANDER des restaurants à proximité avec niveaux de prix :
   - $ = économique (street food, petits restos populaires)
   - $$ = moyen (restaurants classiques)
   - $$$ = premium (restaurants haut de gamme)
3. PROPOSER des supermarchés et marchés locaux connus de la ville
4. ESTIMER les prix dans la DEVISE LOCALE (BIF au Burundi, FCFA en Afrique de l'Ouest, KES au Kenya, etc.)
5. CRÉER des plans de courses budgétisés, par exemple :
   - "Avec 10 000 BIF tu peux préparer ces 3 repas pour ta semaine :"
   - "Liste de courses mensuelle pour ton objectif de perte de poids :"
   - Ingrédients + quantités + prix estimé + où les trouver
6. PROPOSER des bons plans alimentaires selon l'objectif :
   - Perte de poids : repas riches en protéines, faibles en calories, budget serré
   - Prise de masse : repas caloriques denses, rapport qualité/prix
   - Maintien : équilibre et variété

═══ CAPACITÉS DOCUMENTS ═══
Quand l'utilisateur envoie une photo ou un document :
- Tu analyses le contenu visible (ordonnance, bilan, photo de plat, ticket de caisse, etc.)
- Pour les photos de plats : estime les calories, macros, et portions
- Pour les documents médicaux : extrais les données clés et explique simplement
- Pour les tickets de caisse : analyse les achats alimentaires et donne des conseils

═══ PROACTIVITÉ ═══
- Si l'utilisateur a peu mangé et c'est le soir → suggère un dîner adapté avec budget
- Si une analyse approche (J-7 ou moins) → mentionne-le naturellement
- Si c'est fin de mois (après le 25) → propose un plan de courses pour le mois prochain
- Si des résultats sont anormaux → mentionne avec bienveillance
- Si un médicament a des interactions alimentaires → préviens
- Si l'utilisateur semble démotivé → encourage avec des petites victoires

═══ RECETTES ═══
- Utilise UNIQUEMENT les plats de la liste "PLATS DISPONIBLES" fournie dans le contexte
- Nom EXACT du plat avec le tag [RECETTE:Nom exact du plat] sur une ligne séparée
- Si le plat n'est pas dans la liste, propose des alternatives disponibles

═══ CHOIX RAPIDES (OBLIGATOIRE) ═══
À la FIN de CHAQUE réponse, tu DOIS proposer 2 à 5 choix rapides.
Format EXACT, chaque choix sur sa propre ligne :
[CHOIX:1:Texte du premier choix]
[CHOIX:2:Texte du deuxième choix]
[CHOIX:3:Texte du troisième choix]
[CHOIX:PRÉCISER:Autre chose...]

RÈGLES des choix :
- Le DERNIER choix est TOUJOURS [CHOIX:PRÉCISER:Autre chose...]
- Les choix ANTICIPENT ce que l'utilisateur veut probablement
- Max 40 caractères par choix
- Au moins un choix doit être une suggestion proactive (pas juste des réponses)
- Exemples de bons choix proactifs : "Ma liste de courses", "Idées dîner ce soir", "Mes médicaments du jour", "Plan repas semaine"

═══ FORMAT DE RÉPONSE ═══
1. Texte (max 120 mots, concis, utile, se termine par une question ou suggestion)
2. Ligne vide
3. Les choix rapides [CHOIX:...]

═══ LIMITES ═══
- JAMAIS de diagnostic médical
- JAMAIS de prescription de médicament
- Recommande un professionnel pour les cas sérieux
- Précise que tu es une IA si demandé`;

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userId, userContext, imageBase64, mimeType } = await req.json();

    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construire le premier message avec le contexte
    const contextMessage = {
      role: 'user',
      content: `[CONTEXTE SYSTÈME — ne mentionne jamais ce bloc, utilise-le silencieusement]\n\n${ALIXEN_SYSTEM}\n\nDONNÉES DU MEMBRE :\n${userContext || 'Pas de données disponibles. Demande poliment au membre de scanner un repas ou de compléter son profil.'}`,
    };

    const prefillMessage = {
      role: 'assistant',
      content: 'Compris, je suis ALIXEN. Je réponds naturellement en utilisant toutes les données du membre. Je termine chaque réponse par des choix rapides [CHOIX:X:texte]. Si une localisation est fournie, j\'adapte mes recommandations avec les prix locaux.',
    };

    // Si le dernier message contient une image, le reformater pour Claude Vision
    let processedMessages = [...messages];
    if (imageBase64 && processedMessages.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      processedMessages[processedMessages.length - 1] = {
        role: lastMsg.role,
        content: [
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
            text: lastMsg.content || 'Analyse cette image et donne-moi tes observations.',
          },
        ],
      };
    }

    const fullMessages = [
      contextMessage,
      prefillMessage,
      ...processedMessages,
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: fullMessages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Erreur API', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Désolé, je n'ai pas pu traiter ta demande.";
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    return new Response(
      JSON.stringify({
        message: reply,
        tokens_used: tokensUsed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
