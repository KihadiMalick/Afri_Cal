# AUDIT — ProfilePage.js

Audit lecture seule de `LIXUM-APP/src/pages/profile/ProfilePage.js` aligné DB V6.
Aucune modification apportée au code.

---

## SECTION 1 — Structure générale

- **Chemin** : `LIXUM-APP/src/pages/profile/ProfilePage.js`
- **Lignes totales** : 826
- **Fichier de constantes lié** : `LIXUM-APP/src/pages/profile/profileConstants.js` (176 lignes)

### Imports principaux

- `react` : `useState, useEffect, useRef, useCallback`
- `react-native` : `View, Text, ScrollView, Pressable, Platform, StatusBar, Modal, TextInput, Image, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Linking`
- `expo-linear-gradient` : `LinearGradient`
- `@react-native-async-storage/async-storage` : `AsyncStorage` (importé mais jamais utilisé dans ce fichier — voir dette §7)
- `react-native-svg` : `Svg, Path`
- `react-native-markdown-display` : `Markdown`
- `./profileConstants` : `W, wp, fp, SUPABASE_URL, SUPABASE_ANON_KEY, CONNECTORS, activityLevelToIndex, activityIndexToKey, calculateBMR, calculateTDEE, calculateDailyTarget, XP_MILESTONES, XP_SOURCES, getNextMilestone, getXPForLevel, ACTIVITY_LEVELS, DIETS, GOALS, T, getCharEmoji`
- `../../config/AuthContext` : `useAuth`
- `@react-navigation/native` : `useFocusEffect, useRoute`
- `../../config/supabase` : `supabase`
- `../../components/shared/MetalCard` : `MetalCard`

### Sous-composants définis

- `ProfileScrollPicker` (l.73-98) : picker à défilement snap utilisé pour l'hydratation
- `Section` (l.277-286) : ligne de réglage cliquable (icône + titre + subtitle + chevron)
- `renderConnectorCard` (l.357-368) : carte connecteur (Apple Health, Strava...)

### Sections UI (scroll de haut en bas, root = View plein écran l.371)

- Section 1 (l.374-399) : Header — back arrow, avatar, display_name, badge tier, lixtag, barre XP niveau, 3 stats (Lix / Énergie / Cartes)
- Section 2 (l.401-428) : Prompt personnalisation profil (conditionnel si display_name vide)
- Section 3 (l.430-438) : Données personnelles — 4 tuiles (âge, poids, taille, IMC)
- Section 4 (l.439-472) : MetalCard IMC — barre colorée avec curseur positionné
- Section 5 (l.474) : Bouton `t.editProfile`
- Section 6 (l.476-499) : MetalCard Objectif hydratation — picker L + recommandation EFSA
- Section 7 (l.600-603) : Paramètres — Localisation / Abonnement / Notifications
- Section 8 (l.605-607) : Connecteurs (Apple Health, Samsung, Fitbit, Strava)
- Section 9 (l.609-611) : Apprendre — Glossaire / Guide LIXUM
- Section 10 (l.613-617) : Légal & support — Privacy / Terms / Contact / Évaluer
- Section 11 (l.619-620) : Logout + Supprimer compte
- Section 12 (l.621) : Footer version + mention "Fait avec ♥ au Burundi"

### Modals définis

- Édition profil (l.501-570)
- Avertissement médical hydratation (l.572-598)
- Confirmation logout (l.624-633)
- Confirmation suppression compte (l.635-644)
- Milestones XP (l.646-699) — **jamais ouvrable** (voir §7)
- Contact picker (l.701-743)
- Privacy markdown (l.745-779)
- Terms markdown (l.781-815)
- Toast (l.817-822)

### useState déclarés (30 au total)

