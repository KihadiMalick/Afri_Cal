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

## Section G — Modal détail + flip pouvoirs (BUG VISUEL CONFIRMÉ)

### Architecture
**1 SEUL Modal** (`CharactersTab.js:208-1231`) avec **2 vues superposées** gérées par 2 `Animated.View` :

```javascript
{/* Front view */}
<Animated.View pointerEvents={charFlipped ? 'none' : 'auto'}
  style={{
    opacity: frontInterpolate,
    position: charFlipped ? 'absolute' : 'relative',
    width: '100%'
  }}>  // l.212
  ... carte personnage zoom + overlays + bouton CTA ...
</Animated.View>

{/* Back view */}
<Animated.View pointerEvents={!charFlipped ? 'none' : 'auto'}
  style={{
    opacity: backInterpolate,
    position: !charFlipped ? 'absolute' : 'relative',
    width: '100%'
  }}>  // l.420
  <ScrollView style={{ flex: 1, maxHeight: SCREEN_WIDTH * 1.1 }}>  // l.423
    ... 3 niveaux pouvoirs Niv1/Niv2/MAX ...
  </ScrollView>
</Animated.View>
```

### Animation
- **Animated.Value** : `flipAnim` créé dans `LixVersePage.js:146`
- **Fonction** : `flipCard()` (LixVersePage:195-200)
  ```javascript
  Animated.timing(flipAnim, { toValue: charFlipped ? 0 : 1, duration: 400 })
    .start(() => setCharFlipped(!charFlipped));
  ```
- Pas un vrai flip 3D rotateY, mais un crossfade `opacity` (front 1→0 / back 0→1)

### Dimensions
| Élément | Hauteur |
|---|---|
| Root Modal `<View>` | `maxHeight: '95%'` (l.211) |
| ScrollView racine (front) | `flex: 1` (l.75) |
| ScrollView pouvoirs (back) | `maxHeight: SCREEN_WIDTH * 1.1` (l.423) |
| Cards pouvoirs Niv1/Niv2/MAX | `maxHeight: wp(300)` chacune (l.682, 714, 772, 816, 858, 886) |

### Hypothèse bug "fenêtre qui rétrécit"
🔴 **Vue avant et vue arrière ont des hauteurs naturelles très différentes**.

- **Vue avant** (carte zoomée + overlays + bouton CTA) : hauteur ~85% écran
- **Vue arrière** (3 cards pouvoirs ScrollView avec `maxHeight: SCREEN_WIDTH * 1.1`) : hauteur ~50-60% écran

Quand `charFlipped` passe de `false` à `true` :
1. Front view passe en `position: 'absolute'` → sort du flow → **n'occupe plus de hauteur**
2. Back view passe en `position: 'relative'` → entre dans le flow → impose **sa hauteur naturelle plus courte**
3. Le modal `maxHeight: '95%'` se contracte au contenu **= visuel "rétrécit et descend au milieu"**

**Cause racine** : pas de hauteur fixe garantie entre les deux vues lors du flip.

### Verdict G
🔴 **Bug confirmé : architecture absolute/relative cause une re-layout brutale au flip.**

**Actions Phase 2** (refonte visuelle) :
- **Option A** : fixer `minHeight` ou `height` au container parent du modal pour que la vue garde toujours la même taille (le plus simple)
- **Option B** : conserver les 2 vues toujours en `position: 'absolute'` (les empiler en permanence), sans switch relative/absolute
- **Option C** : 2 modals séparés au lieu de 1 (transition différente, fade au lieu de flip)

Recommandation : **Option B** — empilement permanent en absolute. Élimine le re-layout. Plus proche du flip 3D réel.

---

## Section H — Overlays dynamiques sur image carte (PRÉPARATION PHASE 2)

### Composant card individuelle
**Aucun fichier `CharacterCard.js` ou `CharacterTile.js` séparé**. Tout est **inline dans `CharactersTab.js`** :
- **Grille 3 cols** : l.143-209 (~66 lignes)
- **Carte zoom dans modal** : l.260-422 (~162 lignes)

### Overlays présents (modal détail vue avant, l.260-422)

