# FINAL_TEST_EXPO — Labo de test UX isolé

Ce dossier contient des **versions isolées** de composants LIXUM destinées à être testées
directement sur [snack.expo.dev](https://snack.expo.dev), sans attendre un build APK.

## Objectif

- Valider visuellement et ergonomiquement les écrans/modals critiques avant intégration dans `LIXUM-APP/src/`.
- Itérer rapidement sur le design (fond sombre, accents emerald, MetalCard) sur device réel.
- Tester les flows bloquants (RGPD, paiement, onboarding...) en scénarios mock sans toucher à la DB ni au reste de l'app.

## Workflow

1. Choisir un snack dans ce dossier (ex. `snack_01_rgpd/`).
2. Ouvrir [https://snack.expo.dev](https://snack.expo.dev) et créer un nouveau projet vide.
3. Copier-coller le contenu de `App.js` du snack choisi dans l'éditeur Snack.
4. Installer **Expo Go** sur le device de test (Z Fold 5, iPhone, etc.) si ce n'est pas déjà fait.
5. Scanner le QR code affiché par Snack avec Expo Go.
6. Tester le flow en cochant la checklist UX du README de chaque snack.

## Principe

- 1 snack = 1 composant ou 1 flow isolé.
- Les props sont **mockées** dans le snack via un `MockScenariosPanel` qui permet de basculer entre scénarios sans retoucher le code.
- Aucun import de `LIXUM-APP/src/` ni de lib non-standard (supabase, Skia, Reanimated complexes, lucide...) pour rester compatible Snack sans config.
- Styles inline pour reproduire le look MetalCard (pas d'import du composant prod).

## Snacks disponibles

| Snack | Sujet | Statut |
|-------|-------|--------|
| `snack_01_rgpd/` | Modals RGPD — suppression compte (double confirmation "SUPPRIMER") + restauration compte (fenêtre 30 jours) | À tester |

## Conventions internes

- `var` uniquement, `function` uniquement (pas d'arrow, pas de let/const).
- Indentation 2 espaces.
- Accents UTF-8 préservés.
- Emojis Unicode uniquement pour les icônes (pas de lucide-react-native).
- Dossier **hors** de `LIXUM-APP/` — aucune interaction avec le build Expo principal.
