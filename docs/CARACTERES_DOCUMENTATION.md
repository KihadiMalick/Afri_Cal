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

# ELITE — 3 PERSONNAGES

## 11. LICORNIUM 🦄
**Slug DB** : `licornium`
**Spécialité** : Analyse nutritionnelle profonde et planification repas
**Tier** : Elite | Frags : 7 → 14 → 20 | Recharge : 5é | Efficiency : 0.60
**Description** : La licorne cristalline, maîtresse absolue de la nutrition avancée.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Analyse Complète | Après scan : macros + micros + score qualité nutritionnelle /10 | modal_inline |
| 2 | Planificateur 3 Repas | Planifie petit-déj + déjeuner + dîner optimisés selon ton objectif (calcul DB) | redirect |
| MAX | Corne Magique ⭐ | Détecte les carences probables sur 7 jours et suggère les aliments correctifs avec quantités exactes | redirect |

---

## 12. Jaane Snake 🐍
**Slug DB** : `jaane_snake`
**Spécialité** : Calculs fitness ultra-précis et programmes personnalisés
**Tier** : Elite | Frags : 7 → 14 → 20 | Recharge : 5é | Efficiency : 0.60
**Description** : Le serpent de Jaane, prédateur silencieux de la performance physique.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Venin Précis | Calcul calories ultra-précis basé sur poids + durée + intensité + MET spécifique à l'activité | modal_inline |
| 2 | Mue Hebdo | Rapport hebdo complet : progression volume, intensité, comparaison semaine précédente | redirect |
| MAX | Hypnose ⭐ | Programme d'entraînement personnalisé 4 semaines généré depuis ton historique d'activités | redirect |

---

## 13. MOSQUITO 🦟
**Slug DB** : `mosquito`
**Spécialité** : Accès rationné à tous les pouvoirs du jeu (Joker universel)
**Tier** : Elite | Frags : 7 → 14 → 20 | Recharge : 5é | Efficiency : 0.60
**Description** : Le moustique — petit mais redoutable. Accède à tout, partout, de manière rationnée.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Piqûre Nutrition | 1 analyse rapide post-scan avec score santé (version light) | modal_inline |
| 2 | Piqûre Activité | 1 bilan post-activité enrichi avec zones d'intensité (version light) | modal_inline |
| MAX | Essaim ⭐ | 1 accès/jour à N'IMPORTE quel pouvoir Niv1 de n'importe quelle carte du jeu, même non possédée | redirect |

**Note** : MOSQUITO ne possède pas le pouvoir directement — il "emprunte" celui d'un autre personnage pour 1 utilisation.

---

# MYTHIQUE — 2 PERSONNAGES

## 14. Diamond Simba 🦁
**Slug DB** : `diamond_simba`
**Spécialité** : Boost global XP + rapport mensuel complet
**Tier** : Mythique | Frags : 6 → 12 → 18 | Recharge : 5é | Efficiency : 0.80
**Description** : Le lion de diamant, roi incontesté de la savane digitale. Sa présence booste tout.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Rugissement | Boost XP +50% sur TOUTES les actions : scans, activités, humeur, hydratation | redirect_with_boost |
| 2 | Territoire | Dashboard enrichi : mini-graphique tendance 30 jours nutrition + activité + hydratation | redirect |
| MAX | Roi de la Savane ⭐ | Rapport mensuel complet PDF exportable : nutrition + activité + hydratation + humeur + évolution poids | redirect |

---

## 15. Alburax 🐴
**Slug DB** : `alburax`
**Spécialité** : Double Lix + protection streaks + MediBook avancé
**Tier** : Mythique | Frags : 6 → 12 → 18 | Recharge : 5é | Efficiency : 0.80
**Description** : La créature céleste, symbole de transcendance et de voyage entre les mondes.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Streak Shield | Protection 1 jour si tu casses ton streak. Activable une fois par semaine | redirect_with_boost |
| 2 | MediBook avancé | Accès aux recherches médicales approfondies dans MediBook | redirect |
| MAX | Transcendance ⭐ | Double Lix permanent + streak shield permanent + MediBook illimité | redirect_with_boost |

