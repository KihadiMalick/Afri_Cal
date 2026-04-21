# 📖 COOKBOOK ADMIN LIXUM — v2 corrigé

**Date** : 20 avril 2026
**Version** : v2 (après investigation tables réelles)

**Usage** : copier-coller chaque bloc dans Supabase SQL Editor (onglet SQL du dashboard). Toutes les requêtes sont **READ-ONLY**, zéro risque d'altération.

**Variables à adapter** : remplacer `'LXM-QJLMVQ'` par le lixtag recherché, `'ff3ba7cf-0e1e-...'` par le user_id ciblé, ajuster les dates.

**Astuce Supabase** : quand tu as plusieurs SELECT dans une passe, seul le dernier s'affiche. Pour voir toutes les analyses d'un coup, lance chaque bloc séparément (cliquer dans le bloc + Ctrl+Entrée / Run).

---

## 🧑‍💼 PARTIE 1 — HISTORIQUE TRANSACTIONS D'UN UTILISATEUR

### 1.1 — Historique complet Lix d'un user (par lixtag)

```sql
SELECT
  TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI:SS') AS quand,
  t.direction,
  t.amount AS lix,
  t.source,
  t.description,
  t.lix_before || ' → ' || t.lix_after AS balance_change,
  t.reference_id,
  t.metadata
FROM transactions_lix t
JOIN users_profile up ON up.user_id = t.user_id
WHERE up.lixtag = 'LXM-QJLMVQ'   -- ← adapter
ORDER BY t.created_at DESC
LIMIT 100;
```

### 1.2 — Historique complet abonnements d'un user

```sql
SELECT
  TO_CHAR(sh.created_at, 'YYYY-MM-DD HH24:MI:SS') AS quand,
  sh.event_type,
  COALESCE(sh.from_tier, '(création)') || ' → ' || sh.to_tier AS changement,
  sh.triggered_by,
  sh.payment_method,
  sh.payment_reference,
  CASE WHEN sh.amount_paid_currency IS NOT NULL
       THEN (sh.amount_paid_currency / 100.0)::text || ' ' || sh.currency
       ELSE '—' END AS prix,
  TO_CHAR(sh.starts_at, 'YYYY-MM-DD') AS starts,
  TO_CHAR(sh.expires_at, 'YYYY-MM-DD') AS expires
FROM subscription_history sh
JOIN users_profile up ON up.user_id = sh.user_id
WHERE up.lixtag = 'LXM-QJLMVQ'   -- ← adapter
ORDER BY sh.created_at DESC;
```

### 1.3 — Historique énergie (recharges via Lix)

```sql
SELECT
  TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') AS quand,
  'RECHARGE +' || (t.amount / 10) || 'é' AS action,
  '-' || t.amount || ' Lix' AS lix_cout,
  t.metadata->>'energy_added' AS energie_ajoutee,
  t.lix_before || '→' || t.lix_after AS balance_lix
FROM transactions_lix t
JOIN users_profile up ON up.user_id = t.user_id
WHERE up.lixtag = 'LXM-QJLMVQ'   -- ← adapter
  AND t.source = 'energy_recharge'
ORDER BY t.created_at DESC;
```

Pour voir **l'état actuel** du solde :

```sql
SELECT lixtag, energy AS solde_energie, lix_balance AS solde_lix,
       subscription_tier AS abo, subscription_expires_at AS abo_expire_le
FROM users_profile
WHERE lixtag = 'LXM-QJLMVQ';   -- ← adapter
```

### 1.4 — Historique devises (paiements $) d'un user

```sql
SELECT
  TO_CHAR(sh.created_at, 'YYYY-MM-DD HH24:MI') AS quand,
  sh.event_type,
  sh.to_tier AS tier_acquis,
  (sh.amount_paid_currency / 100.0) AS montant,
  sh.currency,
  sh.payment_method,
  sh.payment_reference AS reference_transaction
FROM subscription_history sh
JOIN users_profile up ON up.user_id = sh.user_id
WHERE up.lixtag = 'LXM-QJLMVQ'   -- ← adapter
  AND sh.amount_paid_currency IS NOT NULL
ORDER BY sh.created_at DESC;
```

### 1.5 — Total dépensé et gagné par un user (vue 360°)

```sql
WITH user_ref AS (
  SELECT user_id, lixtag FROM users_profile WHERE lixtag = 'LXM-QJLMVQ'   -- ← adapter
)
SELECT
  ur.lixtag,
  (SELECT SUM(amount) FROM transactions_lix WHERE user_id=ur.user_id AND direction='debit') AS total_lix_depenses,
  (SELECT SUM(amount) FROM transactions_lix WHERE user_id=ur.user_id AND direction='credit') AS total_lix_gagnes,
  (SELECT SUM(amount_paid_currency)/100.0 FROM subscription_history
     WHERE user_id=ur.user_id AND currency='USD') AS total_paye_usd,
  (SELECT COUNT(*) FROM transactions_lix WHERE user_id=ur.user_id) AS nb_transactions,
  (SELECT COUNT(*) FROM subscription_history WHERE user_id=ur.user_id
     AND event_type IN ('purchase','renewal','upgrade')) AS nb_paiements_abo
FROM user_ref ur;
```

