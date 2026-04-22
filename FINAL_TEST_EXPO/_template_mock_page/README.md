# _template_mock_page — Template réutilisable

Template de base pour tous les **snacks de test UX isolés** du dossier `FINAL_TEST_EXPO/`.
Fournit une structure commune : providers mock (Auth + Language) + page de test + dictionnaire de traductions.

## Structure

| Fichier | Rôle |
|---------|------|
| `App.js` | Squelette racine qui monte `<MockAuthProvider>` + `<MockLanguageProvider>` + page testée |
| `MockAuthContext.js` | Expose `useAuth()` avec des valeurs mockées (userId fixe, `deletionPending`, etc.) |
| `MockLanguageContext.js` | Expose `useLang()` retournant `{ language, setLanguage }` |
| `mockT.js` | Dictionnaire `T.fr` / `T.en` minimal à compléter selon le snack |
| `MockPage.js` | Placeholder à remplacer par la vraie page à tester |
| `README.md` | Ce fichier |

## Créer un nouveau snack à partir du template

1. **Copier** tout le dossier `_template_mock_page/` vers `snack_XX_feature/`.
2. **Renommer** `MockPage.js` en nom de la page testée (ex: `ProfilePageMock.js`) et adapter l'import dans `App.js`.
3. **Copier les vrais composants prod** à tester dans un sous-dossier `components/`. Remplacer leur import `T` par `../mockT`.
4. **Remplacer** les appels `supabase.rpc` par `setTimeout` qui retournent des données mockées (format identique au retour DB).
5. **Adapter** `mockT.js` en y ajoutant toutes les clés utilisées par la page et les composants.
6. **Étoffer** `MockAuthContext` avec les states et fonctions supplémentaires nécessaires au flow testé (ex: `testTriggerRestoreModal` pour RGPD).
7. **Documenter** dans `README.md` du snack la checklist UX à valider.

## Workflow de test

1. Ouvrir [snack.expo.dev](https://snack.expo.dev) sur un navigateur.
2. Créer un nouveau projet vide (template "blank").
3. Dans l'éditeur Snack, créer chaque fichier .js du dossier snack (Snack accepte plusieurs fichiers) et y coller le contenu.
4. Installer **Expo Go** sur le device de test (Z Fold 5, iPhone).
5. Scanner le QR code affiché par Snack avec Expo Go.
6. Dérouler la checklist UX du README du snack.

## Principe

- Zéro dépendance Supabase ni librairie non-standard (uniquement `react`, `react-native`, `expo-haptics`, `expo-status-bar`).
- Conventions LIXUM respectées : `var` + `function`, 2 espaces d'indentation, UTF-8.
- Les vrais composants prod sont **copiés à l'identique** (sauf import `T`) pour garantir fidélité visuelle + comportementale.
