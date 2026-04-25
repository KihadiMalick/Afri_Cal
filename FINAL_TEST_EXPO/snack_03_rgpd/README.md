# snack_03_rgpd — LixVerse Caractères V5 Premium

## Scope test
- Page LixVerse complète avec 4 sub-tabs (Défi / Human / Caractères / LixShop)
- Seul Caractères est interactif (refonte Premium V5)
- Connexion Supabase RÉELLE (compte test-dev `c4e24be5-17e8-4c0e-85cc-47db9286b496`)

## Comment lancer
1. Importer le dossier dans Snack Expo (https://snack.expo.dev)
2. Run sur device Z Fold 5 ou émulateur Expo Go
3. Onglet Caractères doit afficher 16 perso depuis DB

## Architecture
```
snack_03_rgpd/
├── App.js                    Entry point Snack
├── package.json              Deps (Expo SDK 54.0.33)
├── README.md
├── MockAuthContext.js        Compte test-dev
├── MockLanguageContext.js    Mock i18n
├── MockNavigation.js         Stub navigation
├── mockT.js                  Translations FR
├── lixverseConstants.js      Config Supabase + tier configs
├── LixVersePage.js           Parent avec 4 sub-tabs
├── tabs/
│   ├── CharactersTab.js      Le seul interactif
│   ├── DefiTabStub.js        Stub "Coming soon"
│   ├── HumanTabStub.js       Stub
│   └── LixShopTabStub.js     Stub
├── components/
│   ├── CharacterCard.js      Card grid 3:4 TCG
│   ├── ActiveCharacterBanner.js
│   └── CharacterDetailModal.js  FIX BUG flip (empilement absolute permanent)
└── utils/
    └── haptics.js            5 helpers (single source of truth)
```

## Fonctionnalités testées Phase 2
- ✅ Layout LixVerse complet (header + 4 tabs + bottom nav implicite)
- ✅ RPC `get_user_collection` au mount (16 caractères depuis DB)
- ✅ RPC `get_character_powers` au flip card
- ✅ Image Emerald Owl dynamique depuis Supabase Storage
- ✅ Cards 3:4 TCG avec gradients tier signatures
- ✅ Modal détail bottom sheet 95% screen height
- ✅ FIX bug modal flip (empilement permanent en `position: absolute`)
- ✅ Haptic feedback sur tap/flip
- ✅ Pull-to-refresh
- ✅ Loading state ActivityIndicator emerald

## Limitations Phase 2
- 3 autres sub-tabs = stubs "Coming soon"
- Animations natives breath/aura/floating → Phase 3
- Test RPC `set_active_character` / `use_character_power` / `recharge_character` → Phase 5
- Build natif → bloqué quota EAS jusqu'au 1er mai

## Migration prod prévue
**Phase 6** — transpose Snack → `LIXUM-APP/src/pages/lixverse/CharactersTab.js`

## Validation visuelle checklist
Voir prompt sprint Phase 2 section "Procédure de validation post-merge".
