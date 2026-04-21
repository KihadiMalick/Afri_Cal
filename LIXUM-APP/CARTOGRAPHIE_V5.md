# Cartographie V5 — Alignement client JS

Généré par lecture seule. Aucun fichier source modifié. Périmètre : `LIXUM-APP/**/*.{js,jsx,ts,tsx}` hors `node_modules`, `.expo`, `build`, `dist` (80 fichiers scannés).

## SECTION 1 — RPC V5 : état de consommation côté JS

| RPC | Statut |
| --- | --- |
| `add_user_xp` | ❌ JAMAIS APPELÉE |
| `set_active_character` | ✅ CONSOMMÉE dans `src/pages/lixverse/LixVersePage.js:251` (via wrapper `supaRpc`) |
| `choose_first_character` | ✅ CONSOMMÉE dans `src/pages/lixverse/LixVersePage.js:237` (via `supaRpc`) |
| `check_character_onboarding` | ✅ CONSOMMÉE dans `src/pages/lixverse/LixVersePage.js:214` (via `supaRpc`) |
| `credit_lix_with_guardian` | ❌ JAMAIS APPELÉE |
| `add_character_fragments` | ❌ JAMAIS APPELÉE |
| `unlock_micros_history` | ❌ JAMAIS APPELÉE |
| `unlock_hydration_history` | ✅ CONSOMMÉE dans `src/pages/dashboard/DashboardPage.js:202` |
| `admin_grant_to_user` | ❌ JAMAIS APPELÉE |
| `admin_create_promo_code` | ❌ JAMAIS APPELÉE |
| `redeem_promo_code_signup` | ❌ JAMAIS APPELÉE |
| `redeem_promo_code_on_purchase` | ❌ JAMAIS APPELÉE |
| `get_my_affiliate_dashboard` | ❌ JAMAIS APPELÉE |
| `change_subscription` | ❌ JAMAIS APPELÉE |
| `check_and_deduct_energy` | ❌ JAMAIS APPELÉE (nom absent du code — l'infrastructure `energy_remaining` / `energy_cost` côté client est alimentée par d'autres endpoints : voir notes) |
| `credit_lix` | ❌ JAMAIS APPELÉE |
| `debit_lix` | ❌ JAMAIS APPELÉE |
| `calc_xp_for_level` | ❌ JAMAIS APPELÉE |
| `get_user_xp` | ⚠️ CONSOMMÉE via REST (pas `supabase.rpc`) dans `src/pages/profile/ProfilePage.js:200` — `fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_xp', ...)` |
| `claim_daily_login_xp` | ❌ JAMAIS APPELÉE |
| `recharge_lix_to_energy` | ❌ JAMAIS APPELÉE |
| `grant_momo_streak_bonus` | ❌ JAMAIS APPELÉE |
| `deduct_alixen_recipe` | ✅ CONSOMMÉE dans `src/pages/repas/RecettesScreen.js:624` |

Notes :
- Wrapper `supaRpc` utilisé dans LixVersePage encapsule `supabase.rpc(...)` (résout la Promise et retourne `data`). Le grep par nom de RPC trouve ces appels même sans la signature `supabase.rpc(`.
- Les champs `energy_remaining` / `energy_cost` sont lus par `src/pages/medicai/index.js:1251,1375,1877`, `src/pages/repas/RecettesScreen.js:737,839`, `src/pages/repas/XscanScreen.js:2690`, `src/pages/repas/CartScanScreen.js:1331` et `src/pages/medicai/MediBookPages.js:1024`, mais l'appel réseau sous-jacent ne transite PAS par `check_and_deduct_energy` côté JS — cette RPC serveur n'est jamais nommée par le client. À investiguer lors de l'alignement V5.
- Bilan chiffré : **6 RPC V5 consommées** (dont 1 via REST) / **17 RPC V5 jamais appelées**. Zone promo/affiliate + XP système + subscription switch + admin grant : couverture JS nulle.

## SECTION 2 — Colonnes V4 obsolètes encore référencées

| Chaîne | Occurrences |
| --- | --- |
| `lix_count` | ✅ Propre (0 occurrence) |
| `energy_monthly_used` | ⚠️ 2 occurrences — `src/config/AuthContext.js:166` (SELECT du profil) et `src/config/AuthContext.js:174` (`setEnergyMonthlyUsed(data.energy_monthly_used \|\| 0)`) |
| `monthly_energy_reset_at` | ⚠️ 2 occurrences — `src/config/AuthContext.js:166` (SELECT) et `src/config/AuthContext.js:175` (`setMonthlyEnergyResetAt(data.monthly_energy_reset_at \|\| null)`) |
| `is_premium` | ✅ Propre (0 occurrence) |
| `is_premium_until` | ✅ Propre (0 occurrence) |
| `last_spin_at` | ✅ Propre (0 occurrence) |