| Ligne | State | Init | Usage |
|---|---|---|---|
| 111 | profile | null | données users_profile |
| 113 | ownedCharacters | 0 | count lixverse_user_characters |
| 114 | userXP | `{user_xp:0, user_level:1, xp_progress:0, xp_needed:80, xp_percent:0}` | affichage header + milestones |
| 115 | activeCharSlug | null | emoji avatar |
| 116 | userEnergy | 20 | stat énergie header |
| 117 | showEditProfile | false | modal édition |
| 118 | hydroGoalL | null | objectif hydratation (L) |
| 119 | showMedicalWarning | false | modal avertissement hydratation |
| 120 | pendingHydroGoal | null | valeur en attente de confirmation médicale |
| 121 | showLocationPicker | false | **modal non rendue** |
| 122 | showGlossary | false | **modal non rendue** |
| 123 | showFeatures | false | **modal non rendue** |
| 124 | showSubscription | false | **modal non rendue** |
| 125 | showPrivacy | false | modal Privacy |
| 126 | showTerms | false | modal Terms |
| 127 | legalCache | `{privacy:{fr,en}, terms:{fr,en}}` | cache docs légaux |
| 128 | legalLoading | false | loader modal legal |
| 129 | legalError | null | erreur modal legal |
| 130 | showMilestones | false | modal milestones **jamais setter à true** |
| 131 | showLogoutConfirm | false | modal confirmation logout |
| 132 | showDeleteConfirm | false | modal confirmation delete |
| 133 | showContactPicker | false | modal contact |
| 134-138 | editName/Age/Weight/Height/Location | '' | édition profil |
| 139 | connectedApps | `{}` | **state local uniquement, non persisté** |
| 140 | toast | null | toast custom |
| 145 | focusedField | null | UI focus des inputs édition |

### useEffect (4 au total)

- l.164-172 deps `[showEditProfile, profile]` : pré-remplit les inputs d'édition à l'ouverture de la modal
- l.174-181 deps `[route.params]` : scroll-to-weight si navigation param
- l.183 deps `[userId]` : `loadProfile()` au mount / changement userId
- l.345-349 deps `[showPrivacy]` : fetch Privacy doc quand modal ouverte
- l.351-355 deps `[showTerms]` : fetch Terms doc quand modal ouverte

Plus un `useFocusEffect` (l.185-187) : `refreshLixFromServer()` au retour sur la page (ne refetch **PAS** XP ni profile).

### Handlers / async définis

