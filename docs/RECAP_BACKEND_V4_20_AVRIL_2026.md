# LIXUM — Recap Journée Back-end V4 Complet

**Date** : 20 avril 2026
**Durée session** : ~12 heures
**Statut** : Back-end DB production-grade complet ✅
**Tag git** : `v1.2-backend-v4-complete`

---

## 🎯 Objectif initial

Éliminer toute dette technique sur le back-end Supabase avant build final, aligner le modèle business V4 de bout en bout, rendre l'économie Lix + Énergie auditable et infalsifiable.

---

## 📊 Modèle business V4 verrouillé

### Énergie — Pool unique cumulatif

L'énergie est **un seul pool** qui :
- Ne se réinitialise jamais
- N'a pas de cap
- Accumule toutes les sources (cadeau mensuel abo, achats Lix, défis, paliers XP)
- Ne se perd que par consommation réelle

**Coûts énergie (hardcodés côté RPC pour le back-end, à recalibrer côté Edge Functions en S3)** :

| Feature | Coût |
|---|---|
| Chat ALIXEN | 10 é |
| XScan repas (2 photos, profondeur+qté) | 20 é |
| Galerie photo repas | 12 é |
| Recette ALIXEN (3 recettes) | 8 é |
| Document médical | 30 é |
| Photo médicament | 12 é |
| CartScan caddie code-barre (par caddie entier) | 10 é |
| CartScan photo fallback | 10 é |
| MediBook recherche manuelle (par produit introuvable) | 5 é |
| MediBook batch 1-5 médicaments | 50 é |
| MediBook batch 6-10 médicaments | 80 é |

### Conversion Lix ↔ Énergie

- **Ratio fixe** : 10 Lix = 1 énergie
- Conversion uniquement dans ce sens (Lix → énergie), jamais l'inverse
- Montant doit être multiple de 10

### Monnaie réelle

- 1 USD = 1 000 Lix (base de conversion marketing)
- Packs Lix Starter 0.99 $ → Prestige 49.99 $
- Web lixum.com : +20 % bonus Lix (plus de marge vs stores)

### Abonnements

| Tier | Prix | Énergie/mois | Lix/mois | Stats MediBook | Enfant gratuit | Réduction é |
|---|---|---|---|---|---|---|
| **Free** | 0 $ | 0 (+onboarding 20é) | 50 initial | aucune | 0 | 0 |
| **Silver** | 4.99 $/mois | 200 é | 3 000 | 30 j inclus | 1er gratuit | 0 % |
| **Gold** | 9.99 $/mois | 400 é | 6 000 | 365 j inclus | 1er gratuit | -25 % |
| **Platinum** | 20 $/mois | 800 é | 12 000 | Origine incluse | 1er gratuit | -50 % |

**Règles abo** :
- Reset mensuel = anniversaire de l'abo (pas le 1er du mois)
- Cadeau mensuel cumulatif : jamais perdu même si non consommé
- MediBook logs reste gratuit à vie (même post-résil)
- Profil enfant non-abonné : 5 000 Lix
- 2ème enfant (même pour abonné) : 5 000 Lix

### Paywalls Lix (24h)

| Feature | Coût | Remarque |
|---|---|---|
| Hydration 7j Dashboard | 100 Lix | Ou pouvoir Coral Dolphin Niv2 |
| MediBook Stats 30j | 500 Lix | Ou Silver actif, ou Gipsy Niv2 |
| MediBook Stats 365j | 5 000 Lix | Ou Gold actif, ou Gipsy MAX |
| MediBook Stats Origine | 10 000 Lix | Ou Platinum actif |

---

## 🏗️ Architecture DB finale

### Table `users_profile` — état courant

**Colonnes DROPPÉES aujourd'hui** :
- `lix_count` (Étape A — redondant avec `lix_balance`)
- `last_spin_at` (Étape B — fossile Spin Wheel supprimé)
- `is_premium`, `premium_since`, `premium_expires` (Étape D — remplacés par `subscription_tier`)
- `full_name` (Étape E — privacy, `display_name` + `lixtag`)
- `energy_monthly_used`, `monthly_energy_reset_at` (Session 1 V4 — pool unique)

