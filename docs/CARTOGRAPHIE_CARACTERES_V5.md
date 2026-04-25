# 🗺️ CARTOGRAPHIE COMPLÈTE — SYSTÈME CARACTÈRES V5

**Date** : 25 avril 2026
**Source** : Diagnostic Supabase (CSV) + Rapport Claude Code Phase 0
**Statut** : Document de référence centrale pour tous les sprints Caractères V5
**Repo** : `KihadiMalick/Afri_Cal` branche `main`

---

## 📊 PARTIE 1 — BASE DE DONNÉES

### 1.1 Table `lixverse_characters` — CATALOGUE MASTER (16 lignes)

Source de vérité statique des 16 personnages. Lecture seule par le client.

| Colonne | Type | NULL | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | — | Primary key UUID |
| `slug` | text | NO | — | Identifiant technique (ex: `emerald_owl`, `hawk_eye`) — **utilisé partout dans le code** |
| `name` | text | NO | — | Display name V5 (`Emerald Owl`, `Golden Eagle`, `Mariposa`, `Momo`) |
| `tier` | text | NO | — | `standard` \| `rare` \| `elite` \| `mythique` \| `ultimate` |
| `description_fr` | text | YES | — | Description française |
| `description_en` | text | YES | — | Description anglaise |
| `specialty_fr` | text | YES | — | Spécialité française (ex: "Résumés nutritionnels…") |
| `specialty_en` | text | YES | — | Spécialité anglaise |
| `efficiency_bonus` | numeric | NO | — | 0.30 / 0.45 / 0.60 / 0.80 / 1.00 selon tier |
| `frags_niv1` | integer | NO | — | Fragments cumulés pour débloquer Niv 1 |
| `frags_niv2` | integer | NO | — | Fragments cumulés pour débloquer Niv 2 |
| `frags_max` | integer | NO | — | Fragments cumulés pour débloquer Niv MAX (Niv 3) |
| `max_uses_per_cycle` | integer | NO | — | 3 pour tous (sauf cap spécial Simba/Alburax) |
| `recharge_energy` | integer | NO | — | 5 pour Std/Rare/Elite/Myth, 0 pour Ultimate (TARDIGRUM auto) |
| `image_url` | text | YES | — | Path relatif Supabase Storage (ex: `characters/emerald-owl.webp`) ou null |
| `sort_order` | integer | NO | — | Ordre d'affichage 1-16 |
| `created_at` | timestamptz | YES | — | Timestamp création |
| `emoji` | text | YES | — | Emoji fallback (utilisé si image_url null) |

#### Contenu confirmé du catalogue (CSV diagnostic)

| sort_order | slug | name (V5) | tier | frags_niv1/2/max |
|---|---|---|---|---|
| 1 | `emerald_owl` | Emerald Owl | standard | 10 / 20 / 30 |
| 2 | `hawk_eye` | **Golden Eagle** | standard | 10 / 20 / 30 |
| 3 | `ruby_tiger` | Ruby Tiger | standard | 10 / 20 / 30 |
| 4 | `amber_fox` | **Mariposa** | standard | 10 / 20 / 30 |
| 5 | `gipsy` | Gipsy | standard | 10 / 20 / 30 |
| 6 | `jade_phoenix` | Jade Phoenix | rare | 8 / 18 / 25 |
| 7 | `silver_wolf` | **Momo** | rare | 8 / 18 / 25 |
| 8 | `boukki` | Boukki | rare | 8 / 18 / 25 |
| 9 | `iron_rhino` | Iron Rhino | rare | 8 / 18 / 25 |
| 10 | `coral_dolphin` | Coral Dolphin | rare | 8 / 18 / 25 |
| 11 | `licornium` | LICORNIUM | elite | 7 / 14 / 20 |
| 12 | `jaane_snake` | Jaane Snake | elite | 7 / 14 / 20 |
| 13 | `mosquito` | MOSQUITO | elite | 7 / 14 / 20 |
| 14 | `diamond_simba` | Diamond Simba | mythique | 6 / 12 / 18 |
| 15 | `alburax` | Alburax | mythique | 6 / 12 / 18 |
| 16 | `tardigrum` | TARDIGRUM | ultimate | 3 / 5 / 6 |

> ⚠️ **Slugs gardés legacy V1 (`hawk_eye`, `amber_fox`, `silver_wolf`)** mais display name V5 (`Golden Eagle`, `Mariposa`, `Momo`). Ne JAMAIS renommer les slugs en DB (FK partout).