| Ligne | Nom | Rôle |
|---|---|---|
| 106 | getAuthHeaders | Récupère JWT pour les fetch REST manuels |
| 189 | loadProfile | Fetch parallèle users_profile + lixverse_user_characters + get_user_xp |
| 205 | saveProfile | PATCH users_profile avec nouveaux BMR/TDEE/target |
| 221 | saveLocation | Met `editLocation` + toast (**n'écrit pas en DB**) |
| 222 | toggleConnector | Toggle connectedApps local state |
| 228 | saveHydrationGoal | Update custom_hydration_goal_ml en DB |
| 239 | trySetHydroGoal | Déclenche avertissement médical si hors zone [1.5L, 3.5L] |
| 249 | confirmMedicalWarning | Valide le goal après avertissement |
| 255 | handleLogout | auth.signOut() |
| 256 | handleDeleteAccount | auth.signOut() **⚠ ne supprime rien** (voir §7) |
| 258 | handleCloseMilestones | setShowMilestones(false) — **unique interaction avec ce state** |
| 259-260 | handleOpenContact/Close | Toggle modal contact |
| 262 | openMailto | Ouvre mailto avec Linking |
| 271-275 | handleContactBug/Suggestion/Billing/RGPD/Partnership | Wrappers openMailto |
| 307 | fetchLegalDocument | RPC get_current_legal_document + cache |
| 142 | showToast | Toast avec auto-dismiss 2500ms |

---

## SECTION 2 — Consommation DB (alignement V5/V6)

### Lectures (SELECT / RPC)

| Ligne | Type | Table/RPC | Colonnes / Params | Statut |
|---|---|---|---|---|
| 107 | supabase.auth.getSession | — | — | ✅ |
| 193 | REST GET | `users_profile?select=*` | toutes | ✅ V6 |
| 194 | REST GET | `lixverse_user_characters` | `character_slug, is_active, level` | ✅ |
| 200 | REST RPC | `get_user_xp` | `p_user_id` | ✅ V6 |
| 316 | supabase.rpc | `get_current_legal_document` | `p_document_type, p_language` | ✅ |

### Écritures (UPDATE / PATCH)

| Ligne | Type | Table | Colonnes | Statut |
|---|---|---|---|---|
| 216 | REST PATCH | `users_profile` | display_name, age, weight, height, gender, activity_level, dietary_regime, goal, bmr, tdee, daily_calorie_target, language | ✅ V6 |
| 233 | supabase update | `users_profile` | custom_hydration_goal_ml | ✅ V6 |

### Colonnes V4 dropées recherchées

Grep effectué sur `lix_count | energy_monthly_used | monthly_energy_reset_at | is_premium | is_premium_until | full_name | last_spin_at` → **0 match**.

**Verdict : ✅ ProfilePage est V5/V6 compliant. Aucune dette de colonne droppée.**

### Colonnes V6 consommées correctement

- `lix_balance` (l.198) — OK
- `energy` (l.198) — OK
- `display_name` (l.156, 166, 198, 303, 381) — OK
- `lixtag` (l.384) — OK
- `custom_hydration_goal_ml` (l.198, 233) — OK
- `subscription_tier` via `auth.subscriptionTier` (l.294) — OK

### Remarques

- ⚠ **Mélange REST manuel + client supabase** : certains appels utilisent `fetch(SUPABASE_URL + '/rest/v1/...')` (l.193, 194, 200, 216) et d'autres `supabase.from(...)` (l.233) ou `supabase.rpc(...)` (l.316). Incohérence stylistique — pas une dette DB mais une dette d'uniformité.
- ⚠ `language: 'FR'` hardcodé dans le PATCH (l.215) — écrase toute préférence en base même pour un user anglophone.
- ⚠ Les colonnes `gender`, `activity_level`, `dietary_regime`, `goal`, `target_weight_loss`, `target_months` sont réutilisées depuis `profile` existant dans saveProfile mais **ne sont jamais éditables via l'UI** → voir §7.

---

## SECTION 3 — Affichage XP + niveau

### Appel `get_user_xp`

- **Ligne** : 200 (via `fetch` REST manuel POST sur `/rest/v1/rpc/get_user_xp`)
- **Body** : `{ p_user_id: userId }`
- **Réponse consommée** : `setUserXP(d)` où `d` remplace TOUT l'objet d'état
- **Format attendu** : `{ user_xp, user_level, xp_progress, xp_needed, xp_percent }` (5 clés)

### Lieux d'affichage

- l.388 : badge `NIV {userXP.user_level}` (header)
- l.389 : `{userXP.xp_progress} / {userXP.xp_needed} XP` (header)
- l.391 : `LinearGradient` width = `xp_percent + '%'` (barre header)
- l.657 : `NIV {userXP.user_level}` (milestones modal — **jamais ouvrable**)
- l.658 : `{userXP.xp_progress} / {userXP.xp_needed} XP` (milestones modal)
- l.661 : barre interne modal (width = xp_percent)

### Fréquence de refetch

| Déclencheur | Refetch XP ? |
|---|---|
| Mount initial (useEffect `[userId]` l.183) | ✅ via `loadProfile()` |
| `useFocusEffect` l.185 (retour sur la page) | ❌ **n'appelle que `refreshLixFromServer`** |
| setInterval périodique | ❌ aucun |
| Après une action XP (scan, mood, activity...) | ❌ aucun hook |

⚠ **Dette V6** : l'utilisateur peut gagner de l'XP ailleurs (scan repas, logger mood, etc. via les 11 call sites branchés en PR #707 et #708), puis revenir sur ProfilePage et voir les **anciennes valeurs** jusqu'au prochain mount complet. Voir opportunités §8.

### Skeleton / loader

❌ Aucun loader pendant le fetch XP. L'état initial `{user_xp:0, user_level:1, xp_progress:0, xp_needed:80, xp_percent:0}` s'affiche tel quel. L'utilisateur voit brièvement "NIV 1" même s'il est au niveau 42.

### Gestion d'erreur

- l.201 : `.catch(function(err) { console.warn('[LIXUM] XP fetch error:', err); })` — **silencieux**. Aucun toast, aucune retry, aucune UI d'erreur. Si le fetch échoue, l'utilisateur reste sur les valeurs initiales à 0 sans le savoir.
- Pas de retry button pour XP (contraste avec les modals légales qui ont un bouton "Réessayer").

---

## SECTION 4 — Modal Milestones V5 (paliers XP)

### Source des paliers

Liste `XP_MILESTONES` définie dans `profileConstants.js` l.66-72, importée dans ProfilePage l.13, consommée dans la modal l.664-681.

### Alignement avec la spec V5

| Palier | Spec V5 attendue | Actuel (`profileConstants.js`) | Statut |
|---|---|---|---|
| Niv 10 | 500 Lix + 20é + **3 frags Rare** | 500 Lix + 20é + **1 Carte Rare** | ⚠ Récompense désalignée |
| Niv 25 | 1500 Lix + 50é + **5 frags Elite** | 1500 Lix + 50é + **1 Carte Elite** | ⚠ Récompense désalignée |
| Niv 50 | 5000 Lix + 100é + **5 frags Mythique** | 5000 Lix + 100é + **1 Carte Mythique** | ⚠ Récompense désalignée |
| Niv 75 | 10000 Lix + 200é + **1 Carte Mythique COMPLÈTE** | 10000 Lix + 200é + **5 Fragments Mythique** | ⚠ Récompenses inversées avec Niv 50 |
| Niv 100 | 25000 Lix + 500é + **Badge Légendaire + 3 frags TARDIGRUM** | 25000 Lix + 500é + **Badge Légendaire** | ⚠ Fragments TARDIGRUM manquants |

**Chiffres Lix et énergie corrects sur les 5 paliers** ✅
**Récompenses cartes/fragments désalignées sur les 5 paliers** ⚠

Différences ligne par ligne dans `profileConstants.js` :

- l.67 : `reward: '1 Carte Rare'` → devrait être `'3 Fragments Rare'`
- l.68 : `reward: '1 Carte Elite'` → devrait être `'5 Fragments Elite'`
- l.69 : `reward: '1 Carte Mythique'` → devrait être `'5 Fragments Mythique'`
- l.70 : `reward: '5 Fragments Mythique'` → devrait être `'1 Carte Mythique complète'`
- l.71 : `reward: 'Badge Légendaire'` → devrait être `'Badge Légendaire + 3 frags TARDIGRUM'`

Les traductions `rewardEn` sont également désalignées (même inversion).

### Distinction visuelle palier atteint

✅ Oui, bien implémentée :

- l.667 `borderColor: reached ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.05)'` — bordure verte si atteint
- l.667 `opacity: reached ? 1 : 0.55` — opacité réduite si non atteint
- l.669 emoji `🏆` si atteint, sinon emoji personnalisé du palier
- l.674 label `✓ ATTEINT` en vert si reached
- l.673 couleur du texte niveau en vert si reached

### ⚠ Critique : modal jamais ouvrable

- `setShowMilestones(true)` est **absent** du fichier (grep exhaustif)
- `showMilestones` n'est modifié que par `handleCloseMilestones` (l.258) qui le met à `false`
- Conséquence : **cette modal entière (l.646-699, 53 lignes) est du code mort visuellement inaccessible**
- L'utilisateur n'a aucun moyen de voir ses paliers XP

---

## SECTION 5 — Respect privacy display_name vs lixtag

### Règle LIXUM

- `display_name` = UI interne, salutations, tutoiement ALIXEN
- `lixtag` = exports médicaux, contextes publics
- Aucun `full_name` dans les surfaces exportables

### Audit ProfilePage

| Concept | Utilisation | Statut |
|---|---|---|
| `full_name` | grep → **0 match** dans ProfilePage | ✅ non exposé |
| `display_name` salutations | l.381 (sous avatar), l.303 (fallback avatar), l.166 (préfill édition) | ✅ UI interne uniquement |
| `display_name` fallback | l.381 `profile.display_name \|\| 'Utilisateur'` | ✅ |
| `lixtag` affichage | l.384 `profile.lixtag` sous le badge tier, en gris clair | ✅ public-safe |
| Bouton "copier mon LixTag" | **Absent** | ⚠ dette UX Premium |

### Détails

- l.381 : `profile ? (profile.display_name || 'Utilisateur') : '...'` — affiche "Utilisateur" si vide (générique, OK)
- l.384 : `profile ? profile.lixtag : 'LXM-...'` — placeholder loading correct
- l.401-428 : si `!profile.display_name`, prompt conditionnel pour inviter à personnaliser — bonne UX onboarding
- l.525 : TextInput édition `display_name` avec label "Comment vous appeler" et helper "Visible uniquement par vous" — texte correct côté privacy
- l.527-528 : note "Visible uniquement par vous" — **légèrement trompeur** : ALIXEN voit aussi ce nom (tutoiement), et le nom peut transparaître dans les exports MediBook si non filtré côté edge function

**Verdict** : ✅ Règle respectée globalement. Manque un bouton "copier LixTag" pour partager aux médecins.

---

## SECTION 6 — Autres fonctionnalités

### État par section UI

| Section | Ligne début | État | Détail |
|---|---|---|---|
| Édition profil (modal) | 501-570 | ✅ Fonctionnelle partielle | Inputs : name, age, weight, height, location. **Manquants** : gender, activity_level, dietary_regime, goal |
| Objectif hydratation | 476-499 | ✅ Fonctionnelle | Picker L + avertissement médical + save DB |
| Localisation (Section) | 601 | ❌ Cassée | `setShowLocationPicker(true)` appelé mais **aucune modal correspondante** dans le JSX |
| Abonnement (Section) | 602 | ❌ Cassée | `setShowSubscription(true)` mais **aucune modal** (pas de Silver/Gold/Platinum) |
| Notifications (Section) | 603 | ❌ Placeholder | Affiche toast "Bientôt", aucune logique |
| Connecteurs | 605-607 | ⚠ Mock UI | `connectedApps` en local state, **jamais persisté en DB**. Aucune intégration Apple Health / Samsung / Fitbit / Strava réelle |
| Glossaire (Section) | 610 | ❌ Cassée | `setShowGlossary(true)` mais **aucune modal** |
| Guide LIXUM (Section) | 611 | ❌ Cassée | `setShowFeatures(true)` mais **aucune modal** |
| Privacy (modal) | 745-779 | ✅ Fonctionnelle | RPC `get_current_legal_document`, cache, loader, error retry |
| Terms (modal) | 781-815 | ✅ Fonctionnelle | Même pattern que Privacy |
| Contact (modal picker) | 701-743 | ✅ Fonctionnelle | 5 catégories via mailto:contact@lixum.com |
| Évaluer LIXUM (Section) | 617 | ❌ Placeholder | Toast "Bientôt" |
| Logout | 619 + modal 624-633 | ✅ Fonctionnelle | auth.signOut() |
| Supprimer compte | 620 + modal 635-644 | ❌ **BUG RGPD CRITIQUE** | handleDeleteAccount l.256 = `auth.signOut()` uniquement. **Ne supprime AUCUNE donnée en DB.** La modal dit "Action irréversible" mais le compte persiste |
| Milestones (modal) | 646-699 | ❌ Inaccessible | Modal rendue conditionnellement mais aucun trigger `setShowMilestones(true)` |
| Données personnelles (tuiles) | 430-438 | ✅ Affichage | Âge / Poids / Taille / IMC, affichage seul |
| IMC MetalCard | 439-472 | ✅ Fonctionnelle | Barre colorée + curseur + label catégorie |
| Historique (meals, activities, transactions) | — | ❌ Absent | Aucune section historique malgré data V6 disponible |
| Raccourcis vers autres pages | — | ❌ Absent | Aucun "Aller à LixVerse" / "Voir mon MediBook" |

### Fonctions d'écriture DB côté profil

- `saveProfile` (l.205) : ✅ PATCH users_profile complet
- `saveHydrationGoal` (l.228) : ✅ UPDATE custom_hydration_goal_ml
- `saveLocation` (l.221) : ❌ **n'écrit rien en DB**, juste `setEditLocation` + toast
- `handleDeleteAccount` (l.256) : ❌ **RGPD non conforme**, fait juste un signOut

---

## SECTION 7 — Dette technique détectée

### Critique (bloquant)

1. ❌ **handleDeleteAccount (l.256) ne supprime pas le compte** — fait juste `auth.signOut()`. Violation RGPD, risque légal si l'utilisateur croit que ses données sont effacées. La modal (l.635-644) promet "Action irréversible" — mensonge.
2. ❌ **Connecteurs santé non implémentés** (l.605-607 + toggleConnector l.222) — toggle en local state `connectedApps` jamais persisté, aucune intégration réelle Apple Health / Samsung / Fitbit / Strava. UI trompeuse.
3. ❌ **Modale Milestones orpheline** (l.646-699) — `setShowMilestones(true)` absent du fichier. 53 lignes de JSX inaccessibles.
4. ❌ **4 modales inexistantes référencées** : `showLocationPicker`, `showGlossary`, `showFeatures`, `showSubscription` — setters appelés par les Sections (l.601, 602, 610, 611) mais aucun `<Modal visible={show...}>` correspondant dans le JSX. Clic = état mis à true + rien ne se passe.
5. ❌ **Paliers XP désalignés V5** — récompenses cartes/fragments incorrectes sur les 5 paliers dans `profileConstants.js` l.67-71 (détaillé §4).

### Majeure

6. ⚠ **saveLocation (l.221) ne persiste rien en DB** — `editLocation` reste en state local.
7. ⚠ **editLocation n'est PAS inclus dans le body de saveProfile** (l.215) — même si on édite via la modal profil, le champ `city` / `location` n'est jamais transmis au PATCH.
8. ⚠ **Pas de re-fetch XP au retour** (useFocusEffect l.185 ne rafraîchit que lixBalance).
9. ⚠ **`language: 'FR'` hardcodé** dans saveProfile (l.215) — écrase la préférence serveur à chaque save profil.
10. ⚠ **`var t = T.fr` hardcodé** (l.141) — pas de `useLang()` malgré l'existence complète de T.en dans profileConstants.
11. ⚠ **Version app "LIXUM v1.0.0-beta" hardcodée** (l.621) — devrait venir de app.json / expo-constants.
12. ⚠ **Gender, activity_level, dietary_regime, goal non éditables** dans la modale profil (l.501-570) — les imports `ACTIVITY_LEVELS`, `DIETS`, `GOALS` (l.14) le suggèrent mais aucun picker UI. saveProfile (l.209-214) réutilise les valeurs existantes.
13. ⚠ **Aucune accessibilité** — `grep accessibilityLabel|accessibilityHint|accessible=` → 0 match. Problématique VoiceOver/TalkBack.
14. ⚠ **Loader XP absent** — l'utilisateur voit brièvement NIV 1 avant le fetch.
15. ⚠ **Gestion d'erreur loadProfile silencieuse** — l.202 `console.error` sans UI d'erreur / retry. Si le fetch échoue, l'écran reste sur "..." / "—" sans explication.

### Mineure

16. Imports non utilisés depuis profileConstants (l.11, 13, 14) :
    - `activityLevelToIndex` (uniquement `activityIndexToKey` est utilisé, l.210)
    - `getNextMilestone`
    - `getXPForLevel`
    - `ACTIVITY_LEVELS`
    - `DIETS`
    - `GOALS`
17. Import `AsyncStorage` l.4 — **jamais utilisé** dans le fichier.
18. `handleCloseMilestones` l.258 — inutile tant que la modal est inaccessible.
19. State `hydroGoalL` (l.118) redondant avec `profile.custom_hydration_goal_ml`, pourrait être dérivé via `useMemo`.
20. Pas de re-fetch profile après `saveHydrationGoal` (l.228-237) — le state `hydroGoalL` est mis à jour manuellement mais `profile` n'est pas rechargé.
21. Avertissement médical hydratation (l.583-584) avec textes **hardcodés en français**, non traduits malgré T.fr/T.en disponible.
22. Toast (l.820) ne propose ni d'action, ni de close manuel. Auto-dismiss à 2500ms fixe.
23. Bouton back (l.377) sans feedback visuel (pas de Pressable style function), tap zone étroite.
24. Mélange styles inline + objets markdownStyles/legalStyles (l.23-71) — les deux objets sont bien extraits, mais les l.374-621 contiennent des styles inline massifs répétitifs (paddings / borders / colors).
25. Placeholders "Bientôt" (l.603 notifications, l.617 rate LIXUM) — affichent un toast sans action, pas de design de placeholder plus propre.
26. Tier check via IIFE (l.293-299) — pourrait être extrait en helper pur dans profileConstants (aussi utilisé ailleurs dans l'app potentiellement).
27. Gestion asynchrone loadProfile (l.189) : `Promise.all([...fetch]).then(...).then(...).catch(...)` — chaîne de 3 `.then` + fetch supplémentaire imbriqué (l.200) non await. Si get_user_xp met 3s, le reste s'affiche d'abord.
28. `getAuthHeaders` (l.106) construit à chaque saveProfile/loadProfile ; pourrait être mémoïsé.
29. `showMilestones`, `pendingHydroGoal`, `focusedField` n'ont pas de type checks — pas de TypeScript mais PropTypes serait utile sur ProfileScrollPicker / Section.
30. Les 5 paliers et les 7 sources XP sont en hard code côté JS, pas synchronisés avec la DB. Si la spec V6 change, double maintenance.

---

## SECTION 8 — Opportunités d'amélioration V6

### Alignement données

- **Refetch XP + profile dans useFocusEffect** (l.185) pour afficher les XP gagnés sur les autres pages (PR #707 / #708 branchent `add_user_xp` sur 10 points, mais l'utilisateur ne voit la progression qu'au prochain mount).
- **Récupérer les paliers depuis la DB** via RPC `get_xp_milestones()` — supprime la double maintenance JS/DB et corrige automatiquement les désalignements §4.
- **Corriger les récompenses dans `profileConstants.js` l.67-71** pour matcher la spec V5 (à faire soit côté JS, soit en migrant vers une source DB).

### Features Premium V6

- **Animation "+X XP"** déclenchée si `add_user_xp` retourne `xp_gained > 0` (la RPC V6 renvoie déjà ce champ). Intégrable via un event emitter global ou via le resultat qu'on ignore actuellement.
- **Section "XP gagnés aujourd'hui par source"** via la table `xp_ledger` V6 (`SELECT source, SUM(xp_amount) WHERE user_id = ? AND created_at::date = CURRENT_DATE GROUP BY source`). Transparence anti-farming.
- **Compteur "cap restant aujourd'hui"** par source, ex. "Scans restants : 3/5". Affichable à côté de chaque source dans la modal milestones.
- **Section "Ma streak actuelle"** (X jours consécutifs) — alignée avec le cron DB `grant_momo_streak_bonus` à brancher côté UI une fois implémenté.
- **Bouton "copier mon LixTag"** à côté de la ligne lixtag (l.384) — `Clipboard.setString(profile.lixtag)` + toast "LixTag copié".
- **Carte "Ma dernière activité trackée"** — `SELECT type, calories_burned FROM activities ORDER BY created_at DESC LIMIT 1`.
- **Carte "Mon dernier repas"** — `SELECT food_name, calories FROM meals ORDER BY created_at DESC LIMIT 1`.
- **Raccourci "Aller à LixVerse"** avec l'emoji du caractère actif (déjà récupéré via `activeCharSlug` l.115) et `navigation.navigate('LixVerse')`.
- **Bouton "Exporter mon MediBook PDF"** — déjà accessible ailleurs, raccourci utile depuis le profil.

### Correctifs UX / dette

- **Ajouter un bouton "Voir mes paliers XP"** pour rendre la modal milestones (l.646-699) accessible.
- **Implémenter les 4 modales manquantes** : location picker, subscription, glossary, features. Alternative : supprimer les sections si pas prêtes au lieu de leur donner un clic qui ne fait rien.
- **Transformer `handleDeleteAccount`** en appel RPC dédié `delete_user_account(p_user_id)` côté DB (RGPD) + double confirmation texte (taper DELETE).
- **Persister les connecteurs** dans une table `users_health_connectors(user_id, connector_id, connected_at, last_sync)` au lieu du local state. Ou retirer la section tant que non implémentée.
- **Ajouter `useLang()`** pour traduction dynamique — infrastructure T.fr/T.en déjà présente dans profileConstants.
- **Skeleton loader** pour le header XP/profil pendant `loadProfile` (voir `MetalCard` pour inspiration).
- **Toast d'erreur retry** pour les fetch XP / profile en échec.
- **accessibilityLabel** sur tous les Pressable principaux (back, edit, logout, delete, sections).
- **Refactor en sous-composants** : `ProfileHeader.js` (l.374-399), `EditProfileModal.js` (l.501-570), `HydrationGoalCard.js` (l.476-499), `LegalModals.js` (l.745-815), `MilestonesModal.js` (l.646-699). Permettrait de passer le fichier sous 300 lignes.
- **Extraire la version app** via `Constants.expoConfig.version` plutôt que l'hardcoder l.621.
- **Uniformiser REST vs client supabase** — soit tout migrer vers `supabase.from(...)` (plus concis et gère auth automatiquement), soit documenter pourquoi certains endpoints restent en REST manuel (ex. perf).

---

## Synthèse

- **826 lignes** de source auditées (ProfilePage.js) + 176 lignes profileConstants.js
- **7 appels DB identifiés**, tous alignés V6 — ✅ zéro colonne V4 droppée utilisée
- **Privacy display_name vs lixtag** : règle respectée, pas de `full_name` exposé
- **5 problèmes critiques** : handleDeleteAccount non fonctionnel (RGPD), connecteurs mock, modal milestones orpheline, 4 modales inexistantes, paliers XP désalignés
- **10 problèmes majeurs** + **15 problèmes mineurs**
- **18 opportunités V6** proposées (features Premium + correctifs UX)



