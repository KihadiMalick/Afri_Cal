# RAPPORT DIAGNOSTIC PHASE 0 — LIXVERSE CARACTÈRES V5

**Date** : 25 avril 2026
**Type** : LECTURE SEULE — préparation refonte V5
**Branche** : `sprint/lixverse-characters-phase-0-diagnostic`
**Scope** : `LIXUM-APP/src/pages/lixverse/CharactersTab.js` + dépendances

---

## Section A — État du repo

### Branche actuelle
`sprint/lixverse-characters-phase-0-diagnostic` (créée depuis `main` à jour)

### Working tree
**Clean** au démarrage. Le diagnostic ne créera qu'un seul fichier (ce rapport, à la racine du repo, demandé par Malick pour visualisation).

### 10 derniers commits
```
8e451d3 Merge pull request #730 from KihadiMalick/docs/characters-documentation-v5-db-aligned
0d6e098 docs(characters): V5 phase 5 — système recharge + switch + RPC + historique
9bfd295 docs(characters): V5 phase 4 — 3 Elite + 2 Mythique + 1 Ultimate
219cfa1 docs(characters): V5 phase 3 — 5 personnages Rare
df17d9f docs(characters): V5 phase 2 — 5 personnages Standard
8651693 docs(characters): V5 phase 1 — header + vue d'ensemble + fragments
0662d8d Merge pull request #728 from KihadiMalick/docs/diagnostic-snack-vs-build
9a2a778 docs: diagnostic features Snack vs Build (roadmap 7 jours + backlog 1er mai)
fa5c023 Merge pull request #727 from KihadiMalick/sprint/polish-editprofile-final
6d16a8b feat(profile): polish final EditProfilePage — haptic, animation, discard
```

### Tags récents
```
v1.8-rgpd-complete
v1.7-rgpd-reasons-catalog
v1.7-rgpd-soft-delete
v1.2-backend-v4-complete
v1.2-session1-v4-validated
```