---

## 📊 PARTIE 2 — STATISTIQUES GLOBALES UTILISATEURS

### 2.1 — Nombre total d'utilisateurs par catégorie d'abonnement

```sql
SELECT
  COALESCE(subscription_tier, 'inconnu') AS tier,
  COUNT(*) AS nb_users,
  COUNT(*) FILTER (WHERE subscription_expires_at > NOW()) AS nb_actifs,
  COUNT(*) FILTER (WHERE subscription_expires_at IS NULL OR subscription_expires_at < NOW()) AS nb_expires_ou_null,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_total
FROM users_profile
GROUP BY subscription_tier
ORDER BY nb_users DESC;
```

### 2.2 — Répartition par sexe

```sql
SELECT
  COALESCE(gender, 'non précisé') AS sexe,
  COUNT(*) AS nb_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_total
FROM users_profile
GROUP BY gender
ORDER BY nb_users DESC;
```

### 2.3 — Répartition par tranche d'âge

```sql
SELECT
  CASE
    WHEN age IS NULL THEN 'non précisé'
    WHEN age < 18 THEN '< 18 ans'
    WHEN age BETWEEN 18 AND 24 THEN '18-24 ans'
    WHEN age BETWEEN 25 AND 34 THEN '25-34 ans'
    WHEN age BETWEEN 35 AND 44 THEN '35-44 ans'
    WHEN age BETWEEN 45 AND 54 THEN '45-54 ans'
    WHEN age BETWEEN 55 AND 64 THEN '55-64 ans'
    ELSE '65+ ans'
  END AS tranche_age,
  COUNT(*) AS nb_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_total
FROM users_profile
GROUP BY tranche_age
ORDER BY
  CASE tranche_age
    WHEN '< 18 ans' THEN 1 WHEN '18-24 ans' THEN 2 WHEN '25-34 ans' THEN 3
    WHEN '35-44 ans' THEN 4 WHEN '45-54 ans' THEN 5 WHEN '55-64 ans' THEN 6
    WHEN '65+ ans' THEN 7 ELSE 8
  END;
```

### 2.4 — Répartition par objectif santé

```sql
SELECT
  COALESCE(goal, 'non précisé') AS objectif,
  COUNT(*) AS nb_users,
  ROUND(AVG(target_weight_loss)::numeric, 1) AS moyenne_perte_poids_kg,
  ROUND(AVG(target_months)::numeric, 1) AS moyenne_mois_cible,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_total
FROM users_profile
GROUP BY goal
ORDER BY nb_users DESC;
```

### 2.5 — Répartition par pays

```sql
SELECT
  COALESCE(country, 'non précisé') AS pays,
  COALESCE(country_flag, '🌍') AS drapeau,
  COUNT(*) AS nb_users,
  COUNT(*) FILTER (WHERE subscription_tier != 'free' AND subscription_expires_at > NOW()) AS nb_abonnes,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_total
FROM users_profile
GROUP BY country, country_flag
ORDER BY nb_users DESC;
```

### 2.6 — Répartition par régime alimentaire

```sql
SELECT
  COALESCE(dietary_regime, 'standard') AS regime,
  COUNT(*) AS nb_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_total
FROM users_profile
GROUP BY dietary_regime
ORDER BY nb_users DESC;
```

### 2.7 — Cross-tab abonnement × sexe

```sql
SELECT
  COALESCE(subscription_tier, 'inconnu') AS tier,
  COUNT(*) FILTER (WHERE gender='male') AS hommes,
  COUNT(*) FILTER (WHERE gender='female') AS femmes,
  COUNT(*) FILTER (WHERE gender IS NULL) AS non_precise,
  COUNT(*) AS total
FROM users_profile
GROUP BY subscription_tier
ORDER BY total DESC;
```

---

## 🎴 PARTIE 3 — CARACTÈRES LIXVERSE

> **⚠️ Note importante** : ta DB contient **2 tables caractères** (`lixverse_user_characters` moderne et `user_characters` legacy), à consolider en Session 5 XP. Pour l'instant, on utilise la moderne.

### 3.1 — Possession par tier (vue globale)

```sql
SELECT
  lc.tier,
  lc.name AS caractere,
  COUNT(DISTINCT luc.user_id) AS nb_proprietaires,
  SUM(luc.fragments_count) AS total_fragments,
  ROUND(AVG(luc.fragments_count)::numeric, 1) AS moyenne_frags_par_user
FROM lixverse_user_characters luc
JOIN lixverse_characters lc ON lc.slug = luc.character_slug
GROUP BY lc.tier, lc.name
ORDER BY
  CASE lc.tier
    WHEN 'ultimate' THEN 1 WHEN 'mythique' THEN 2
    WHEN 'elite' THEN 3 WHEN 'rare' THEN 4
    WHEN 'standard' THEN 5 ELSE 6
  END, nb_proprietaires DESC;
```