---

### 1.2 Table `lixverse_user_characters` — COLLECTION USER

État individuel de chaque user pour chaque personnage. Lecture + écriture via RPC.

| Colonne | Type | NULL | Default | Description |
|---|---|---|---|---|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users.id` |
| `character_slug` | text | NO | — | FK → `lixverse_characters.slug` |
| `fragments` | integer | NO | 0 | Cumul fragments obtenus |
| `level` | integer | NO | 0 | 0 (locked) / 1 / 2 / 3 (MAX) |
| `xp` | integer | NO | 0 | XP intra-niveau |
| `xp_full` | boolean | NO | false | XP rempli |
| `is_active` | boolean | NO | false | Un seul `true` par user |
| `uses_remaining` | integer | NO | **10** ⚠️ | 0-3 normalement (default = 10 anomalie) |
| `last_recharge_at` | timestamptz | YES | — | Timestamp dernière recharge |
| `obtained_at` | timestamptz | YES | `now()` | Date d'obtention |
| `active_since` | timestamptz | YES | — | Timestamp activation (cooldown 30min serveur) |

#### Contraintes confirmées (CSV diagnostic)

| Contrainte | Type | Colonnes |
|---|---|---|
| `lixverse_user_characters_pkey` | PRIMARY KEY | `id` |
| `lixverse_user_characters_user_id_character_slug_key` | UNIQUE | `(user_id, character_slug)` |
| `lixverse_user_characters_character_slug_fkey` | FOREIGN KEY | `character_slug` |

> ⚠️ **Anomalie connue** : `uses_remaining` default = 10 au lieu de 3. À investiguer dans un sprint futur (probablement vestige cap IA Simba/Alburax). Zéro impact actuel parce que les RPC override.

---

### 1.3 Table `lixverse_character_powers` — POUVOIRS (48 lignes = 16 × 3)

Catalogue des pouvoirs débloqués par niveau.

| Colonne | Type | Description |
|---|---|---|
| `character_slug` | text | FK |
| `level_required` | integer | 1, 2, 3 |
| `power_key` | text | Identifiant unique (ex: `owl_resume_macros`) |
| `name_fr` / `name_en` | text | Nom du pouvoir |
| `description_fr` / `description_en` | text | Description |
| `action_type` | text | `modal_inline` \| `redirect` \| `redirect_with_boost` \| `toggle` |
| `is_superpower` | boolean | true uniquement pour le pouvoir niv 3 ⭐ |

> 🔍 **À diagnostiquer** : on n'a pas encore exporté de CSV de cette table. À faire si Phase 5 (test pouvoirs réels) révèle des incohérences.

---

### 1.4 Table `users_profile` — Champs liés caractères

Colonnes utilisées par le système Caractères :

| Colonne | Type | Description |
|---|---|---|
| `user_id` | uuid | FK → `auth.users.id` |
| `display_name` | text | Nom affiché (UI privée seulement) |
| `lixtag` | text | LXM-XXXXXX (exports publics) |
| `lix_balance` | integer | Solde Lix |
| `energy` | integer | Solde énergie |
| `active_character_id` | uuid | **FK → `lixverse_user_characters.id`** (perso actif) |
| `subscription_tier` | text | `free` / `silver` / `gold` / `platinum` |
| `language` | text | `fr` / `en` |

> ⚠️ **Double tracking du perso actif** : `is_active = true` dans `lixverse_user_characters` ET `active_character_id` dans `users_profile`. À garder synchronisés (le RPC `set_active_character` doit faire les deux).

---

### 1.5 RPC Supabase utilisés

#### 5 RPC Caractères V5 (tous branchés ✅)

| RPC | Signature | Usage | Retour |
|---|---|---|---|
| `get_user_collection` | `(p_user_id uuid)` | Fetch collection complète des 16 perso | Array de 16 objets avec `slug`, `name`, `tier`, `description_fr`, `specialty_fr`, `efficiency_bonus`, `frags_niv1/2/max`, `image_url`, `sort_order`, `fragments`, `level`, `xp`, `is_active`, `uses_remaining`, `obtained_at`, `owned` |
| `get_character_powers` | `(p_user_id uuid, p_slug text)` | Fetch les 3 pouvoirs d'un perso | Array de 3 objets avec `power_key`, `level_required`, `name_fr`, `description_fr`, `action_type`, `is_superpower`, `unlocked` |
| `set_active_character` | `(p_user_id uuid, p_slug text)` | Switch perso actif | Gère cooldown 30min serveur via `active_since`. Met à jour `is_active` ET `users_profile.active_character_id` |
| `use_character_power` | `(p_user_id uuid, p_power_key text)` | Consomme 1 use et active pouvoir | Décrémente `uses_remaining`, log dans `transactions_lix` éventuellement |
| `recharge_character` | `(p_user_id uuid, p_slug text)` | Recharge à 3 uses | Coûte 5é (sauf TARDIGRUM auto). Vérifie solde côté serveur |

#### 2 RPC Onboarding

| RPC | Usage |
|---|---|
| `check_character_onboarding` | Check si user a déjà choisi 1er compagnon |
| `choose_first_character` | Sélection 1er compagnon Standard à l'onboarding |

#### Pattern d'appel (LixVersePage.js:189)

```javascript
async function supaRpc(fnName, params) {
  var res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
    method: 'POST',
    headers: POST_HEADERS,
    body: JSON.stringify(params)
  });
  return await res.json();
}
```

✅ Pattern propre, centralisé. À garder.

---

## 💻 PARTIE 2 — CODE CLIENT

### 2.1 Architecture globale

```
LixVersePage.js (parent — gère tous les states + RPC + handlers)
├── DefiTab.js
├── HumanTab.js
├── CharactersTab.js  ⭐ SUJET DE LA REFONTE V5
└── LixShopTab.js
```

`CharactersTab.js` est une **vue contrôlée pure** : tous les states (`userCollection`, `activeCharSlug`, `selectedChar`, `charFlipped`, `charPowers`...) et tous les handlers (`onSwitchActive`, `onUseCharPower`, `onRechargeChar`...) sont passés en **props** depuis `LixVersePage.js`.

> 💡 **Implication clé** : pour Phase 1, on touche **2 fichiers principaux** (`LixVersePage.js` pour la logique + `CharactersTab.js` pour l'affichage) plus `lixverseConstants.js` pour purger le code mort.

---

### 2.2 Fichiers principaux LixVerse

#### `src/pages/lixverse/LixVersePage.js` — Parent contrôleur

| Élément | Ligne | Description |
|---|---|---|
| Import `useAuth` | 34 | Auth context |
| `flipAnim` (Animated.Value) | 146 | Animation flip carte |
| `flipCard()` | 195 | Trigger flip avec setCharFlipped |
| `supaRpc()` | 189 | Wrapper RPC fetch |
| Call `check_character_onboarding` | 214 | Onboarding check |
| Call `get_user_collection` | 224 | Fetch collection |
| **Mapping écrasant FRAGS_NIV1** ⚠️ | 221 | **🔴 BUG : écrase fragments_required du RPC** |
| Call `choose_first_character` | 237 | Onboarding |
| Call `set_active_character` | 251 | Switch perso |
| Call `get_character_powers` | 309 | Fetch pouvoirs |
| Call `use_character_power` | 319 | Activation pouvoir |
| Call `recharge_character` | 344, 359 | Recharge |
| Fallback FRAGS_NIV1 selectedChar | 781 | 🔴 Fallback hardcodé |
| `onGoToSpin` (en réalité va vers Défi) | 1002 | À renommer `onGoToDefi` |

#### `src/pages/lixverse/CharactersTab.js` — Vue (1235 lignes)

| Bloc | Lignes | Contenu |
|---|---|---|
| Imports | 1-30 | `Animated`, `LinearGradient`, `LixGem`, constants legacy |
| Props signature | 47-55 | 12 props passées par parent |
| Helpers internes (3) | 58-70 | `activeChar`, `getLevelBadge`, `closeCharModal` |
| Header tab | 73-138 | Titre + counter + boutons |
| **Grille 3 colonnes des 16 perso** | 138-209 | Cards individuelles avec image + level badge |
| **Modal détail (1 modal, 2 vues flip)** | 210-1234 | Architecture animée crossfade `frontInterpolate`/`backInterpolate` |
| → Vue avant (carte zoom + overlays) | 260-422 | Image perso + badges + CTA |
| → Vue arrière (3 pouvoirs Niv1/2/MAX) | 430-1100+ | ScrollView avec 3 cards pouvoirs |
| → Boutons action contextuels | divers | Activer / Utiliser / Recharger / Fragments manquants |

#### Overlays sur carte zoom (modal détail)

| Overlay | Position | Données |
|---|---|---|
| Image personnage | full | `getCharImage(slug)` |
| Background fallback | full (si image null) | `#1E2530` |
| Badge niveau | `top: wp(32), right: wp(28)` | `Niv X` ou `MAX` |
| Badge XP | `top: wp(58), right: wp(28)` | `XP/XP_next` |
| Overlay locked sombre | full (si !owned) | `bg:rgba(0,0,0,0.6)` + 🔒 centré |
| Flèches navigation | `left/right: wp(6)` | chevrons gauche/droite |

