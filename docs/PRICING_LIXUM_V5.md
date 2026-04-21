# LIXUM — Documentation Pricing Complète
## Version 5 — 21 Avril 2026

---

# 🎯 VUE D'ENSEMBLE

LIXUM fonctionne avec **deux monnaies virtuelles** et **une monnaie réelle** :

| Monnaie | Rôle | Obtention principale |
|---|---|---|
| ⚡ **Énergie (é)** | Consommée pour les actions IA | Cadeaux abonnement, achats via Lix, recharges ponctuelles |
| 💎 **Lix** | Monnaie de récompense + paywalls | Actions utilisateur (scans, activités), achats directs, abonnements |
| 💵 **USD / Devises réelles** | Abonnements, achats Lix | Cartes bancaires, mobile money (Wave, Orange Money), Stripe, in-app stores |

### Règles économiques de base
- **1 USD = 1 000 Lix** (base de conversion marketing)
- **10 Lix = 1 énergie** (conversion fixe)
- **Pool énergie cumulatif** : jamais réinitialisé, aucun cap, sauf consommation réelle
- **MediBook historique = gratuit à vie**, même après résiliation d'abonnement

---

# ⚡ SECTION 1 — ÉNERGIE

## Features qui consomment de l'énergie

| Feature | Coût standard | Description |
|---|---|---|
| 💬 **Chat ALIXEN** | 10 é / message | Après les 4 messages onboarding gratuits |
| 📸 **XScan repas** | 20 é / scan | 2 photos profondeur + analyse qté |
| 🖼️ **Galerie photo repas** | 12 é / scan | Analyse 1 photo depuis galerie |
| 🍲 **Recette ALIXEN** | 8 é / lot | Génération 3 recettes via IA |
| 📄 **Document médical** | 30 é / document | Analyse complète OCR + synthèse |
| 💊 **Photo médicament** | 12 é / médicament | Reconnaissance + détails |
| 🛒 **CartScan caddie code-barre** | 10 é / caddie entier | 1 paiement par caddie, pas par produit |
| 🛒 **CartScan photo fallback** | 10 é / photo | Si code-barre illisible |
| 🔍 **MediBook recherche manuelle** | 5 é / produit introuvable | Complément après scan médoc |
| 📚 **MediBook batch 1-5 médicaments** | 50 é / lot | Reconnaissance multi-médicaments |
| 📚 **MediBook batch 6-10 médicaments** | 80 é / lot | Batch élargi |

## Réductions énergie par abonnement

| Abonnement | Réduction énergie IA |
|---|---|
| Free | 0 % |
| Silver (4.99 $) | 0 % |
| **Gold (9.99 $)** | **-10 %** (appliqué sur tous coûts IA) |
| **Platinum (20 $)** | **-25 %** (appliqué sur tous coûts IA) |

### Exemple concret — Chat ALIXEN
- Free / Silver : **10 é**
- Gold : 10 × 0.90 = **9 é**
- Platinum : 10 × 0.75 = **7.5 é** (arrondi à 8 é minimum facturable)

### Réductions cumulables avec caractères
- **TARDIGRUM Niv 1** : -50 % sur toutes actions IA (stackable avec abo)
  - Free + TARDIGRUM Niv 1 : 10 × 0.50 = **5 é**
  - Platinum + TARDIGRUM Niv 1 : 10 × 0.75 × 0.50 = **3.75 é** (arrondi à 4 é)
- **TARDIGRUM MAX** : -80 % IA
  - Platinum + TARDIGRUM MAX : 10 × 0.75 × 0.20 = **1.5 é** (floor à 1 é minimum)
- **Diamond Simba Niv 2 Mode Royal** (24h) : -50 % sur chats ALIXEN uniquement

## Sources d'énergie

