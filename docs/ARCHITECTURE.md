# LIXUM — Architecture Technique

## Stack technique

- Frontend : React Native + Expo SDK 54
- Backend : Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- IA : Anthropic API (Claude Sonnet 4 + Haiku 4.5)
- Build : EAS Build (Expo Application Services)
- Repo : github.com/KihadiMalick/Afri_Cal (privé)
- Dossier actif : LIXUM-APP/ uniquement

## Comptes et identifiants

- Expo : Alixir2977, projectId 2303bd63-dc83-43d1-b248-b6660299d940
- Supabase : projet AfriCalo, URL yuhordnzfpcswztujovi.supabase.co
- Package Android : com.malick2977.LIXUMAPP
- EAS login : malick.thiam@kihadi.com
- User test : ff3ba7cf-0e1e-4557-b640-45e2849a9145

## Commande de build

```
cd ~/Afri_Cal/LIXUM-APP && git pull && EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform android --profile preview
```

OTA updates (JS uniquement, sans rebuild natif) : `eas update`

## Structure du dossier src/

```
src/
├── config/
│   ├── AuthContext.js          — Source de vérité globale (user, energy, lix, abo, profil)
│   └── supabase.js             — Client Supabase initialisé
├── components/
│   └── shared/
│       ├── EnergyGateModal.js   — Modal quand énergie insuffisante (402)
│       ├── DatePickerModal.js   — Sélecteur de date natif
│       └── NotificationService.js — Service notifications push Expo
├── medicai/
│   ├── index.js                — Page MedicAi principale (~3000+ lignes)
│   ├── constants.js            — ENERGY_CONFIG, coûts, abonnements
│   ├── AlixenChat.js           — Composant chat ALIXEN
│   ├── MediBookPages.js        — MediBook complet (~3600+ lignes)
│   ├── SecretPocket.js         — Coffre-fort documents sensibles
│   └── Modals.js               — Tous les modals médicaux (ajout med, vaccin, etc.)
├── repas/
│   ├── RepasPage.js            — Page Repas principale
│   ├── RecettesScreen.js       — ALIXEN Chef (3 recettes IA)
│   ├── XscanScreen.js          — Scan photo repas
│   ├── CartScanScreen.js       — Scan ticket de caisse
│   └── ManualEntryScreen.js    — Saisie manuelle repas
├── activity/
│   ├── ActivityPage.js         — Page Activité
│   ├── activityComponents.js   — Composants activité
│   └── activityConstants.js    — Constantes (MET, sports, etc.)
├── lixverse/
│   ├── LixVersePage.js         — Hub LixVerse (3 onglets)
│   ├── lixverseConstants.js    — Personnages, défis, caisses
│   └── lixverseComponents.js   — Composants partagés LixVerse
├── dashboard/
│   └── DashboardPage.js        — Page d'accueil
└── register/
    └── phases/                 — Onboarding en 6 phases
```

## Flux de données principal

```
Utilisateur → React Native App
    ↓
AuthContext.js (state global : user, energy, lix, abo)
    ↓
Supabase Client (REST API)
    ↓
PostgreSQL (tables + RLS) ←→ Edge Functions (IA)
    ↓                              ↓
Données utilisateur          Anthropic API (Sonnet/Haiku)
```

## Flux d'authentification

1. RegisterPage → RPC create_user_profile → users_profile créé
2. Login → Supabase Auth → JWT token
3. AuthContext.js → fetch users_profile → expose via useAuth()
4. refreshLixFromServer() → recharge lix_balance, energy, subscription_tier, onboarding_usage

## Système d'énergie (Business Model)

```
Utilisateur envoie un message/scan
    ↓
Frontend calcule le coût (ENERGY_CONFIG.COSTS)
    ↓
Edge Function appelle RPC check_and_deduct_energy(userId, cost, feature)
    ↓
RPC vérifie en cascade :
  1. Onboarding gratuit restant ? → Gratuit
  2. Abonnement avec quota quotidien ? → Déduit du quota
  3. Énergie achetée via Lix ? → Déduit de energy
  4. Rien → Retourne { allowed: false } → HTTP 402
    ↓
Si 402 → Frontend affiche EnergyGateModal
Si OK → Edge Function appelle Anthropic API → Réponse
    ↓
Après réponse → Log dans energy_log
```

## Navigation (Navbar 5 onglets)

```
[Accueil] [Repas] [MedicAi] [Activité] [LixVerse]
                     ↑ centre
```

- Accueil : DashboardPage (score vitalité, résumé jour, cartes)
- Repas : RepasPage (historique, XScan, CartScan, ALIXEN Chef)
- MedicAi : Chat ALIXEN + MediBook + SecretPocket
- Activité : ActivityPage (objectif OMS, recommandations)
- LixVerse : 3 sous-onglets (Défi, Human, Caractères)

Profil accessible via icône avatar dans le header de chaque page.

## Optimisations API en place

- Prompt caching : system blocks avec cache_control ephemeral (90% réduction tokens cachés)
- Compression historique : messages > 6 compressés en résumé via Haiku
- Historique limité : 6 derniers messages envoyés, anciens résumés
- Contexte compact : données médicales en format condensé
- Requêtes parallèles : Promise.all dans fetchAlixenContext