> 💡 **Médaillon doré in-image** : les badges sont positionnés **top-right**, donc ne masquent **pas** le médaillon décoratif top-left de l'illustration Emerald Owl. ✅

#### `src/pages/lixverse/lixverseConstants.js` — Constants partagés

| Export | Statut V5 |
|---|---|
| `ALL_CHARACTERS` (16 perso UPPERCASE) | 🔴 À refondre (display name V5) ou supprimer |
| `TIER_CONFIG` | ✅ Garder (couleurs/labels par tier) |
| `CHAR_NAMES` (mapping legacy hardcodé) | 🔴 **À SUPPRIMER** (utiliser DB `character.name`) |
| `FRAGS_NIV1 = { standard: 3, rare: 4, elite: 5, mythique: 8, ultimate: 15 }` | 🔴 **À SUPPRIMER** (utiliser DB `frags_niv1`) |
| `CHARACTER_IMAGES` (require statiques webp) | ✅ Garder pour fallback offline-first |
| `SUPABASE_URL`, `HEADERS`, `POST_HEADERS` | ✅ Garder |
| `getCharImage(slug)` helper | ✅ Garder |
| `RECHARGE_COST_BY_TIER` | 🔴 À aligner V5 (uniforme 5é) |

#### `src/pages/lixverse/lixverseComponents.js` — Composants helpers

