# LIXUM — Modèle Économique et Pricing

## Principes

- Modèle "avant-goût" : PAS freemium, essai gratuit ONE-TIME limité
- Monnaie virtuelle : $1 = 1000 Lix
- Énergie : 10 Lix = 1 énergie (coût invisible de l'IA)
- Abonnements pour usage régulier
- Web lixum.com (futur) pour contourner les 30% stores

## Essais gratuits (one-time, jamais renouvelés)

| Feature | Essais gratuits |
|---------|----------------|
| XScan (photo repas) | 1 |
| Galerie (scan galerie) | 2 |
| Chat ALIXEN | 4 |
| Recette IA | 1 |
| Scan médical | 1 |
| CartScan | 5 |

Gérés par les colonnes onboarding_*_used dans users_profile.
La RPC check_and_deduct_energy vérifie automatiquement.

## Coûts énergie par feature

| Feature | Énergie | Lix | Coût user | Coût API réel | Marge |
|---------|---------|-----|-----------|--------------|-------|
| Chat ALIXEN | 10 | 100 | $0.10 | ~$0.02 | ~80% |
| XScan photo | 12 | 120 | $0.12 | ~$0.04 | ~67% |
| Galerie photo | 12 | 120 | $0.12 | ~$0.04 | ~67% |
| Recette IA (3 propositions) | 8 | 80 | $0.08 | ~$0.03 | ~63% |
| Scan document médical | 30 | 300 | $0.30 | ~$0.04 | ~87% |
| Scan photo médicament | 12 | 120 | $0.12 | ~$0.04 | ~67% |
| CartScan | 1 | 10 | $0.01 | ~$0.001 | ~90% |
| Saisie manuelle (Haiku) | 3 | 30 | $0.03 | ~$0.0005 | ~98% |
| MediBook batch 1-5 photos | 50 | 500 | $0.50 | ~$0.15 | ~70% |
| MediBook batch 6-10 photos | 80 | 800 | $0.80 | ~$0.25 | ~69% |

## Abonnements

| Tier | Prix/mois | Énergie/jour | Cible |
|------|-----------|-------------|-------|
| Silver | $4.99 | 60 | Utilisateur occasionnel (2-3 chats + 1 scan/jour) |
| Gold | $9.99 | 150 | Utilisateur régulier (5 chats + 2 scans/jour) |
| Platinum | $14.99 | 300 | Power user (10+ chats + 3 scans/jour) |

## Rentabilité par abonnement

Utilisateur actif (usage 70% du quota) :

| Tier | Net Store (-30%) | Net Web (-3%) | Coût API/mois | Marge Store | Marge Web |
|------|-----------------|---------------|--------------|-------------|-----------|
| Silver | $3.49 | $4.84 | $3.00 | +$0.49 (+14%) | +$1.84 (+38%) |
| Gold | $6.99 | $9.69 | $3.00 | +$3.99 (+57%) | +$6.69 (+69%) |
| Platinum | $10.49 | $14.54 | $3.00 | +$7.49 (+71%) | +$11.54 (+79%) |

TVA : pas applicable au Sénégal sous 25M FCFA de CA annuel (~$41,000).

## Autres sources de revenus

| Source | Prix | Description |
|--------|------|-------------|
| Profil enfant médical | 1000 Lix ($1) | One-time, déverrouille MediBook pour un enfant |
| Packs Lix | $0.99 - $49.99 | Starter à Prestige (+20% bonus web) |
| Caisses Lix | 100-2500 Lix | Bois/Argent/Or/Légendaire (fragments personnages) |
| Rapport PDF MediBook | 500 Lix | Rapport santé 3 mois imprimable |
| Accès pouvoirs one-shot | Variable Lix | Non-possesseurs d'un personnage |
| Pack Fondateurs | $4.99 | 500 places, bonus exclusifs |

## Cascade de déduction (RPC check_and_deduct_energy)

```
1. Onboarding gratuit restant ? → Gratuit, compteur +1
2. Abonnement actif avec quota quotidien ? → Déduit du quota daily
3. Énergie achetée (lix → energy) ? → Déduit de energy
4. Rien → { allowed: false } → HTTP 402 → EnergyGateModal
```

Reset quotidien automatique : energy_daily_used → 0 à minuit.
Expiration abo auto-détectée : subscription_tier → 'free' si expiré.

## Métriques clés à surveiller

| Métrique | Où la voir | Seuil d'alerte |
|----------|-----------|---------------|
| Coût API/utilisateur/mois | Console Anthropic → Cost | > $5 = utilisateur trop actif |
| Tokens par message ALIXEN | Edge function logs (cache_read vs cache_write) | > 10K in = contexte non caché |
| Taux conversion free→abo | Supabase → users_profile subscription_tier | < 5% = pricing trop élevé |
| Cache hit rate | Logs "TOKENS: cache_read=X" | cache_read = 0 = cache pas actif |

## Fichiers de code concernés par le pricing

| Fichier | Quoi modifier |
|---------|---------------|
| src/medicai/constants.js | ENERGY_CONFIG.COSTS, SUBSCRIPTION_PRICES |
| lixman-chat/index.ts | ENERGY_COSTS (chat, recipe) |
| scan-meal/index.ts | ENERGY_COSTS (xscan, gallery, cartscan, manual_entry) |
| scan-medical/index.ts | ENERGY_COSTS (medic_document, medication_photo) |
| RPC check_and_deduct_energy | Limites onboarding, quotas abo (silver:60, gold:150, platinum:300) |
