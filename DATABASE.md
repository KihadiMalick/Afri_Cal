# LIXUM — Base de Données (Supabase PostgreSQL)

## Tables principales

### users_profile
Source de vérité du profil utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| user_id | UUID (PK, FK auth.users) | Identifiant unique |
| full_name | TEXT | Nom complet |
| weight | NUMERIC | Poids actuel (kg) |
| goal | TEXT | lose / maintain / gain |
| target_weight_loss | NUMERIC | Kg à perdre/gagner |
| target_months | INTEGER | Durée prévue |
| daily_calorie_target | INTEGER | Objectif kcal/jour |
| bmr | INTEGER | Métabolisme de base |
| tdee | INTEGER | Dépense totale |
| dietary_regime | TEXT | classic/vegetarian/vegan/keto/halal |
| activity_level | TEXT | sedentary/light/moderate/active/very_active |
| lix_balance | INTEGER | Monnaie virtuelle Lix |
| energy | INTEGER | Énergie disponible |
| subscription_tier | TEXT | free/silver/gold/platinum |
| subscription_expires_at | TIMESTAMPTZ | Expiration abo |
| energy_daily_used | INTEGER | Énergie utilisée aujourd'hui |
| daily_energy_reset_at | TIMESTAMPTZ | Dernier reset quotidien |
| onboarding_completed | BOOLEAN | Onboarding terminé |
| onboarding_xscan_used | INTEGER | Compteur essais gratuits XScan |
| onboarding_gallery_used | INTEGER | Compteur galerie |
| onboarding_chat_used | INTEGER | Compteur chat |
| onboarding_recipe_used | INTEGER | Compteur recettes |
| onboarding_medic_used | INTEGER | Compteur scan médical |
| onboarding_cartscan_used | INTEGER | Compteur CartScan |
| push_token | TEXT | Token notification Expo |
| current_mood | TEXT | Humeur actuelle |
| current_weather | TEXT | Météo actuelle |

### meals
Repas loggés par l'utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| food_name | TEXT | Nom du plat |
| calories | INTEGER | Calories |
| protein_g | NUMERIC | Protéines |
| carbs_g | NUMERIC | Glucides |
| fat_g | NUMERIC | Lipides |
| fiber_g | NUMERIC | Fibres |
| meal_type | TEXT | breakfast/lunch/dinner/snack |
| date | DATE | Date du repas |
| source | TEXT | scan/manual/gallery/cartscan/alixen |
| created_at | TIMESTAMPTZ | |

### daily_summary
Résumé nutritionnel quotidien (calculé automatiquement).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| date | DATE | |
| total_calories | INTEGER | Total kcal consommées |
| total_calories_burned | INTEGER | Kcal brûlées (sport) |
| total_protein | NUMERIC | Total protéines |
| total_carbs | NUMERIC | Total glucides |
| total_fat | NUMERIC | Total lipides |
| meals_count | INTEGER | Nombre de repas |

### user_activities (anciennement activities)
Activités physiques loguées.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| activity_type | TEXT | Type d'activité |
| duration_min | INTEGER | Durée en minutes |
| calories_burned | INTEGER | Calories brûlées |
| intensity | TEXT | low/medium/high |
| date | DATE | |
| created_at | TIMESTAMPTZ | |

### moods
Humeur et météo loguées.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| mood | TEXT | Humeur (12 options) |
| weather | TEXT | Météo |
| energy_level | INTEGER | Niveau d'énergie 1-5 |
| created_at | TIMESTAMPTZ | |

### hydration_logs
Hydratation quotidienne.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| beverage_type | TEXT | Type de boisson |
| quantity_ml | INTEGER | Quantité en ml |
| hydration_coefficient | NUMERIC | Coefficient BHI |
| date | DATE | |
| created_at | TIMESTAMPTZ | |

---

## Tables médicales

### medications
Médicaments de l'utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| profile_id | UUID | Ancien champ (déprécié) |
| family_member_id | UUID (FK family_members) | Profil enfant ou NULL (self) |
| name | TEXT | Nom du médicament |
| dosage | TEXT | Dosage texte |
| dosage_value | NUMERIC | Valeur numérique |
| dosage_unit | TEXT | mg/ml/etc. |
| frequency | TEXT | Fréquence texte |
| frequency_per_day | INTEGER | Fois par jour |
| frequency_times | TEXT[] | Horaires ['08:00','14:00','20:00'] |
| duration | TEXT | Durée texte |
| start_date | DATE | Début traitement |
| end_date | DATE | Fin traitement |
| prescriber | TEXT | Médecin prescripteur |
| status | TEXT | active/completed |
| reminder_enabled | BOOLEAN | Rappels activés |
| taken_today | BOOLEAN | Pris aujourd'hui |
| taken_history | JSONB | Historique prises |
| source | TEXT | scan/manual/alixen |
| medication_db_id | UUID | Lien vers base médicaments |
| notes | TEXT | |