- Exporte `LixGem` (utilisé dans CharactersTab pour afficher le coût en Lix)

#### `src/pages/lixverse/DefiTab.js` / `HumanTab.js` / `LixShopTab.js`

> ⚠️ **À diagnostiquer en début de Phase 1** : `grep -rn "FRAGS_NIV1\|CHAR_NAMES\|ALL_CHARACTERS"` dans ces 3 fichiers pour vérifier qu'ils n'importent rien de ce qui sera supprimé.

---

### 2.3 Fichiers transverses (autres pages utilisant les RPC Caractères)

| Fichier | RPC appelé | Ligne |
|---|---|---|
| `src/pages/dashboard/Dashboard.js` | `get_user_collection` | 309 |
| `src/pages/dashboard/Dashboard.js` | `get_character_powers` | 313 |
| `src/pages/dashboard/Dashboard.js` | `use_character_power` | 320 |
| `src/pages/repas/RepasPage.js` | `get_user_collection` | 225 |
| `src/pages/repas/RepasPage.js` | `get_character_powers` | 231 |
| `src/pages/repas/RepasPage.js` | `use_character_power` | 284 |
| `src/pages/activity/ActivityPage.js` | `get_user_collection` | 235 |
| `src/pages/activity/ActivityPage.js` | `get_character_powers` | 240 |
| `src/pages/activity/ActivityPage.js` | `use_character_power` | 249 |

> 🔴 **Garde-fou Phase 1** : si on simplifie le mapping post-RPC dans `LixVersePage.js:221`, il faut vérifier que ces 3 pages **ne dépendent pas** du même mapping écrasant. À auditer avant tout refactor.

---

### 2.4 Onboarding

#### `src/pages/register/phases/Phase6Characters.js` — Choix premier compagnon

| Ligne | Problème |
|---|---|
| 85 | Hardcode `name: 'EMERALD OWL'` (à aligner V5 → `Emerald Owl`) |

> ⚠️ **À inclure dans le scope Phase 1** pour cohérence onboarding ↔ LixVerse.

---

### 2.5 Composants partagés

| Composant | Path | Utilisé dans LixVerse ? |
|---|---|---|
| `ToastMessage` | `src/components/shared/ToastMessage.js` | ❌ Non (à intégrer Phase 1 pour notifs switch/use) |
| Helpers haptic | `src/pages/profile/EditProfilePage.js:32-48` | ❌ Non (à factoriser dans `src/utils/haptics.js`) |
| `useAuth` | `src/config/AuthContext.js` | ✅ Cohérent |
| `wp(), fp()` | `src/constants/layout.js` | ✅ Cohérent (responsive sizing) |
| Helper Storage URL | ❌ N'existe pas | À créer si migration vers Supabase Storage Phase 2 |