Contexte AuthContext (lignes 162-176) :
```
.select('lix_balance, energy, subscription_tier, subscription_expires_at,
        energy_monthly_used, monthly_energy_reset_at,
        onboarding_xscan_used, onboarding_gallery_used, onboarding_chat_used,
        onboarding_recipe_used, onboarding_medic_used, onboarding_cartscan_used')
...
setEnergyMonthlyUsed(data.energy_monthly_used || 0);
setMonthlyEnergyResetAt(data.monthly_energy_reset_at || null);
```
→ Si V5 supprime ces colonnes côté DB, il faut retirer leur sélection et les 2 setters associés dans `AuthContext.js`.

## SECTION 3 — Code promo : visuel existant

Grep case-insensitive `promo|affiliate` sur les 80 fichiers JS/TS : **0 occurrence**.

- Pas de champ de saisie code promo sur `RegisterPage` ni sur aucune phase d'onboarding.
- Aucun state local `promoCode` / `setPromoCode`.
- Aucun bouton « Valider code promo ».
- Aucun écran ou route « Affiliation » / « Parrainage ».

→ La fonctionnalité promo / affiliation V5 est intégralement à construire côté client (UI + states + appels RPC). Les 4 RPC associées (`admin_create_promo_code`, `redeem_promo_code_signup`, `redeem_promo_code_on_purchase`, `get_my_affiliate_dashboard`) ne sont consommées nulle part.

## SECTION 4 — Caractères & XP : pages existantes

### Grille des 16 caractères
- `src/pages/lixverse/CharactersTab.js` — **fichier de la grille**. Export par défaut l.19 `CharactersTab`. L.58 résout `activeChar`. L.138 rend la grille via `(userCollection ?: ALL_CHARACTERS).map(ch => …)`. L.141 applique le contour "actif". Contient aussi le détail de carte inline (powers, XP bar, uses bar, verrouillage Niv1).
- `src/pages/lixverse/LixVersePage.js:26` — importe `CharactersTab`, le monte l.988 dans son onglet.

### Onboarding "premier compagnon"
- `src/pages/register/phases/Phase6Characters.js` — phase d'**inscription** (register flow). L.23 déclare le composant local `CharacterCard`, l.131 l'itère dans un swipe. C'est le choix initial lors du register, pas la modal compagnon post-login.
- `src/pages/lixverse/LixVersePage.js:135` — state `showCharOnboarding` / `setShowCharOnboarding` déclaré. Setter appelé l.218 (`true` si `first_character_chosen === false`) et l.240 (`false` après `choose_first_character`), mais **la valeur booléenne `showCharOnboarding` n'est JAMAIS lue dans le JSX** (grep confirmé : 1 seule ligne contient `showCharOnboarding` → la déclaration).
- **Conclusion : la modal "premier compagnon" côté LixVerse est absente.** Le state existe, les setters sont câblés, mais aucun `{showCharOnboarding && <Modal …>}` n'est rendu. À construire.

### Affichage niveau XP utilisateur
- `src/pages/profile/ProfilePage.js` — **fichier d'affichage XP user**. L.114 : `var _userXP = useState({ user_xp:0, user_level:1, xp_progress:0, xp_needed:80, xp_percent:0 })`. L.200 : fetch REST `/rpc/get_user_xp`. L.388 : badge `NIV {userXP.user_level}`. L.389 : compteur `{userXP.xp_progress} / {userXP.xp_needed} XP`. L.391 : barre de progression (`xp_percent`). L.657-661 : grand écran XP dans la Modal Milestones (NIV + progress + barre). L.665 : comparaison `userXP.user_level >= m.level` pour paliers atteints.
- Aucun autre fichier n'affiche le niveau XP utilisateur.

### Compagnon actif (affichage read-only)
- `src/pages/dashboard/DashboardPage.js:118,217,411,443` — state `activeChar`, passage en props à `DashboardContent` et `HydrationModal`.
- `src/pages/dashboard/DashboardContent.js:203-217` — badge compagnon visible si powers actifs.
- `src/pages/dashboard/dashboardComponents.js:46-53` + `src/components/shared/NavBar.js:17-19` — `AvatarButton` (emoji compagnon actif dans la barre de nav).
- `src/pages/repas/RepasPage.js:87,523-550,1010-1047,1270` — header compagnon + verrouillage powers Niv1/Niv2.
- `src/pages/activity/ActivityPage.js:105,488-511,987` — idem pour activité.
- `src/pages/activity/LiveTrackingScreen.js:578-596` — vignette compagnon pendant le live tracking.
- `src/pages/medicai/index.js:125` — état `activeCharAvatar`.
- `src/pages/repas/XscanScreen.js:27,2070` — prop `activeChar` + contrôle du nombre max de substitutions selon level.
- `src/pages/repas/RepasPage.js:98` — `activeCharAvatar`.

Bilan Section 4 : grille existe, affichage XP existe, onboarding register (swipe) existe — **seule la modal "premier compagnon" déclenchée depuis LixVerse est incomplète**.