### 3.2 — Top users par nombre de caractères possédés

```sql
SELECT
  up.lixtag,
  up.subscription_tier,
  COUNT(DISTINCT luc.character_slug) AS nb_caracteres_distincts,
  STRING_AGG(DISTINCT lc.name, ', ' ORDER BY lc.name) AS caracteres_possedes
FROM users_profile up
LEFT JOIN lixverse_user_characters luc ON luc.user_id = up.user_id
LEFT JOIN lixverse_characters lc ON lc.slug = luc.character_slug
GROUP BY up.user_id, up.lixtag, up.subscription_tier
HAVING COUNT(DISTINCT luc.character_slug) > 0
ORDER BY nb_caracteres_distincts DESC
LIMIT 20;
```

### 3.3 — Caractère actif par user

```sql
SELECT
  up.lixtag,
  lc.name AS caractere_actif,
  lc.tier,
  luc.fragments_count
FROM users_profile up
LEFT JOIN lixverse_characters lc ON lc.id = up.active_character_id
LEFT JOIN lixverse_user_characters luc
  ON luc.user_id = up.user_id AND luc.character_slug = lc.slug
WHERE up.active_character_id IS NOT NULL
ORDER BY lc.tier, up.lixtag;
```

### 3.4 — Progression XP caractères (bonus avec `lixverse_character_progress`)

```sql
SELECT
  up.lixtag,
  lc.name AS caractere,
  lc.tier,
  lcp.*
FROM lixverse_character_progress lcp
JOIN users_profile up ON up.user_id = lcp.user_id
JOIN lixverse_characters lc ON lc.slug = lcp.character_slug
WHERE up.lixtag = 'LXM-QJLMVQ'   -- ← adapter
ORDER BY lc.tier, lc.name;
```

### 3.5 — Pouvoirs caractères utilisés (bonus `lixverse_character_powers`)

```sql
SELECT *
FROM lixverse_character_powers
WHERE user_id = (SELECT user_id FROM users_profile WHERE lixtag = 'LXM-QJLMVQ')   -- ← adapter
ORDER BY created_at DESC
LIMIT 50;
```

---

## 🏥 PARTIE 4 — MEDIBOOK & DONNÉES MÉDICALES

### 4.1 — Nombre de rapports médicaux / analyses générés

Ta table s'appelle `medical_analyses` (22 colonnes).

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS mois,
  COUNT(*) AS nb_analyses,
  COUNT(DISTINCT user_id) AS nb_users_distincts
FROM medical_analyses
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mois DESC;
```

### 4.2 — Historique analyses médicales d'un user

```sql
SELECT *
FROM medical_analyses
WHERE user_id = (SELECT user_id FROM users_profile WHERE lixtag = 'LXM-QJLMVQ')   -- ← adapter
ORDER BY created_at DESC
LIMIT 50;
```

### 4.3 — Partages médicaux QR code (table `medical_shares`)

```sql
-- Vue globale des QR codes de partage médecin 30min
SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS jour,
  COUNT(*) AS nb_qr_generes,
  COUNT(DISTINCT user_id) AS nb_users_distincts
FROM medical_shares
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
ORDER BY jour DESC;
```

### 4.4 — Volume de data médicale par user

```sql
SELECT
  up.lixtag,
  COUNT(DISTINCT d.id) AS nb_diagnostics,
  COUNT(DISTINCT v.id) AS nb_vaccinations,
  COUNT(DISTINCT a.id) AS nb_allergies,
  COUNT(DISTINCT m.id) AS nb_medications,
  COUNT(DISTINCT ma.id) AS nb_analyses,
  COUNT(DISTINCT fm.id) FILTER (WHERE fm.is_active = true AND fm.relation='child') AS nb_enfants_actifs
FROM users_profile up
LEFT JOIN diagnostics d ON d.profile_id = up.id
LEFT JOIN vaccinations v ON v.profile_id = up.id
LEFT JOIN allergies a ON a.profile_id = up.id
LEFT JOIN medications m ON m.profile_id = up.id
LEFT JOIN medical_analyses ma ON ma.user_id = up.user_id
LEFT JOIN family_members fm ON fm.user_id = up.user_id
GROUP BY up.user_id, up.lixtag
HAVING (COUNT(DISTINCT d.id) + COUNT(DISTINCT v.id) +
        COUNT(DISTINCT a.id) + COUNT(DISTINCT m.id) + COUNT(DISTINCT ma.id)) > 0
