# LIXUM — Design System

## Identité visuelle

- Thème : Dark metallic + émeraude
- Philosophie : premium, futuriste, Apple/Google-level quality
- Positionnement : "Le premier compagnon de santé IA créé en Afrique"

## Couleurs

### Palette principale
- Émeraude principal : #00D984
- Background gradient : ['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']
- Texte principal : #FFFFFF
- Texte secondaire : #8A8F98

### Macros nutritionnels
- Protéines (P) : #FF6B8A
- Glucides (G) : #FFD93D
- Lipides (L) : #4DA6FF

### Status médicaux
- Normal : #00D984 (vert)
- Elevated : #FFD93D (jaune)
- Low : #4DA6FF (bleu)
- Critical : #FF4444 (rouge)
- Unknown : #8A8F98 (gris)

## Composants

### MetalCard Simple
```
fond: #2A303B
bordure: 1px solid #3A3F46
border-radius: 12
```
Usage : cartes informatives, conteneurs de données

### MetalCard Dense (bordure épaisse)
```
fond: gradient
bordure: 1.5px solid #4A4F55
border-radius: 12
```
Usage : éléments interactifs importants, sections LixVerse

### Boutons

**Bouton vert plein (données/indicateurs)**
```
fond: #00D984
texte: #000000
border-radius: 25
```
Usage : valider, confirmer, indicateurs de statut

**Bouton contour émeraude (interactif/CTA)**
```
fond: transparent
bordure: 1px solid #00D984
texte: #00D984
border-radius: 25
```
Usage : actions secondaires, CTA, navigation

**Bouton texte gris (tertiaire)**
```
fond: transparent
texte: #8A8F98
```
Usage : annuler, fermer, actions mineures

### Badges de sévérité (médical)
- Légère/mild : fond vert transparent, texte vert
- Modérée/moderate : fond orange transparent, texte orange
- Sévère/severe : fond rouge transparent, texte rouge

### Cartes d'alerte (calendrier)
- En retard : fond rgba(226,75,74,0.15), bordure gauche 4px #E24B4A
- < 1 semaine : fond rouge clair, bordure #E24B4A
- < 1 mois : fond rgba(186,117,23,0.1), bordure #BA7517
- < 3 mois : fond rgba(29,158,117,0.1), bordure #1D9E75

## Responsive

### Base de calcul
- BASE_WIDTH = 320dp
- wp() : width proportionnel
- fp() : font proportionnel
- Jamais de valeurs pixel brutes

### Règle
Tous les tailles, margins, paddings utilisent wp() et fp() pour s'adapter à tous les écrans (du petit Android au Galaxy Z Fold 5 déplié).

## Typographie

- Police : système (sans-serif)
- Titres : fp(18-22), fontWeight 700
- Sous-titres : fp(14-16), fontWeight 600
- Corps : fp(13-14), fontWeight 400
- Petits textes : fp(11-12), fontWeight 400

## Icônes

- Source : emojis natifs (pas de librairie d'icônes externe)
- Navbar LixVerse : sphère géodésique SVG émeraude
- AlixenFace : 420 particules SVG, 11 états visuels

## Images

- Format : WebP obligatoire
- Personnages : 600×800px
- Textures : 400×400px tileable
- Budget total assets : ~2-3 MB

## Animations

- Swipe cards (WelcomePage/Caractères) : reanimated + gesture-handler, Pan, rotateZ ±12deg, spring damping15/stiffness150
- AlixenFace : 11 états (idle, speaking, thinking, listening, scanning, memory + 4 émotions)
- Calendrier événements : slide-up animation
- Mood modal : hearts spawn at finger coordinates, Bézier curves

## Règles de design

1. Bordures visibles épaisses = éléments cliquables/interactifs
2. Bordures fines simples (#3A3F46) = sections informatives
3. MetalCard gradient = éléments premium LixVerse
4. Pas d'emojis dans l'UI LIXUM (sauf chat ALIXEN et catégories)
5. Dark theme uniquement — pas de light mode
6. Tout placeholder texte doit tenir sur 1 ligne