| Source | Montant | Fréquence |
|---|---|---|
| Onboarding initial | 20 é | 1 fois à la création du compte |
| Trial chat | 4 messages gratuits | 1 fois |
| Trial XScan | 1 scan gratuit | 1 fois |
| Trial galerie | 2 scans gratuits | 1 fois |
| Trial recette | 1 lot gratuit | 1 fois |
| Trial médic | 1 analyse gratuite | 1 fois |
| Trial CartScan | 5 caddies gratuits | 1 fois |
| **Cadeau mensuel Silver** | **+200 é** | Chaque mois (anniversaire abo) |
| **Cadeau mensuel Gold** | **+400 é** | Chaque mois |
| **Cadeau mensuel Platinum** | **+800 é** | Chaque mois |
| Recharge Lix → é | +X é (10 Lix = 1 é) | À la demande |
| Palier XP 500 | +5 é | 1 fois |
| Paliers XP élevés | +X é | Progressifs |

**Règle** : l'énergie se cumule dans un **pool unique sans cap ni reset**.

---

# 💎 SECTION 2 — LIX

## Sources de Lix (crédits)

| Source | Montant | Conditions |
|---|---|---|
| 📸 Scan repas (XScan/galerie) | +10 Lix | Par scan validé |
| ✍️ Saisie manuelle repas | +3 Lix | Par saisie |
| 🏃 Enregistrement activité | +5 Lix | Par activité validée |
| 💦 Log hydratation | Variable | Bonus Coral Dolphin MAX : +15 XP/jour + streak |
| 🔥 Bonus streak Momo | +5 Lix × streak | Si Momo Niv 2 équipé |
| 🏆 Défi LixVerse rang 1 | 5 000 Lix | Récompense mensuelle "Lixer du mois" |
| 🏅 Récompense défi rang 2-10 | Variable | Selon défi + position |
| 🎁 Cadeau mensuel abonnement | +3 000 / 6 000 / 12 000 | Silver / Gold / Platinum |
| 🎁 Cadeau wall (reçu) | Variable | Cadeaux entre users |
| 📊 Palier XP 500 | +20 Lix | 1 fois |
| 📊 Palier XP 5 000 | +50 Lix | 1 fois |
| 📊 Palier XP 10 000 | +100 Lix | 1 fois |
| 📊 Palier XP 25 000 | +200 Lix | 1 fois |
| 📊 Palier XP 50 000 | +500 Lix | 1 fois |
| 💰 Achat direct Lix (packs) | 50 à 50 000 Lix | Selon pack acheté |
| 🐴 **Alburax MAX Pégase Guardian** | **+10 % permanent** | Sur tous gains Lix tant qu'équipé |
| 🐴 **Alburax Niv 2 Mode Pégase** (24h) | **×2 Lix sur XScans** | Pendant 24h après activation |

## Dépenses de Lix (débits)

### Paywalls MediBook / Mes Stats (24h-7j)

| Feature | Coût | Exception |
|---|---|---|
| 💦 Hydration 7j Dashboard | 100 Lix / 24h | Gratuit si Coral Dolphin Niv 2 équipée |
| 🔬 Micros history 7j (Mes Stats) | 100 Lix / 7j | Gratuit si Golden Eagle Niv 2 équipée |
| 📊 MediBook Stats 30j | 500 Lix / 24h | Gratuit si Silver actif ou Gipsy Niv 2 équipée ou Emerald Owl Niv 1 |
| 📊 MediBook Stats 365j | 5 000 Lix / 24h | Gratuit si Gold actif ou LICORNIUM MAX ou Gipsy MAX |
| 📊 MediBook Stats Origine | 10 000 Lix / 24h | Gratuit si Platinum actif ou Diamond Simba MAX ou TARDIGRUM MAX |

### Paywalls Profils enfants

| Situation | Coût |
|---|---|
| 1er profil enfant (abonné actif) | **Gratuit** |
| 1er profil enfant (user free) | 5 000 Lix |
| 2e profil enfant et au-delà | 5 000 Lix (même abonné) |

### Recharges énergie

| Ratio | Montant énergie | Coût Lix |
|---|---|---|
| 10:1 fixe | +10 é | 100 Lix |
| 10:1 fixe | +100 é | 1 000 Lix |
| 10:1 fixe | +500 é | 5 000 Lix |

**Restriction** : montant doit être multiple de 10.

### Recharges caractères (post 3 uses)