ORDER BY (COUNT(DISTINCT d.id) + COUNT(DISTINCT v.id) +
          COUNT(DISTINCT a.id) + COUNT(DISTINCT m.id) + COUNT(DISTINCT ma.id)) DESC
LIMIT 20;
```

### 4.5 — Profils enfants créés

```sql
SELECT
  TO_CHAR(fm.created_at, 'YYYY-MM') AS mois,
  COUNT(*) AS nb_enfants_crees,
  COUNT(*) FILTER (WHERE fm.is_active=true) AS encore_actifs
FROM family_members fm
WHERE fm.relation = 'child'
GROUP BY TO_CHAR(fm.created_at, 'YYYY-MM')
ORDER BY mois DESC;
```

### 4.6 — Revenue profil enfant (Lix dépensés)

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS mois,
  COUNT(*) AS nb_enfants_payants,
  SUM(amount) AS total_lix_depenses
FROM transactions_lix
WHERE source = 'child_profile_creation'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mois DESC;
```

---

## 🏆 PARTIE 5 — LIXVERSE (DÉFIS + BINÔMES + STICKERS)

### 5.1 — Défis par statut avec templates

```sql
SELECT
  CASE WHEN c.is_active THEN 'En cours' ELSE 'Terminé' END AS statut,
  COUNT(*) AS nb_defis,
  MIN(c.start_date) AS plus_ancien,
  MAX(c.end_date) AS plus_recent,
  COUNT(DISTINCT c.template_id) AS nb_templates_differents
FROM lixverse_challenges c
GROUP BY c.is_active;
```

### 5.2 — Participants par défi

```sql
SELECT
  c.title AS defi,
  c.is_active,
  COUNT(DISTINCT g.id) AS nb_groupes,
  COUNT(DISTINCT gm.user_id) AS nb_participants,
  ROUND(AVG(g.total_score)::numeric, 0) AS moyenne_score,
  MAX(g.total_score) AS meilleur_score
FROM lixverse_challenges c
LEFT JOIN lixverse_groups g ON g.challenge_id = c.id
LEFT JOIN lixverse_group_members gm ON gm.group_id = g.id
GROUP BY c.id, c.title, c.is_active
ORDER BY c.start_date DESC;
```

### 5.3 — Total utilisateurs engagés défis (unique)

```sql
SELECT
  COUNT(DISTINCT gm.user_id) AS nb_users_ayant_participe,
  COUNT(DISTINCT gm.user_id) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM lixverse_challenges c
      JOIN lixverse_groups g ON g.challenge_id = c.id
      WHERE g.id = gm.group_id AND c.is_active = true
    )
  ) AS nb_users_actuellement_engages
FROM lixverse_group_members gm;
```

### 5.4 — Score events (historique détaillé)

Table `challenge_score_events` (11 cols) — historique granulaire des contributions.

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS jour,
  COUNT(*) AS nb_events_score,
  COUNT(DISTINCT user_id) AS nb_users_distincts,
  SUM(CASE WHEN points IS NOT NULL THEN points ELSE 0 END) AS total_points_gagnes
FROM challenge_score_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
ORDER BY jour DESC;
```

### 5.5 — Binômes — Table `lixverse_binome_matches`

```sql
SELECT
  COUNT(*) AS nb_binomes_total,
  COUNT(*) FILTER (WHERE is_active = true) AS nb_actifs,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS crees_30j,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') AS crees_7j
FROM lixverse_binome_matches;
```

### 5.6 — Activité binômes journalière

Table `lixverse_binome_daily` (11 cols) trace l'activité quotidienne des binômes.

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS jour,
  COUNT(*) AS nb_events_binome,
  COUNT(DISTINCT binome_id) AS nb_binomes_actifs_ce_jour
FROM lixverse_binome_daily
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
ORDER BY jour DESC;
```

### 5.7 — Messages échangés entre binômes

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS jour,
  COUNT(*) AS nb_messages,
  COUNT(DISTINCT binome_id) AS nb_binomes_ayant_chatte
FROM lixverse_binome_messages
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
ORDER BY jour DESC;
```

### 5.8 — Leaderboard binômes

```sql
SELECT *
FROM lixverse_binome_leaderboard
ORDER BY created_at DESC
LIMIT 20;
```

### 5.9 — Wall stickers & cadeaux Lix

```sql
SELECT
  COUNT(DISTINCT ws.id) AS nb_stickers_total,
  COUNT(DISTINCT ws.user_id) AS nb_users_avec_sticker,
  SUM(ws.lix_received) AS total_lix_recus_cumul,
  (SELECT COUNT(*) FROM wall_sticker_catalog) AS nb_stickers_catalogue,
  (SELECT COUNT(*) FROM wall_gifts) AS nb_cadeaux_envoyes,
  (SELECT SUM(lix_amount) FROM wall_gifts) AS total_lix_echanges