---

# ULTIMATE — 1 PERSONNAGE

## 16. TARDIGRUM 🧬
**Slug DB** : `tardigrum`
**Spécialité** : Tous les pouvoirs combinés + statut légendaire
**Tier** : Ultimate | Frags : 3 → 5 → 6 | Recharge : **0é (auto)** | Efficiency : 1.00
**Description** : Le survivant ultime. Inspiré du tardigrade, l'organisme le plus résistant de l'univers. Indestructible.

| Niv | Pouvoir | Description | Type |
|-----|---------|-------------|------|
| 1 | Résistance | +30% XP toutes actions + efficacité énergie 100% (coût IA divisé par 2) | redirect_with_boost |
| 2 | Adaptation | Accès à TOUS les pouvoirs Niv1 de TOUTES les cartes du jeu simultanément | toggle |
| MAX | Immortel ⭐ | Badge Légendaire permanent sur Wall of Health + titre TARDIGRUM visible par tous + rapport santé illimité | redirect |

**Auto-recharge** :
- Niv 1 : auto 48h
- Niv 2 : auto 36h
- MAX : auto 24h

**Note** : TARDIGRUM est volontairement presque impossible à obtenir. Ses fragments ne sont disponibles que lors d'événements rares organisés par LIXUM. Un détenteur de TARDIGRUM MAX est une légende de la communauté.

---

# SYSTÈME DE RECHARGE

Chaque personnage a **3 utilisations par charge**.
Après 3 utilisations, le personnage doit être rechargé.

| Tier | Coût recharge | Temps auto (uniquement TARDIGRUM) |
|------|--------------|-----------------------------------|
| Standard | 5 énergie | — |
| Rare | 5 énergie | — |
| Elite | 5 énergie | — |
| Mythique | 5 énergie | — |
| Ultimate (TARDIGRUM) | **0é** | Auto 48h / 36h / 24h selon niveau |

**Recharge uniforme à 5é** pour tous les tiers Std/Rare/Elite/Myth = décision V5 pour simplifier l'UX et éviter la confusion. L'équilibrage est géré par la **rareté des fragments** et l'**efficiency_bonus**.

---

# SWITCH DE PERSONNAGE ACTIF

Un seul personnage actif à la fois. Le switch a les règles suivantes :

- **Cooldown de 30 minutes** entre chaque switch (stocké dans `active_since` de `lixverse_user_characters`)
- Pas de coût énergie pour switcher
- Les pouvoirs Passifs du personnage précédent sont désactivés immédiatement
- Le personnage actif apparaît dans le header du Dashboard et dans l'ALIXEN Zone

---

# ACTION_TYPE — Types de pouvoirs

La DB catégorise les pouvoirs en 3 types techniques :

| Action type | Comportement UI |
|---|---|
| `modal_inline` | Ouvre un modal inline avec le résultat (ex: affichage macros) |
| `redirect` | Redirige vers une page dédiée avec filtre appliqué (ex: historique scanner) |
| `redirect_with_boost` | Redirige vers la page cible + applique un multiplicateur actif pendant X temps |
| `toggle` | Active/désactive un mode passif tant que le personnage est équipé |

**`is_superpower = true`** marque le pouvoir MAX (niveau 3) de chaque personnage. Visuellement distingué dans l'UI par une icône ⭐.

---

# CARTES PHYSIQUES COLLECTOR

Les joueurs qui atteignent le niveau MAX sur un personnage Mythique ou Ultimate reçoivent une carte physique collector envoyée **gratuitement** par LIXUM :

- Carte plastique premium
- Bordures métalliques **argentées** (Mythique) ou **dorées** (Ultimate)
- Fines lignes d'or pour Mythique, or massif pour Ultimate
- Nom du joueur et LixTag gravés
- QR code vers le profil public du joueur
- Édition limitée numérotée
- Envoi mondial gratuit (budget marketing LIXUM)

---

