# DIAGNOSTIC FEATURES SNACK VS BUILD — LIXUM

**Date** : 24 avril 2026
**Branche analysée** : `main` + branche `sprint/polish-editprofile-final` (PR #727 pending)
**Contexte** : quota EAS Build épuisé jusqu'au **1er mai 2026** → prioriser sprints Snack-safe pendant 7 jours

---

## Section 1 — Vue d'ensemble

### Stats globales

```
Pages/composants analysés : 9 dossiers (dashboard, activity, lixverse, login,
                                        medicai, profile, register, repas + WelcomePage)
Fichiers .js scannés : 60+
Modules natifs détectés : 8 expo-* + 4 react-native-* + 1 Skia
```

### Modules natifs utilisés

| Module | Catégorie | Usage | Status Snack |
|---|---|---|---|
| `expo-camera` | 🔨 BUILD | XScan, CartScan | ❌ Impossible (CameraView) |
| `expo-image-picker` | 🔨 BUILD | XScan, MediBook, Modals medicai | ❌ Pas de vraie galerie |
| `expo-document-picker` | 🔨 BUILD | medicai scan PDF | ❌ |
| `expo-location` | 🔨 BUILD | LiveTracking, medicai, AlixenChat | ❌ Permissions natives |
| `expo-speech` | 🔨 BUILD | LiveTracking (voice coach) | ⚠️ Partiellement |
| `expo-sharing` | 🔨 BUILD | MediBook share PDF | ❌ |
| `expo-notifications` | 🔨 BUILD | NotificationService (DÉSACTIVÉ) | ❌ |
| `@shopify/react-native-skia` | 🔨 BUILD | AlixenFaceSkia | ❌ Canvas natif |
| `react-native-maps` | 🔨 BUILD | LiveTracking, PostReport | ❌ MapView natif |
| `expo-haptics` | ⚠️ MIXTE | EditProfilePage | ⚠️ Code OK mais pas de vibration |
| `expo-linear-gradient` | ✅ SNACK | Partout | ✅ |
| `expo-clipboard` | ✅ SNACK | LixVerse, Register | ✅ |
| `react-native-svg` | ✅ SNACK | Partout | ✅ |
| `react-native-reanimated` | ✅ SNACK | Phase6Characters | ✅ (cas simples) |
| `react-native-gesture-handler` | ✅ SNACK | RegisterPage, Phase6 | ✅ |
| `react-native-qrcode-svg` | ✅ SNACK | MediBook QR share | ✅ |
| `react-native-safe-area-context` | ✅ SNACK | DashboardPage, LoginPage | ✅ |
| `@react-native-async-storage` | ✅ SNACK | Partout | ✅ |
| `@supabase/supabase-js` | ✅ SNACK | Partout | ✅ |

### Permissions app.json
`CAMERA`, `READ/WRITE_EXTERNAL_STORAGE`, `ACCESS_FINE/COARSE_LOCATION`, `VIBRATE`, `USE_BIOMETRIC`, `USE_FINGERPRINT`, `RECORD_AUDIO`

### Edge Functions Supabase détectées
`alixen-live-coach` · `analyze-cart` · `generate-recipe` · `lixman-chat` · `lookup-barcode` · `medical-share` · `scan-meal` · `scan-medical` · `search-medication`

### RPC Supabase (26+)
`add_beverage_log`, `add_meal_and_update_summary`, `add_user_activity`, `add_user_xp`, `check_and_generate_notifications`, `deduct_alixen_recipe`, `delete_user_activity`, `generate_medical_share`, `get_active_deletion_reasons`, `get_character_powers`, `get_daily_hydration`, `get_unread_notifications`, `get_unread_lixverse_notifications`, `get_user_collection`, `mark_all_*`, `mark_*_read`, `request_account_deletion`, `restore_account`, `search_beverages_fuzzy`, `search_ingredients_fuzzy`, `search_meals_fuzzy`, `unlock_child_medical_profile`, `unlock_hydration_history`, `use_character_power`

### Bilan global

```
SNACK-SAFE (✅) : ~65% — Dashboard, Profile, Login, LixVerse (4 onglets sauf GPS challenges),
                        Register (Phase 1,2,3,4,5 UI), Repas UI (Recettes, Cooking, Manual),
                        medicai SecretPocket + MediBook UI + AlixenChat UI, Activity UI
BUILD-REQUIRED (🔨) : ~25% — XScan pipeline, CartScan, LiveTracking GPS, ImagePicker flows,
                            AlixenFaceSkia, scan-medical camera, push notifications
MIXTE (⚠️) : ~10% — expo-haptics (code OK, effet 0), Phase6Characters reanimated,
                    Register OAuth (si implémenté), photo avatar profil
```

---

## Section 2 — Détail par page

## 📄 Page : Accueil (Dashboard)

### Fichiers concernés
- `src/pages/dashboard/DashboardPage.js`
- `src/pages/dashboard/DashboardContent.js`
- `src/pages/dashboard/MoodModal.js`
- `src/pages/dashboard/HydrationModal.js`
- `src/pages/dashboard/BeverageModal.js`
- `src/pages/dashboard/dashboardComponents.js` / `dashboardConstants.js` / `dashboardIcons.js`

### Modules natifs utilisés
Aucun BUILD-REQUIRED. Uniquement `LinearGradient`, `react-native-svg`, `SafeAreaView`, `AsyncStorage`.

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Widget Vitalité (score /100) | UI + RPC | ✅ | - | SVG + Supabase |
| ECG Pulse + dots | Animation SVG | ✅ | - | `react-native-svg` |
| Orbital reactors (4 stats) | UI SVG | ✅ | - | |
| DNA Helix | UI SVG | ✅ | - | |
| Mood modal (emoji picker) | UI + RPC | ✅ | - | Pas de caméra ici |
| Hydration modal (ScrollPicker L) | UI + RPC | ✅ | - | |
| Beverage modal (add log) | UI + RPC | ✅ | - | `add_beverage_log` RPC |
| Last meal card | UI + RPC | ✅ | - | `select last meals` |
| Calories restantes | Calcul JS | ✅ | - | |
| Macros bar (P/C/F) | UI SVG | ✅ | - | |
| Tooltip pédagogie (i) | UI pure | ✅ | - | |
| Quick action Scan repas | Navigate XScan | ✅ (navigate) | 🔨 (action) | Le bouton marche, XScan derrière = BUILD |
| Navigation bottom tabs | @react-navigation | ✅ | - | |

### Sprints possibles MAINTENANT (Snack)
- **Sprint Dashboard Polish** : ajouter tooltips info sur chaque widget, animations d'entrée
- **Sprint Vitalité History** : écran historique 7 jours avec chart SVG (bars simples)
- **Sprint Beverage Pack** : ajouter thé/café/jus avec RPC (search_beverages_fuzzy existe)

### Sprints à attendre le 1er mai (Build)
- Aucun sur le dashboard lui-même. Les quick actions déclenchant XScan restent bloquées au redirect vers les pages BUILD.

---

## 📄 Page : Profile / EditProfile

### Fichiers concernés
- `src/pages/profile/ProfilePage.js`
- `src/pages/profile/EditProfilePage.js`
- `src/pages/profile/profileConstants.js`

### Modules natifs utilisés
Aucun BUILD-REQUIRED. `expo-haptics` (MIXTE — code OK, effet 0 en Snack).

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Affichage profil complet | UI + SELECT | ✅ | - | ✅ PR #723-#727 |
| EditProfile (tabs Infos/Objectifs) | UI + PATCH | ✅ | - | ✅ |
| Haptic feedback | Native | ⚠️ | 🔨 effet | Code fonctionne, vibration uniquement en APK |
| Animation tab switcher | Animated.Value | ✅ | - | `useNativeDriver: false` |
| Discard confirm modal | UI pure | ✅ | - | |
| Modal médical hydratation | UI pure | ✅ | - | |
| Stats Lix + Énergie + Cartes | UI + RPC | ✅ | - | |
| XP progress bar + milestones | UI SVG + RPC | ✅ | - | `get_user_xp` |
| Ma localisation (dropdown) | UI | ✅ | - | Input texte, pas de GPS ici |
| Abonnement modal | UI pure | ✅ | - | Display uniquement, pas d'IAP |
| Connecteurs (Apple/Samsung/Fitbit/Strava) | UI toggle | ✅ | 🔨 OAuth | Toggle visuel OK, OAuth vrai = BUILD |
| Glossary / Guide markdown | `react-native-markdown-display` | ✅ | - | |
| Politique / Termes fetch | Supabase | ✅ | - | |
| Delete account modal + raisons | UI + RPC | ✅ | - | `request_account_deletion` |
| Restore account banner | UI + RPC | ✅ | - | `restore_account` |
| Toast message | ToastMessage shared | ✅ | - | `useNativeDriver: true` déjà noté |

### Sprints possibles MAINTENANT (Snack)
- Aucun — **Sprint Modifier Profil complet** ✅ après merge PR #727

### Sprints à attendre le 1er mai (Build)
- **Sprint Connecteurs OAuth** : Apple Health / Samsung Health / Fitbit / Strava (libs natives)
- **Sprint Photo avatar profil** : `expo-image-picker` upload vers Supabase Storage

---

## 📄 Page : Auth / Login

### Fichiers concernés
- `src/pages/login/LoginPage.js`
- `src/pages/login/loginConstants.js`

### Modules natifs utilisés
Aucun BUILD-REQUIRED. `SafeAreaView`, `AsyncStorage`, `LinearGradient`, `react-native-svg`.

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Écran login LIXUM | UI | ✅ | - | |
| Input email/password | TextInput | ✅ | - | |
| `signInWithPassword` | Supabase auth | ✅ | - | |
| `signUp` | Supabase auth | ✅ | - | |
| Réinitialisation mdp alert | UI pure | ✅ | - | `showLixAlert` (texte "Bientôt disponible") |
| Auto-save email via AsyncStorage | AsyncStorage | ✅ | - | |
| Sign-In with Apple/Google | ❌ absent | - | 🔨 | À créer quand BUILD |

### Sprints possibles MAINTENANT (Snack)
- **Sprint Reset Password** : implémenter réellement le reset via `supabase.auth.resetPasswordForEmail`
- **Sprint Login Polish** : animation logo + fade transitions, améliorer feedback erreur

### Sprints à attendre le 1er mai (Build)
- **Sprint OAuth Apple/Google Sign-In** : modules natifs nécessaires
- **Sprint Biometric unlock** : permissions `USE_BIOMETRIC` déjà déclarées dans app.json

---

## 📄 Page : Repas

### Fichiers concernés
- `src/pages/repas/RepasPage.js` (hub principal)
- `src/pages/repas/XscanScreen.js` 🔨
- `src/pages/repas/CartScanScreen.js` 🔨
- `src/pages/repas/RecettesScreen.js`
- `src/pages/repas/CookingModeScreen.js`
- `src/pages/repas/ManualEntryScreen.js`
- `src/pages/repas/repasConstants.js`

### Modules natifs utilisés
- **BUILD-REQUIRED** : `expo-camera` (CameraView), `expo-image-picker`
- **SNACK-SAFE** : LinearGradient, react-native-svg, Ionicons

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| RepasPage hub (3 modes) | UI | ✅ | - | Boutons navigation |
| **XScan caméra AR** | CameraView | - | 🔨 | expo-camera pipeline complet |
| XScan AR phases (idle/center/navigating/tapping/complete) | Logic | ✅ (visualisation) | 🔨 (camera) | |
| ImagePicker galerie (fallback XScan) | expo-image-picker | - | 🔨 | |
| Appel `scan-meal` Edge Function | fetch | ✅ | - | Testable en isolé (POST image base64) |
| **CartScan caméra** | CameraView | - | 🔨 | Multi-item detection |
| Appel `analyze-cart` Edge Function | fetch | ✅ | - | |
| **RecettesScreen ALIXEN** | UI + Edge Function | ✅ | - | Chat + génération |
| Appel `generate-recipe` Edge Function | fetch | ✅ | - | |
| Deduct 50 Lix via `deduct_alixen_recipe` | RPC | ✅ | - | |
| **CookingModeScreen** (mode cuisson step-by-step) | UI pure | ✅ | - | |
| **ManualEntryScreen** | UI + RPC | ✅ | - | Recherche aliment (`search_meals_fuzzy`) + form macros |
| Add meal `add_meal_and_update_summary` | RPC | ✅ | - | |
| Barcode lookup | fetch `lookup-barcode` | ⚠️ | 🔨 | Appel Edge OK, mais scan barcode = BUILD |
| XP +10 via `add_user_xp` | RPC | ✅ | - | |

### Sprints possibles MAINTENANT (Snack)
- **Sprint ManualEntry Polish** : amélioration UI form (sliders macros, presets "portion standard")
- **Sprint Recettes Favoris** : persister recettes ALIXEN en DB (nouvelle table `user_recipes`)
- **Sprint Cooking Mode Timer** : ajouter minuteur par étape avec haptic
- **Sprint Search Meals UX** : améliorer `search_meals_fuzzy` avec historique récent, filtres repas type
- **Sprint Edge Function test harness** : écran debug qui appelle `scan-meal`/`generate-recipe` avec inputs mock pour valider en isolation

### Sprints à attendre le 1er mai (Build)
- **Sprint XScan E2E** : pipeline caméra + IA + save (tout est prêt backend, il manque le test caméra)
- **Sprint CartScan E2E** : analyse multi-items
- **Sprint Barcode Scanner** : `expo-barcode-scanner` ou `expo-camera` avec code reader
- **Sprint Photo recette utilisateur** : image-picker upload vers Storage

---

## 📄 Page : MedicAi

### Fichiers concernés
- `src/pages/medicai/index.js` 🔨 (hub ALIXEN Zone avec camera/location)
- `src/pages/medicai/AlixenChat.js` 🔨 (expo-location)
- `src/pages/medicai/AlixenFaceSkia.js` 🔨 (@shopify/react-native-skia)
- `src/pages/medicai/MediBookPages.js` 🔨 (image-picker + sharing dynamique)
- `src/pages/medicai/Modals.js` 🔨 (image-picker)
- `src/pages/medicai/SecretPocket.js` ✅
- `src/pages/medicai/AlertSheet.js` ✅
- `src/pages/medicai/alixenzone.js` ✅
- `src/pages/medicai/shared.js` / `constants.js`

### Modules natifs utilisés
- **BUILD-REQUIRED** : `expo-image-picker`, `expo-document-picker`, `expo-location`, `expo-sharing`, `@shopify/react-native-skia`, `QRCode`
- **SNACK-SAFE** : LinearGradient, react-native-svg, react-native-qrcode-svg (pur SVG)

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| **AlixenChat UI** (bubbles, input, typing) | UI pure | ✅ | - | `react-native-svg` |
| AlixenChat géolocation auto | `expo-location` | - | 🔨 | Envoie contexte géo à ALIXEN |
| Appel `alixen-live-coach` Edge Function | fetch | ✅ | - | Testable isolé |
| Appel `lixman-chat` Edge Function | fetch | ✅ | - | |
| **AlixenFaceSkia** (avatar animé) | `@shopify/react-native-skia` | - | 🔨 | Canvas natif |
| **MediBook 25 slots** (grid display) | UI | ✅ | - | |
| MediBook CRUD (add/edit/delete) | UI + DB | ✅ | - | |
| MediBook photo document | `expo-image-picker` | - | 🔨 | |
| MediBook scan PDF | `expo-document-picker` | - | 🔨 | |
| MediBook analyse IA | `scan-medical` Edge | ⚠️ | 🔨 | Edge OK mais la photo vient du camera |
| **MediBook QR share médecin 30min** | `react-native-qrcode-svg` | ✅ | - | Le QR s'affiche, token généré par `generate_medical_share` RPC |
| MediBook share PDF natif | `expo-sharing` | - | 🔨 | Dynamique `require('expo-sharing')` |
| **SecretPocket** (notes cryptées) | UI + Supabase RLS | ✅ | - | Full Snack OK |
| SecretPocket unlock LixSigns | RPC | ✅ | - | |
| **alixenzone** (hub Alixen decor) | UI SVG | ✅ | - | |
| AlertSheet (médicaments) | UI pure | ✅ | - | |
| Search medication `search-medication` | Edge Function | ✅ | - | |
| Photo médicament scan | image-picker | - | 🔨 | |
| ALIXEN vocal (micro) | ❌ absent | - | 🔨 | Pas encore implémenté (permission RECORD_AUDIO prête) |
| Unlock child medical profile | RPC | ✅ | - | |

### Sprints possibles MAINTENANT (Snack)
- **Sprint SecretPocket Polish** : animations RLS lock/unlock, countdown visuel
- **Sprint MediBook CRUD Full UI** : formulaires complets ajout doc manuel (sans photo) — titre, type, date, notes libres, date rappel
- **Sprint AlixenChat UI V2** : bulles typing animation, quick replies carousels, export conversation
- **Sprint QR Share Flow UI** : écran complet de génération QR + countdown 30min + révocation
- **Sprint Médicaments Catalog** : écran de recherche via `search-medication` avec historique et favoris
- **Sprint Alert medication reminders** : UI de programmation (sans notif push, juste affichage in-app)
- **Sprint Edge Functions test** : écran debug alixen-live-coach / scan-medical (inputs mock)

### Sprints à attendre le 1er mai (Build)
- **Sprint XScan MedicAi Photo** : pipeline photo document → scan-medical → affichage résultat
- **Sprint AlixenFaceSkia** : animations avatar (Skia nécessite vraiment le natif)
- **Sprint PDF Sharing** : export MediBook en PDF + partage natif
- **Sprint ALIXEN Vocal** : permission micro + transcription voix → texte
- **Sprint Photo Médicament auto-fill** : image-picker + OCR médicament

---

## 📄 Page : Activité

### Fichiers concernés
- `src/pages/activity/ActivityPage.js` ✅ (hub principal)
- `src/pages/activity/LiveTrackingScreen.js` 🔨 (GPS tracking)
- `src/pages/activity/PostReportModal.js` 🔨 (MapView polyline)
- `src/pages/activity/PulseTrack.js` ✅ (UI SVG)
- `src/pages/activity/activityComponents.js` / `activityConstants.js` ✅

### Modules natifs utilisés
- **BUILD-REQUIRED** : `expo-location`, `expo-speech`, `react-native-maps`
- **SNACK-SAFE** : LinearGradient, react-native-svg, Ionicons

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| **ActivityPage hub** (ring WHO 150min/sem) | UI SVG + RPC | ✅ | - | Ring + calcul |
| Mood-based recommendations | Logic JS + DB | ✅ | - | Lit mood du jour |
| Activity cards (list) | UI + select | ✅ | - | |
| Add activity manual | UI + RPC | ✅ | - | `add_user_activity` |
| Delete activity | RPC | ✅ | - | `delete_user_activity` |
| Speed-based intensity calc | JS pur | ✅ | - | |
| **LiveTrackingScreen** GPS real-time | `expo-location` watchPosition | - | 🔨 | |
| LiveTracking map polyline | `react-native-maps` MapView | - | 🔨 | |
| LiveTracking voice coach | `expo-speech` | - | 🔨 | Speech.speak |
| LiveTracking anti-cheat vitesse | Accéléro + GPS | - | 🔨 | |
| **PostReportModal** summary trace | `react-native-maps` Polyline | - | 🔨 | Display trace sans tracking |
| **PulseTrack** (animation pulse) | UI SVG pure | ✅ | - | Ellipse animée |
| Weekly progress ring | UI SVG | ✅ | - | |
| Calories burned estimation | JS pur | ✅ | - | |

### Sprints possibles MAINTENANT (Snack)
- **Sprint Activity Manual UX** : ajout UX d'une activité avec presets (jogging, vélo, marche, natation) + durée picker + intensité slider
- **Sprint Activity History Chart** : écran historique 7/30 jours avec SVG bars
- **Sprint Mood Recommendations V2** : affiner le système de recommandations (plus de variété, éviter répétition)
- **Sprint Activity Badges** : badges "+1000 kcal semaine", "+5 activités", affichage dans profil (sans IAP)
- **Sprint PulseTrack animations** : améliorer les animations idle/during/end

### Sprints à attendre le 1er mai (Build)
- **Sprint LiveTracking GPS** : le cœur de l'app activité
- **Sprint Anti-cheat vitesse** : validation course/vélo vs voiture
- **Sprint Voice Coach ALIXEN** : couplage LiveTracking + expo-speech
- **Sprint PostReport Map** : trace visualisée avec MapView

---

## 📄 Page : LixVerse

### Fichiers concernés
- `src/pages/lixverse/LixVersePage.js` (hub 4 onglets)
- `src/pages/lixverse/DefiTab.js`
- `src/pages/lixverse/HumanTab.js`
- `src/pages/lixverse/CharactersTab.js`
- `src/pages/lixverse/LixShopTab.js`
- `src/pages/lixverse/lixverseComponents.js` / `lixverseConstants.js`

### Modules natifs utilisés
- **SNACK-SAFE uniquement** : `react-native-svg`, `LinearGradient`, `expo-clipboard`
- **Aucun BUILD** détecté dans les fichiers LixVerse actuels

### Fonctionnalités

#### Onglet Défi
| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Liste challenges | UI + DB | ✅ | - | |
| Progression challenge | UI SVG | ✅ | - | |
| Start/join challenge | UI + DB | ✅ | - | |
| Challenge GPS validation Live | **non implémenté** UI | ✅ (UI) | 🔨 (backend) | Interface prête, backend GPS = BUILD |

#### Onglet Human
| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Binôme matching | UI + DB | ✅ | - | |
| Rapport hebdomadaire (nutritionniste) | UI | ✅ | - | |
| LixSigns exchange | UI + RPC | ✅ | - | |
| Anonymous chat via LixTag | UI + DB | ✅ | - | Pas de push notif needed en Snack |
| Trouve ton partenaire santé | UI recherche | ✅ | - | |

#### Onglet Caractères
| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Roster 16 cards display | UI SVG | ✅ | - | |
| Switch active character | RPC | ✅ | - | |
| 30min cooldown | Logic JS | ✅ | - | |
| Caisses Lix (open box) | UI + RPC | ✅ | - | |
| Fragments accumulation | UI + DB | ✅ | - | |
| `get_character_powers` | RPC | ✅ | - | |
| `use_character_power` | RPC | ✅ | - | |
| `get_user_collection` | RPC | ✅ | - | |

#### Onglet LixShop
| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Shop items display | UI | ✅ | - | |
| Badges "Populaire" / "Rare" / "Elite" | UI | ✅ | - | |
| Buy avec Lix (virtual) | UI + RPC | ✅ | - | |
| IAP réel (vrai argent) | ❌ absent | - | 🔨 | Pas encore, à prévoir |

#### Hub LixVerse
| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| Notifications cloche in-app | UI + RPC | ✅ | - | `get_unread_lixverse_notifications` |
| Copy LixTag via Clipboard | `expo-clipboard` | ✅ | - | Snack compatible |
| Bottom tabs switcher 4 onglets | UI | ✅ | - | |

### Sprints possibles MAINTENANT (Snack)
- **Sprint LixVerse Human UI complète** : binôme matching avec filtres, display partenaire, LixSigns animés
- **Sprint Anonymous Chat** : messagerie temps-réel via Supabase Realtime (pas besoin de push en Snack)
- **Sprint Caractères V5 Display** : roster animé 16 cards + switch actif avec cooldown visuel
- **Sprint Caisses Lix** : animation ouverture caisse, révélation fragments, collection display
- **Sprint LixShop UI** : tous les items virtuels achetables avec Lix, badges, filtres tier
- **Sprint Défi UI V2** : animation progression, countdown, leaderboard
- **Sprint Notifications LixVerse V2** : NotificationDetailSheet complet, deep-link vers feature concernée

### Sprints à attendre le 1er mai (Build)
- **Sprint Challenge GPS Live** : anti-cheat + validation course
- **Sprint IAP LixShop** : vrais achats Lix avec expo-in-app-purchases ou react-native-iap

---

## 📄 Page : Register / Onboarding

### Fichiers concernés
- `src/pages/register/RegisterPage.js` (hub 6 phases)
- `src/pages/register/phases/Phase1Identity.js` ✅
- `src/pages/register/phases/Phase1bOTP.js` ✅
- `src/pages/register/phases/Phase2Morphology.js` ✅
- `src/pages/register/phases/Phase3Activity.js` ✅
- `src/pages/register/phases/Phase4Diet.js` ✅ (DietarySelector shared)
- `src/pages/register/phases/Phase5Goals.js` ✅ (shared components)
- `src/pages/register/phases/Phase6Characters.js` ⚠️ (react-native-reanimated + gesture-handler)
- `src/pages/WelcomePage.js` ✅ (onboarding slides)

### Modules natifs utilisés
- **MIXTE** : `react-native-reanimated` (Phase6Characters), `react-native-gesture-handler` (Phase6 + RegisterPage root)
- **SNACK-SAFE** : SafeAreaView, LinearGradient, AsyncStorage, expo-clipboard, Ionicons

### Fonctionnalités

| Feature | Catégorie | Snack? | Build? | Notes |
|---|---|---|---|---|
| **WelcomePage** (4 slides onboarding) | UI + animations | ⚠️ | - | `useNativeDriver: true` présent (noté dette) |
| Slides auto-advance + swipe | UI | ✅ | - | |
| **Phase1 Identity** (nom, email, mdp, genre) | UI + signUp | ✅ | - | |
| **Phase1b OTP** (si activé) | UI + auth | ✅ | - | |
| **Phase2 Morphology** (age, poids, taille, picker) | ScrollPicker shared | ✅ | - | |
| **Phase3 Activity** (niveau) | ActivityLevelSelector shared | ✅ | - | |
| **Phase4 Diet** (5 régimes) | DietarySelector shared | ✅ | - | PR #726 |
| **Phase5 Goals** (goal + pace + plan) | shared components | ✅ | - | PR #724 |
| **Phase6 Characters** (swipe/gesture) | `reanimated` + `gesture-handler` | ⚠️ | - | Fonctionne en Snack mais perf dégradée |
| Create profile via RPC `create_user_profile` | fetch | ✅ | - | |
| Copy LixTag via Clipboard | expo-clipboard | ✅ | - | |
| Transition animation bienvenue | Animated RN | ⚠️ | - | `useNativeDriver: true` |
| Photo avatar (upload pendant register) | ❌ absent | - | 🔨 | Pas encore implémenté |

### Sprints possibles MAINTENANT (Snack)
- **Sprint WelcomePage Slides V2** : améliorer illustrations SVG par slide, animations textuelles
- **Sprint Register Transitions** : convertir animations `useNativeDriver: true` → `false` (scope LIXUM conformity)
- **Sprint Phase1 Email Validation** : vérification format, feedback visuel en temps réel
- **Sprint OTP Phase1b** : améliorer l'UX de saisie des 6 chiffres (auto-focus fluide, animation shake erreur)
- **Sprint Phase6 Characters Flow** : validation swipe/gesture en Snack, éventuel fallback tap-based pour Web

### Sprints à attendre le 1er mai (Build)
- **Sprint Avatar Photo Register** : image-picker + upload Storage
- **Sprint OAuth Sign-Up** : Apple/Google lors du register initial

---

## Section 3 — Priorisation Malick : sprints recommandés d'ici le 1er mai

7 jours de productivité max Snack. Sprints triés par **ratio impact/temps**.

### 🥇 Top 5 (impact élevé, time-to-ship court)

| # | Sprint | Temps estimé | Impact utilisateur | Fichiers |
|---|---|---|---|---|
| 1 | **LixVerse Caractères V5 Display** | ~1h30 | 🔥 HIGH (feature marquante LIXUM, roster visible) | `CharactersTab.js`, RPC get/use_character_power |
| 2 | **Anonymous Chat LixTag** (Realtime) | ~2h | 🔥 HIGH (social core) | `HumanTab.js` + nouvelle table `lixtag_messages` |
| 3 | **ManualEntry Repas UX** | ~1h | 🟠 MEDIUM-HIGH (fallback XScan quand pas de camera) | `ManualEntryScreen.js` |
| 4 | **MediBook CRUD manuel complet** | ~1h30 | 🟠 MEDIUM-HIGH (MediBook sans photo) | `MediBookPages.js` (parties non-camera) |
| 5 | **Reset Password flow** | ~45min | 🟠 MEDIUM (blocker UX current) | `LoginPage.js` + `supabase.auth.resetPasswordForEmail` |

### 🥈 Sprints de poids secondaire

| # | Sprint | Temps | Impact |
|---|---|---|---|
| 6 | **Dashboard Tooltips pédagogie** | ~1h | 🟡 MEDIUM (onboarding implicite) |
| 7 | **Activity Manual UX presets** | ~1h | 🟡 MEDIUM |
| 8 | **SecretPocket Polish** (animations lock/unlock) | ~45min | 🟡 MEDIUM |
| 9 | **WelcomePage Slides V2** | ~1h30 | 🟡 MEDIUM (first-impression) |
| 10 | **LixShop UI items display** | ~1h | 🟡 MEDIUM |

### 🥉 Sprints techniques / dette

| # | Sprint | Temps | Impact |
|---|---|---|---|
| 11 | **fix/useNativeDriver-conformity** (19 fichiers) | ~2h | 🔵 LOW user visible, HIGH code quality |
| 12 | **Edge Functions test harness** | ~1h30 | 🔵 LOW UI, HIGH dev value (debug Edge en isolation) |
| 13 | **Diagnostic E2E SQL (D/E/F/J depuis rapport précédent)** | ~30min | 🔵 Confirmer DB avant Étape 7 |

### Plan de semaine suggéré (7 jours)

| Jour | Sprint(s) | Total |
|---|---|---|
| J1 (aujourd'hui) | #1 Caractères V5 Display | 1h30 |
| J2 | #2 Anonymous Chat LixTag + #5 Reset Password | 2h45 |
| J3 | #3 ManualEntry Repas UX + #7 Activity Manual UX | 2h |
| J4 | #4 MediBook CRUD manuel | 1h30 |
| J5 | #6 Dashboard Tooltips + #8 SecretPocket Polish | 1h45 |
| J6 | #9 WelcomePage V2 + #10 LixShop UI | 2h30 |
| J7 | #11 fix useNativeDriver conformity | 2h |
| **Total** | **10 sprints** | **~14h** |

---

## Section 4 — Backlog sprints BUILD-ONLY (à tester le 1er mai)

Regroupés par domaine technique pour session de validation efficace.

### 🎥 Caméra (expo-camera CameraView)
- **XScan repas E2E** (critique) — pipeline caméra + `scan-meal` Edge + save DB
- **CartScan multi-items** — `analyze-cart` Edge
- **MediBook photo document** → `scan-medical`
- **Photo médicament auto-fill** → OCR
- **Barcode scanner** — `lookup-barcode` Edge + scan code

### 📸 ImagePicker galerie
- **Fallback XScan galerie** (si user a déjà photo)
- **Avatar profil** upload Storage
- **Avatar Register** pendant signup
- **MediBook upload doc** depuis galerie

### 📍 GPS / Location
- **LiveTracking Activity** — cœur Activity
- **Anti-cheat vitesse** (accéléromètre + GPS)
- **Challenges GPS LixVerse Live** — validation parcours
- **AlixenChat géo-context** — recommandations locales
- **medicai location** (pharmacies proches?)

### 🔊 Audio / Speech
- **LiveTracking voice coach** — `expo-speech`
- **ALIXEN vocal** — micro pour dicter (permission `RECORD_AUDIO` prête)

### 📤 Partage natif
- **MediBook export PDF** + share iOS/Android
- **QR Share médecin** — déjà QR SVG OK, manque le share natif

### 🔔 Notifications push
- **NotificationService V2** (actuellement désactivé)
  - Permission différée (au moment opportun, pas au login)
  - Setup token push
  - Test isolé
- **Rappel médicaments** push schedule

### 🎭 Skia / Canvas natif
- **AlixenFaceSkia animations** — avatar ALIXEN expressif

### 🔐 Biométrie
- **Biometric unlock Login** — `USE_BIOMETRIC` déjà dans app.json

### 💳 In-App Purchases
- **LixShop IAP réel** — achat Lix avec vrai argent
- **Abonnement Silver/Gold/Platinum IAP** — actuellement display uniquement

### 🔗 OAuth
- **Sign-In Apple/Google** — Login + Register

### 📲 Ordre de priorité pour la session 1er mai

1. **XScan E2E** (le plus attendu par users, validation du pipeline complet)
2. **LiveTracking GPS** (cœur Activity)
3. **NotificationService V2** (unblock rappels médicaments, challenges)
4. **MediBook photo + scan-medical** (medical compliance)
5. **Avatar photo flows** (register + profil)
6. **Challenges GPS Live LixVerse**
7. **IAP LixShop + Abonnement**
8. **OAuth Sign-In**
9. **Biometric unlock**
10. **ALIXEN Vocal**
11. **AlixenFaceSkia**

---

## Section 5 — Notes et ambiguïtés

### ⚠️ À valider avec Malick

| Point | Question | Hypothèse |
|---|---|---|
| `expo-haptics` en Snack | Vibration réelle ou silencieuse ? | **Silencieuse** (le code ne crash pas mais pas de feedback physique). Validé via try/catch dans EditProfilePage qui ne crash jamais. |
| `react-native-reanimated 4.3.0` en Snack | Animations complexes OK ? | Phase6Characters utilise gesture swipe — probablement OK mais perf dégradée. À valider en ouvrant snack_test. |
| `useNativeDriver: true` dans ToastMessage | Casse-t-il en Snack ? | **Non**, juste warning console. Pattern utilisé déjà en prod via ProfilePage showToast. |
| `@shopify/react-native-skia` | Snack support ? | Normalement non (Canvas natif). AlixenFaceSkia sera un rendu blanc/placeholder en Snack. |
| `react-native-maps` | Snack web preview ? | MapView blanc ou erreur en Snack. Tracking = BUILD uniquement. |
| Edge Functions testables sans UI | Authorization header nécessaire ? | OUI — besoin d'un accessToken valide. Snack peut faire `fetch` avec token depuis supabase.auth. |
| `create_user_profile` RPC | Existe encore ou migré ? | Utilisée actuellement par RegisterPage:223 (`p_user_id`, `p_display_name`, etc.). |
| NotificationService DÉSACTIVÉ | Va-t-il recrasher en V2 ? | Plan V2 noté dans le fichier : permission différée, test isolé. OK. |

### 🔵 Dépendances transverses

- **Toast pattern** est dupliqué : `ToastMessage.js` shared + `setToast` inline dans ProfilePage (`{message, color}`). Cohérence à unifier un jour.
- **19 fichiers en violation `useNativeDriver: true`** → sprint dédié fix conformity recommandé (voir J7 du plan)
- **AlixenFaceSkia** est le seul consommateur de Skia → alternative possible en SVG pur (UI équivalente, moins fluide) pour rendre Snack-friendly. À trancher.

### 🟢 Points forts LIXUM révélés par le diagnostic

1. **Architecture très Snack-friendly** : ~65% du code est testable sans APK. La stratégie "Supabase-first + RPC + Edge Functions" paye.
2. **Composants shared très bien factorisés** : 20 composants dans `components/shared/`, pattern cohérent (ex. GoalSelector, DietarySelector, ScrollPicker).
3. **Backend mature** : 26+ RPC + 9 Edge Functions déjà en place, un gros pan du "métier" est testable indépendamment du client.
4. **Code LIXUM conventions respectées** : `var`, fonctions nommées, indentation 2 espaces, accents UTF-8 (post-PR #724).

### 🔴 Points d'attention

1. **Dette technique animations** : 19 fichiers `useNativeDriver: true` (violation règle LIXUM). Sprint fix de 2h quand l'agenda le permet.
2. **NotificationService désactivé** : tout le flow rappels médicaments / notifs push attend le 1er mai.
3. **Phase6Characters reanimated** : à tester explicitement en Snack avant de s'y baser pour d'autres features.
4. **Pas de tests unitaires visibles** dans le repo : le diagnostic repose sur l'analyse statique. Un `jest` setup aiderait.

---

## ✅ Vérifications du livrable

- Fichier : `/home/user/Afri_Cal/DIAGNOSTIC_FEATURES_SNACK_VS_BUILD.md`
- Aucune modification de code dans `LIXUM-APP/src/`
- Couvre Section 1 (vue d'ensemble) + Section 2 (7 pages) + Section 3 (priorisation) + Section 4 (backlog build) + Section 5 (notes)
- Aucune branche créée, aucun commit

Fin du diagnostic.