| Overlay | Ligne | Position | Données | Style |
|---|---|---|---|---|
| Image personnage | 276 | full | `charImg.img` via `getCharImage(slug)` | `width:100%, height:100%, resizeMode:cover` |
| Background fallback (sans image) | 278 | full | `#1E2530` background | rendered si `charImg.img === null` |
| Badge niveau | 284 | `top: wp(32), right: wp(28)` | `Niv X` ou `MAX` | `bg:rgba(0,0,0,0.65), border 1.5 rouge/or selon niveau` |
| Badge XP | 291 | `top: wp(58), right: wp(28)` | `XP/XP_next` | `bg:rgba(0,0,0,0.65)` |
| Overlay locked sombre | 296 | full (top:0, left:0, right:0, bottom:0) | rendered si `!owned` | `bg:rgba(0,0,0,0.6), centered icon 🔒` |
| Cadenas grille (small card) | 169 | `position:'absolute', center` | `🔒` | si `!owned` |
| Flèche navigation gauche | 221 | `left: wp(6), top: wp(370)/2 - wp(22)` | chevron | `zIndex: 20` |
| Flèche navigation droite | 238 | `right: wp(6), top: wp(370)/2 - wp(22)` | chevron | `zIndex: 20` |

### Affichages textuels sous l'image (pas overlay, mais flow JSX)
- Nom personnage (CHAR_NAMES) — l.316-320
- Tier label (STANDARD / RARE / etc.) — l.323-327
- Description courte — l.328-332
- Bar progression XP `xp/xp_next` (vue front) — l.330
- Bar progression Fragments `frags/fragsReq` (vue front si !owned) — l.338
- Texte CTA "Obtenir via Spin ou Défis" — l.388

