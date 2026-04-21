# LIXUM — Documentation Complète des Caractères
## Version 4 — 15 Avril 2026

---

# VUE D'ENSEMBLE

16 personnages répartis en 5 tiers de rareté.
1 seul personnage actif à la fois (switch libre).
Chaque personnage a 3 niveaux de pouvoir débloqués par fragments.
3 utilisations par charge, puis recharge en énergie.

---

# FRAGMENTS — Seuils par tier

| Tier | Niv 1 | Niv 2 (cumul) | MAX (cumul) | Recharge |
|------|-------|---------------|-------------|----------|
| Standard | 7 | 17 | 47 | 5é |
| Rare | 8 | 23 | 63 | 10é |
| Elite | 9 | 29 | 79 | 15é |
| Mythique | 10 | 40 | 100 | 20é |
| Ultimate | 5 | 55 | 155 | 25é (MAX = auto 72h) |

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
- Jamais via abonnement, jamais via caisses

---

# STANDARD — 5 PERSONNAGES

## 1. Emerald Owl 🦉
Spécialité : Nutrition avancée
Tier : Standard | Frags : 7 → 17 → 47 | Recharge : 5é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Stats 30 jours | Débloque l'accès aux statistiques nutrition sur 30 jours tant qu'équipé (sinon coûte 500 Lix/24h) | Passif |
| Niv 2 | Tendance nutrition 30j | Courbe macros + calories sur 1 mois avec moyennes et évolution | Modal |
| MAX | Suggestion repas | Calcul des calories et macros restants → propose un plat depuis la base meals_master qui comble le déficit + alerte ALIXEN si macros déséquilibrés 3 jours | Actif + Alerte |

Sources de données : meals (calories, protein_g, carbs_g, fat_g), daily_summary, users_profile.daily_calorie_target
Coût IA : $0 (calcul DB uniquement)

---

## 2. Hawk Eye 🦅
Spécialité : Micronutriments
Tier : Standard | Frags : 7 → 17 → 47 | Recharge : 5é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Vue micronutriments | Après chaque scan repas, affiche les micronutriments estimés : fer, zinc, calcium, vitamine C, magnésium, potassium | Modal |
| Niv 2 | Tracker micros 7 jours | Graphique des micronutriments sur la semaine avec barres vs apports journaliers recommandés (AJR) | Modal |
| MAX | Alerte carence | Si un micronutriment est en dessous de 50% de l'AJR pendant 3 jours consécutifs → notification ALIXEN avec conseil alimentaire | Alerte |

Sources de données : meals (iron_mg, zinc_mg, calcium_mg, vitamin_c_mg, vitamin_a_ug, magnesium_mg, sodium_mg, potassium_mg)
Coût IA : $0
Note : Les micronutriments sont estimés par Claude Vision lors du scan et stockés dans les nouvelles colonnes de la table meals.

---

## 3. Ruby Tiger 🐯
Spécialité : XP / Performance
Tier : Standard | Frags : 7 → 17 → 47 | Recharge : 5é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Boost XP +10% | Multiplicateur passif sur tous les gains XP tant qu'équipé | Passif |
| Niv 2 | Boost XP +20% | Remplace le +10%, passif tant qu'équipé | Passif |
| MAX | Boost XP +30% + Badge | +30% XP passif + badge doré visible dans le profil et le Wall of Health LixVerse | Passif + Badge |

Sources de données : système XP utilisateur
Coût IA : $0
Note : Le boost XP s'applique à toutes les sources : scan, activité, humeur, hydratation, connexion, streak.

---

## 4. Amber Fox 🦊
Spécialité : Substitution d'ingrédients
Tier : Standard | Frags : 7 → 17 → 47 | Recharge : 5é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | 1 substitution/jour | Taper sur un ingrédient après un scan → propose une alternative nutritionnellement équivalente depuis ingredients_master | Actif |
| Niv 2 | 2 substitutions/jour | Même fonctionnalité, 2 fois par jour | Actif |
| MAX | Mode Régime | Active un filtre permanent sur les résultats de scan et suggestions (keto, végétarien, sans gluten, halal) selon le dietary_regime de l'utilisateur | Passif |