FROM wall_stickers ws;
```

---

## 💬 PARTIE 6 — CHAT ALIXEN & USAGE IA

### 6.1 — Sessions vocales ALIXEN (table `alixen_voice_sessions`)

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS jour,
  COUNT(*) AS nb_sessions_vocales,
  COUNT(DISTINCT user_id) AS nb_users_distincts
FROM alixen_voice_sessions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
ORDER BY jour DESC;
```

### 6.2 — Insights ALIXEN générés

Table `alixen_insights` (11 cols) — les insights hebdomadaires/mensuels générés par ALIXEN.

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS mois,
  COUNT(*) AS nb_insights_generes,
  COUNT(DISTINCT user_id) AS nb_users_distincts
FROM alixen_insights
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mois DESC;
```

### 6.3 — Préférences apprises par ALIXEN

```sql
SELECT
  COUNT(*) AS nb_preferences_apprises,
  COUNT(DISTINCT user_id) AS nb_users_avec_prefs
FROM alixen_learned_preferences;
```

### 6.4 — Résumés annuels ALIXEN

```sql
SELECT
  EXTRACT(YEAR FROM created_at) AS annee,
  COUNT(*) AS nb_resumes_annuels,
  COUNT(DISTINCT user_id) AS nb_users_distincts
FROM alixen_annual_summaries
GROUP BY EXTRACT(YEAR FROM created_at)
ORDER BY annee DESC;
```

### 6.5 — Notifications ALIXEN envoyées

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM-DD') AS jour,
  notification_type,
  COUNT(*) AS nb_envoyees
FROM alixen_notifications
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD'), notification_type
ORDER BY jour DESC, nb_envoyees DESC;
```

### 6.6 — Compteurs trial onboarding (vue d'ensemble)

```sql
SELECT 'chat' AS feature,
  COUNT(*) FILTER (WHERE onboarding_chat_used >= 4) AS users_trial_epuise,
  COUNT(*) FILTER (WHERE onboarding_chat_used > 0) AS users_ayant_commence,
  COUNT(*) AS users_total,
  ROUND(AVG(onboarding_chat_used)::numeric, 2) AS moyenne_utilisation
FROM users_profile UNION ALL
SELECT 'xscan',
  COUNT(*) FILTER (WHERE onboarding_xscan_used >= 1),
  COUNT(*) FILTER (WHERE onboarding_xscan_used > 0),
  COUNT(*), ROUND(AVG(onboarding_xscan_used)::numeric, 2)
FROM users_profile UNION ALL
SELECT 'gallery',
  COUNT(*) FILTER (WHERE onboarding_gallery_used >= 2),
  COUNT(*) FILTER (WHERE onboarding_gallery_used > 0),
  COUNT(*), ROUND(AVG(onboarding_gallery_used)::numeric, 2)
FROM users_profile UNION ALL
SELECT 'recipe',
  COUNT(*) FILTER (WHERE onboarding_recipe_used >= 1),
  COUNT(*) FILTER (WHERE onboarding_recipe_used > 0),
  COUNT(*), ROUND(AVG(onboarding_recipe_used)::numeric, 2)
FROM users_profile UNION ALL
SELECT 'medic',
  COUNT(*) FILTER (WHERE onboarding_medic_used >= 1),
  COUNT(*) FILTER (WHERE onboarding_medic_used > 0),
  COUNT(*), ROUND(AVG(onboarding_medic_used)::numeric, 2)
FROM users_profile UNION ALL
SELECT 'cartscan',
  COUNT(*) FILTER (WHERE onboarding_cartscan_used >= 5),
  COUNT(*) FILTER (WHERE onboarding_cartscan_used > 0),
  COUNT(*), ROUND(AVG(onboarding_cartscan_used)::numeric, 2)
FROM users_profile
ORDER BY users_ayant_commence DESC;
```

### 6.7 — Usage scans repas (par source)

```sql
SELECT
  source,
  COUNT(*) AS nb_scans,
  COUNT(DISTINCT user_id) AS nb_users_distincts,
  TO_CHAR(MIN(created_at), 'YYYY-MM-DD') AS premier_scan,
  TO_CHAR(MAX(created_at), 'YYYY-MM-DD') AS dernier_scan
FROM meals
WHERE source IN ('xscan_4','quick_scan','gallery','manual')
GROUP BY source
ORDER BY nb_scans DESC;
```

---

## 🛒 PARTIE 7 — CARTSCAN (BONUS découverte `cart_reports`)

### 7.1 — Rapports CartScan générés par mois

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS mois,
  COUNT(*) AS nb_caddies_scannes,
  COUNT(DISTINCT user_id) AS nb_users_distincts