| Tier | Coût recharge |
|---|---|
| Standard | 5 é (= 50 Lix) |
| Rare | 5 é (= 50 Lix) |
| Elite | 5 é (= 50 Lix) |
| Mythique | 5 é (= 50 Lix) |
| Ultimate | **Gratuit** (auto-recharge 24h/36h/48h) |

### Caisses Lix (fragments caractères)

| Caisse | Prix |
|---|---|
| 🪵 Bois | 100 Lix |
| 🥈 Argent | 300 Lix |
| 🥇 Or | 800 Lix |
| 💎 Légendaire | 2 500 Lix |

---

# 💵 SECTION 3 — ABONNEMENTS

## Grille tarifaire

| Fonction | Free | Silver (4.99 $) | Gold (9.99 $) | Platinum (20 $) |
|---|---|---|---|---|
| **Énergie mensuelle** | 0 é | 200 é | 400 é | 800 é |
| **Lix mensuels** | 0 | 3 000 | 6 000 | 12 000 |
| **Fragments Std mensuels** | 0 | 3 | 3 | 3 |
| **Fragments Rare mensuels** | 0 | 0 | 2 | 2 |
| **Fragments Elite mensuels** | 0 | 0 | 2 | 3 |
| **Fragments Myth mensuels** | 0 | 0 | 0 | 1 |
| **Stats MediBook inclus** | aucune | 30 j | 365 j | Origine (tout historique) |
| **1er enfant gratuit** | ❌ | ✅ | ✅ | ✅ |
| **Réduction énergie IA** | 0 % | 0 % | **-10 %** | **-25 %** |
| **MediBook gratuit** | ✅ | ✅ | ✅ | ✅ |

### Règles cumul
- Énergie mensuelle **s'ajoute au pool existant** (jamais remplacée)
- Lix mensuels **s'ajoutent au solde**
- Fragments mensuels **s'ajoutent à la collection** du personnage concerné (choix auto ou manuel selon design final)
- **Reset = anniversaire de l'abo** (pas le 1er du mois calendaire)

### Cadeau mensuel non perdu
Si un utilisateur ne consomme pas son cadeau mensuel, **il s'accumule**. Jamais de perte pour l'utilisateur.

### Post-résiliation
- `MediBook log` reste gratuit à vie (obligation éthique santé)
- Stats longues (30j+) basculent sur le paywall Lix
- Caractères possédés conservés (fragments, niveaux)
- Cadeau mensuel stoppé

## Packs Lix (achat direct)

| Pack | Prix | Contenu |
|---|---|---|
| Starter | 0.99 $ | 1 000 Lix |
| Bronze | 2.99 $ | 3 000 Lix |
| Argent | 4.99 $ | 5 000 Lix |
| Or | 9.99 $ | 10 500 Lix (+5 % bonus) |
| Platine | 19.99 $ | 22 000 Lix (+10 %) |
| Prestige | 49.99 $ | 60 000 Lix (+20 %) |

**Marge Web vs Stores** : Web lixum.com bénéficie de +20 % de bonus Lix supplémentaire (car Stripe 3 % vs Apple/Google 30 %). Web = marge ~97 %, Stores = marge ~70 %.

### Abonnements annuels (web uniquement) : -25 %
Silver annuel : 44.91 $ au lieu de 59.88 $ (soit -25 %).

---

# 🎴 SECTION 4 — CARACTÈRES (IMPACT PRICING)

## Règles d'économie caractères

- **Recharge uniforme 5 é** pour Standard à Mythique (= 50 Lix si rechargé via Lix)
- **3 uses par charge**, puis recharge nécessaire
- **Cap 10 uses / 24h** pour les pouvoirs IA (Diamond Simba, Alburax uniquement)
- **TARDIGRUM : auto-recharge gratuite** (48h Niv1 / 36h Niv2 / 24h MAX)
- **Cooldown switch 30 min** entre deux changements de compagnon actif

## Tableau des économies potentielles par carte équipée

### Standard (5 cartes)