---

### 2.6 Assets

#### Images personnages

`assets/characters/*.webp` — actuellement chargés via `require()` statiques dans `CHARACTER_IMAGES`.

| Slug | Image dispo |
|---|---|
| `emerald_owl` | ✅ `emerald_owl.webp` (validée Gemini, ratio 3:4, bordure dorée intégrée) |
| 15 autres | 🟠 Pas encore générées (à faire avec Gemini selon prompt template Malick) |

**Stratégie fallback Phase 2** : si `image_url` null OU asset absent → afficher **emoji géant centré** sur fond gradient tier (déjà prévu dans `CHARACTER_EMOJIS`).

---

## 🔄 PARTIE 3 — MAPPING ACTUEL vs V5 ATTENDU

### 3.1 Display names

| Slug DB | Affiché actuellement (UI) | Attendu V5 | Source bug |
|---|---|---|---|
| `emerald_owl` | EMERALD OWL | **Emerald Owl** | `ALL_CHARACTERS.name` UPPERCASE |
| `hawk_eye` | HAWK EYE | **Golden Eagle** | `CHAR_NAMES['hawk_eye'] = 'Hawk Eye'` puis fallback ALL_CHARACTERS UPPERCASE |
| `amber_fox` | AMBER FOX | **Mariposa** | idem |
| `silver_wolf` | SILVER WOLF | **Momo** | idem |
| `ruby_tiger`, `gipsy`, `jade_phoenix`, etc. | UPPERCASE | Capitalize standard | `ALL_CHARACTERS.name` UPPERCASE |

**Fix Phase 1** : supprimer `CHAR_NAMES` + supprimer champ `name` de `ALL_CHARACTERS` + lire `character.name` directement depuis le retour `get_user_collection`.

### 3.2 Fragments thresholds

| Tier | Hardcoded V1 (`FRAGS_NIV1`) | DB V5 (`frags_niv1`) | Écart UI |
|---|---|---|---|
| standard | 3 | **10** | -70% |
| rare | 4 | **8** | -50% |
| elite | 5 | **7** | -28% |
| mythique | 8 | **6** | +33% |
| ultimate | 15 | **3** | +400% |

**Fix Phase 1** : supprimer `FRAGS_NIV1` + supprimer `LixVersePage.js:221` mapping écrasant + utiliser directement `character.frags_niv1` (ou un `fragments_required` calculé selon le niveau actuel).

### 3.3 Naming Spin → Défi (cosmétique)

| Référence actuelle | Action |
|---|---|
| `onGoToSpin` (prop) | Renommer `onGoToDefi` |
| `'Obtenir via Spin ou Défis'` (texte UI ligne 388) | Remplacer par `'Obtenir via Défis'` |
| 6 occurrences `onPress={() => onGoToSpin()}` | Renommer |

