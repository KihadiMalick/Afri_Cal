# LIXUM — Edge Functions (Supabase Deno)

## Vue d'ensemble

3 edge functions déployées sur Supabase. Toutes utilisent la clé API Anthropic stockée dans les secrets.

| Fonction | Modèle IA | Usage | Fichier |
|----------|-----------|-------|---------|
| lixman-chat | Sonnet 4 + Haiku 4.5 | Chat ALIXEN, recettes, voice coach | supabase/functions/lixman-chat/index.ts |
| scan-meal | Sonnet 4 + Haiku 4.5 | Scan photo repas, recherche ingrédients | supabase/functions/scan-meal/index.ts |
| scan-medical | Sonnet 4 | Scan documents médicaux, scan médicaments | supabase/functions/scan-medical/index.ts |

## Secrets Supabase nécessaires

```
ANTHROPIC_API_KEY = sk-ant-api03-... (clé LIXUM TRACKING)
SUPABASE_URL = https://yuhordnzfpcswztujovi.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhb... (rôle service, accès total)
```

---

## 1. lixman-chat (888 lignes)

### Modes d'appel

| Mode | Modèle | Gate énergie | Coût | Description |
|------|--------|-------------|------|-------------|
| chat (défaut) | Sonnet 4 | 10 énergie | ~$0.02/msg | Chat conversationnel ALIXEN |
| recipe | Sonnet 4 | 8 énergie | ~$0.03 | 3 propositions recettes JSON |
| voice_coach | Haiku 4.5 | Aucun | ~$0.0003 | Encouragement pendant activité |
| loading_steps | Haiku 4.5 | Aucun | ~$0.0003 | Phrases d'animation chargement |

### Body de la requête (mode chat)

```json
{
  "messages": [{"role": "user", "content": "Salut"}],
  "userId": "UUID",
  "userContext": "LOCALISATION: ..., LANGUE: FR",
  "imageBase64": "base64 optionnel",
  "mimeType": "image/jpeg",
  "lang": "FR",
  "mode": null
}
```

### Body de la requête (mode recipe)

```json
{
  "mode": "recipe",
  "message": "Contexte repas: calories restantes 800, mood: content, weather: ensoleillé...",
  "userId": "UUID"
}
```

### Réponse (mode chat)

```json
{
  "message": "Texte nettoyé d'ALIXEN",
  "tokens_used": 1234,
  "model_used": "sonnet",
  "web_search_used": false,
  "pending_action": null,
  "emotion": "happy",
  "cache_read_tokens": 5000,
  "cache_creation_tokens": 0,
  "gate_reason": "onboarding_free",
  "energy_remaining": 50,
  "onboarding_remaining": 3
}
```

### Réponse erreur (402 — énergie insuffisante)

```json
{
  "error": "energy_required",
  "reason": "insufficient_energy",
  "energy_balance": 0,
  "lix_balance": 500,
  "energy_cost": 10
}
```

### Optimisations en place

- Prompt caching : system blocks avec cache_control ephemeral → 90% réduction tokens cachés
- Compression historique : messages > 6 compressés en résumé Haiku (~$0.0005)
- Historique limité : 6 derniers messages en entier, anciens résumés
- Contexte compact : données médicales en format condensé
- Requêtes Supabase en parallèle (Promise.all)
- Fallback si erreur API : retry sans web search

### Fonctions internes

| Fonction | Rôle |
|----------|------|
| checkEnergyGate() | Appelle RPC check_and_deduct_energy |
| logEnergyUsage() | INSERT dans energy_log |
| compressOldMessages() | Résume anciens messages via Haiku |
| fetchAlixenContext() | Charge profil + nutrition + préférences + insights + mémoire |
| needsWebSearch() | Détecte si web search nécessaire (prix, lieux, etc.) |
| generateLoadingSteps() | Génère phrases animation via Haiku |

### ALIXEN_DATA (actions depuis le chat)

ALIXEN peut retourner des blocs JSON dans sa réponse pour déclencher des actions :

```
[ALIXEN_DATA]{"pending_action":{"type":"learn_preference","payload":{...}}}[/ALIXEN_DATA]
```

Types d'actions : save_meal_plan, update_weight, add_medication, add_analysis, add_allergy, add_vaccination, add_diagnostic, add_full_diagnosis, navigate, learn_preference

---

## 2. scan-meal (671 lignes)

### Modes d'appel

