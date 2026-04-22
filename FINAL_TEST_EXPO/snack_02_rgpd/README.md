# Snack #02 — Test RGPD complet sur Expo Go

Instance du template `_template_mock_page/` dédiée au test visuel du **flow RGPD
complet** (suppression compte + restauration) dans le contexte réel d'une
page profil, directement dans Expo Go — aucun build APK nécessaire.

## Ce qui est mocké

- `supabase.rpc('request_account_deletion')` → `setTimeout(1500ms)` puis déclenche `triggerAccountDeletedSuccess` avec date `NOW + 30 jours`.
- `supabase.rpc('restore_account')` → `setTimeout(1000ms)` puis retourne `{ success: true }`.
- `useAuth()` → `MockAuthContext` avec `userId` fixe `66666666-6666-...`, states `deletionPending` / `accountDeletedSuccessVisible` / `accountDeletedScheduledDate`, plus helpers `testTriggerRestoreModal(days)` et `testReset()`.
- `useLang()` → `MockLanguageContext` avec `language: 'FR'`.

## Ce qui est RÉEL

Les 3 composants prod sont **copiés à l'identique** depuis `LIXUM-APP/src/components/profile/`
dans `components/` — seul l'import `T` change (`../mockT` au lieu de
`../../pages/profile/profileConstants`) :

- `components/DeleteAccountModal.js` (312 lignes) — haptics, countdown 2s, scale+glow
- `components/RestoreAccountModal.js` (247 lignes) — badge pulsant, double-confirm
- `components/AccountDeletedSuccessScreen.js` (92 lignes) — plein écran sombre

La page `ProfilePageMock.js` reproduit visuellement `ProfilePage` prod (avatar, LixTag,
stats, sections grisées non-fonctionnelles) — **seul le bouton "Supprimer mon compte"
est actif**.

`RootOverlaysMock.js` monte les 2 modals conditionnelles et ajoute un **panneau de test
fixe en bas** avec 3 boutons :

| Bouton | Action |
|--------|--------|
| `Restore J+15` | Appelle `testTriggerRestoreModal(15)` → montre `RestoreAccountModal` (cas normal, badge vert) |
| `Urgent J+1` | Appelle `testTriggerRestoreModal(1)` → montre `RestoreAccountModal` (cas urgent, badge rouge pulsant, icône ⚠) |
| `Reset` | Appelle `testReset()` → revient à l'état initial de la page profil |

Le panneau disparaît automatiquement quand une modal RGPD est visible.

## Fichiers du snack

```
snack_02_rgpd/
  App.js                                  (orchestrateur)
  MockAuthContext.js                      (Auth mock + helpers de test)
  MockLanguageContext.js                  (Language mock)
  mockT.js                                (T.fr + T.en avec 26 clés RGPD + 13 visuelles)
  ProfilePageMock.js                      (landing, simule ProfilePage)
  RootOverlaysMock.js                     (modals + panneau test)
  components/
    DeleteAccountModal.js                 (copie prod, import T modifié)
    RestoreAccountModal.js                (copie prod, import T modifié)
    AccountDeletedSuccessScreen.js        (copie prod, import T modifié)
  README.md                               (ce fichier)
```

## Workflow test sur Expo Go

1. Ouvrir [snack.expo.dev](https://snack.expo.dev) dans un navigateur.
2. Créer un nouveau projet vide (template "blank").
3. Dans l'éditeur Snack, **créer un fichier par fichier** de ce dossier et coller le contenu. Snack supporte plusieurs fichiers et sous-dossiers — créer `components/` et y placer les 3 copies.
4. Sur **Expo Go** (Z Fold 5 / iPhone / autre), scanner le QR code affiché dans la sidebar Snack.
5. L'app démarre sur `ProfilePageMock`.

### Alternative : importer depuis GitHub

Snack accepte l'import d'un repo GitHub public. Cette branche sera sur
`claude/snack-02-rgpd-template` — tu peux passer l'URL raw du dossier à Snack
une fois la PR mergée, ou simplement copier chaque fichier manuellement.

## Checklist UX à valider (13 items)

### Landing
- [ ] `ProfilePageMock` s'affiche : avatar 👤, nom "Malick", LixTag `LXM-QJLMVQ`, 3 stats
- [ ] Toutes les options sauf "Supprimer mon compte" sont visuellement grisées (opacity 0.4)
- [ ] Panneau de test visible en bas de l'écran (fond #1A1D22, 3 boutons)

### DeleteAccountModal
- [ ] Tap "Supprimer mon compte" → modal s'ouvre avec animation fade
- [ ] Warning lisible : "Toutes vos données (Nutrition, Activité, Santé, Social)"
- [ ] 6 raisons cochables (checkboxes custom vert emerald)
- [ ] Cocher "Autre" ouvre un TextInput multiligne
- [ ] Taper `suppr...` → bouton rouge reste grisé tant que `SUPPRIMER` pas complet
- [ ] Taper `SUPPRIMER` en minuscules → l'autoCapitalize force les majuscules
- [ ] Keyword match → haptic Heavy (vibration forte) + animation scale+glow rouge sur bouton
- [ ] Countdown 2s visible : "Appuyez dans 2s..." → "1s..." → texte final
- [ ] Tap bouton final → haptic Medium + spinner 1.5s → transition vers AccountDeletedSuccessScreen

### AccountDeletedSuccessScreen
- [ ] Écran plein fond #0A0E14 avec ♻️ vert géant (fontSize 72)
- [ ] Titre + body avec date `DD/MM/YYYY` (~30 jours dans le futur)
- [ ] Petit texte italique "Un email de confirmation vous sera envoyé."
- [ ] Bouton "J'ai compris" emerald → tap = retour à l'état initial (panneau test réapparaît)

### RestoreAccountModal (via bouton test J+15)
- [ ] Tap "Restore J+15" dans panneau → modal s'ouvre, haptic Light
- [ ] Icône ♻️ vert, pas de pulsation
- [ ] Badge "15 JOURS RESTANTS" en emerald
- [ ] 2 boutons : "Restaurer mon compte" (vert plein) + "Confirmer la suppression" (rouge outline)

### RestoreAccountModal cas urgent (via bouton test J+1)
- [ ] Badge "1 JOUR RESTANT" en rouge pulsant (opacity 0.55↔1)
- [ ] Icône ⚠ orange (au lieu de ♻️)

### Flow restauration
- [ ] Tap "Restaurer" → haptic Medium + spinner 1s → modal se ferme + retour panneau test

### Flow rejet double-confirm
- [ ] Tap "Confirmer la suppression" → haptic Heavy + sous-modal s'ouvre par-dessus
- [ ] Sous-modal titre : "Êtes-vous absolument certain ?"
- [ ] Body mentionne la date de suppression définitive
- [ ] Tap "Oui, supprimer définitivement" → haptic Warning + modal se ferme (signOut)
- [ ] Tap "Non, je réfléchis" → retour à la modal restore (pas de fermeture)

## Retours à reporter

Noter pour chaque ❌ :
- Device + OS version
- Scénario exact
- Screenshot si possible
- Remonter directement dans le chat Claude Code pour itérer.