**Fix Phase 1** (cohérent puisqu'on touche déjà CharactersTab).

---

## 🚦 PARTIE 4 — SYNTHÈSE DES SPRINTS PRÉVUS

| Phase | Scope | Fichiers touchés | Complexité | Estimation |
|---|---|---|---|---|
| **Phase 0** ✅ | Diagnostic lecture seule | 0 | — | Fait |
| **Phase 1** | Alignement DB V5 (display names + fragments + cleanup Spin) | `LixVersePage.js`, `CharactersTab.js`, `lixverseConstants.js`, `Phase6Characters.js` | 🟡 Moyenne | ~1h30 |
| **Phase 2** | Refonte visuelle Premium (Snack `snack_03_rgpd`) | Snack isolé | 🟠 Élevée | ~2h |
| **Phase 3** | Animations P1 (breath, aura, floating, tilt, particules) | Snack | 🟢 Faible | ~1h |
| **Phase 4** | Haptic feedback complet | Snack + `src/utils/haptics.js` factorisé | 🟢 Faible | ~30min |
| **Phase 5** | Test connexion réelle 5 RPC + DB Supabase | Snack | 🟡 Moyenne | ~1h30 |
| **Phase 6** | Transpose Snack → Prod | Migration vers `src/pages/lixverse/CharactersTab.js` + composants | 🟡 Moyenne | ~1h |
| **Phase 7** | Cleanup naming + DROP tables legacy `characters` + `user_characters` | `LixVersePage.js`, `CharactersTab.js` + SQL | 🟢 Faible | ~30min |

**Total estimé : 8h sur 7 sprints.**

---

## 🚨 PARTIE 5 — RISQUES ET GARDE-FOUS

### Risques techniques

| Risque | Mitigation |
|---|---|
| Suppression `FRAGS_NIV1` casse autres onglets LixVerse | `grep` préalable dans `DefiTab.js`, `HumanTab.js`, `LixShopTab.js` (Phase 1 step 0) |
| Refonte mapping post-RPC `LixVersePage.js:221` casse Dashboard/Repas/Activity | Audit des 3 pages avant refactor |
| Refonte modal flip casse `flipAnim` partagé avec parent | Garder `flipAnim` dans LixVersePage, n'utiliser que les nouvelles dims côté CharactersTab |
| Migration `CHAR_NAMES` casse onboarding Phase6Characters | Inclure le fichier dans le scope Phase 1 |
| `useNativeDriver: true` (dette PR #727 — 19 fichiers) | Hors scope. Ne pas introduire de nouveau `useNativeDriver: true` Phase 2 |
| Default `uses_remaining = 10` au lieu de 3 | À investiguer sprint séparé (zéro impact si RPC override) |

### Garde-fous transverses (Dashboard / Repas / Activity)

Avant tout refactor de `LixVersePage.js:221`, vérifier que ces 3 pages :
- N'utilisent pas le champ `fragments_required` retourné par le mapping écrasant
- N'utilisent pas `FRAGS_NIV1` directement
- N'écrasent pas elles-mêmes les valeurs DB de la même manière

Sinon, propager la correction aux 3 pages dans Phase 1.

---

## 📚 PARTIE 6 — RÉFÉRENCES

### Diagnostics DB exécutés

| Date | CSV | Confirme |
|---|---|---|
| 25/04 | `users_profile` colonnes | 7 NOT NULL sans default + 8 check constraints |
| 25/04 | `lixverse_characters` schéma | 18 colonnes confirmées |
| 25/04 | `lixverse_user_characters` schéma | 12 colonnes + UNIQUE (user_id, character_slug) |
| 25/04 | Catalogue 16 caractères | Display names V5 + frags_niv1/2/max corrects |
| 25/04 | Setup compte test-dev | UUID `c4e24be5-17e8-4c0e-85cc-47db9286b496` créé avec 16 caractères états variés |

### Compte test-dev configuré

| Champ | Valeur |
|---|---|
| user_id | `c4e24be5-17e8-4c0e-85cc-47db9286b496` |
| email | `test-dev@lixum.com` |
| display_name | Test Dev |
| lixtag | LXM-TESTDEV |
| lix_balance | 5000 |
| energy | 200 |
| active_character | emerald_owl |
| Collection | 16 caractères dans 5 états (actif, MAX, Niv2 uses 0, locked progression, locked vierge) |

### Fichiers diagnostic produits

- `SPRINT_PHASE_0_DIAGNOSTIC_CARACTERES_V5.md` (sprint envoyé à Claude Code)
- `RAPPORT_DIAGNOSTIC_PHASE_0` (rapport Claude Code reçu)
- `CARTOGRAPHIE_CARACTERES_V5.md` (ce document — référence centrale)

---

## ✅ PROCHAINE ÉTAPE

**Sprint Phase 1 — Alignement DB V5** :

1. Step 0 (audit transverse) : `grep` dépendances FRAGS_NIV1/CHAR_NAMES/ALL_CHARACTERS dans les 3 autres tabs LixVerse + Dashboard/Repas/Activity
2. Suppression `CHAR_NAMES` + champ `name` de `ALL_CHARACTERS`
3. Suppression `FRAGS_NIV1`
4. Refactor `LixVersePage.js:221` : ne plus écraser le retour RPC
5. Refactor `CharactersTab.js` : utiliser `character.name` et `character.frags_niv1` du RPC
6. Renommage `onGoToSpin → onGoToDefi` + texte UI "Obtenir via Défis"
7. Mise à jour `Phase6Characters.js:85` (display name V5)
8. Factorisation helpers haptic dans `src/utils/haptics.js`
9. V1-V20 vérifications + commit + PR

**Estimation : ~1h30 Claude Code.**

---

*Document maintenu par Malick. Dernière mise à jour : 25 avril 2026.*
