# LIXUM — Pages et Navigation

## Navigation principale (Navbar 5 onglets)

```
[Accueil] [Repas] [MedicAi] [Activité] [LixVerse]
```

Profil accessible via icône avatar dans le header de chaque page.

---

## 1. Dashboard (Accueil) — DashboardPage.js

Page d'accueil avec vue d'ensemble de la journée.

### Contenu
- Header : avatar + nom + solde Lix + énergie
- Score Vitalité : jauge circulaire basée sur nutrition + activité + hydratation + humeur
- Résumé calories : barre de progression kcal consommées vs objectif
- Macros du jour : barres P/G/L (couleurs #FF6B8A / #FFD93D / #4DA6FF)
- Dernier repas : carte expandable avec détails
- Coach ALIXEN : carte expandable avec barres Vitalité
- Mes Stats 7 jours : modal avec graphiques hebdo
- DNA Helix : animation bioluminescente

### Tables Supabase utilisées
- users_profile (lecture profil, lix, energy)
- daily_summary (calories du jour)
- meals (dernier repas)
- moods (humeur)
- hydration_logs (hydratation)

---

## 2. Repas — RepasPage.js

Hub de la nutrition avec historique et outils.

### Sous-pages
- Historique repas (liste par jour)
- XScan (scan photo) → XscanScreen.js
- CartScan (ticket de caisse) → CartScanScreen.js
- Saisie manuelle → ManualEntryScreen.js
- ALIXEN Chef (recettes IA) → RecettesScreen.js

### XscanScreen.js
- Caméra ou galerie → scan-meal edge function
- Résultat : 2 suggestions DB + fallback IA
- Écran "Corriger" : modifier quantités, ingrédients
- Certainty system : badge "?" si < 70%

### RecettesScreen.js (ALIXEN Chef)
- Calcule calories/macros restants
- Envoie contexte (mood, weather, heure, régime)
- Reçoit 3 propositions avec macros, étapes, hydratation
- 1 recette gratuite/jour, sinon 8 énergie (50 Lix si sans abo)
- Catégories alternatives proposées

### CartScanScreen.js
- Scan ticket de caisse
- Extraction items alimentaires
- 1 énergie par scan

---

## 3. MedicAi — medicai/index.js

Page principale du compagnon médical. 3 vues :

### Vue Chat ALIXEN
- AlixenFace V6 (420 particules SVG, 11 états)
- FunnelBridge (tubes, support, LixTag LXM-2K7F4A)
- Bulles de session numérotées (1-13+) avec bouton "+" nouvelle session
- Chat avec ALIXEN : messages enrichis (balises TITRE, SECTION, ALERTE, etc.)
- Choix rapides (Quick Reply) en fin de chaque réponse
- Actions ALIXEN : save_meal_plan, update_weight, add_medication, add_diagnostic, add_allergy, add_vaccination, add_full_diagnosis, add_analysis, navigate, learn_preference
- Barre de saisie en bas avec boutons +, recherche, micro
- Boutons MediBook et Secret Pocket sous AlixenFace

### Vue MediBook — MediBookPages.js
Navigation par state mediBookView :

**Landing (mediBookView = 'landing')**
- Bouton "Ajouter des données de santé" → BottomSheet avec 6 options :
  - Scanner un document, Ajouter médicament/diagnostic/vaccin/allergie, Planifier analyse
- Carte "Importer mon carnet de santé" → vue carnet (photos)
- Carte "Continuer avec mes données" → vue report
- Carte "Mes Stats" → vue stats

**Report Hub (mediBookView = 'report', reportSection = 'hub')**
- Score Vitalité
- 6 sections cliquables :
  - Analyses médicales → reportSection='analyses'
  - Médicaments → reportSection='medications'
  - Allergies et intolérances → reportSection='allergies'
  - Carnet vaccinal → reportSection='vaccinations'
  - Diagnostics à surveiller → reportSection='diagnostics'
  - Calendrier de santé → reportSection='calendar'
- Badge rouge sur Calendrier si rappels dans 30 jours
- Bouton "Générer mon MediBook" (PDF 500 Lix)
- FAB upload scan

**Section Analyses (reportSection = 'analyses')**
- Onglets Effectuées / À venir
- Liste analyses avec status coloré
- FAB "Planifier une analyse"
- Formulaire : type (chips rapides), date (DatePicker), médecin, labo, notes

**Section Médicaments (reportSection = 'medications')**
- Onglets Actifs / Terminés
- Cartes médicaments : nom, dosage, horaires, rappels toggle, prise du jour
- FAB "Ajouter un médicament"
- Formulaire 2 étapes : recherche DB (RPC search_medications_db) → dosage/fréquence/durée

**Section Allergies (reportSection = 'allergies')**
- Liste allergies avec badges type/sévérité
- FAB "Ajouter une allergie"
- Formulaire : substance, type (4 radio), sévérité (3 radio), réaction

**Section Vaccinations (reportSection = 'vaccinations')**
- Liste vaccins avec date, dose, prochain rappel
- Badges : "Rappel en retard" (rouge), "Rappel bientôt" (orange)
- FAB "Ajouter un vaccin"
- Formulaire : nom, date (DatePicker), dose, rappel, médecin, lot

**Section Diagnostics (reportSection = 'diagnostics')**
- Liste diagnostics avec badges sévérité/status
- FAB "Ajouter un diagnostic"
- Formulaire 2 étapes : recherche DB (RPC search_diseases_db, 97 maladies) → détails
- Fallback "Pas trouvé ? Ajouter manuellement"

**Calendrier de santé (reportSection = 'calendar')**
- Navigation mois (flèches gauche/droite)
- Toggle Mois / Année
- Grille calendrier avec pastilles colorées par type d'événement :
  - Rouge = diagnostic, Bleu = médicament, Vert = analyse, Violet = vaccin, Orange = allergie
- 5 chips filtres toggleables
- Tap sur jour → liste événements slide-up
- Modal détail événement
- Section "Rappels à venir" en haut (cartes colorées par urgence)
- Modal rappel : "Marquer comme fait" / "Reporter"
- Vue année : grille 4x3 mini-cartes mois

**Scan / Upload**
- Upload : photo ou galerie → scan-medical edge function
- Batch : 1-10 photos, coût 50 énergie (1-5) ou 80 (6-10)
- Résultats catégorisés : données, médicaments, vaccins, allergies, diagnostics, alertes
- Boutons "Valider et intégrer" / "Rejeter et supprimer"

**Stats (mediBookView = 'stats')**
- 4 onglets : nutrition, santé, activité, humeur
- Graphiques SVG barres 7 jours

### Vue Secret Pocket — SecretPocket.js
- Coffre-fort verrouillé pour documents sensibles
- Catégories : diagnostics, allergies, medications, lab-results, notes

---

## 4. Activité — ActivityPage.js

### Contenu
- Objectif OMS : anneau 150 min/semaine
- Recommandations intelligentes (croisement calories × mood)
- Post-activité modal : équivalents alimentaires
- Détection intensité par vitesse (futur Live GPS)

### Tables utilisées
- user_activities (INSERT/SELECT)
- daily_summary (calories brûlées)
- moods (croisement humeur)

---

## 5. LixVerse — LixVersePage.js

### 3 sous-onglets

**Défi**
- 10 templates de défis (anti-triche : 7j usage, GPS speed caps)
- Leaderboard 5 onglets
- Groupes (7j cooldown suppression)
- 1 défi actif par utilisateur

**Human**
- Binôme : matching santé par LixTag
- Suivi Humain : nutritionniste réel (coaching payant hebdo)

**Caractères**
- 16 personnages sur 5 tiers : Standard (5), Rare (5), Elite (3), Mythique (2), Ultimate (1)
- Obtention fragments via : caisses Lix, défis, paliers XP
- Tap carte → modal → "Utiliser" → flip animation → pouvoirs
- 1 seul personnage actif à la fois
- Onboarding : choix 1er compagnon parmi 5 Standard

---

## 6. Profil

Accessible via icône avatar dans le header.

### Contenu
- Infos personnelles (nom, poids, taille, objectif)
- Régime alimentaire
- Niveau XP + progression
- Abonnement actuel
- Paramètres