Sources de données : ingredients_master, preparations_master, users_profile.dietary_regime
Coût IA : $0 (lookup DB)

---

## 5. Gipsy 🕷️
Spécialité : Corrélations santé
Tier : Standard | Frags : 7 → 17 → 47 | Recharge : 5é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Humeur ↔ Nutrition | Graphique croisé montrant la corrélation entre le niveau d'humeur (max_gauge_percent) et les calories consommées sur 7 jours | Modal |
| Niv 2 | Toile de corrélations | Tous les croisements : humeur×nutrition, hydratation×énergie, météo×humeur en un seul écran | Modal |
| MAX | Toile de Santé + alerte | Rapport complet croisé + alerte ALIXEN si humeur en dessous de 40% pendant 3 jours : conseil personnalisé | Actif + Alerte |

Sources de données : moods, meals, hydration_logs, daily_summary
Coût IA : $0

---

# RARE — 5 PERSONNAGES

## 6. Jade Phoenix 🔥
Spécialité : Bien-être / Récupération
Tier : Rare | Frags : 8 → 23 → 63 | Recharge : 10é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Score bien-être du jour | Calcul croisé vitalité + humeur + nutrition → score sur 100 avec conseil | Modal |
| Niv 2 | Alerte jour de repos | Si 3 jours consécutifs d'activité intense dans daily_summary → notification "Prenez un jour de repos" | Alerte |
| MAX | Historique bien-être 30 jours | Tendance mensuelle de santé globale avec identification des points forts et faibles | Modal |

Sources de données : moods, meals, daily_summary, users_profile.vitality_score
Coût IA : $0

---

## 7. Silver Wolf 🐺
Spécialité : Streaks / Discipline
Tier : Rare | Frags : 8 → 23 → 63 | Recharge : 10é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Dashboard streaks | Streak actuel, record personnel, historique visuel en calendrier depuis users_profile.discipline_streak | Modal |
| Niv 2 | Bonus streak Lix | +5 Lix par jour de streak tant qu'équipé, crédité dans transactions_lix | Passif |
| MAX | Bouclier streak | 1 jour raté pardonné par semaine (le streak ne se reset pas), max 1 utilisation/semaine | Passif |

Sources de données : users_profile (discipline_streak, discipline_record), transactions_lix
Coût IA : $0

---

## 8. Boukki 🦴
Spécialité : Planification calories
Tier : Rare | Frags : 8 → 23 → 63 | Recharge : 10é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Calories restantes | Objectif quotidien − calories consommées = X kcal restants + suggestions de plats depuis meals_master | Modal |
| Niv 2 | Complément repas | Analyse le dernier repas → identifie les macros manquants → propose quoi ajouter pour équilibrer | Modal |
| MAX | Planificateur journée | Génère 3 repas (PDJ/Déjeuner/Dîner) depuis meals_master qui correspondent exactement à l'objectif calorique + alerte si déficit >40% pendant 3 jours | Actif + Alerte |

Sources de données : meals, meals_master, daily_summary, users_profile.daily_calorie_target
Coût IA : $0

---

## 9. Iron Rhino 🦏
Spécialité : Fitness / Défis
Tier : Rare | Frags : 8 → 23 → 63 | Recharge : 10é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Objectif brûlé personnalisé | Définir un objectif quotidien de calories brûlées, tracker vs daily_summary.total_calories_burned | Actif |
| Niv 2 | Rapport activité hebdo | Résumé 7 jours : total brûlé, jours actifs vs inactifs, meilleur jour, tendance | Modal |
| MAX | Boost défi +15% XP | +15% de XP dans les challenges LixVerse (multiplicateur sur les récompenses de défi) | Passif |

Sources de données : daily_summary, challenges LixVerse
Coût IA : $0

---