FROM cart_reports
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mois DESC;
```

### 7.2 — Détail CartScan d'un user

```sql
SELECT *
FROM cart_reports
WHERE user_id = (SELECT user_id FROM users_profile WHERE lixtag = 'LXM-QJLMVQ')   -- ← adapter
ORDER BY created_at DESC
LIMIT 20;
```

---

## 💰 PARTIE 8 — FINANCES & REVENUE

### 8.1 — Revenue total par mois (devises)

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS mois,
  currency,
  COUNT(*) AS nb_transactions,
  ROUND(SUM(amount_paid_currency) / 100.0, 2) AS total_revenue,
  ROUND(AVG(amount_paid_currency) / 100.0, 2) AS panier_moyen
FROM subscription_history
WHERE amount_paid_currency IS NOT NULL
GROUP BY TO_CHAR(created_at, 'YYYY-MM'), currency
ORDER BY mois DESC, currency;
```

### 8.2 — Répartition revenue par event_type

```sql
SELECT
  event_type,
  COUNT(*) AS nb_transactions,
  ROUND(SUM(amount_paid_currency) / 100.0, 2) AS total_revenue_usd,
  ROUND(AVG(amount_paid_currency) / 100.0, 2) AS panier_moyen_usd
FROM subscription_history
WHERE currency = 'USD' AND amount_paid_currency IS NOT NULL
GROUP BY event_type
ORDER BY total_revenue_usd DESC;
```

### 8.3 — Churn mensuel

```sql
SELECT
  TO_CHAR(created_at, 'YYYY-MM') AS mois,
  COUNT(*) FILTER (WHERE event_type='auto_downgrade_expired') AS auto_downgrades,
  COUNT(*) FILTER (WHERE event_type='cancellation') AS resiliations_volontaires,
  COUNT(*) FILTER (WHERE event_type='renewal') AS renouvellements,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event_type='auto_downgrade_expired')
    / NULLIF(COUNT(*) FILTER (WHERE event_type IN ('auto_downgrade_expired','renewal')), 0), 2)
    AS churn_pct
FROM subscription_history
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY mois DESC;
```

### 8.4 — LTV (Lifetime Value) — Top 20 payeurs

```sql
SELECT
  up.lixtag,
  up.subscription_tier AS tier_actuel,
  ROUND(SUM(sh.amount_paid_currency) / 100.0, 2) AS ltv_usd,
  COUNT(*) FILTER (WHERE sh.event_type IN ('purchase','renewal','upgrade')) AS nb_paiements,
  TO_CHAR(MIN(sh.created_at), 'YYYY-MM-DD') AS premier_paiement,
  TO_CHAR(MAX(sh.created_at), 'YYYY-MM-DD') AS dernier_event
FROM users_profile up
JOIN subscription_history sh ON sh.user_id = up.user_id
WHERE sh.currency = 'USD'
GROUP BY up.user_id, up.lixtag, up.subscription_tier
HAVING SUM(sh.amount_paid_currency) > 0
ORDER BY ltv_usd DESC
LIMIT 20;
```

### 8.5 — Économie Lix : flux net hebdomadaire

```sql
SELECT
  DATE_TRUNC('week', created_at)::date AS semaine,
  SUM(CASE WHEN direction='credit' THEN amount ELSE 0 END) AS total_credite,
  SUM(CASE WHEN direction='debit' THEN amount ELSE 0 END) AS total_debite,
  SUM(CASE WHEN direction='credit' THEN amount
           WHEN direction='debit' THEN -amount ELSE 0 END) AS flux_net,
  COUNT(*) AS nb_transactions
FROM transactions_lix
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY semaine DESC;
```

### 8.6 — Dépenses Lix par feature (30 derniers jours)

```sql
SELECT
  source,
  COUNT(*) AS nb_achats,
  SUM(amount) AS total_lix_depenses,
  ROUND(100.0 * SUM(amount) / NULLIF((
    SELECT SUM(amount) FROM transactions_lix
    WHERE direction='debit' AND created_at >= NOW() - INTERVAL '30 days'), 0), 1)
    AS pct_total_depenses
FROM transactions_lix
WHERE direction='debit' AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY source
ORDER BY total_lix_depenses DESC;
```

### 8.7 — Revenue par pays

```sql
SELECT
  up.country,
  up.country_flag,
  COUNT(DISTINCT sh.user_id) AS nb_abonnes_payants,
  COUNT(sh.id) AS nb_transactions,
  ROUND(SUM(sh.amount_paid_currency) / 100.0, 2) AS total_revenue
FROM subscription_history sh
JOIN users_profile up ON up.user_id = sh.user_id
WHERE sh.amount_paid_currency IS NOT NULL
GROUP BY up.country, up.country_flag
ORDER BY total_revenue DESC NULLS LAST;
```

---

## 🎯 PARTIE 9 — DASHBOARDS (VUE EXÉCUTIVE)

### 9.1 — Dashboard global one-liner

