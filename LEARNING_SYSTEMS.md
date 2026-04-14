# LIXUM — Systèmes d'Apprentissage et Mémoire ALIXEN

## Vue d'ensemble

ALIXEN dispose de 5 couches de mémoire qui lui permettent de personnaliser ses réponses :

```
Couche 1 : Conversation (éphémère, 6 derniers messages + résumé)
Couche 2 : Préférences apprises (permanent, table alixen_learned_preferences)
Couche 3 : Insights 30 jours (hebdomadaire, table alixen_insights)
Couche 4 : Résumés annuels (annuel, table alixen_annual_summaries)
Couche 5 : Données temps réel (nutrition, médical, depuis les tables)
```

---

## Couche 1 : Conversation (éphémère)

### Fonctionnement
- Les 6 derniers messages sont envoyés en entier à l'API
- Les messages plus anciens sont compressés en résumé par Haiku (~$0.0005)
- Le résumé est injecté dans le system prompt : "RÉSUMÉ CONVERSATION PRÉCÉDENTE"
- Tout disparaît quand l'utilisateur ferme le chat

### Fichier
- lixman-chat/index.ts → fonction compressOldMessages()

### Coût
- Compression Haiku : ~500 tokens in, ~100 tokens out = $0.0005
- Se déclenche seulement à partir du 7ème message

---

## Couche 2 : Préférences apprises (permanent)

### Fonctionnement
- ALIXEN détecte naturellement les préférences dans la conversation
- Exemples : "j'adore le thieboudienne", "je ne mange jamais d'oignons", "je cuisine rarement"
- ALIXEN retourne un bloc ALIXEN_DATA avec type "learn_preference"
- L'edge function lixman-chat INSERT dans alixen_learned_preferences via REST API direct
- Les préférences sont rechargées à chaque nouveau message via fetchAlixenContext()

### Catégories
| Catégorie | Exemples |
|-----------|---------|
| food_like | Adore le thieboudienne, aime le poulet grillé |
| food_dislike | N'aime pas les oignons, déteste le poisson cru |
| cooking_habit | Pas de four, cuisine uniquement sur feu |
| eating_habit | Mange toujours tard le soir après 22h |
| health_note | Digère mal les lentilles, ballonnements |
| budget | Budget courses 15000 FCFA/semaine |
| flavor_pref | Préfère les plats épicés |
| cuisine_pref | Cuisine sénégalaise surtout |
| schedule | Petit-déjeuner à 7h, déjeuner à 13h |

### Règles
- ALIXEN ne demande JAMAIS "est-ce que tu aimes X ?" — il apprend naturellement
- ALIXEN ne propose JAMAIS un aliment food_dislike
- ALIXEN privilégie les aliments food_like quand compatible avec l'objectif
- Maximum 5 blocs learn_preference par réponse
- Confiance par défaut : 1.0 (confirmé en conversation)

### Table
alixen_learned_preferences (voir DATABASE.md)

### Parsing technique (lixman-chat/index.ts)
```
Réponse ALIXEN contient :
[ALIXEN_DATA]{"pending_action":{"type":"learn_preference","payload":{"category":"food_like","key":"thieboudienne","value":"Adore le thieboudienne"}}}[/ALIXEN_DATA]

→ Regex extraction par catMatch/keyMatch/valMatch (contourne bug Deno V8 JSON.parse)
→ INSERT via REST API direct (pas Supabase JS client qui timeout)
```

---

## Couche 3 : Insights 30 jours (hebdomadaire)

### Fonctionnement
- Edge function generate-insights exécutée chaque lundi à 6h (cron)
- Analyse 7 patterns sur les 30 derniers jours de chaque utilisateur
- INSERT résultats dans alixen_insights
- ALIXEN reçoit les insights dans son contexte et les mentionne proactivement