# NOTIFICATIONS ALIXEN PAR PERSONNAGE

Les personnages équipés au niveau MAX déclenchent des alertes ALIXEN automatiques (calcul DB, coût $0 d'IA). Ces alertes sont gérées par la RPC `check_and_generate_notifications` qui lit directement depuis `lixverse_user_characters` (fix V4+ appliqué le 24 avril).

| Personnage | Alerte | Condition | trigger_key |
|-----------|--------|-----------|-------------|
| Golden Eagle MAX | Apport fer faible | Fer moyen <9mg sur 3 jours | `iron_low_3d` |
| Golden Eagle MAX | Apport calcium faible | Calcium moyen <500mg sur 3 jours | `calcium_low_3d` |
| Gipsy MAX | Humeur en baisse | Humeur <40% sur 3 jours | `mood_low_3d` |
| Coral Dolphin MAX | Déshydratation | Hydratation <50% objectif sur 3 jours | `dehydration_3d` |
| Momo (Silver Wolf) Niv1+ | Streak en danger | Streak actif + 20h sans action | `streak_at_risk` |

**Autres alertes LIXUM** (indépendantes des caractères, activées globalement) :
- `calorie_deficit_3d` : déficit calorique >40% sur 3 jours
- `calorie_surplus_3d` : surplus calorique >30% sur 3 jours
- `sedentary_5d` : aucune activité enregistrée depuis 5 jours
- `streak_milestone_7` / `streak_milestone_30` : célébration paliers streak
- `vaccine_overdue` : rappels vaccinaux en retard
- `medication_reminder` : rappel médicaments actifs

L'utilisateur voit "ALIXEN" comme émetteur — il ne sait pas qu'il s'agit d'un template déclenché par son personnage équipé.

---

# RPC SUPABASE CARACTÈRES

Fonctions principales disponibles :

| RPC | Signature | Usage |
|-----|-----------|-------|
| `get_user_collection` | `p_user_id uuid` | Retourne la collection complète avec fragments/niveau/actif |
| `get_character_powers` | `p_user_id uuid, p_slug text` | Retourne les 3 pouvoirs d'un personnage |
| `set_active_character` | `p_user_id uuid, p_slug text` | Change le personnage actif (cooldown 30min) |
| `use_character_power` | `p_user_id uuid, p_power_key text` | Consomme 1 use et active le pouvoir |
| `recharge_character` | `p_user_id uuid, p_slug text` | Recharge 3 uses (coûte 5é sauf TARDIGRUM) |
| `add_character_fragments` | `p_user_id, p_slug, p_amount, p_reason` | Ajoute des fragments (source caisse/abo/défi/palier XP) |
| `choose_first_character` | `p_user_id, p_slug` | Onboarding : choix 1er compagnon Standard |
| `give_starting_character` | `p_user_id, p_character_id` | Onboarding auto |
| `check_character_onboarding` | `p_user_id` | Vérifie si l'utilisateur a choisi son premier perso |
| `set_character_avatar` | `p_user_id, p_character_id` | Définit l'avatar affiché |

---

# HISTORIQUE VERSIONS

| Version | Date | Changements |
|---------|------|-------------|
| V1 | Mars 2026 | 12 persos, noms "colorés" (Gold Chicken, Iron Bull...) — **legacy supprimé 24/04/2026** |
| V2 | Fin mars 2026 | Refonte complète — 16 persos, pouvoirs alignés santé |
| V3 | 10 avril 2026 | Ajustement fragments + recharges |
| V4 | 15 avril 2026 | Ajout MOSQUITO Joker — **Doc V4 obsolète, divergence DB** |
| **V5** | **24 avril 2026** | Doc alignée sur DB réelle. Renames display : Golden Eagle/Mariposa/Momo. Recharge uniforme 5é. Fragments 10/20/30 · 8/18/25 · 7/14/20 · 6/12/18 · 3/5/6. |

---

**Document versionné figé le 24 avril 2026. Remplace toutes les versions antérieures.**
**Toute modification DB des caractères doit déclencher une mise à jour de ce document.**

