# LIXUM — Secrets et Configuration

## Secrets Supabase (Edge Functions)

Gérés dans : Supabase Dashboard → Edge Functions → Secrets

| Secret | Valeur | Usage |
|--------|--------|-------|
| ANTHROPIC_API_KEY | sk-ant-api03-... (clé LIXUM TRACKING) | Appels API Claude Sonnet/Haiku |
| SUPABASE_URL | https://yuhordnzfpcswztujovi.supabase.co | URL du projet (auto-injecté) |
| SUPABASE_SERVICE_ROLE_KEY | eyJhb... | Accès total DB (auto-injecté) |

## Clés API Anthropic

| Clé | Workspace | Usage |
|-----|-----------|-------|
| LIXUM TRACKING | Malick's workspace | Production — tracking tokens |
| Xscan (ancienne) | Malick's workspace | Ancienne clé, $10 rechargés |

Console : platform.claude.com → Analytics → Usage/Cost (filtrer par API key)

## Configuration Expo (app.json)

| Clé | Valeur |
|-----|--------|
| expo.name | LIXUM |
| expo.slug | lixum-app |
| expo.owner | alixir2977 |
| expo.android.package | com.malick2977.LIXUMAPP |
| expo.extra.eas.projectId | 2303bd63-dc83-43d1-b248-b6660299d940 |

## Configuration EAS (eas.json)

| Profil | Usage | Distribution |
|--------|-------|-------------|
| preview | APK de test | internal |
| production | AAB pour Play Store | store |

## Variables côté client

Le client Supabase est initialisé dans src/config/supabase.js avec :
- SUPABASE_URL (publique)
- SUPABASE_ANON_KEY (publique, commence par eyJhbGciOiJIUzI1NiIs...)

Ces clés sont PUBLIQUES — pas de secret côté client. La sécurité est assurée par RLS.

## Packages natifs critiques

| Package | Version | Config app.json | Usage |
|---------|---------|----------------|-------|
| expo-notifications | ^55.0.16 | plugins: ["expo-notifications"] | Push notifications |
| expo-camera | latest | plugins: ["expo-camera"] | Scan photo |
| expo-image-picker | latest | plugins: ["expo-image-picker"] | Galerie photos |
| react-native-reanimated | v4.3.0 | plugins: ["react-native-reanimated"] | Animations |
| react-native-gesture-handler | latest | — | Swipe/Pan gestures |

## Cron Jobs Supabase

Configurés dans Supabase Dashboard → Database → Extensions → pg_cron

| Schedule | Fonction | Description |
|----------|----------|-------------|
| Lundi 6h UTC | generate-insights | Analyse 7 patterns 30 jours |
| 2 Janvier 3h UTC | generate-annual-summary | Résumé annuel Haiku |

## Comment changer la clé API Anthropic

1. Créer nouvelle clé sur console.anthropic.com
2. Supabase Dashboard → Edge Functions → Secrets
3. Modifier ANTHROPIC_API_KEY avec la nouvelle clé
4. Zéro changement de code — les 3 edge functions lisent le même secret
