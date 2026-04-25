# LIXUM — Documentation Complète des Caractères

**Version 5 — 24 Avril 2026**
**Source de vérité** : aligné sur DB Supabase (`lixverse_characters` + `lixverse_character_powers` + `lixverse_user_characters`).
**Statut** : version officielle, remplace toutes les versions antérieures.

---

# VUE D'ENSEMBLE

16 personnages répartis en 5 tiers de rareté.
1 seul personnage actif à la fois (switch libre avec cooldown 30 min).
Chaque personnage possède 3 niveaux de pouvoir débloqués par fragments accumulés.
3 utilisations par charge, puis recharge en énergie (5é uniforme, sauf TARDIGRUM auto).

## Architecture DB

Les caractères sont gérés par 3 tables Supabase :

| Table | Rôle | Nb lignes |
|---|---|---|
| `lixverse_characters` | Catalogue master des 16 personnages | 16 |
| `lixverse_character_powers` | 3 pouvoirs par personnage (16 × 3 = 48) | 48 |
| `lixverse_user_characters` | Collection par utilisateur (fragments, niveau, actif, uses) | variable |

### Note technique importante — Slugs vs Display names

Les **slugs** (identifiants techniques DB) conservent les anciens noms pour ne pas casser les références. Les **display names** (affichés dans l'UI) sont les noms V5.

| Slug DB | Display name V5 | Emoji |
|---|---|---|
| `hawk_eye` | Golden Eagle | 🦅 |
| `amber_fox` | Mariposa | 🦋 |
| `silver_wolf` | Momo | 🐿️ |

Les 13 autres slugs correspondent à leur display name (ex: `emerald_owl` → Emerald Owl).

---

# FRAGMENTS — Seuils par tier

| Tier | Niv 1 | Niv 2 (cumul) | MAX (cumul) | Recharge |
|------|-------|---------------|-------------|----------|
| Standard | 10 | 20 | 30 | 5é |
| Rare | 8 | 18 | 25 | 5é |
| Elite | 7 | 14 | 20 | 5é |
| Mythique | 6 | 12 | 18 | 5é |
| Ultimate | 3 | 5 | 6 | 0é (auto 48/36/24h selon niveau) |

**Logique** : plus le tier est rare, moins il faut de fragments (car les fragments de tier élevé sont eux-mêmes très rares à obtenir).

**Efficiency bonus** (multiplicateur global appliqué aux pouvoirs équipés) :

| Tier | Efficiency bonus |
|---|---|
| Standard | 0.30 |
| Rare | 0.45 |
| Elite | 0.60 |
| Mythique | 0.80 |
| Ultimate | 1.00 |

---

# OÙ TROUVER DES FRAGMENTS

## Abonnements mensuels
| Abonnement | Standard | Rare | Elite | Mythique |
|------------|----------|------|-------|----------|
| Silver $4.99 | 3 | — | — | — |
| Gold $9.99 | 3 | 2 | 2 | — |
| Platinum $20 | 3 | 2 | 3 | 1 |

## Caisses Lix (achat en boutique)
| Caisse | Prix | Contenu possible |
|--------|------|-----------------|
| Bois | 100 Lix | 1 frag Standard (garanti) |
| Argent | 300 Lix | 1-2 frags Standard ou 1 frag Rare |
| Or | 800 Lix | 1-2 frags Rare ou 1 frag Elite |
| Légendaire | 2 500 Lix | 1-2 frags Elite ou 1 frag Mythique |

## Défis LixVerse
Les défis hebdomadaires et mensuels récompensent des fragments selon le classement :
- 1er : 3 frags du tier le plus élevé du défi
- 2e-3e : 2 frags
- 4e-10e : 1 frag
- Participation : XP uniquement

## Paliers XP utilisateur
| Palier XP | Récompense |
|-----------|------------|
| 500 XP | 5é + 20 Lix |
| 5 000 XP | 1 frag Rare + 50 Lix |
| 10 000 XP | 2 frags Rare + 100 Lix |
| 25 000 XP | 1 frag Elite + 200 Lix |
| 50 000 XP | 1 frag Mythique + 500 Lix |

## Événements spéciaux (TARDIGRUM uniquement)
Les frags Ultimate ne sont disponibles que lors d'événements rares :
- Défis communautaires spéciaux (1 frag pour les 100 premiers)
- Événements saisonniers (Ramadan, Journée Mondiale de la Santé)
- Milestones LIXUM (10K utilisateurs, 100K utilisateurs)
- LIX-QUEST événements spéciaux
- Jamais via abonnement, jamais via caisses

---

# STANDARD — 5 PERSONNAGES

## 1. Emerald Owl 🦉
**Slug DB** : `emerald_owl`
**Spécialité** : Résumés nutritionnels et suggestions repas
**Tier** : Standard | Frags : 10 → 20 → 30 | Recharge : 5é | Efficiency : 0.30
**Description** : Le hibou émeraude, sage gardien de la nutrition.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Résumé du jour | Récap macros P/G/L vs objectif avec indicateur vert/orange/rouge | modal_inline |
| 2 | Alerte Macros | Notification quand un macro est en dessous de 80% de l'objectif | toggle |
| MAX | Suggestion Repas ⭐ | 1 suggestion/jour du repas idéal pour compléter ta journée (calcul DB) | redirect |

---

## 2. Golden Eagle 🦅
**Slug DB** : `hawk_eye`
**Spécialité** : Micronutriments
**Tier** : Standard | Frags : 10 → 20 → 30 | Recharge : 5é | Efficiency : 0.30
**Description** : Le faucon à l'œil perçant, spécialiste des détails cachés.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Micronutriments | Affichage détaillé fer, zinc, calcium, vitamines après scan | modal_inline |
| 2 | Comparateur Scans | Compare 2 scans côte à côte macros + micros | redirect |
| MAX | Historique Scanner ⭐ | Historique 30 derniers scans avec tendances | redirect |

---

## 3. Ruby Tiger 🐯
**Slug DB** : `ruby_tiger`
**Spécialité** : Bonus XP activité physique
**Tier** : Standard | Frags : 10 → 20 → 30 | Recharge : 5é | Efficiency : 0.30
**Description** : Le tigre rubis, force brute et discipline de fer.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Boost XP +10% | +10% bonus XP appliqué à la prochaine activité enregistrée. Consomme 1 use. | redirect_with_boost |
| 2 | Boost XP +20% | +20% bonus XP (remplace le +10%). Consomme 1 use. | redirect_with_boost |
| MAX | Boost XP +30% + Badge ⭐ | +30% bonus XP + badge doré 🐯 sur le Wall of Health. Consomme 1 use. | redirect_with_boost |

---

## 4. Mariposa 🦋
**Slug DB** : `amber_fox`
**Spécialité** : Substitutions d'ingrédients
**Tier** : Standard | Frags : 10 → 20 → 30 | Recharge : 5é | Efficiency : 0.30
**Description** : Le renard ambre, rusé et adaptable à tout régime (display papillon = métamorphose alimentaire).

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Substitution ×1 | 1 substitution d'ingrédient par jour (calcul DB) | modal_inline |
| 2 | Substitution ×2 | 2 substitutions par jour | modal_inline |
| MAX | Mode Régime ⭐ | 3 sub/jour + filtre automatique scans (keto, végé, sans gluten) | redirect |

---

## 5. Gipsy 🕷️
**Slug DB** : `gipsy`
**Spécialité** : Corrélations humeur-nutrition-hydratation-activité
**Tier** : Standard | Frags : 10 → 20 → 30 | Recharge : 5é | Efficiency : 0.30
**Description** : L'araignée tisseuse, connecte les données de santé entre elles.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Humeur ↔ Nutrition | Graphique hebdo corrélation humeur et nutrition | modal_inline |
| 2 | Hydratation ↔ Énergie | Corrélation hydratation et niveau d'énergie perçu | modal_inline |
| MAX | Toile de Santé ⭐ | Rapport mensuel croisé nutrition+humeur+hydratation+activité | redirect |

---

# RARE — 5 PERSONNAGES

## 6. Jade Phoenix 🔥
**Slug DB** : `jade_phoenix`
**Spécialité** : Récupération intelligente et protection des streaks
**Tier** : Rare | Frags : 8 → 18 → 25 | Recharge : 5é | Efficiency : 0.45
**Description** : Le phénix de jade, maître de la récupération et de la résilience.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Détection Récupération | Analyse ton activité récente + humeur et recommande un jour de repos si nécessaire | modal_inline |
| 2 | Nutrition Récupération | Suggère des aliments anti-inflammatoires et riches en protéines après un effort intense | modal_inline |
| MAX | Renaissance ⭐ | Récupère 1 streak perdu par semaine. Rattrape 1 jour manqué comme si tu ne l'avais jamais raté | redirect |

---

## 7. Momo 🐿️
**Slug DB** : `silver_wolf`
**Spécialité** : Streaks bienveillants
**Tier** : Rare | Frags : 8 → 18 → 25 | Recharge : 5é | Efficiency : 0.45
**Description** : Le loup d'argent, traqueur de constance et gardien des habitudes (display écureuil = accumulation de réserves).

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Traqueur de Streaks | Affiche tes streaks actifs : scans, activité, humeur, hydratation | modal_inline |
| 2 | Bonus Streak | +5 Lix automatiques quand un streak atteint 7 jours sur n'importe quelle catégorie | toggle |
| MAX | Meute ⭐ | Lie 2 streaks ensemble : si l'un tombe, l'autre le protège pendant 24h. Bouclier de meute | redirect |

---

## 8. Boukki 🦴
**Slug DB** : `boukki`
**Spécialité** : Planification repas et optimisation calorique
**Tier** : Rare | Frags : 8 → 18 → 25 | Recharge : 5é | Efficiency : 0.45
**Description** : La hyène rusée du folklore africain, stratège de l'alimentation optimale.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Calories Restantes | Combien de kcal il te reste pour aujourd'hui avec répartition P/G/L optimale suggérée | modal_inline |
| 2 | Complément Repas | Après un scan, suggère quoi ajouter au repas pour atteindre ton objectif macro du jour | modal_inline |
| MAX | Festin Optimisé ⭐ | Planificateur complet de journée : 3 repas optimisés selon tes objectifs, calculés depuis la DB | redirect |

---

## 9. Iron Rhino 🦏
**Slug DB** : `iron_rhino`
**Spécialité** : Objectifs fitness personnalisés et défis hebdomadaires
**Tier** : Rare | Frags : 8 → 18 → 25 | Recharge : 5é | Efficiency : 0.45
**Description** : Le rhinocéros de fer, puissance brute et objectifs ambitieux.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Objectif Personnalisé | Objectif hebdo qui va au-delà des 150 min OMS, adapté à ton profil et ton historique | modal_inline |
| 2 | Bilan Enrichi | Post-activité enrichi : vitesse moy, zones d'intensité, comparaison semaine précédente | modal_inline |
| MAX | Charge du Rhino ⭐ | Défi fitness hebdo personnalisé avec récompense Lix. Ex: "3 courses de 5km = +50 Lix" | modal_inline |

---

## 10. Coral Dolphin 🐬
**Slug DB** : `coral_dolphin`
**Spécialité** : Hydratation intelligente et rappels adaptés
**Tier** : Rare | Frags : 8 → 18 → 25 | Recharge : 5é | Efficiency : 0.45
**Description** : Le dauphin de corail, gardien de l'équilibre hydrique.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Rappel Hydratation | Rappels intelligents basés sur ton activité du jour + climat. "Bois 250ml maintenant" | modal_inline |
| 2 | Tracker Hydratation | Jauge animée + historique semaine avec coefficients BHI (Beverage Hydration Index) | modal_inline |
| MAX | Vague Bleue ⭐ | Coefficients hydratation personnalisés par boisson + objectif adapté poids/activité/climat | redirect |

---