| Carte | Économie maximale / 24h | Détail |
|---|---|---|
| Emerald Owl Niv 1 | 500 Lix | Stats 30j MediBook gratuit |
| Golden Eagle Niv 2 | 100 Lix | Historique micros 7j gratuit |
| Golden Eagle MAX | 500 Lix | Historique micros 30j |
| Ruby Tiger MAX | Variable XP | +30 % XP toutes sources (paliers + récompenses) |
| Mariposa MAX | 150 Lix | 5 substitutions gratuites + Mode Régime |
| Gipsy Niv 2 | 500 Lix | Stats 30j MediBook gratuit |
| **Gipsy MAX** | **5 000 Lix** | **Stats 365j MediBook gratuit** |

### Rare (5 cartes)

| Carte | Économie / avantage | Détail |
|---|---|---|
| Jade Phoenix MAX | Renaissance | Session récupération gratuite si score <40 % 5j |
| **Momo Niv 2** | **+5 Lix × streak** | Crédit automatique quotidien via `credit_lix` |
| Momo MAX | Streak Shield | 1 jour raté pardonné/semaine |
| Boukki MAX | Alerte Meute | Conseil alimentaire auto |
| Iron Rhino MAX | +15 % XP défis | Multiplicateur récompenses défis |
| Coral Dolphin Niv 2 | 100 Lix / 24h | Hydration 7j gratuit |
| Coral Dolphin MAX | +65 XP / 7j | Streak hydratation rewards |

### Elite (3 cartes)

| Carte | Économie maximale | Détail |
|---|---|---|
| **LICORNIUM MAX** | **5 000 Lix / 24h** | Stats 365j MediBook gratuit |
| Jaane Snake MAX | Alerte sédentarité | Prévention auto |
| **MOSQUITO MAX** | **13 pouvoirs Niv 1** | Accès polyvalent Std + Rare + Elite |

### Mythique (2 cartes)

| Carte | Économie / avantage | Détail |
|---|---|---|
| Diamond Simba Niv 2 Mode Royal | -50 % énergie chat 24h | Stackable avec abo |
| **Diamond Simba MAX** | **10 000 Lix / 24h + carte physique + Hall of Fame** | Stats Origine permanent + rapport vocal |
| Alburax Niv 2 Mode Pégase | ×2 Lix XScans 24h | Bonus temporaire |
| **Alburax MAX Pégase Guardian** | **+10 % Lix permanents** | Stackable avec toutes autres sources |

### Ultimate (1 carte)

| Carte | Économie maximale | Détail |
|---|---|---|
| TARDIGRUM Niv 1 | -50 % énergie IA permanent | Stackable avec abo |
| TARDIGRUM Niv 2 | -50 % é + tous pouvoirs Niv 1 Std/Rare/Elite | 3 uses / 24h auto 36h |
| **TARDIGRUM MAX** | **-80 % é + tout gratuit non-IA + carte physique or** | Passif divin + Immortalité symbolique |

## Stackabilité — Exemples de cumul

### Exemple 1 : User Free + Alburax MAX équipé
- +10 % Lix sur tous gains
- 1 chat IA gratuit / use (3 uses = 3 chats gratuits)
- 1 XScan IA gratuit / use
- 1 recette IA gratuite / use
- Secret Pocket MediBook illimité
- Streak Shield cumulable avec Momo MAX

### Exemple 2 : User Platinum + TARDIGRUM Niv 1
- Abonnement : -25 % énergie IA
- TARDIGRUM Niv 1 : -50 % énergie IA
- Cumul : 10 × 0.75 × 0.50 = **3.75 é par chat** (au lieu de 10 é → économie 62.5 %)

### Exemple 3 : Combo ultime (théorique, rare en pratique)
User Platinum + TARDIGRUM MAX + Alburax MAX équipés tour à tour :
- Énergie IA : -80 % + -25 % = **~1 é par chat** (floor à 1 é min)
- Lix : +10 % permanent sur tous gains
- Stats : tout débloqué à vie
- Cartes physiques : or massif TARDIGRUM + argenté Alburax
- **Valeur équivalente : 100+ $/mois au prix réel**

---

# 🌍 SECTION 5 — LIX-QUEST (feature future, Session 6)

## Concept
Fragments et cartes complètes apparaissent sur la carte Live Activités, collectables uniquement en étant physiquement dans la zone GPS pendant une activité réelle (marche, course, vélo).