**Colonnes principales actives** :
- `user_id` (FK auth.uid), `id` (PK auto), `display_name`, `lixtag`
- `lix_balance` (default 50), `energy` (pool unique cumulatif)
- `subscription_tier` ('free'/'silver'/'gold'/'platinum'), `subscription_expires_at`
- `onboarding_*_used` (6 compteurs trial : chat 4 / xscan 1 / gallery 2 / recipe 1 / medic 1 / cartscan 5)
- `*_unlocked_until` (3 colonnes timer paywalls)
- `user_xp`, `user_level`, `vitality_score`, `discipline_streak`, `discipline_record`
- `active_character_id`, `current_mood`, `current_weather`
- Champs profil : age, weight, height, gender, activity_level, goal, bmr, tdee, country, etc.

### Table `transactions_lix` — audit financier Lix

Table existante, désormais **alimentée systématiquement** par les helpers `credit_lix` / `debit_lix` (plus aucun UPDATE direct JS).

**Colonnes** : id, user_id, amount, direction ('credit'|'debit'), source, description, lix_before, lix_after, reference_id, metadata jsonb, created_at.

**11 sources auditables** :

| Source | Direction | Montant | Événement |
|---|---|---|---|
| `self_test` | both | 1 | Tests internes validation |
| `stats_access` | debit | 500/5000/10000 | MediBook stats 30j/365j/Origine |
| `hydration_access` | debit | 100 | Dashboard hydration 7j |
| `child_profile_creation` | debit | 5 000 | Profil enfant non-abonné / 2ème |
| `energy_recharge` | debit | variable | Conversion Lix → énergie |
| `meal_scan_reward` | credit | 10 | XScan / galerie / quick_scan |
| `meal_manual_reward` | credit | 3 | Saisie manuelle repas |
| `activity_reward` | credit | 5 | Activité enregistrée |
| `lixer_du_mois_reward` | credit | 5 000 | Gagnant mensuel LixVerse |
| `challenge_reward_rank_N` | credit | variable | Récompense défi par rang |
| `gift_sent` / `gift_received` | debit / credit | variable | Cadeaux wall entre users |

### Table `subscription_history` — audit abonnements (NOUVELLE)

Créée aujourd'hui en Session 2bis. Alimentée par `change_subscription` exclusivement.

**Colonnes** : id, user_id, from_tier, to_tier, event_type, starts_at, expires_at, payment_method, payment_reference, amount_paid_currency, currency, triggered_by, metadata jsonb, created_at.

