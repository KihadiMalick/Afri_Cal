# LIXUM

Mobile calorie tracking app built with React Native and Expo.

## Setup (GitHub Codespace)

```bash
cd lixum-mobile
npm install
npx expo start --tunnel
```

Then scan the QR code with **Expo Go** on your phone/tablet.

## Project structure

```
lixum-mobile/       # Expo React Native app
  src/
    components/     # Reusable UI components
    context/        # Auth, Theme, Locale providers
    hooks/          # Custom hooks
    i18n/           # Translations (FR/EN)
    lib/            # Supabase client, vision pipeline
    navigation/     # React Navigation setup
    screens/        # App screens
    theme/          # LIXUM design system (colors, spacing, shadows)
    types/          # TypeScript types
    utils/          # Utility functions
supabase-*.sql      # Database schema and migrations
```