## Types de drops

### Frag drops classiques
Quelques fragments dispersés géographiquement chaque jour/semaine.

### Carte complète thématique
| Zone thématique | Carte pouvant apparaître |
|---|---|
| Zones humides (marais, étangs, jardins botaniques, zoos) | 🦟 MOSQUITO |
| Parcs nationaux, réserves, zoos | 🦁 Diamond Simba |
| Hippodromes, ranchs, parcs équestres | 🐴 Alburax |
| Événements santé officiels (marathons, courses sponsorisées) | 🧬 TARDIGRUM frags |
| Salles de sport partenaires | 🐯 Ruby Tiger |
| Plages, piscines, bassins | 🐬 Coral Dolphin |
| Parcs de street workout | 🦏 Iron Rhino |
| Forêts, arbres, espaces verts | 🐿️ Momo |

### Drops programmés (dashboard admin LIXUM)
Pour événements marketing, partenariats ministères, journées mondiales.

## Anti-triche
- Vérification GPS obligatoire
- Caps vitesse : marche ≤ 8 km/h, course ≤ 25 km/h, vélo ≤ 45 km/h
- Système de détection des faux déplacements

## Impact stratégique

1. **Boucle vertueuse santé** : sortir → bouger → gagner → utiliser → meilleure santé
2. **Alignement santé publique** : partenariats ministères, collectivités
3. **Différenciation concurrentielle mondiale** : premier health-to-earn au monde
4. **Collection physique premium** : cartes AAA deviennent objets de désir IRL
5. **Budget marketing** : les événements LIX-QUEST peuvent être sponsorisés par des partenaires

## Implémentation
Session 6 LIX-QUEST, après Chantier XP (Session 5).

---

# 📌 ANNEXES

## Résumé des 25 tables Supabase liées au pricing

### Tables financières
- `users_profile` — état courant (lix_balance, energy, subscription_tier)
- `transactions_lix` — audit financier Lix (11 sources)
- `subscription_history` — audit abonnements (9 event_types)
- `hydration_access_log` — logs paywalls hydration
- `stats_access_log` — logs paywalls stats MediBook

### Tables caractères
- `lixverse_characters` — catalogue 16 caractères
- `lixverse_user_characters` — possession users
- `lixverse_character_powers` — pouvoirs utilisés
- `lixverse_character_progress` — progression XP
- `lixverse_fragments` — catalogue fragments
- `user_characters` — ⚠️ LEGACY à migrer en Session 5

### Tables LixVerse / défis
- `lixverse_challenges` — défis actifs/passés
- `challenge_templates` — templates défis
- `challenge_score_events` — événements scoring
- `lixverse_groups` / `lixverse_group_members`
- `lixverse_binome_*` — 5 tables binômes
- `wall_stickers` / `wall_sticker_catalog` / `wall_gifts`

### Tables ALIXEN / IA
- `alixen_voice_sessions`
- `alixen_insights`
- `alixen_learned_preferences`
- `alixen_annual_summaries`
- `alixen_notifications`

### Tables médicales
- `medical_analyses` (22 colonnes)
- `medical_shares` (QR 30 min)
- `diagnostics` / `vaccinations` / `allergies` / `medications`
- `family_members` / `family_allergies`

### Tables nutrition / CartScan
- `meals` / `daily_summary` / `activities` / `hydration_logs`
- `meals_master` / `ingredients_master` / `preparations_master`
- `cart_reports`

## Versions des documents
- V1 Pricing : février 2026 (AfriCalo → LIXUM transition)
- V2 Pricing : mars 2026 (premium + business model first draft)
- V3 Pricing : 15 avril 2026 (réductions abo -25 %/-50 %)
- **V4 Pricing** : 18 avril 2026 (énergie pool unique, transactions_lix)
- **V5 Pricing (ce document)** : 21 avril 2026 (caractères V5, grille frags inversée, réductions abo recalibrées -10 %/-25 %, LIX-QUEST concept)

---

*Document V5 généré le 21 avril 2026.*
*Prochaine révision : après implémentation Chantier XP (Session 5) et LIX-QUEST (Session 6).*