**9 event_type possibles** :
- `initial` — création user (backfill)
- `purchase` — souscription initiale
- `renewal` — renouvellement mensuel
- `upgrade` — passage tier supérieur
- `downgrade` — passage tier inférieur
- `cancellation` — résiliation (tier maintenu jusqu'à expires_at)
- `auto_downgrade_expired` — expiration détectée par `check_and_deduct_energy`
- `refund` — remboursement
- `admin_manual` — intervention support

**3 triggered_by** : user (action volontaire), system (auto-downgrade, cron), admin (support).

**Garde-fous** : CHECK constraints sur `to_tier`, `from_tier`, `event_type`, `triggered_by`. RLS activée, table 100 % privée.

### Table `hydration_access_log` — audit paywall hydratation (créée aujourd'hui)

Schéma : id, profile_id, unlocked_until, lix_cost, created_at. Alimentée par `unlock_hydration_history`.

### Table `stats_access_log` — audit paywall stats (existante, durcie)

Schéma : id, profile_id, unlocked_until, lix_cost, range_key, created_at. Alimentée par `unlock_stats_range`.

### Table `family_members` — profils enfants

Schéma inchangé. Règle business V4 implémentée via `unlock_child_medical_profile` :
- 1er enfant actif + abonné actif → gratuit (metadata `is_free=true`)
- Sinon → débit 5 000 Lix via `debit_lix`
- Relation `='child'` (fix crucial appliqué pour cohérence avec `loadFamilyMembers` côté client)

---

## 🔧 RPCs du back-end V4 — inventaire complet

### Helpers financiers (pattern central)

| RPC | Signature | Rôle |
|---|---|---|
| `credit_lix` | uuid, int, text, text, text?, jsonb? | Crédit atomique avec FOR UPDATE + INSERT tx |
| `debit_lix` | uuid, int, text, text, text?, jsonb? | Débit atomique avec FOR UPDATE + INSERT tx |
| `change_subscription` | uuid, text, text, text, timestamptz?, text?, text?, int?, text?, jsonb? | Modif tier atomique + INSERT history |

### RPCs métier utilisant les helpers

| RPC | Helper utilisé | Événement |
|---|---|---|
| `add_meal_and_update_summary` | `credit_lix` | +10 Lix scan, +3 Lix manuel |
| `add_user_activity` | `credit_lix` | +5 Lix par activité |
| `calculate_lixer_du_mois` | `credit_lix` | +5 000 Lix gagnant |
| `end_challenge` | `credit_lix` (boucle membres) | Récompenses rang 1-10+ |
| `gift_lix_to_sticker` | `debit_lix` + `credit_lix` | Transfert A→B atomique |
| `unlock_stats_range` | (UPDATE direct + INSERT tx) | Paywall stats MediBook |
| `unlock_hydration_history` | (UPDATE direct + INSERT tx) | Paywall hydration 7j |
| `unlock_child_medical_profile` | `debit_lix` (sauf 1er abo) | Profil enfant 5000 Lix ou gratuit |
| `recharge_lix_to_energy` | `debit_lix` + UPDATE energy | Conversion 10 Lix = 1 é |
| `deduct_alixen_recipe` | wrapper `check_and_deduct_energy` | 8 énergie recette (ou trial) |

### RPCs énergie

| RPC | Rôle |
|---|---|
| `check_and_deduct_energy` | Cascade : trial onboarding → pool énergie → refus 402. Auto-downgrade abo expiré via `change_subscription` (tracé). |

---

## 📝 Modifications JavaScript livrées

### Commit `fef722d` — `unlockHistoryWithLix` RPC atomique
`DashboardPage.js` ligne ~202. Remplace UPDATE direct JS toxique par appel `supabase.rpc('unlock_hydration_history', ...)`.

### Commit `a44f8b7` — RecettesScreen V4 énergie
`RecettesScreen.js` l. 611-641. 5 modifs clés :
- `checkAlixenRecipeCost` : reason owl / energy / try_trial (au lieu de Lix)
- `deductAlixenLix` → renommée `deductAlixenEnergy`, appelle `deduct_alixen_recipe` RPC
- 4 call sites unifiés (Surprends-moi, région, type, mes ingrédients)
- Badge UI "💎 50 Lix" → "⚡ 8 énergie"
- Messages modaux "50 Lix" → "8 énergie"

### Commits précédents (matin)
- `429df7a` Dashboard : suppression paywall 200 Lix Mes Stats
- `9cfb9bd` DashboardContent : carte Mes Stats minimaliste
- `1e8bf00` cleanup code mort `patientTag` typo `lix_tag`
- `368bc56` MediBookPages PDF lixtag
- `6211c4c` ProfilePage cleanup fallbacks

---

## 🧪 Tests validés (16 tests SQL end-to-end)

### Session 1 V4 — 9/9 PASS

| # | Test | Garantie |
|---|---|---|
| T1 | Recette trial free | Compteur incrémenté, énergie intacte |
| T2 | Recette énergie payée (8é) | Débit pool unique |
| T3 | Recette énergie insuffisante | Refus 402 sans mutation |
| T4 | Enfant free user payé 5000 Lix | Débit + INSERT family_members |
| T5 | Enfant abonné 1er gratuit | is_free=true, lix intact |
| T6 | Enfant abonné 2ème payé | Règle count>0 respectée |
| T7 | Recharge 100 Lix = +10 é | tx `energy_recharge` loggée |
| T8 | Recharge invalide (55 Lix) | Refus `invalid_amount` |
| 99 | Cleanup state restauré | Snapshot validé |

### Session 2bis — 7/7 PASS

| # | Test | Garantie |
|---|---|---|
| T1 | Purchase free→silver (Stripe 4.99 $) | history inserted |
| T2 | Upgrade silver→gold (Stripe 9.99 $) | from_tier='silver' dans history |
| T3 | Cancellation gold (expires maintenu) | event='cancellation' tracé |
| T4 | Auto-downgrade expiré via check_energy | event='auto_downgrade_expired' tracé |
| T5 | Refus to_tier='unicorn_tier' | invalid_to_tier |
| T6 | Refus event_type='teleportation' | invalid_event_type |
| 99 | Cleanup state restauré | Snapshot validé |

---

## 🔐 Garanties techniques en place

| Garantie | Implémentation |
|---|---|
| Atomicité | Toutes RPC PL/pgSQL = transaction PostgreSQL |
| Anti-race condition | FOR UPDATE sur tous SELECT critiques |
| Anti-bypass API | SECURITY DEFINER + RLS sur tables audit |
| Validation stricte | CHECK constraints + validations inline |
| Traçabilité Lix | 11 sources dans transactions_lix |
| Traçabilité abos | 9 event_types dans subscription_history |
| Anti-overspend | Check solde avant débit (credit_lix/debit_lix/check_energy) |
| Rollback automatique | RAISE EXCEPTION dans cascade → rollback toute la tx |
| Cohérence direction | 'credit' / 'debit' (jamais 'in' / 'out' — erreur 23514 fix) |
| Harmony `user_id` | Toutes RPC WHERE user_id (fix credit_lix WHERE id → user_id) |

---

## 🚀 Sessions restantes pour build final

### Session 3 — Edge Functions Deno V4 (~2 h dédiée)

**Objectif** : Recalibrer les coûts d'énergie dans les Edge Functions TypeScript côté Supabase dashboard.

**Edge Functions concernées** :
- `lixman-chat` → `check_and_deduct_energy(10, 'chat')`
- `scan-xscan` → `check_and_deduct_energy(20, 'xscan')` (au lieu de 12)
- `scan-gallery` → `check_and_deduct_energy(12, 'gallery')`
- `scan-medical` → `check_and_deduct_energy(30, 'medic')`
- `scan-photo-medoc` → `check_and_deduct_energy(12, 'medic')`
- `cartscan-barcode` → `check_and_deduct_energy(10, 'cartscan')` **par caddie**, pas par scan (refactor UX)
- `cartscan-photo` (si existe) → `check_and_deduct_energy(10, 'cartscan')`
- `medibook-manual-search` → `check_and_deduct_energy(5, 'medic')` par produit
- `medibook-batch-recognize` → `check_and_deduct_energy(50|80, 'medic')` selon taille batch

**Point d'attention** : CartScan nécessite un **refactor UX en parallèle** :
- Ne plus afficher kcal pendant le scan (anti-fraude scan+quit)
- Afficher kcal uniquement après "Confirmer caddie"
- Facturer 1x par caddie, pas par scan individuel

### Session 4 — Cron mensuel renewal (~1 h dédiée)

**Objectif** : Fonction PL/pgSQL ou Edge Function scheduled qui :
1. Scanne les users dont `subscription_expires_at` approche de la date anniversaire
2. Si paiement validé (à décider : webhook Stripe vs pull) → appelle `change_subscription(p_user_id, same_tier, 'renewal', 'system', new_expires_at, ...)` en cascade :
   - Update tier + expires_at
   - INSERT subscription_history event='renewal'
   - `credit_lix` du bonus mensuel Lix (3 000 / 6 000 / 12 000 selon tier)
   - UPDATE energy += cadeau mensuel (200 / 400 / 800)
   - Optionnel : distribution fragments caractères
3. Idempotent via flag `last_monthly_grant_at` sur users_profile (à ajouter)

### Session 5 (optionnelle) — Câblage XP + Caractères

**Trous identifiés** :
- `add_user_xp` jamais appelée côté JS
- Multiplicateurs Ruby Tiger / TARDIGRUM / Diamond Simba / Coral Dolphin non câblés
- Milestones 7j / 30j affichent +50 XP textuellement mais jamais crédités
- 4 tables caractères legacy à consolider (`user_characters`, `characters`, `lixverse_characters`, `lixverse_user_characters`)
- `discipline_streak` / `discipline_record` préservées mais jamais incrémentées

---

## 📌 Checkpoints git stables

| Tag | Commit | Description |
|---|---|---|
| `v1.0-stable-apk` | `17f4f29` | APK minimal, useEffect ALIXEN neutralisé, filet de secours |
| `v1.1-stable-notifications` | `fc82794` | APK 17 avril avec ALIXEN notifs fonctionnelles |
| `v1.2-backend-v4-complete` | (taggué 20 avril) | Back-end V4 complet : DB, helpers, audit, tests |

Rollback si nécessaire : `git checkout v1.X-stable-XXX`

---

## 📖 Règles apprises & formalisées aujourd'hui

### Workflow SQL Supabase

1. Toujours auditer CSV colonnes avant SQL
2. `users_profile.id ≠ user_id` — tables financières utilisent `user_id`, tables médicales utilisent `profile_id`
3. Popup RLS sur RECORD/SELECT INTO = faux positif → **orange "Run without RLS"**
4. `CREATE OR REPLACE` refuse rename param **ET** ajout/retrait defaults (ERROR 42P13) → **DROP + CREATE**
5. Popup "destructive ops" sur DROP = vrai garde-fou, voulu → Run
6. Multi-SELECT séparés dans 1 query → seul le dernier s'affiche → préférer table TEMP + UNION ALL final
7. `pg_get_functiondef` KO sur agrégées → utiliser `prosrc`
8. Constraint `transactions_lix.direction` accepte `'credit'` / `'debit'` (pas `'in'` / `'out'`)
9. Si RPC business appelle une autre RPC qui fait RAISE EXCEPTION → rollback auto de toute la transaction
10. Snapshot via table TEMP `ON COMMIT DROP` + restore final = pattern de tests sans pollution

### Workflow Claude Code

- Prompts chirurgicaux : 1 fichier, 1 objectif clair
- Listes `NE PAS TOUCHER` explicites pour éviter débordements
- Vérifications grep à chaque modif (anti-régression)
- Babel parsing OK systématique

### Privacy LIXUM

- `display_name` = UI interne (Dashboard, ALIXEN, Profile)
- `lixtag` = exports médicaux + contextes publics (MediBook PDF, QR médecin 30min, LixVerse, binôme)
- Aucun nom civil dans fichier exportable
- `auth.users.user_metadata.full_name` (Supabase Auth) hors scope LIXUM
- Marketing : "seul compagnon santé qui ne loggue jamais le nom civil dans un export"

---

## 🎯 À retenir pour demain (ou quand tu reprendras)

### Pour Session 3 Edge Functions

1. Lister les Edge Functions actuelles dans Supabase dashboard
2. Pour chacune, vérifier l'appel actuel à `check_and_deduct_energy` (si existant)
3. Mettre à jour le 2ème paramètre (`p_energy_cost`) selon la grille V4
4. Pour CartScan : refactor UX (kcal après Confirmer) + facture 1x par caddie
5. Tester une feature par une feature via l'app réelle

### Pour le build APK

- Quota EAS épuisé actuellement → attendre reset mensuel
- Commits à merger : tous déjà sur `main` (`fef722d`, `a44f8b7`, +9 commits matin)
- APK attendu : v1.2 avec back-end V4 complet + RecettesScreen V4

### Pour le cadre juridique

- Mettre à jour `CADRE_JURIDIQUE_A_METTRE_A_JOUR.md` si LIXUM SAS progresse (NINEA, RCCM, adresse Dakar, etc.)
- `subscription_history` permet désormais preuves auditables RGPD / fiscales
- `transactions_lix` = registre financier exportable

---

*Recap généré le 20 avril 2026, fin de session back-end V4 complet.*
*Prochaine session recommandée : Session 3 (Edge Functions V4) avec tête fraîche.*