### vaccinations
Carnet vaccinal.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| family_member_id | UUID (FK family_members) | |
| vaccine_name | TEXT | Nom du vaccin |
| vaccine_type | TEXT | Type |
| dose_number | INTEGER | Numéro de dose |
| administration_date | DATE | Date d'administration |
| next_due_date | DATE | Prochain rappel |
| batch_number | TEXT | Numéro de lot |
| administered_by | TEXT | Médecin/centre |
| status | TEXT | completed |
| notes | TEXT | |

### allergies
Allergies et intolérances.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| family_member_id | UUID (FK family_members) | |
| allergen | TEXT | Substance allergène |
| type | TEXT | alimentaire/médicamenteuse/respiratoire/cutanée |
| severity | TEXT | légère/modérée/sévère |
| reaction | TEXT | Description réaction |

### diagnostics
Maladies et diagnostics.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| family_member_id | UUID (FK family_members) | |
| condition_name | TEXT | Nom de la maladie |
| icd_code | TEXT | Code ICD-10 |
| severity | TEXT | mild/moderate/severe |
| diagnosed_date | DATE | Date du diagnostic |
| diagnosed_by | TEXT | Médecin |
| status | TEXT | active/chronic/resolved/monitoring |
| disease_db_id | UUID (FK diseases_master) | Lien vers base maladies |
| source | TEXT | manual/ai/scan |
| notes | TEXT | |

### medical_analyses
Analyses médicales (bilans, résultats).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| family_member_id | UUID (FK family_members) | |
| label | TEXT | Type d'analyse |
| value | TEXT | Valeur mesurée |
| value_numeric | NUMERIC | Valeur numérique |
| reference_range | TEXT | Valeurs de référence |
| status | TEXT | normal/elevated/low/critical |
| category | TEXT | Catégorie |
| is_scheduled | BOOLEAN | Analyse planifiée |
| scheduled_date | DATE | Date prévue |
| reminder | BOOLEAN | Rappel activé |
| prescribed_by | TEXT | Médecin |
| laboratory | TEXT | Laboratoire |
| notes | TEXT | |

### scanned_documents
Index des documents scannés.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| family_member_id | UUID (FK family_members) | |
| batch_id | UUID | ID du batch multi-photos |
| document_type | TEXT | Type de document |
| document_date | DATE | Date du document |
| laboratory | TEXT | Labo/médecin |
| patient_name | TEXT | Nom patient |
| summary | TEXT | Résumé IA |
| raw_ai_response | JSONB | Réponse brute de l'IA |
| scan_context | TEXT | medibook/secretpocket |
| scan_category | TEXT | Catégorie |
| items_extracted | INTEGER | Nombre d'éléments extraits |
| energy_cost | INTEGER | Coût en énergie |
| status | TEXT | pending/analyzed/validated/rejected |

### health_profiles
Profils de santé (score vitalité).

### family_members
Profils familiaux (enfants).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| name | TEXT | Nom de l'enfant |
| relation | TEXT | child |
| age | INTEGER | Âge |
| birth_date | DATE | Date de naissance |
| gender | TEXT | Genre |
| dietary_regime | TEXT | Régime alimentaire |
| is_active | BOOLEAN | Profil actif |
| medical_profile_unlocked | BOOLEAN | Déverrouillé (1000 Lix) |
| unlocked_at | TIMESTAMPTZ | Date déverrouillage |

### family_allergies
Allergies des membres familiaux.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| family_member_id | UUID (FK) | |
| allergen | TEXT | |
| severity | TEXT | |

---

## Tables de référence (lecture seule)

### meals_master
1066+ plats du monde avec macros. Source FAO/WAFCT.

### african_food_database
524+ plats africains avec macros par pays/région.

### ingredients_master
Ingrédients crus avec macros pour 100g.

### preparations_master
Ingrédients cuisinés/préparés avec macros pour 100g.

### diseases_master
97 maladies avec codes ICD-10, catégories, flag is_common_africa.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| name_fr | TEXT | Nom français |
| name_en | TEXT | Nom anglais |
| icd_code | TEXT | Code ICD-10 |
| category | TEXT | Catégorie (Infectieuses, Cardiovasculaires...) |
| subcategory | TEXT | Sous-catégorie |
| is_chronic | BOOLEAN | Maladie chronique |
| is_common_africa | BOOLEAN | Fréquente en Afrique |
| description_fr | TEXT | Description |
| search_name | TEXT | Termes de recherche normalisés |

---

## Tables IA / ALIXEN