### Évitement médaillon doré in-image ?
🔴 **Aucune logique** pour éviter le médaillon doré présent dans certaines illustrations (top-left de l'image Emerald Owl par exemple).

Tous les overlays badges/XP sont positionnés en **top-right** de l'image, donc **ne masquent pas** le médaillon top-left. ✅

Mais **l'overlay locked sombre** (l.296) couvre toute l'image avec `bg:rgba(0,0,0,0.6)` ce qui inclut le médaillon. Pour les personnages non-possédés, le médaillon décoratif est invisible. Pas grave UX (cohérent avec "carte verrouillée").

### Tailles font / couleurs / backgrounds des overlays
| Overlay | Font | Color | Background |
|---|---|---|---|
| Badge niveau | `fp(11), fontWeight:800` | `#FFF` | `rgba(0,0,0,0.65)` + border 1.5 (or `#D4AF37` si MAX, sinon emerald `rgba(0,217,132,0.5)`) |
| Badge XP | `fp(11), fontWeight:700` | `#FFF` | `rgba(0,0,0,0.65)` |
| Locked overlay | `fp(20)` | text dim | `rgba(0,0,0,0.6)` |

### Verdict H
🟢 **Overlays adaptables Phase 2 sans refonte complète.**

Tous les overlays badges/navigation utilisent des positions relatives au container (`wp(...)`), donc s'adapteront automatiquement si la taille du modal change.

**Actions Phase 2 recommandées** :
- Si on agrandit la zone image (cf. fix bug Section G), recalculer `top: wp(370)/2 - wp(22)` des flèches navigation pour rester centrées
- Garder positions top-right des badges (bonne pratique : évite le médaillon décoratif)
- Ajouter éventuellement un **3e overlay tier badge** (gauche) pour cohérence avec la grille (ex : badge `RARE`/`ELITE` toujours visible)
- Considérer extraction `CharacterCard.js` shared component pour découpler les overlays du fichier monolithique 1235 lignes

---

## Section I — Composants et helpers partagés

### `ToastMessage` shared
**Path** : `src/components/shared/ToastMessage.js` ✅
**Interface** : `{ message, type ('success'|'error'|'info'|'warning'), visible, onDismiss? }`
⚠️ **Pas utilisé dans `lixverse/`** actuellement. Aucune occurrence.

### Helpers haptic
**Localisation actuelle** : `src/pages/profile/EditProfilePage.js:32-48` (5 helpers définis localement)
```javascript
function hapticLight()  { try { Haptics.impactAsync(...Light) } catch(e) {} }
function hapticMedium() { try { Haptics.impactAsync(...Medium) } catch(e) {} }
function hapticSuccess() { try { Haptics.notificationAsync(...Success) } catch(e) {} }
function hapticError() { ... }
function hapticWarning() { ... }
```

🔴 **Pas factorisés en module shared.** Définis uniquement dans EditProfilePage.

### Pattern Supabase client
**LixVersePage.js:189** :
```javascript
const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {...});
```

Direct fetch via `SUPABASE_URL` (importé de `lixverseConstants`). Pas de wrapper `getSupabaseClient()`.

**Helper `supaRpc`** centralisé localement dans LixVersePage:189-195 ✅

### Pattern useAuth
**Cohérent** entre `LixVersePage.js:34` et `CharactersTab.js:50` :
```javascript
var auth = useAuth(); var userId = auth.userId;
```

✅ Hook `useAuth` depuis `'../../config/AuthContext'`

### Helper Storage URL
🔴 **Aucun helper centralisé** pour générer les URL publiques Supabase Storage.

Les images personnages sont actuellement chargées via `require()` statiques dans `CHARACTER_IMAGES` (lixverseConstants:183-209) :
```javascript
const CHARACTER_IMAGES = {
  emerald_owl: { img: require('../../../assets/characters/emerald_owl.webp'), emoji: '🦉' },
  // ... 15 autres
};
```

**Implication V5** : si Phase 2 doit charger les images depuis Supabase Storage (URLs dynamiques), il faut :
- Créer un helper `getCharacterImageUrl(slug)` dans `src/utils/storage.js`
- Modifier `CHARACTER_IMAGES` pour soit garder les `require` (offline-first), soit migrer vers URL distantes

### Verdict I

| Composant | Status | Action Phase 1/2 |
|---|---|---|
| `ToastMessage` shared | ✅ existe | Importer dans LixVersePage pour notifs switch/use_power |
| Helpers haptic | 🔴 locaux EditProfilePage | **Décision Phase 1** : factoriser dans `src/utils/haptics.js` OU dupliquer 5 fonctions au top de `LixVersePage.js` |
| Supabase client (`supaRpc`) | ✅ centralisé local | Déplacer en helper shared si réutilisable |
| `useAuth` | ✅ pattern cohérent | RAS |
| Image storage URL | 🔴 absent | À créer si migration vers Storage distant prévue Phase 2 |

**Recommandation** : factoriser haptic dans `src/utils/haptics.js` (5 lignes import) — cohérent avec règle LIXUM "single source of truth".

---

## Section J — Tables legacy DB et autres onglets LixVerse

### Fichiers `src/pages/lixverse/`
```
CharactersTab.js          (1235 lignes — sujet du diagnostic)
DefiTab.js                (onglet Défi)
HumanTab.js               (onglet Human / binôme)
LixShopTab.js             (onglet boutique)
LixVersePage.js           (parent, gère tous les states + RPC)
lixverseComponents.js     (composants helpers : LixGem, etc.)
lixverseConstants.js      (constants : ALL_CHARACTERS, FRAGS_NIV1, CHAR_NAMES, etc.)
```

### Composants partagés `src/components/lixverse/`
🔴 **Dossier inexistant.** Tous les composants spécifiques LixVerse vivent dans `pages/lixverse/lixverseComponents.js` (centralisé) ou inline.

### Composants partagés entre onglets
- **`lixverseComponents.js`** exporte `LixGem` (utilisé dans CharactersTab)
- **`lixverseConstants.js`** exporte `SUPABASE_URL`, `HEADERS`, `POST_HEADERS`, `ALL_CHARACTERS`, `TIER_CONFIG`, `CHAR_NAMES`, `FRAGS_NIV1`, `CHARACTER_IMAGES`, `RECHARGE_COST_BY_TIER`, `getCharImage`, etc.

⚠️ **Tous les onglets LixVerse partagent `lixverseConstants.js`**. Toucher `FRAGS_NIV1` ou `CHAR_NAMES` pourrait impacter `DefiTab.js`, `HumanTab.js`, `LixShopTab.js` si ces onglets les importent.

### Vérification dépendances
Recherche rapide à faire en Phase 1 avant suppression :
```bash
grep -rn "FRAGS_NIV1\|CHAR_NAMES\|ALL_CHARACTERS" src/pages/lixverse/{DefiTab,HumanTab,LixShopTab,lixverseComponents}.js
```

### Verdict J
🟢 **Scope strict respectable** : Phase 1+ touche principalement `CharactersTab.js`, `LixVersePage.js`, `lixverseConstants.js`.

**Risque latent** : si autres onglets (Défi/Human/LixShop) importent les constants legacy, il faudra adapter aussi. À vérifier en début de Phase 1.

---

## Synthèse globale

### Complexité estimée

| Sprint | Complexité | Fichiers à toucher | Estimation |
|---|---|---|---|
| **Phase 1** (alignement DB V5) | 🟡 **moyenne** | `LixVersePage.js`, `CharactersTab.js`, `lixverseConstants.js` (+ peut-être `Phase6Characters.js`) | ~1h30 |
| **Phase 2** (refonte visuelle modal flip + overlays) | 🟠 **élevée** | `CharactersTab.js` (refonte modal), éventuellement extraction `CharacterCard.js` | ~2h |
| **Phase 7** (cleanup naming Spin → Défi) | 🟢 **faible** | `LixVersePage.js`, `CharactersTab.js` | ~20 min |

### Total fichiers à modifier (toutes phases)
- Phase 1 : 3-4 fichiers
- Phase 2 : 1-2 fichiers
- Phase 7 : 2 fichiers
- **Total** : ~5-6 fichiers (sans doublon)

### Risques identifiés

| Risque | Mitigation |
|---|---|
| Suppression `FRAGS_NIV1` casse autres onglets LixVerse | Grep préalable avant suppression (Phase 1 step 0) |
| RPC `get_user_collection` ne retourne pas `frags_niv1` | Tester en isolation avant Phase 1 (Malick a déjà confirmé DB OK) |
| Refonte modal Section G casse l'animation flipAnim parente | Garder `flipAnim` dans LixVersePage, n'utiliser que les nouvelles dims côté CharactersTab |
| Migration `CHAR_NAMES` casse onboarding `Phase6Characters.js:85` | Inclure ce fichier dans le scope Phase 1 |
| Helpers haptic dupliqués si non factorisés | Décision Phase 1 : factoriser dès la 1ère utilisation hors EditProfilePage |
| 19 fichiers `useNativeDriver: true` (dette PR #727) | Hors scope. Ne pas introduire de nouveau `useNativeDriver: true` en Phase 2 |

### Questions ouvertes pour Malick

1. **Format DB retour `get_user_collection`** : peux-tu confirmer les champs retournés par le RPC ? Notamment :
   - `display_name` ou `name` (lowercase V5) ?
   - `frags_niv1`, `frags_niv2`, `frags_max` directement ?
   - `fragments_required` calculé selon le niveau actuel ?
   - `is_active`, `uses_remaining`, `uses_max` ?
   → **Crucial pour Phase 1**

2. **Renommage `onGoToSpin` → `onGoToDefi`** : faire dans Phase 1 ou attendre Phase 7 dédié ?
   → Recommandation : Phase 1 si on touche déjà `CharactersTab.js` ; Phase 7 sinon (cohérence sprint)

3. **Helpers haptic** : factoriser dans `src/utils/haptics.js` immédiatement ou dupliquer pour ce sprint ?
   → Recommandation : factoriser maintenant (single source of truth)

4. **Refonte modal flip Section G** : Option A (fix minHeight), B (toujours absolute), C (2 modals séparés) ?
   → Recommandation : Option B

5. **Extraction `CharacterCard.js`** : ouvrir Phase 2 ou attendre Phase 8 ?
   → Recommandation : conserver inline pour Phase 2 si scope contenu, extraire seulement si CharactersTab dépasse 1500 lignes

6. **Tags v1.9** : poser `v1.9-profile-edit-complete` et `v1.9.2-polish-final` maintenant ou après merge PR Phase 1 ?
   → Recommandation : poser maintenant (post PR #727 mergée)

### Verdict global
🟢 **Diagnostic clair, scope cadré, aucune zone d'ombre majeure.**

Les principaux problèmes sont :
- ❌ **Naming legacy V1** dur-codé (Section C) — Phase 1 obligatoire
- ❌ **Fragments hardcodés** qui écrasent DB (Section D) — Phase 1 obligatoire
- ❌ **Bug modal flip** (Section G) — Phase 2 obligatoire

Les bonnes nouvelles :
- ✅ Les 5 RPC V5 sont déjà branchés (Section F)
- ✅ Système Spin déjà supprimé (Section E)
- ✅ Architecture composant propre (vue contrôlée)
- ✅ Overlays adaptables sans refonte complète (Section H)
- ✅ Helpers `useAuth` / `supaRpc` propres (Section I)

**Ready for Phase 1.** En attente de réponses Malick sur les 6 questions ouvertes.

---

**Diagnostic Phase 0 produit le 25 avril 2026. Aucune modification du code source `LIXUM-APP/src/`. Seul fichier créé : ce rapport à la racine du repo.**