```sql
SELECT 'Utilisateurs totaux' AS metric, (SELECT COUNT(*) FROM users_profile)::text AS valeur UNION ALL
SELECT 'Abonnés actifs',
  (SELECT COUNT(*) FROM users_profile
   WHERE subscription_tier != 'free' AND subscription_expires_at > NOW())::text UNION ALL
SELECT 'Nouveaux users 7j',
  (SELECT COUNT(*) FROM users_profile WHERE created_at >= NOW() - INTERVAL '7 days')::text UNION ALL
SELECT 'Total Lix circulants',
  (SELECT SUM(lix_balance)::text FROM users_profile) UNION ALL
SELECT 'Total énergie circulante',
  (SELECT SUM(energy)::text FROM users_profile) UNION ALL
SELECT 'Transactions Lix 30j',
  (SELECT COUNT(*)::text FROM transactions_lix WHERE created_at >= NOW() - INTERVAL '30 days') UNION ALL
SELECT 'Repas scannés 30j',
  (SELECT COUNT(*)::text FROM meals WHERE created_at >= NOW() - INTERVAL '30 days') UNION ALL
SELECT 'Analyses médicales 30j',
  (SELECT COUNT(*)::text FROM medical_analyses WHERE created_at >= NOW() - INTERVAL '30 days') UNION ALL
SELECT 'CartScan reports 30j',
  (SELECT COUNT(*)::text FROM cart_reports WHERE created_at >= NOW() - INTERVAL '30 days') UNION ALL
SELECT 'Binômes actifs',
  (SELECT COUNT(*)::text FROM lixverse_binome_matches WHERE is_active=true) UNION ALL
SELECT 'Défis en cours',
  (SELECT COUNT(*)::text FROM lixverse_challenges WHERE is_active=true) UNION ALL
SELECT 'Revenue USD 30j',
  (SELECT COALESCE(ROUND(SUM(amount_paid_currency)/100.0, 2)::text, '0')
   FROM subscription_history
   WHERE currency='USD' AND created_at >= NOW() - INTERVAL '30 days');
```

### 9.2 — Rapport quotidien

```sql
SELECT
  CURRENT_DATE AS date_rapport,
  (SELECT COUNT(*) FROM users_profile
   WHERE created_at >= CURRENT_DATE) AS nouveaux_users,
  (SELECT COUNT(*) FROM subscription_history
   WHERE event_type='purchase' AND created_at >= CURRENT_DATE) AS nouveaux_abonnes,
  (SELECT COUNT(*) FROM transactions_lix
   WHERE created_at >= CURRENT_DATE) AS transactions_lix,
  (SELECT COUNT(*) FROM meals
   WHERE created_at >= CURRENT_DATE) AS scans_repas,
  (SELECT COUNT(*) FROM medical_analyses
   WHERE created_at >= CURRENT_DATE) AS analyses_medicales,
  (SELECT COUNT(*) FROM alixen_voice_sessions
   WHERE created_at >= CURRENT_DATE) AS sessions_vocales_alixen,
  (SELECT COALESCE(SUM(amount_paid_currency)/100.0, 0) FROM subscription_history
   WHERE created_at >= CURRENT_DATE AND currency='USD') AS revenue_usd;
```

---

## 🔐 PARTIE 10 — AUDIT & INTÉGRITÉ

### 10.1 — Réconciliation solde Lix

```sql
WITH reconciliation AS (
  SELECT
    up.user_id, up.lixtag, up.lix_balance AS balance_db,
    COALESCE(SUM(CASE WHEN t.direction='credit' THEN t.amount
                      WHEN t.direction='debit' THEN -t.amount ELSE 0 END), 0) AS balance_calcule_tx,
    up.lix_balance - COALESCE(SUM(CASE WHEN t.direction='credit' THEN t.amount
                                       WHEN t.direction='debit' THEN -t.amount ELSE 0 END), 0) AS diff
  FROM users_profile up
  LEFT JOIN transactions_lix t ON t.user_id = up.user_id
  GROUP BY up.user_id, up.lixtag, up.lix_balance
)
SELECT * FROM reconciliation
WHERE ABS(diff) > 100
ORDER BY ABS(diff) DESC
LIMIT 20;
```

### 10.2 — Cohérence tier (DB vs dernière ligne history)

```sql
WITH last_sh AS (
  SELECT DISTINCT ON (user_id) user_id, to_tier, created_at
  FROM subscription_history
  ORDER BY user_id, created_at DESC
)
SELECT
  up.lixtag, up.subscription_tier AS tier_db,
  last_sh.to_tier AS tier_history,
  last_sh.created_at AS derniere_modif_history
FROM users_profile up
LEFT JOIN last_sh ON last_sh.user_id = up.user_id
WHERE COALESCE(up.subscription_tier,'free') != COALESCE(last_sh.to_tier,'free')
ORDER BY last_sh.created_at DESC NULLS LAST;
```

### 10.3 — Détection anomalies (tx > 50 000 Lix)