### alixen_learned_preferences
Préférences apprises par ALIXEN au fil des conversations.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| category | TEXT | food_like/food_dislike/cooking_habit/eating_habit/health_note/budget/social/flavor_pref/cuisine_pref/schedule |
| key | TEXT | Mot-clé court |
| value | TEXT | Description naturelle |
| confidence | NUMERIC | Score de confiance 0-1 |
| source | TEXT | conversation/scan |
| is_active | BOOLEAN | Préférence active |
| last_confirmed_at | TIMESTAMPTZ | Dernière confirmation |

### alixen_insights
Analyses de tendances 30 jours (générées par cron hebdomadaire).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| insight_type | TEXT | Type de pattern |
| title | TEXT | Titre court |
| description | TEXT | Description détaillée |
| severity | TEXT | info/success/warning/danger |
| period_start | DATE | Début période analysée |
| period_end | DATE | Fin période |
| acknowledged_at | TIMESTAMPTZ | NULL = non lu |

### alixen_annual_summaries
Résumés annuels (mémoire 10 ans, générés par cron chaque 2 janvier).

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| year | INTEGER | Année |
| summary | TEXT | Résumé 3-5 phrases par Haiku |
| top_foods | JSONB | Plats les plus mangés |
| main_achievements | JSONB | Objectifs atteints |
| main_challenges | JSONB | Difficultés |
| avg_daily_calories | INTEGER | Moyenne kcal/jour |
| weight_change | NUMERIC | Variation de poids |

### alixen_notifications
Notifications push programmées.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| type | TEXT | vaccine_reminder/med_reminder/analysis_reminder |
| title | TEXT | Titre notification |
| body | TEXT | Corps |
| data | JSONB | Données supplémentaires |
| scheduled_at | TIMESTAMPTZ | Date programmée |
| sent_at | TIMESTAMPTZ | Date d'envoi |
| read_at | TIMESTAMPTZ | Date de lecture |
| status | TEXT | pending/sent/read |
| notification_expo_id | TEXT | ID Expo Notifications |
| reference_id | UUID | Lien vers vaccination/analyse |

---

## Tables économie / énergie

### energy_log
Historique de chaque dépense/recharge d'énergie.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| amount | INTEGER | Quantité |
| direction | TEXT | debit/credit |
| source | TEXT | ai_call/lix_purchase/spin_reward/daily_reset/subscription/admin |
| feature | TEXT | chat/xscan/gallery/recipe/medic/cartscan/manual_entry |
| edge_function | TEXT | lixman-chat/scan-meal/scan-medical |
| tokens_used | INTEGER | Tokens API consommés |
| energy_before | INTEGER | Énergie avant |
| energy_after | INTEGER | Énergie après |
| metadata | JSONB | Données supplémentaires |
| created_at | TIMESTAMPTZ | |

### transactions_lix
Historique achats/dépenses Lix.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID (PK) | |
| user_id | UUID (FK) | |
| amount | INTEGER | Quantité Lix |
| direction | TEXT | debit/credit |
| source | TEXT | purchase_store/purchase_web/energy_buy/recipe_cost/crate_cost/reward/child_profile/admin |
| description | TEXT | Description |
| lix_before | INTEGER | Solde avant |
| lix_after | INTEGER | Solde après |
| reference_id | TEXT | Référence externe |
| metadata | JSONB | |
| created_at | TIMESTAMPTZ | |

---

## Tables LixVerse

### lixverse_characters
Catalogue des 16 personnages.

### lixverse_user_characters
Personnages possédés par l'utilisateur (fragments, niveau, XP).

### lixverse_challenges
Défis actifs et historique.

### lixverse_groups
Groupes de défis.

### lixverse_group_members
Membres des groupes.

---

## RPCs (Fonctions SQL)

| Fonction | Paramètres | Retour | Usage |
|----------|-----------|--------|-------|
| check_and_deduct_energy | p_user_id, p_energy_cost, p_feature | JSONB {allowed, reason, energy_remaining...} | Gate énergie atomique |
| unlock_child_medical_profile | p_user_id, p_child_name, p_child_birth_date, p_child_gender | JSONB {success, child_id, lix_remaining} | Déverrouiller profil enfant (1000 Lix) |
| search_diseases_db | p_query, p_limit | SETOF diseases_master | Recherche maladies |
| search_medications_db | p_query, p_limit | SETOF medications_db | Recherche médicaments |
| recharge_energy_with_lix | p_user_id, p_lix_cost, p_energy_amount | JSONB | Achat énergie avec Lix |
| create_user_profile | ... | ... | Création compte |
| check_email_available | ... | BOOLEAN | Vérification email |
| get_user_xp | ... | ... | XP utilisateur |

## Row Level Security (RLS)

Toutes les tables utilisateur ont RLS activé avec la politique :
```sql
CREATE POLICY "Users see own data" ON table_name
FOR ALL USING (auth.uid() = user_id);
```

Les tables de référence (meals_master, diseases_master, etc.) sont en lecture pour tous :
```sql
CREATE POLICY "Anyone can read" ON table_name
FOR SELECT USING (true);
```
