# LIX-QUEST — Vision V1

**Statut** : Document de vision figé V1
**Date de création** : 24 avril 2026
**Auteur** : Malick (founder LIXUM)
**Version** : 1.0 — Première vision stratégique complète

---

## 🎯 Positionnement stratégique

LIX-QUEST est le **différenciateur principal** de LIXUM face aux apps fitness classiques (Strava, Nike Run Club, Adidas Running).

Là où les concurrents **mesurent** l'activité physique, LIX-QUEST la **rend désirable** via un univers gamifié géolocalisé mêlant :
- Récompenses virtuelles (Lix, Fragments, Énergie, Personnages)
- Récompenses réelles (partenariats locaux — coupons, tickets resto, points supermarché)
- Narratif continental (voyage des personnages à travers l'Afrique)
- Reconnaissance spirituelle (zones sacrées — mosquées, églises, lieux de culte)

**Tagline interne** : "Pokémon Go de la santé africaine — transformer la marche en quête collective."

---

## 🌍 Les Univers Parallèles LIXUM

Une même carte géolocalisée, plusieurs lentilles thématiques.

### Univers 1 — Carte Live Activité (bouton LIVE dans Activité)
- Couleur dominante : emerald (`#00D984`)
- Affiche : caisses, circuits auto-générés, autres users actifs (style flight radar)
- Filtres : aujourd'hui / semaine / mois
- Clic sur un user → voir son circuit tracé

### Univers 2 — Carte Binôme (dans LixVerse → Human → Binôme)
- Couleur dominante : ambre/gold
- Affiche : utilisateurs cherchant binôme, leurs objectifs anonymisés
- Filtres : objectif santé, zone proche, compatibilité algorithmique
- Respect total anonymat (voir section Sécurité)

### Univers futurs possibles
- Carte Partenaires (commerces/restaurants partenaires)
- Carte Événements (défis géolocalisés ponctuels)
- Carte Nutritionniste (localiser les nutritionnistes Suivi Humain)

**Design system commun** : même rendu map, mêmes contrôles, différenciation par couleur dominante et filtres.

---

## 🎮 Mécanique circuits auto-générés

### Choix utilisateur
3 distances au démarrage session Live :
- **500 m** — marche courte / test
- **1 km** — marche moyenne
- **5 km max** — course / marche longue

### Génération algorithmique
- Trace un circuit **en boucle** (pas un aller-retour) qui revient au point de départ
- Privilégie les routes praticables via OpenStreetMap
- Évite zones non éclairées la nuit (voir Sécurité)
- Pose 3-8 caisses sur le parcours selon distance choisie

### Validation
- Speed cap : 8 km/h (marche) / 25 km/h (course)
- Accéléromètre obligatoire (détection triche via GPS mock)
- Photo landmark obligatoire pour certaines caisses de grande valeur
- Plafond journalier Lix/caisses pour prévenir exploitation

---

## 📦 Types de caisses

### Caisses virtuelles (majorité — 90% du volume)

| Type | Contenu | Fréquence |
|---|---|---|
| Caisse Lix | 10-50 Lix selon distance | Commun |
| Caisse Énergie | 10-100é | Commun |
| Capsule Hydrogène | 20-50é (thème santé) | Fréquent |
| Fragments Personnage | 1 fragment d'un personnage Std/Rare/Élite | Moyen |
| Trésor Enfoui | 100-500 Lix (grande valeur, rare) | Rare |
| Carte Complète | Personnage complet Std/Rare | Très rare |
| Fragments TARDIGRUM | 1 fragment TARDIGRUM (Ultimate) | Événements spéciaux uniquement |
| Parchemin Motivation | Texte de motivation + 10 Lix | Commun |

### Caisses réelles partenaires (10% du volume)

- Coupons supermarché (exemple : −10% chez Auchan Sénégal)
- Tickets restaurant (1 boisson offerte, dessert offert)
- Points de fidélité partenaires
- Réductions services (pharmacie, kiné, salle de sport)

**Modèle économique** : partenaires paient pour placer leurs caisses. Revenu B2B2C sans friction utilisateur.

---

## 🌍 Voyage des Personnages à travers l'Afrique

### Concept central

Chaque personnage LIXUM (hors Ultimate) a **une position géographique** dans un pays. La communauté de ce pays contribue collectivement à le faire traverser le pays via leurs km cumulés.

**Exemple** : Mariposa (Rare) démarre à l'extrême est du Sénégal. Objectif : 375 000 km cumulés par tous les users sénégalais. Quand atteint, Mariposa "quitte" le Sénégal, passe en Mauritanie ou Mali, et **tous les participants sénégalais reçoivent Mariposa niveau Max pendant 48h**.

### Calibrage

- **Formule** : `objectif_km = largeur_pays_km × 1000 × facteur_tier`
- **Facteurs par tier** :
  - Standard : 1.0
  - Rare : 1.5
  - Élite : 2.0
  - Myth : 3.0
  - **Ultimate : exclu** (restent mythiques et rares)
- **Rythme visé** : 1 libération par pays tous les 2-3 mois

### Visualisation UI

Quand user clique sur un personnage dans LixVerse → Caractères :
- Carte du pays avec position actuelle du personnage
- Ligne de progression horizontale : "20 000 km / 375 000 km"
- Liste Top contributeurs anonymisés (Lixtag + km contribués)
- Temps estimé avant libération (basé sur rythme actuel)

### Récompense de libération

- Tous les participants du pays reçoivent le personnage **niveau Max** pendant **48 heures**
- Badge permanent "Contributeur libération [Personnage] au [Pays]"
- Événement social : partage sur réseaux généré automatiquement

### Viralité organique attendue

- Moment d'unité nationale (ex: "Le Sénégal a libéré Simba !")
- Partages réseaux sociaux massifs
- Acquisition virale sur les pays voisins (ils voient, s'inscrivent)

---

## 🔒 Sécurité & Anonymat — Principes non négociables

### 1. Pas de rencontres réelles via Binôme

**Règle absolue** : les binômes ne peuvent PAS se retrouver physiquement via la mécanique LIXUM.

- Le matching est **purement algorithmique** (pas de choix utilisateur)
- Aucune localisation exacte partagée entre binômes
- Les Lixtags peuvent être visibles mais **ne donnent aucun avantage** pour se retrouver en binôme
- Un user peut partager son Lixtag sur Instagram — ça ne change rien à la probabilité infime de matching

**Justification** : protège les utilisateurs vulnérables (femmes, mineurs en vacances) contre abus, manipulation, stalking.

### 2. Sécurité des parcours

- Pas de caisses générées dans zones à risque connu
- Pas de caisses la nuit (18h-6h) dans zones non éclairées
- Privilégier routes fréquentées via OpenStreetMap
- **Bouton panique** intégré à la session Live (alerte d'urgence)
- Zones rouges (partenariat municipalités à terme)

### 3. Protection mineurs

- Features carte désactivées pour utilisateurs mineurs (< 18 ans)
- Mode famille activable par parents (voir roadmap V2 Ma Famille)

### 4. Caisses Solidaires Anonymes (extension)

Version éthique de "cadeaux entre amis" :
- User A crée une caisse (coût X Lix) et la place dans sa zone
- Ouverte par **le prochain passant** (qui qu'il soit)
- **Zéro traçabilité** : créateur ne sait pas qui a ouvert, ouvreur ne sait pas qui a créé
- Message affiché : "Une caisse solidaire d'un inconnu bienveillant"

Crée une chaîne humaine anonyme de bienveillance. Respecte l'anonymat total.

---

## 🕌 Zones Sacrées — Reconnaissance spirituelle

### Philosophie

**LIXUM reconnaît la dimension spirituelle comme pilier de santé**, au même titre que nutrition, activité physique et sommeil.

Particulièrement pertinent en Afrique où la prière (musulmane, chrétienne) et les pratiques traditionnelles sont des formes de méditation ancestrales largement sous-représentées dans les apps fitness occidentales (Calm, Headspace).

### Types de zones sacrées

| Zone | Caisses apparaissent | Contenu |
|---|---|---|
| Mosquées | Pendant/après les 5 prières | Citations Coran, duas, bonus méditation |
| Églises | Heures de culte (dimanche, messes quotidiennes) | Versets bibliques, pensées de prière |
| Lieux traditionnels | Moments pratiques spécifiques selon région | Sagesse ancestrale, proverbes locaux |

### Règles éthiques critiques

1. **Aucune manipulation** : LIXUM **récompense** ceux qui fréquentent déjà ces lieux, il ne **force** pas à y aller
2. **Respect horaires solennels** : pas de caisses pendant Ramadan après iftar, Vendredi Saint, grandes fêtes religieuses
3. **Pas de prosélytisme** : LIXUM reconnaît toutes les pratiques sans en favoriser aucune
4. **Partenariats institutionnels** : mosquées/églises peuvent valider leur zone comme "officielle LIXUM"

### Récompense santé

- Fréquenter une zone sacrée = **+ bonus Vitalité**
- Statistique personnelle : "Tu as pratiqué X sessions spirituelles ce mois"
- Reconnaissance sans jugement

---

## 💰 Modèle économique LIX-QUEST

### Sources de revenus

1. **Partenariats caisses réelles**
   - Commerçants paient pour placer leurs coupons sur la carte
   - Tarification par zone géographique + volume de passages estimés
   - Reporting partenaire : nombre de caisses ouvertes, taux de conversion coupon → visite physique

2. **Boosters individuels** (modèle premium)
   - Tiers Silver/Gold/Platinum donnent bonus caisses (x1.1, x1.25, x1.5)
   - Accès prioritaire événements spéciaux (libérations personnages, fêtes nationales)

3. **Publicité événementielle**
   - Un partenaire peut sponsoriser un événement national (ex: "Jour de libération Simba au Sénégal, sponsored by Orange")
   - Caisses Ultra-généreuses avec logo partenaire

### Coûts principaux

- Supabase PostGIS pour requêtes géospatiales
- Bande passante pour updates map real-time
- Modération anti-triche (scores de confiance, vérifications)

---

## 🚀 Extensions futures planifiées

### Routes Mémorables
User peut sauvegarder et nommer un circuit ("Le circuit du stade"). Autres users peuvent le refaire → scoreboard temps. Content UGC gratuit.

### Événements Synchronisés
Tous les dimanches 8h, événement pan-africain : 1 caisse Ultimate apparaît dans chaque capitale. Rendez-vous communautaire récurrent.

### Mode Groupe Binôme ↔ Activités
Si binôme court en même temps à moins de 500m → bonus x2 sur caisses. Fusion des deux univers.

### Caisses Quest
Certaines caisses = quêtes différées ("Marche 2 km de plus aujourd'hui pour débloquer 100 Lix").

### Narratives Saisonnières
Chaque saison (3 mois), un personnage voyage à travers l'Afrique (extension déjà planifiée ci-dessus).

### Mode Santé Guidée
Intégration diagnostics MediBook — routes adaptées aux conditions médicales (diabète, cardio, etc.).

---

## 📅 Roadmap LIX-QUEST

### Prérequis (à valider AVANT de démarrer)
- ✅ PMF core LIXUM validé (login, repas, dashboard stables)
- ✅ Supabase PostGIS configuré
- ✅ 3+ partenaires réels signés dans 1+ ville pilote
- ✅ MVP anti-triche fonctionnel (speed cap, accéléromètre, plafonds)
- ✅ Budget serveur adapté à la charge géolocalisée

### Phase 1 — MVP LIX-QUEST (post-PMF core)
- Carte Activité simple avec circuits 1 distance (1km)
- Caisses virtuelles uniquement (Lix, Énergie, Fragments Std)
- 1 ville pilote (Dakar ou Bujumbura)
- Anti-triche basique (speed cap + accéléromètre)

### Phase 2 — Extensions
- 3 distances (500m/1km/5km)
- Caisses partenaires réelles introduites
- Zones sacrées V1 (mosquées + églises majeures)
- Carte Binôme en parallèle

### Phase 3 — Voyage Personnages
- Lancement mécanique voyage inter-pays
- Premier personnage libéré : Mariposa au Sénégal
- Événement national hypé

### Phase 4 — Échelle continentale
- Extensions multiples activées
- Partenariats institutionnels (municipalités, ministères santé)
- Carte Partenaires comme 3e univers

---

## ⚠️ Pièges identifiés et solutions

### Cold start (carte vide)
- Pré-génération algorithmique de caisses
- Caisses de bienvenue généreuses première semaine
- Expérience solo fun même à 1 user

### Triche GPS
- Speed cap strict
- Accéléromètre obligatoire
- Photos landmarks pour caisses valeur
- Plafonds journaliers durs
- Score de confiance utilisateur

### Batterie
- GPS ping 10-15 sec (pas continu)
- Session explicite avec bouton Démarrer
- Notifications "caisse à proximité" sans afficher map

### Sécurité physique
- Pas de caisses nuit zones non éclairées
- Routes OpenStreetMap fréquentées
- Bouton panique
- Zones rouges exclues

### Équité rurale
- Densité algorithmique compensatoire
- Bonus rural x1.5
- Partenariats hors grandes villes

### Coûts serveur
- Agrégation client (envoi circuit final, pas chaque point)
- Rafraîchissement flight radar 30 sec
- PostGIS pour requêtes efficaces

### Retour valeur réelle
- Démarrer avec 3-5 partenaires clés par ville pilote
- 90% caisses virtuelles / 10% réelles
- Events "Mois Partenaires" pour hype

### Confusion univers
- Design system map commun
- Différenciation par couleur dominante
- Sélecteur univers en haut de carte
- Tutoriels distincts première ouverture

---

## 🔐 Principes non négociables

Ces principes **ne peuvent pas être modifiés** sans réécriture complète de ce document.

1. **Sécurité utilisateurs > Croissance virale**
2. **Anonymat binôme absolu** — zéro rencontre réelle facilitée par LIXUM
3. **Zones sacrées reconnues et respectées** — jamais instrumentalisées
4. **Équité géographique** — afrique rurale aussi bien servie qu'urbaine
5. **Reconnaissance culturelle africaine** — pas un copier-coller d'apps occidentales
6. **Anti-triche rigoureux** — économie Lix protégée
7. **Mineurs protégés** — features carte désactivées

---

## 📝 Notes et évolutions futures

Ce document est **V1** et évoluera au fur et à mesure :
- V1.1 prévue : après validation partenaires dans 1 ville pilote
- V1.2 prévue : après MVP Phase 1 lancé
- V2 prévue : après voyage premier personnage libéré

Toute modification de cette vision doit être **explicitement documentée** avec date, auteur, et justification.

---

**Document versionné figé le 24 avril 2026.**