## 10. Coral Dolphin 🐬
Spécialité : Hydratation
Tier : Rare | Frags : 8 → 23 → 63 | Recharge : 10é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Tracker BHI détaillé | Score d'hydratation réelle (effective_ml basé sur le Beverage Hydration Index) vs objectif quotidien | Modal |
| Niv 2 | Historique hydratation 7 jours | Débloque l'historique d'hydratation tant qu'équipé (sinon payant) | Passif |
| MAX | Rapport hydratation 30 jours + alerte | Tendances mensuelles avec meilleur/pire jour + alerte ALIXEN si en dessous de 50% de l'objectif pendant 3 jours | Modal + Alerte |

Sources de données : hydration_logs (amount_ml, effective_ml, logged_at)
Coût IA : $0

---

# ELITE — 3 PERSONNAGES

## 11. LICORNIUM 🦄
Spécialité : Maître nutrition
Tier : Elite | Frags : 9 → 29 → 79 | Recharge : 15é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Rapport nutritionnel complet | Macros + calories + hydratation + fibres + balance calorique en une seule vue consolidée | Modal |
| Niv 2 | Planificateur 3 repas/jour | Petit-déjeuner / Déjeuner / Dîner depuis meals_master adaptés aux objectifs et au régime | Actif |
| MAX | Stats 1 an débloqué | Accès aux statistiques sur 1 an tant qu'équipé (sinon 5 000 Lix/24h) + alerte nutrition hebdo | Passif + Alerte |

Sources de données : meals, meals_master, hydration_logs, daily_summary
Coût IA : $0

---

## 12. Jaane Snake 🐍
Spécialité : Maître activité
Tier : Elite | Frags : 9 → 29 → 79 | Recharge : 15é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Optimiseur balance | Montre le déficit ou surplus calorique → recommande une action concrète : "Brûlez X kcal" ou "Mangez X kcal de plus" | Modal |
| Niv 2 | Programme activités suggéré | Suggestions d'exercices adaptés au déficit (marche 30min = -200 kcal, course 20min = -300 kcal) | Modal |
| MAX | Rapport fitness 30 jours | Courbe d'évolution + comparaison avec le mois précédent + alerte sédentarité si 5 jours sans activité | Modal + Alerte |

Sources de données : daily_summary, meals
Coût IA : $0

---

## 13. MOSQUITO 🦟
Spécialité : Joker universel (Essaim)
Tier : Elite | Frags : 9 → 29 → 79 | Recharge : 15é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Piqûre Standard | Choisir et activer le pouvoir Niv 1 de n'importe quelle carte Standard (même non possédée) | Actif |
| Niv 2 | Piqûre Avancée | Choisir et activer le pouvoir Niv 2 de n'importe quelle carte Standard | Actif |
| MAX | Essaim | Choisir et activer le pouvoir Niv 1 de n'importe quelle carte Standard OU Rare | Actif |

Sources de données : dépend du pouvoir activé
Coût IA : $0
Note : MOSQUITO ne possède pas le pouvoir directement — il "emprunte" celui d'un autre personnage pour une utilisation.

---

# MYTHIQUE — 2 PERSONNAGES (accès IA)