| Action | Modèle | Gate | Coût | Description |
|--------|--------|------|------|-------------|
| scan (défaut) | Sonnet 4 | Selon feature | 1-12 énergie | Scan photo repas |
| search_ingredients | Aucun | Aucun | Gratuit | Recherche DB ingrédients |
| analyze_unknown_ingredient | Haiku 4.5 | manual_entry | 3 énergie | Estimation IA ingrédient inconnu |

### Features et coûts

| Feature (dans body) | Énergie | Usage |
|---------------------|---------|-------|
| xscan | 12 | Scan photo repas principal |
| gallery | 12 | Scan depuis galerie |
| cartscan | 1 | Scan ticket de caisse |
| manual_entry | 3 | Estimation ingrédient via Haiku |

### Body de la requête (scan)

```json
{
  "photos_base64": ["base64..."],
  "user_id": "UUID",
  "feature": "xscan",
  "user_country": "BI",
  "user_origin_country": "SN",
  "lang": "FR"
}
```

### Pipeline de scan

```
Photo → Sonnet 4 Vision → JSON (plats suggérés + ingrédients vus)
  ↓
Recherche DB : african_food_database → meals_master → mots individuels
  ↓
Si trouvé : enrichissement avec quantités IA → macros proportionnelles
Si pas trouvé : fallback IA (estimation macros par ingrédient)
  ↓
Auto-learning : ingrédient inconnu → Haiku estime → INSERT ingredients_master
```

### Réponse

```json
{
  "mode": "double_choice",
  "suggestions": [{"db_id": "UUID", "name_fr": "Thiéboudienne", "calories": 650, ...}],
  "ai_fallback": null,
  "ai_visual": {"texture": "...", "ingredients_seen": [...]},
  "processing_time_ms": 3200,
  "gate_reason": "subscription",
  "energy_remaining": 48
}
```

---

## 3. scan-medical (387 lignes)

### Modes de scan

| scan_type | Modèle | Gate | Coût | Description |
|-----------|--------|------|------|-------------|
| document (défaut) | Sonnet 4 | medic | 30 énergie | Bilan sanguin, ordonnance, carnet |
| medication_photo | Sonnet 4 | medic | 12 énergie | Photo médicament → principes actifs |

### Body de la requête

```json
{
  "imageBase64": "base64...",
  "mimeType": "image/jpeg",
  "userId": "UUID",
  "scan_type": "medication_photo",
  "context": "medibook",
  "category": "medications"
}
```

### Réponse (document médical) — 6 catégories extraites

```json
{
  "documentType": "Bilan sanguin",
  "date": "2026-04-14",
  "laboratory": "Lab Pasteur",
  "summary": "Bilan sanguin complet...",
  "data": [{"label": "Glycémie", "value": "0.95 g/L", "ref": "0.70-1.10", "status": "normal"}],
  "medications": [{"name": "Doliprane", "dosage": "1000mg", "frequency": "2x/jour"}],
  "vaccinations": [{"vaccine_name": "BCG", "date": "2020-01-15", "dose_number": 1}],
  "allergies": [{"allergen": "Pénicilline", "type": "médicamenteuse", "severity": "sévère"}],
  "diagnostics": [{"condition_name": "Hypertension", "severity": "moderate", "status": "chronic"}],
  "alerts": ["Cholestérol élevé — contrôle recommandé"],
  "gate_reason": "subscription",
  "energy_remaining": 120
}
```

### Réponse (photo médicament)

```json
{
  "medicationType": "photo_medicament",
  "name": "Doliprane 1000mg",
  "activeIngredients": [{"name": "Paracétamol", "dosage": "1000 mg", "role": "analgésique"}],
  "therapeuticClass": "Antalgique",
  "form": "comprimé",
  "precautions": ["Ne pas dépasser 4g/jour"],
  "forTracking": {"name": "Doliprane", "dosage": "1000mg", "frequency": "À définir"}
}
```

---

## Cron Jobs (Edge Functions programmées)

| Fonction | Fréquence | Description |
|----------|-----------|-------------|
| generate-insights | Chaque lundi 6h | Analyse 7 patterns sur 30 jours → INSERT alixen_insights |
| generate-annual-summary | Chaque 2 janvier 3h | Résumé annuel via Haiku → INSERT alixen_annual_summaries |

---

## Comment modifier une Edge Function

1. Aller sur Supabase Dashboard → Edge Functions
2. Cliquer sur la fonction
3. Copier le nouveau code complet (fichier index.ts)
4. Coller et déployer
5. Tester dans l'app

Les secrets sont partagés entre toutes les edge functions — pas besoin de les reconfigurer.