```sql
SELECT
  TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI') AS quand,
  up.lixtag, t.direction, t.amount, t.source, t.description
FROM transactions_lix t
JOIN users_profile up ON up.user_id = t.user_id
WHERE t.amount >= 50000
ORDER BY t.created_at DESC
LIMIT 50;
```

### 10.4 — Détection tables caractères legacy à consolider

Bonus : visualiser la co-existence `user_characters` (legacy) vs `lixverse_user_characters` (moderne).

```sql
SELECT 'user_characters (legacy)' AS table_name, COUNT(*) AS nb_rows FROM user_characters
UNION ALL
SELECT 'lixverse_user_characters (moderne)', COUNT(*) FROM lixverse_user_characters;
```

Si `user_characters` a des lignes, c'est à migrer en Session 5 vers `lixverse_user_characters`.

---

## 💡 RACCOURCIS UTILES

### Trouver un user rapidement

```sql
-- Par lixtag
SELECT user_id, lixtag, display_name, subscription_tier, energy, lix_balance, country, created_at
FROM users_profile WHERE lixtag = 'LXM-XXXXXX';

-- Par email (via auth.users)
SELECT up.user_id, up.lixtag, up.display_name, au.email
FROM users_profile up
JOIN auth.users au ON au.id = up.user_id
WHERE au.email ILIKE '%xxxxx%';

-- Par display_name
SELECT user_id, lixtag, display_name, subscription_tier, energy, lix_balance
FROM users_profile WHERE display_name ILIKE '%malick%';
```

### Voir l'activité récente d'un user (7 jours)

```sql
SELECT
  TO_CHAR(t.created_at, 'MM-DD HH24:MI') AS t,
  t.direction || ' ' || t.amount || ' Lix' AS action,
  t.source, t.description
FROM transactions_lix t
JOIN users_profile up ON up.user_id = t.user_id
WHERE up.lixtag = 'LXM-QJLMVQ'
  AND t.created_at >= NOW() - INTERVAL '7 days'
ORDER BY t.created_at DESC;
```

### Export CSV d'une analyse

Dans Supabase SQL Editor, après avoir lancé une requête, clique sur **"Export"** en haut de Results → **Download CSV**. Utile pour rapports externes.

---

## 📚 INVENTAIRE DES TABLES DISPONIBLES (vérifiées 20/04/2026)

### Tables financières
- `users_profile` — profils utilisateurs (état courant)
- `transactions_lix` — audit financier Lix
- `subscription_history` — audit abonnements (NOUVEAU)
- `hydration_access_log` — log paywalls hydration (NOUVEAU)
- `stats_access_log` — log paywalls stats MediBook

### Tables repas & activités
- `meals` — repas scannés/saisis
- `daily_summary` — résumé nutritionnel quotidien
- `activities` — activités physiques
- `hydration_logs` — logs hydratation
- `cart_reports` — rapports CartScan

### Tables médicales
- `medical_analyses` — analyses médicales (**22 cols**)
- `medical_shares` — QR codes partage médecin 30min
- `diagnostics`, `vaccinations`, `allergies`, `medications` — data MediBook
- `family_members` — profils enfants
- `family_allergies` — allergies par enfant

### Tables ALIXEN / IA
- `alixen_voice_sessions` — sessions vocales
- `alixen_insights` — insights hebdo/mensuels générés
- `alixen_learned_preferences` — préférences apprises
- `alixen_annual_summaries` — résumés annuels
- `alixen_notifications` — notifications push

### Tables LixVerse (défis)
- `lixverse_challenges` — défis (**34 cols**)
- `challenge_templates` — templates défis (14 cols)
- `challenge_score_events` — événements scoring (11 cols)
- `lixverse_groups` — groupes défis
- `lixverse_group_members` — membres groupes

### Tables LixVerse (binômes)
- `lixverse_binome_matches` — matches (**20 cols**)
- `lixverse_binome_daily` — activité quotidienne
- `lixverse_binome_leaderboard` — classement
- `lixverse_binome_messages` — chat binôme
- `lixverse_binome_pokes` — pokes

### Tables LixVerse (caractères)
- `lixverse_characters` — catalogue caractères (**18 cols**)
- `lixverse_user_characters` — possession users (11 cols)
- `lixverse_character_progress` — progression XP (12 cols)
- `lixverse_character_powers` — pouvoirs utilisés (15 cols)
- `lixverse_fragments` — fragments (4 cols)
- `user_characters` — ⚠️ TABLE LEGACY à migrer (Session 5)
- `characters` — ⚠️ TABLE LEGACY à migrer (Session 5)

### Tables Wall
- `wall_stickers` — stickers posés
- `wall_sticker_catalog` — catalogue stickers
- `wall_gifts` — cadeaux Lix échangés

---

*Cookbook v2 généré le 20 avril 2026 après investigation tables réelles. À mettre à jour après Session 5 (consolidation caractères legacy).*