## 14. Diamond Simba 🦁
Spécialité : Roi des données (IA)
Tier : Mythique | Frags : 10 → 40 → 100 | Recharge : 20é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Rugissement IA | 1 résumé santé hebdomadaire personnalisé généré par ALIXEN (1 appel Claude Sonnet, gratuit — ne consomme pas d'énergie) | Actif IA |
| Niv 2 | Territoire IA | 1 recommandation santé complète basée sur toutes les données du patient (nutrition, activité, humeur, hydratation) | Actif IA |
| MAX | Roi de la Savane | Rapport mensuel IA complet + Stats Origine débloqué tant qu'équipé + alertes IA proactives personnalisées | Actif IA + Passif |

Sources de données : toutes les tables patient
Coût IA : appels Claude Sonnet inclus dans le pouvoir (pas de coût énergie pour l'utilisateur)
Note : C'est l'un des seuls personnages qui utilise vraiment l'IA. Les 3 utilisations par charge correspondent à 3 appels IA gratuits.

---

## 15. Alburax 🐴
Spécialité : Compagnon IA
Tier : Mythique | Frags : 10 → 40 → 100 | Recharge : 20é

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | 3 chats ALIXEN gratuits | 3 messages de chat avec ALIXEN sans consommer d'énergie (1 charge = 3 messages) | Actif IA |
| Niv 2 | 1 XScan IA gratuit | 1 scan de repas par photo sans coût énergie (1 charge = 1 scan) | Actif IA |
| MAX | Transcendance | Streak Shield (1 jour pardonné par semaine) + 1 recette IA gratuite par charge + accès Secret Pocket MediBook | Actif IA + Passif |

Sources de données : lixman-chat edge function, scan-meal edge function
Coût IA : appels Claude inclus dans le pouvoir
Note : Alburax est le compagnon IA du quotidien — il offre des utilisations gratuites des fonctionnalités qui normalement coûtent de l'énergie.

---

# ULTIMATE — 1 PERSONNAGE

## 16. TARDIGRUM 🧬
Spécialité : Le Dieu (tout débloqué)
Tier : Ultimate | Frags : 5 → 55 → 155 | Recharge : 25é (MAX = auto 72h)

| Niveau | Pouvoir | Description | Type |
|--------|---------|-------------|------|
| Niv 1 | Résistance | -50% coût énergie sur TOUTES les actions IA (chat, scan, recette, médical) tant qu'équipé | Passif |
| Niv 2 | Adaptation | Accès à TOUS les pouvoirs Niv 1 de toutes les cartes du jeu (Standard + Rare + Elite + Mythique) | Passif |
| MAX | Immortel | Toutes les fonctionnalités payantes non-IA sont gratuites + auto-recharge en 72h (pas besoin de payer d'énergie) + badge légendaire exclusif | Passif + Badge |

Sources de données : toutes
Coût IA : -50% sur tout (Niv 1), gratuit non-IA (MAX)
Note : TARDIGRUM est volontairement presque impossible à obtenir. Ses 5 fragments ne sont disponibles que lors d'événements rares organisés par LIXUM. Un détenteur de TARDIGRUM MAX est une légende de la communauté.

---

# SYSTÈME DE RECHARGE

Chaque personnage a 3 utilisations par charge.
Après 3 utilisations, le personnage doit être rechargé.

| Tier | Coût recharge | Temps auto (MAX uniquement) |
|------|--------------|---------------------------|
| Standard | 5 énergie | — |
| Rare | 10 énergie | — |
| Elite | 15 énergie | — |
| Mythique | 20 énergie | — |
| Ultimate (Niv 1-2) | 25 énergie | — |
| Ultimate (MAX) | Gratuit | Auto-recharge en 72 heures |

---

# CARTES PHYSIQUES COLLECTOR

Les joueurs qui atteignent le niveau MAX sur un personnage Mythique ou Ultimate reçoivent une carte physique collector envoyée gratuitement par LIXUM :

- Carte plastique premium
- Bordures métalliques argentées (Mythique) ou dorées (Ultimate)
- Fines lignes d'or pour Mythique, or massif pour Ultimate
- Nom du joueur et LixTag gravés
- QR code vers le profil public du joueur
- Édition limitée numérotée
- Envoi mondial gratuit (budget marketing LIXUM)

---

# NOTIFICATIONS ALIXEN PAR PERSONNAGE

Les personnages équipés au niveau MAX déclenchent des alertes ALIXEN automatiques (calcul DB, coût $0) :

| Personnage | Alerte | Condition |
|-----------|--------|-----------|
| Emerald Owl MAX | Macros déséquilibrés | Protéines <20% pendant 3 jours |
| Hawk Eye MAX | Carence fer/calcium/zinc/vitC | Micro <50% AJR pendant 3 jours |
| Gipsy MAX | Humeur en baisse | Humeur <40% pendant 3 jours |
| Coral Dolphin MAX | Déshydratation | Hydratation <50% objectif 3 jours |
| Boukki MAX | Déficit calorique | Déficit >40% pendant 3 jours |
| Jade Phoenix Niv2 | Repos nécessaire | 3 jours activité intense |
| Jaane Snake MAX | Sédentarité | 5 jours sans activité |
| Silver Wolf Niv1 | Streak en danger | Streak actif + 20h sans action |

L'utilisateur voit "ALIXEN" comme émetteur — il ne sait pas que c'est un template.