⚠️ Pas de tag `v1.9-profile-edit-complete` ni `v1.9.2-polish-final` posés (suggérés par PR #727 mais non taggés).

---

## Section B — Inventaire `CharactersTab.js`

### Path exact
`LIXUM-APP/src/pages/lixverse/CharactersTab.js`

### Nombre total de lignes
**1235 lignes**

### Imports principaux (top 30)
```javascript
import React from 'react';
import { View, Text, ScrollView, Pressable, Animated,
  Image, Modal, ActivityIndicator, Easing, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ALL_CHARACTERS, TIER_CONFIG, CHAR_NAMES, FRAGS_NIV1,
  CHARACTER_IMAGES, SUPABASE_URL,
  HEADERS, POST_HEADERS, getCharImage, RECHARGE_COST_BY_TIER
} from './lixverseConstants';
import { LixGem } from './lixverseComponents';
import { useAuth } from '../../config/AuthContext';
import { wp, fp } from '../../constants/layout';
```

⚠️ **Imports critiques pour V5** : `ALL_CHARACTERS`, `CHAR_NAMES`, `FRAGS_NIV1`, `CHARACTER_IMAGES` viennent de `lixverseConstants` — **probable code legacy V1-V4 hardcodé** (à confirmer Section C/D).

### useState et useEffect
**AUCUN dans CharactersTab.js** — c'est un composant **enfant pur** (controlled component).

Tous les states sont gérés au niveau parent `LixVersePage.js` :
| State | Ligne LixVersePage | Type |
|---|---|---|
| `selectedCharacter` | 130 | object/null |
| `userCollection` | 133 | array |
| `activeCharSlug` | 134 | string/null |
| `selectedChar` | 136 | object/null |
| `cardViewIndex` | 138 | number |
| `charFlipped` | 139 | boolean |
| `charPowers` | 140 | array |
| `cardViewIndexRef` | 147 (useRef) | ref |

### Signature du composant
```javascript
export default function CharactersTab({
  userCollection,
  ownedCharacters,
  activeCharSlug,
  selectedChar,
  setSelectedChar,
  charFlipped,
  setCharFlipped,
  cardViewIndex,
  setCardViewIndex,
  cardViewIndexRef,
  charPowers,
  // ... + handlers (onSwitchActiveCharacter, onRechargeChar, onUseCharPower,
  //                  onGoToSpin, showLixAlert, closeLixAlert)
}) { ... }
```

### Fonctions internes définies (5)
| Ligne | Nom | Description |
|---|---|---|
| 58 | `activeChar` (var) | `userCollection.find(c => c.slug === activeCharSlug && c.owned !== false)` |
| 59 | `getLevelBadge` | Helper render badge niveau |
| 66 | `closeCharModal` | Ferme modal + reset flip + reset cardViewIndex |

⚠️ **Tout le rendu et les handlers complexes (`onNavigateCard`, `onSwitchActive`, `onRechargeChar`, `onUseCharPower`, `onGoToSpin`)** sont **passés en props** depuis LixVersePage. **CharactersTab.js est purement une vue.**

### Structure return JSX (résumé 5-10 lignes)

Lignes 73-1234 = un seul gros JSX :
- **Lignes 73-138** : Header tab Caractères (titre + counter "X/16 collectés" + boutons "Caisses" / "Voir Pouvoirs")
- **Lignes 138-209** : Grille 3 colonnes des 16 personnages (`userCollection.map(...)`) avec carte image + niveau badge
- **Lignes 210-1234** : **Modal détail** (`<Modal visible={selectedChar !== null}>`) avec :
  - Boutons navigation gauche/droite (l.219-249)
  - Vue avant : carte personnage agrandie + overlays dynamiques (l.260-422)
  - Vue arrière (flip) : pouvoirs Niv1/Niv2/MAX (l.430+)
  - Boutons action contextuels (Activer / Utiliser / Recharger / Fragments manquants)

### Verdict B
`CharactersTab.js` est une **vue contrôlée** 100% drivée par les props. Toute la logique métier (RPC, state) vit dans `LixVersePage.js`. Pour Phase 1 (alignement DB V5), il faudra **toucher les deux fichiers** :
- `LixVersePage.js` pour les RPC et le format des states
- `CharactersTab.js` pour l'affichage (display names, fragments lus depuis collection au lieu de constants)
- `lixverseConstants.js` pour purger le code mort hardcodé

---

## Section C — Naming legacy (CRITIQUE)

### Anciens noms UPPERCASE détectés (2 sources)

**1. `src/pages/lixverse/lixverseConstants.js`** dans `ALL_CHARACTERS` (l.13-30+) :
```javascript
{ id: 'emerald_owl', name: 'EMERALD OWL', tier: 'standard', ... },
{ id: 'hawk_eye',    name: 'HAWK EYE',    tier: 'standard', ... },
{ id: 'ruby_tiger',  name: 'RUBY TIGER',  tier: 'standard', ... },
{ id: 'amber_fox',   name: 'AMBER FOX',   tier: 'standard', ... },
{ id: 'jade_phoenix',name: 'JADE PHOENIX',tier: 'rare',     ... },
{ id: 'silver_wolf', name: 'SILVER WOLF', tier: 'rare',     ... },
// + 10 autres
```

**2. `src/pages/register/phases/Phase6Characters.js:85`** :
```javascript
name: 'EMERALD OWL', level: 'STANDARD', levelColor: '#00D984',
```

### Mapping local trouvé : `CHAR_NAMES` (l.166-175 lixverseConstants.js)
```javascript
const CHAR_NAMES = {
  'emerald_owl': 'Emerald Owl', 'hawk_eye': 'Hawk Eye', 'ruby_tiger': 'Ruby Tiger',
  'amber_fox': 'Amber Fox', 'gipsy': 'Gipsy',
  'jade_phoenix': 'Jade Phoenix', 'silver_wolf': 'Silver Wolf', 'boukki': 'Boukki',
  'iron_rhino': 'Iron Rhino', 'coral_dolphin': 'Coral Dolphin',
  'licornium': 'LICORNIUM', 'jaane_snake': 'Jaane Snake', 'mosquito': 'MOSQUITO',
  'diamond_simba': 'Diamond Simba', 'alburax': 'Alburax', 'tardigrum': 'TARDIGRUM',
};
```

⚠️ **Ce mapping n'est PAS aligné V5** :
- `hawk_eye` → `'Hawk Eye'` au lieu de **`Golden Eagle`**
- `amber_fox` → `'Amber Fox'` au lieu de **`Mariposa`**
- `silver_wolf` → `'Silver Wolf'` au lieu de **`Momo`**

### Stratégie d'affichage actuelle (priorité descendante)
Dans `CharactersTab.js:171, 271, 316, 511, 542, 602` :
```javascript
const name = CHAR_NAMES[acSlug] || ch.name || ac.name || acSlug;
```

L'ordre :
1. **`CHAR_NAMES[slug]`** (mapping legacy local) ← gagne toujours en premier
2. `ch.name` (collection DB) ← rarement consulté car CHAR_NAMES couvre les 16
3. `ac.name` (ALL_CHARACTERS = UPPERCASE) ← fallback
4. `acSlug` (string brut) ← dernier recours

L.171 affiche `{ch.name || ch.slug}` — **utilise donc directement le `name` UPPERCASE de ALL_CHARACTERS** quand la collection est vide. C'est ça que voit l'utilisateur (`EMERALD OWL`).

### Verdict C
🔴 **Naming = mapping hardcodé local + ALL_CHARACTERS UPPERCASE legacy. Aucun appel DB pour display names.**

**Actions Phase 1** :
- Supprimer `CHAR_NAMES` et le champ `name: 'UPPERCASE'` de chaque entry `ALL_CHARACTERS`
- Lire `character.display_name` (ou `character.name` selon schema DB) depuis `userCollection` retournée par `get_user_collection`
- Appliquer renames V5 : `hawk_eye → Golden Eagle`, `amber_fox → Mariposa`, `silver_wolf → Momo`
- Toucher aussi `Phase6Characters.js:85` pour cohérence onboarding

---

## Section D — Fragments thresholds (CRITIQUE)

### Source actuelle : `FRAGS_NIV1` hardcodé (legacy V1)
`src/pages/lixverse/lixverseConstants.js:176` :
```javascript
const FRAGS_NIV1 = { standard: 3, rare: 4, elite: 5, mythique: 8, ultimate: 15 };
```

### Champs DB V5 (`frags_niv1` / `frags_niv2` / `frags_max`)
**0 référence** dans le code source :
```bash
grep -rnE "frags_niv1|frags_niv2|frags_max" src/   →   vide
```

🔴 **Le code n'utilise AUCUN champ DB V5 pour les seuils de fragments.**

### Hardcodes trouvés (8 occurrences)
| Fichier | Ligne | Usage |
|---|---|---|
| `lixverseConstants.js` | 176 | Définition `FRAGS_NIV1` |
| `LixVersePage.js` | 221 | `fragments_required: FRAGS_NIV1[c.tier] || 3` (post-fetch RPC) |
| `LixVersePage.js` | 781 | Fallback selectedChar avec `FRAGS_NIV1` |
| `CharactersTab.js` | 138 | Map default collection avec `FRAGS_NIV1` |
| `CharactersTab.js` | 184 | Bar progress fragments |
| `CharactersTab.js` | 188 | Texte `X/Y frags` |
| `CharactersTab.js` | 265, 310 | Map default collection (modal + modal pouvoirs) |
| `CharactersTab.js` | 322, 361, 377 | Calculs et affichages dans modal |

### Comparaison V1 hardcoded vs V5 doc

| Tier | Hardcoded V1 | V5 DB attendu | Écart |
|---|---|---|---|
| standard | 3 | **10** | -70% (UI sous-estime) |
| rare | 4 | **8** | -50% |
| elite | 5 | **7** | -28% |
| mythique | 8 | **6** | +33% (UI sur-estime) |
| ultimate | 15 | **3** | +400% (UI complètement faux) |

### Hypothèse bug "0/4 frags" pour Jade Phoenix (Rare)
- DB V5 : `frags_niv1 = 8` pour Rare
- Code lit `FRAGS_NIV1.rare = 4`
- `LixVersePage.js:221` **écrase** `fragments_required` du RPC avec `FRAGS_NIV1[c.tier]` :
  ```javascript
  setUserCollection((chars || []).map(c => ({
    ..., fragments_required: FRAGS_NIV1[c.tier] || 3
  })));
  ```
- → l'utilisateur voit `0/4` au lieu de `0/8`

### Verdict D
🔴 **Tous les seuils hardcodés en V1, écrasent les valeurs DB.**

**Actions Phase 1** :
- Supprimer `FRAGS_NIV1` de `lixverseConstants.js`
- Modifier `LixVersePage.js:221` pour **garder** `fragments_required` retourné par le RPC (ne pas l'écraser)
- Vérifier que le RPC `get_user_collection` retourne bien `frags_niv1` ou `fragments_required` calculé selon le niveau actuel
- Modifier les 8 fallback `FRAGS_NIV1[ch.tier] || 3` dans `CharactersTab.js` → `ch.fragments_required`

---

## Section E — Code mort système Spin (À SUPPRIMER PHASE 7)

### Fichiers Spin à supprimer
**AUCUN fichier dédié `*Spin*` détecté** dans `src/`. Le système Spin a déjà été partiellement supprimé.

### RPC Spin restants
**Aucun RPC `execute_spin` / `spin_wheel` / `lix_spin` appelé** dans le code actuel. ✅

### Références dans des fichiers à conserver

**`src/pages/lixverse/LixVersePage.js:1002`** — handler renommé qui pointe vers tab Défi :
```javascript
onConsumePower={consumePower} onGoToSpin={() => setActiveTab('defi')}
```

**`src/pages/lixverse/CharactersTab.js`** — 6 occurrences à nettoyer :
| Ligne | Usage | Action Phase 1 |
|---|---|---|
| 47 | `onGoToSpin` dans signature props | Renommer en `onGoToDefi` |
| 362 | `onPress={() => onGoToSpin()}` (Voir les Défis dans alert fragments manquants) | Renommer |
| 385 | `onPress={() => { closeCharModal(); onGoToSpin(); }}` (CTA principal "Obtenir") | Renommer |
| 388 | **Texte UI : `'Obtenir via Spin ou Défis'`** | ✋ **REMPLACER** par `'Obtenir via Défis'` |
| 511, 542, 602 | `onPress={() => { closeCharModal(); onGoToSpin(); }}` (alerts "Carte requise") | Renommer |

### Faux positifs (à NE PAS toucher)
**Activity** — module sport "spinning" (vélo d'appartement, MET 8.5) :
- `src/pages/activity/activityComponents.js:446` : `case 'spinning':`
- `src/pages/activity/activityConstants.js:43, 347` : entry MET pour activité physique

✅ **Aucun lien avec le système Lix&Spin**. Conserver.

### Verdict E
🟡 **Le système Lix&Spin est déjà supprimé. Reste uniquement du naming legacy `onGoToSpin` qui pointe en réalité vers Défi.**

**Actions Phase 7** (renommage cosmétique, non bloquant Phase 1) :
- Renommer prop/variable `onGoToSpin` → `onGoToDefi` dans `CharactersTab.js` + `LixVersePage.js`
- Remplacer texte UI `'Obtenir via Spin ou Défis'` → `'Obtenir via Défis'` (l.388)
- Vérifier qu'aucun autre fichier n'importe `onGoToSpin`

**Aucun fichier à supprimer.** Sprint Phase 7 = ~20 minutes (cleanup naming).

---

## Section F — RPC Supabase utilisés

### Tableau des 5 RPC V5 attendus

| RPC V5 | Appelé ? | Fichier:ligne (LixVerse) | Aussi appelé ailleurs ? |
|---|---|---|---|
| `get_user_collection` | ✅ | `LixVersePage.js:224` | Dashboard:309, Repas:225, Activity:235 |
| `get_character_powers` | ✅ | `LixVersePage.js:309` | Dashboard:313, Repas:231, Activity:240 |
| `set_active_character` | ✅ | `LixVersePage.js:251` | LixVerse seul |
| `use_character_power` | ✅ | `LixVersePage.js:319` | Dashboard:320, Repas:284, Activity:249 |
| `recharge_character` | ✅ | `LixVersePage.js:344, 359` | LixVerse seul |

🟢 **Les 5 RPC V5 sont tous correctement appelés.**

### RPC Spin Anciens (à confirmer absence)
```bash
grep -rnE "get_characters\b|switch_character|activate_character|pull_character" src/
# → vide
```

✅ **0 ancien RPC obsolète détecté**

### Helper `supaRpc` (LixVersePage.js:189)
```javascript
const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
  method: 'POST',
  headers: POST_HEADERS,
  body: JSON.stringify(params)
});
return await res.json();
```

✅ **Pattern propre. Centralisé.**

### Onboarding spécifique
| RPC | Usage |
|---|---|
| `check_character_onboarding` | LixVersePage:214 — check si user a déjà choisi 1er compagnon |
| `choose_first_character` | LixVersePage:237 — sélection 1er compagnon Standard |

✅ **Cohérent avec la doc V5 section RPC.**

### Format de parsing actuel
**`get_user_collection`** retourné comme array :
- `LixVersePage.js:221` : `setUserCollection((chars || []).map(c => ({ ... })))`
- Mappage manuel pour ajouter `owned`, `level`, `fragments_required` (qu'il **écrase** avec FRAGS_NIV1, voir Section D)

⚠️ **Le RPC retourne probablement déjà tout le nécessaire** (fragments, niveau, owned, frags_niv1...). Le mapping manuel **détruit l'info DB V5**. Phase 1 doit simplifier ce mapping.

### Verdict F
🟢 **Les 5 RPC V5 sont déjà branchés.** Aucun ancien RPC à migrer. Le seul problème = parsing post-RPC qui écrase les valeurs DB (cf. Section D).

**Actions Phase 1** :
- Inspecter le retour réel de `get_user_collection` (champs disponibles : `frags_niv1`, `display_name`, `owned`, `is_active`, `uses_remaining`, etc.)
- Simplifier `LixVersePage.js:221` : `setUserCollection(chars || [])` sans mapping
- Simplifier `LixVersePage.js:781` : pas de fallback hardcodé sur `FRAGS_NIV1`

---
