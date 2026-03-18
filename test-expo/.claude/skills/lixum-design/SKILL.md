---
name: lixum-design
description: >
  Systeme de design premium LIXUM pour React Native (Expo) et adaptation web.
  Utilise ce skill CHAQUE FOIS que la tache concerne le design, l'interface,
  les composants visuels, le style, le theming, les couleurs, la mise en page,
  les animations, les icones, ou toute amelioration visuelle d'une page ou d'un
  composant. Utilise-le aussi quand l'utilisateur dit "ameliore le design",
  "rends ca plus premium", "ajoute du style", "fais comme Apple", "design
  futuriste", "neumorphisme", ou mentionne des composants LIXUM comme
  MetalCard, ResponseCard, bulles, constellation, bottom sheet.
  S'applique a React Native, Expo, et peut etre adapte au web (HTML/CSS/React).
---

# LIXUM Design System — v1.0

## Philosophie

LIXUM cree des interfaces qui rivalisent avec les geants de la Silicon Valley.
Le design doit etre **premium**, **futuriste**, **epure**, et **intuitif**.
Chaque pixel est intentionnel. Pas de compromis sur la qualite visuelle.

### Les 5 piliers du design LIXUM

1. **Premium Tech** : L'app doit donner la sensation d'un objet de luxe technologique. Surfaces metalliques, gradients sombres, reflets subtils.
2. **Respiration** : Chaque element a de l'espace pour exister. Marges generouses, pas de surcharge visuelle. Un ecran ne doit jamais se sentir "rempli".
3. **Contraste intelligent** : Fond clair / elements sombres (ou l'inverse). Jamais de gris moyen partout. Le regard doit etre guide naturellement.
4. **Micro-interactions** : Chaque interaction (press, scroll, apparition) a un feedback physique. `delayPressIn: 120`, scale down a 0.92, animations douces.
5. **Coherence iconique** : Toutes les icones sont SVG, monochromes, trait fin (strokeWidth: 1.5), style SF Symbols d'Apple. Jamais de clip art, jamais d'emojis dans les icones.

---

## Palette de couleurs

### Couleurs primaires LIXUM
```
Emerald   : #00D984   — Couleur signature, succes, sante, action principale
Orange    : #FF8C42   — Attention, alerte douce, secondaire chaud
Blue      : #4DA6FF   — Information, lien, secondaire froid
Gold      : #D4AF37   — Premium, confidentialite, Secret Pocket, recompenses
Coral     : #FF6B6B   — Erreur, urgence, suppression
Purple    : #9B6DFF   — Special, import/export, conversations compactees
```

### Couleurs structurelles
```
Metal border      : #4A4F55
MetalCard gradient : ['#3A3F46', '#252A30', '#333A42', '#1A1D22']
Background gradient (dark) : ['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']
Background light   : #E8ECF0  (pages type "cabinet medical")
Card white        : #FAFBFC  (jamais du blanc pur #FFF)
Text dark         : #2D3436
Text muted        : rgba(255,255,255,0.4) sur fond sombre
                    rgba(0,0,0,0.4) sur fond clair
```

### Regles d'utilisation des couleurs
- Le fond principal est TOUJOURS un gradient, jamais une couleur plate
- Les textes sur fond sombre sont blancs ou en couleur primaire (emerald, gold, etc.)
- Les textes sur fond clair sont en `#2D3436` ou en couleur primaire
- Pas de gris moyen (#888, #999) pour les elements importants — utiliser les couleurs LIXUM
- L'emerald est la couleur d'action par defaut (boutons, CTA, accents)

---

## Composants signature

### MetalCard
Le composant visuel signature de LIXUM. Surface sombre metallique premium.

```
Structure :
  Pressable (delayPressIn: 120)
    LinearGradient (colors: ['#3A3F46','#252A30','#333A42','#1A1D22'])
      Contenu (icone + texte)

Style :
  borderColor: '#4A4F55'
  borderWidth: 1
  borderRadius: wp(16)
  overflow: 'hidden'
  shadowColor: '#000'
  shadowOpacity: 0.3
  shadowRadius: 8
  elevation: 6
```

**Quand utiliser MetalCard :** Cartes d'action (MediBook, Secret Pocket), boutons premium ("+", loupe), elements interactifs principaux, header de section.

**Quand NE PAS utiliser :** Zones de contenu texte long (utiliser ResponseCard), fond de page, elements decoratifs passifs.

### ResponseCard
Carte blanche pour afficher du contenu textuel (messages chat, resultats, informations).

```
Structure :
  View
    Contenu (badge + texte)

Style :
  backgroundColor: '#FAFBFC' (jamais #FFFFFF pur)
  borderRadius: wp(16)
  borderLeftWidth: wp(3)
  borderLeftColor: '#00D984' (accent bar — emerald pour ALIXEN, blue pour user)
  shadowColor: '#000'
  shadowOffset: { width: 0, height: 4 }
  shadowOpacity: 0.08
  shadowRadius: 12
  elevation: 4
  padding: wp(16)
```

### Bottom Sheet Premium
Remplace TOUJOURS les Alert.alert() natifs pour les choix utilisateur. Le systeme natif Android est interdit dans les interactions de choix.

```
Structure :
  Modal (transparent, animationType: 'slide')
    Pressable overlay (rgba(0,0,0,0.6))
      Pressable container (stopPropagation)
        LinearGradient (['#2A2F36','#1E2328','#252A30'])
          Poignee (barre horizontale rgba(255,255,255,0.2))
          Titre (blanc, fp(20), fontWeight 700)
          Sous-titre (rgba(255,255,255,0.5), fp(13))
          Options (chacune avec icone SVG + titre + description + fleche)
          Bouton Annuler (bordure subtile, texte muted)

Style des options :
  flexDirection: 'row'
  backgroundColor: 'rgba(255,255,255,0.05)'
  borderRadius: wp(14)
  borderWidth: 1
  borderColor: 'rgba(255,255,255,0.08)'
  Icone dans un carre arrondi avec fond teinte de la couleur de l'icone (opacity 0.1)
```

**Exception :** Les Alert.alert() natifs sont acceptables UNIQUEMENT pour les messages systeme critiques (limite atteinte, confirmation de suppression irreversible).

### Bulles de constellation
Systeme de visualisation des messages en miniature, disposees en parcours S.

```
Regles :
  - Maximum 30 bulles par session
  - 2 couleurs seulement : Rouge (#E74C3C) = reponse IA, Bleu (#3498DB) = message user
  - Anneau exterieur : borderWidth wp(2.5), borderColor selon type
  - Centre : fond MetalCard #1E2530
  - Numero : color selon type, fp(11), fontWeight 600
  - Bulle active : borderWidth wp(3), glow, shadow
  - Recherche : bulles matchees gardent leur couleur + contour emerald additionnel
  - Bouton "Nouvelle session" toujours en derniere position (bordure dashed emerald)
```

---

## Icones

### Regles generales
- **Format :** SVG uniquement (react-native-svg)
- **Style :** Trait fin, `strokeWidth: 1.5`, `fill: 'none'` (outline only)
- **Taille standard :** `wp(36)` pour les icones de carte, `wp(22)` pour les icones de liste, `wp(18)` pour les petites icones
- **Couleur :** Monochrome, une seule couleur primaire LIXUM par icone
- **Inspiration :** SF Symbols d'Apple — minimaliste, geometrique, reconnaissable en petit

### Interdits
- Pas d'emojis comme icones (les emojis sont OK dans le texte de chat uniquement)
- Pas d'icones remplies (filled) — toujours outline/stroke
- Pas d'icones multi-couleurs
- Pas de bibliotheque d'icones lourde (react-native-vector-icons) — SVG inline uniquement
- Pas de clip art ou d'images raster pour les icones

---

## Typographie

### Tailles (via fp() pour le responsive)
```
Titre principal     : fp(24), fontWeight: '800'
Titre de section    : fp(20), fontWeight: '700'
Titre de carte      : fp(14), fontWeight: '700'
Corps de texte      : fp(14), fontWeight: '400'
Sous-titre/caption  : fp(12), fontWeight: '400'
Badge/tag           : fp(10), fontWeight: '500', letterSpacing: 1-2
Micro texte         : fp(9), fontWeight: '600' (ex: "AI" dans le badge ALIXEN)
```

### Regles
- `letterSpacing` sur les badges, tags, et sous-titres en majuscules
- Jamais de texte en gris moyen sur fond clair — utiliser `#2D3436` ou une couleur LIXUM
- Les titres de carte sont TOUJOURS en couleur primaire (emerald, gold, etc.), jamais en blanc ou noir

---

## Responsive

### Systeme wp()/fp()
Toutes les dimensions utilisent `wp()` (width percentage) et `fp()` (font percentage) pour s'adapter a tous les ecrans.

```javascript
const BASE_WIDTH = 320; // Samsung Galaxy Z Fold 5 plie
const wp = (size) => (size * Dimensions.get('window').width) / BASE_WIDTH;
const fp = (size) => (size * Dimensions.get('window').width) / BASE_WIDTH;
```

### Regles
- JAMAIS de valeurs en pixels bruts — toujours `wp()` ou `fp()`
- Tester sur ~320dp comme ecran minimum
- Les marges laterales minimales : `wp(16)` pour le contenu, `wp(24)` pour les cartes

---

## Animations et interactions

### Pressable standard
```javascript
<Pressable
  delayPressIn={120}
  onPressIn={() => scaleAnim.setValue(0.92)}
  onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
>
```

### Typing indicator (3 points animes)
3 cercles emerald de wp(6) qui rebondissent en sequence (delay 0/150/300ms), translateY de 0 a -4, duree 400ms, boucle infinie.

### Regles
- Toute animation doit avoir `useNativeDriver: true` quand possible
- Les durees d'animation : 200-400ms pour les micro-interactions, 300-500ms pour les transitions
- Jamais d'animation plus longue que 800ms sauf les boucles infinies (typing, loading)
- Le feedback au press est OBLIGATOIRE sur tout element interactif

---

## Espacement et layout

### Marges et padding
```
Marge laterale page    : wp(16)
Marge laterale cartes  : wp(24)
Padding interne carte  : wp(16)
Gap entre cartes       : wp(12)
Gap entre sections     : wp(20)
Marge dessous header   : wp(8)
```

### Regles de layout
- Maximum 3 elements principaux visibles "above the fold" (au-dessus du pli)
- Les listes sont en grille ou en S, jamais en colonne verticale simple pour les elements interactifs
- Le scroll est vertical uniquement (pas de scroll horizontal cache)
- La zone de saisie est TOUJOURS fixee en bas

---

## Regles techniques React Native / Expo

### Imports
- Un seul import `react-native-svg` par fichier (regrouper tous les composants SVG)
- `LinearGradient` depuis `expo-linear-gradient`
- Pas de `\u00XX` — UTF-8 uniquement dans le code

### Code
- Pas de `SafeAreaView` dans Expo Snack — utiliser `paddingTop` fixe
  (TODO: revert pour EAS build)
- Les images PNG sont chargees depuis le dossier assets ou via require()
- Les animations complexes utilisent `Animated` de react-native (pas de bibliotheque externe)

---

## Anti-patterns (CE QU'IL NE FAUT JAMAIS FAIRE)

1. **Alert.alert() pour les choix** — Utiliser un Bottom Sheet Premium a la place
2. **Ombre grise/blanche (neumorphisme clair)** — Provoque des bugs visuels. Utiliser des ombres sombres uniquement
3. **Fond blanc pur #FFFFFF** — Utiliser #FAFBFC minimum
4. **Icones multi-couleurs ou clip art** — SVG monochrome outline only
5. **Texte gris moyen sur fond clair** — Invisible, utiliser une couleur forte
6. **Valeurs en pixels bruts** — Toujours wp()/fp()
7. **Radio buttons natifs** — Le contexte doit etre implicite (badge dans le message)
8. **Elements sans feedback au press** — Tout ce qui est cliquable doit reagir
9. **Espaces vides non justifies** — Chaque espace a un role, sinon reduire les marges
10. **Boutons visuellement incoherents** — Si deux boutons sont cote a cote, meme style

---

## Adaptation Web (HTML/CSS/React)

Ce design system peut etre adapte au web avec ces correspondances :

| React Native | Web |
|-------------|-----|
| `wp(16)` | `1rem` ou `clamp(12px, 2vw, 16px)` |
| `fp(14)` | `0.875rem` |
| `LinearGradient` | `background: linear-gradient(...)` |
| `Pressable` | `<button>` avec `:active { transform: scale(0.92) }` |
| `Animated` | CSS `transition` ou `@keyframes` |
| `borderRadius: wp(16)` | `border-radius: 1rem` |
| `shadowColor/Offset/Opacity` | `box-shadow: 0 4px 12px rgba(0,0,0,0.08)` |
| `react-native-svg` | SVG inline `<svg>` |
| `Modal` | Dialog avec backdrop `rgba(0,0,0,0.6)` + slide-up animation |

### Variables CSS equivalentes
```css
:root {
  --lx-emerald: #00D984;
  --lx-orange: #FF8C42;
  --lx-blue: #4DA6FF;
  --lx-gold: #D4AF37;
  --lx-coral: #FF6B6B;
  --lx-purple: #9B6DFF;
  --lx-metal-border: #4A4F55;
  --lx-bg-light: #E8ECF0;
  --lx-card-white: #FAFBFC;
  --lx-text-dark: #2D3436;
  --lx-metal-1: #3A3F46;
  --lx-metal-2: #252A30;
  --lx-metal-3: #333A42;
  --lx-metal-4: #1A1D22;
  --lx-radius-sm: 0.5rem;
  --lx-radius-md: 1rem;
  --lx-radius-lg: 1.5rem;
}
```