### 7 patterns analysés
1. Déficit calorique chronique
2. Différence weekend vs semaine
3. Carences en protéines
4. Repas sautés fréquents
5. Hydratation insuffisante
6. Corrélation sport + alimentation
7. Progression vers l'objectif

### Sévérité
- info : observation neutre
- success : progrès, objectif atteint
- warning : attention requise
- danger : problème sérieux

### Comportement ALIXEN
- URGENT/DANGER : mentionne proactivement même sans que l'utilisateur demande
- SUCCESS : félicite quand l'occasion se présente
- INFO : intègre naturellement dans la conversation
- Ne récite JAMAIS la liste comme un rapport

---

## Couche 4 : Résumés annuels (mémoire 10 ans)

### Fonctionnement
- Edge function generate-annual-summary exécutée chaque 2 janvier à 3h (cron)
- Utilise Haiku pour générer un résumé de l'année en 3-5 phrases
- Inclut : plats préférés, objectifs atteints, difficultés, moyenne kcal, variation poids
- INSERT dans alixen_annual_summaries
- ALIXEN reçoit les 3 dernières années dans son contexte

### Comportement ALIXEN
- Utilise les souvenirs naturellement : "L'année dernière tu avais du mal avec les protéines"
- Compare les habitudes : "En 2027 ton plat préféré était le mafé"
- Ne récite JAMAIS les résumés comme une liste

---

## Couche 5 : Données temps réel

### Chargées à chaque message via fetchAlixenContext()
| Donnée | Source | Période |
|--------|--------|---------|
| Profil (poids, objectif, régime) | users_profile | Actuel |
| Nutrition | daily_summary | 7 derniers jours |
| Repas détaillés hier | meals | Hier |
| Médicaments actifs | — via contexte frontend | Actuel |
| Allergies | — via contexte frontend | Actuel |
| Rappels vaccins/analyses | — via contexte frontend | À venir |

### Rappels médicaux injectés dans le contexte
- Rappels vaccins à venir avec nombre de jours
- Rappels en retard avec "ATTENTION"
- Analyses programmées avec dates
- ALIXEN peut proactivement rappeler : "N'oublie pas ton vaccin BCG prévu dans 3 jours"

---

## Auto-learning des ingrédients (scan-meal)

### Fonctionnement
Quand un ingrédient scanné n'est pas trouvé dans les tables de référence :

```
Scan photo → Sonnet identifie "fumbwa" (légume congolais)
  ↓
Recherche dans preparations_master → pas trouvé
Recherche dans ingredients_master → pas trouvé
  ↓
Appel Haiku : "Donne les macros pour 100g de fumbwa"
  ↓
Haiku retourne JSON avec kcal, protéines, glucides, lipides, fibres
  ↓
INSERT dans ingredients_master avec source='ai_learned'
  ↓
Prochaine fois que "fumbwa" est scanné → trouvé en DB, pas d'appel IA
```

### Impact
- La base de données grandit automatiquement avec l'usage
- Chaque nouvel ingrédient africain ou local enrichit la DB pour tous les utilisateurs
- Coût : ~$0.0005 par apprentissage (Haiku)

---

## Notifications push (rappels)

### Service
src/components/shared/NotificationService.js

### Types de rappels programmés
| Type | Déclencheur | Fréquence |
|------|------------|-----------|
| Vaccin | next_due_date existe | 3 mois, 1 mois, 1 semaine avant |
| Médicament | reminder_enabled = true | Quotidien aux horaires frequency_times |
| Analyse | is_scheduled = true | 1 semaine et 1 jour avant |

### Points de branchement
- Après INSERT vaccination → scheduleVaccineReminder()
- Après INSERT medication avec reminder → scheduleMedicationReminder()
- Après INSERT analyse planifiée → scheduleAnalysisReminder()
- Toggle rappel médicament → schedule ou cancel
- "Marquer comme fait" dans calendrier → cancelAllReminders()
- "Reporter" dans calendrier → cancel puis re-schedule
