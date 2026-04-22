# Snack #01 — Test UX modals RGPD

Snack isolé pour tester visuellement les **2 modals RGPD** avant intégration dans
`LIXUM-APP/src/pages/profile/ProfilePage.js` :

1. **Modal suppression compte** avec double confirmation (tape `SUPPRIMER` + raison optionnelle)
2. **Modal restauration compte** quand l'utilisateur revient dans la fenêtre de 30 jours

Aucun appel DB réel — les RPC `request_account_deletion` et `restore_account` sont mockées
via `setTimeout`.

## Workflow

1. Ouvrir [https://snack.expo.dev](https://snack.expo.dev) dans un navigateur.
2. Créer un nouveau projet vide (template "blank").
3. Ouvrir `App.js` dans l'éditeur Snack et **remplacer tout son contenu** par le contenu du fichier `App.js` de ce dossier.
4. Installer **Expo Go** sur le device de test (Z Fold 5, iPhone, etc.) depuis le Play Store / App Store.
5. Scanner le QR code affiché dans la colonne de droite de Snack avec Expo Go.
6. L'app se charge — 3 boutons de scénarios visibles sur l'écran d'accueil.

## Scénarios disponibles

| Bouton | Déclenche | But |
|--------|-----------|-----|
| `Simuler demande suppression` | DeleteConfirmModal | Tester double confirmation + raison |
| `Simuler retour utilisateur (J+15)` | RestoreAccountModal avec `scheduledDate = NOW + 15 jours` | Cas normal, 15 jours restants |
| `Simuler retour urgent (J+1)` | RestoreAccountModal avec `scheduledDate = NOW + 1 jour` | Cas urgent, icône ⚠ orange |

## Checklist UX à valider sur device

- [ ] **Modal suppression** : le warning jaune est lisible sans avoir à scroller sur un écran 6.2" ?
- [ ] **Keyword SUPPRIMER** : le texte s'affiche bien en majuscules même si l'utilisateur tape en minuscules (propriété `autoCapitalize="characters"`) ?
- [ ] **Bouton Supprimer** : reste-t-il visuellement désactivé (opacité réduite, couleur atténuée) tant que le keyword n'est pas exactement `SUPPRIMER` ?
- [ ] **TextInput raison** : la zone multiligne de 3 lignes est-elle confortable à utiliser ?
- [ ] **Modal restauration** : la date s'affiche-t-elle au format `DD/MM/YYYY` (ex. `05/05/2026`) ?
- [ ] **Cas urgent J+1** : l'icône change-t-elle bien en `⚠` orange, et le compteur "jour restant" est-il au singulier ?
- [ ] **Différenciation visuelle** : les 2 boutons (Restaurer vert plein / Confirmer suppression rouge outline) sont-ils assez contrastés pour qu'un utilisateur stressé ne se trompe pas ?
- [ ] **Tailles de cards** : les modals ne débordent-elles pas de l'écran sur petit device ? Padding confortable mais pas excessif ?
- [ ] **Contraste textes** : tous les textes passent le test de lisibilité sur fond `#1A1D22` (MetalCard simulé) ?
- [ ] **Animation fade** : la transition d'ouverture/fermeture est-elle fluide (pas de flash blanc) ?
- [ ] **Spinner pendant action** : l'`ActivityIndicator` remplace bien les boutons pendant les 1.5s de simulation ?
- [ ] **Alert natif** : le message de confirmation final s'affiche-t-il correctement après chaque flow ?

## Retours à reporter

Si un élément de la checklist est ❌, noter précisément :
- Quel device + OS version
- Quel scénario (delete / restore J+15 / restore J+1)
- Screenshot si possible
- Remonter dans une issue ou directement dans le chat Claude pour itérer sur App.js

## Intégration prod

Une fois les modals validées sur ce Snack, les étapes d'intégration dans
`LIXUM-APP/src/pages/profile/ProfilePage.js` seront :

1. Remplacer `handleDeleteAccount` (ProfilePage l.256) par un appel à `supabase.rpc('request_account_deletion', { p_user_id, p_reason })`.
2. Remplacer le contenu de `<Modal visible={showDeleteConfirm}>` (ProfilePage l.635-644) par le composant `DeleteConfirmModal` de ce Snack.
3. Ajouter `RestoreAccountModal` dans `App.js` ou `AppNavigator.js` de LIXUM-APP, consumée via `useAuth().deletionPending` (après extension d'AuthContext pour exposer `deleted_at` + `scheduled_deletion_at`).
4. Dans `AuthContext.refreshLixFromServer` (l.160), ajouter `deleted_at, scheduled_deletion_at` au `select`.
5. Si `deletionPending` est détecté dans le useEffect login (AuthContext l.187-194), monter la `RestoreAccountModal`.

## Notes

- Les styles sont **inline** pour rester Snack-compatible (pas d'import de `MetalCard`).
- Toutes les constantes sont dans `App.js` (`COLORS`, `T`).
- Conventions LIXUM respectées : `var`, `function`, 2 espaces, UTF-8.
