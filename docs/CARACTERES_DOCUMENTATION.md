# LIXUM — Documentation Complète des Caractères

**Version 5 — 24 Avril 2026**
**Source de vérité** : aligné sur DB Supabase (`lixverse_characters` + `lixverse_character_powers` + `lixverse_user_characters`).
**Statut** : version officielle, remplace toutes les versions antérieures.

---

# VUE D'ENSEMBLE

16 personnages répartis en 5 tiers de rareté.
1 seul personnage actif à la fois (switch libre avec cooldown 30 min).
Chaque personnage possède 3 niveaux de pouvoir débloqués par fragments accumulés.
3 utilisations par charge, puis recharge en énergie (5é uniforme, sauf TARDIGRUM auto).

## Architecture DB

Les caractères sont gérés par 3 tables Supabase :

| Table | Rôle | Nb lignes |
|---|---|---|
| `lixverse_characters` | Catalogue master des 16 personnages | 16 |
| `lixverse_character_powers` | 3 pouvoirs par personnage (16 × 3 = 48) | 48 |
| `lixverse_user_characters` | Collection par utilisateur (fragments, niveau, actif, uses) | variable |

### Note technique importante — Slugs vs Display names

Les **slugs** (identifiants techniques DB) conservent les anciens noms pour ne pas casser les références. Les **display names** (affichés dans l'UI) sont les noms V5.

| Slug DB | Display name V5 | Emoji |
|---|---|---|
| `hawk_eye` | Golden Eagle | 🦅 |
| `amber_fox` | Mariposa | 🦋 |
| `silver_wolf` | Momo | 🐿️ |

Les 13 autres slugs correspondent à leur display name (ex: `emerald_owl` → Emerald Owl).

---

# FRAGMENTS — Seuils par tier

| Tier | Niv 1 | Niv 2 (cumul) | MAX (cumul) | Recharge |
|------|-------|---------------|-------------|----------|
| Standard | 10 | 20 | 30 | 5é |
| Rare | 8 | 18 | 25 | 5é |
| Elite | 7 | 14 | 20 | 5é |
| Mythique | 6 | 12 | 18 | 5é |
| Ultimate | 3 | 5 | 6 | 0é (auto 48/36/24h selon niveau) |

**Logique** : plus le tier est rare, moins il faut de fragments (car les fragments de tier élevé sont eux-mêmes très rares à obtenir).

**Efficiency bonus** (multiplicateur global appliqué aux pouvoirs équipés) :

| Tier | Efficiency bonus |
|---|---|
| Standard | 0.30 |
| Rare | 0.45 |
| Elite | 0.60 |
| Mythique | 0.80 |
| Ultimate | 1.00 |

---

# OÙ TROUVER DES FRAGMENTS

## Abonnements mensuels
| Abonnement | Standard | Rare | Elite | Mythique |
|------------|----------|------|-------|----------|
| Silver $4.99 | 3 | — | — | — |
| Gold $9.99 | 3 | 2 | 2 | — |
| Platinum $20 | 3 | 2 | 3 | 1 |

## Caisses Lix (achat en boutique)
| Caisse | Prix | Contenu possible |
|--------|------|-----------------|
| Bois | 100 Lix | 1 frag Standard (garanti) |
| Argent | 300 Lix | 1-2 frags Standard ou 1 frag Rare |
| Or | 800 Lix | 1-2 frags Rare ou 1 frag Elite |
| Légendaire | 2 500 Lix | 1-2 frags Elite ou 1 frag Mythique |

## Défis LixVerse
Les défis hebdomadaires et mensuels récompensent des fragments selon le classement :
- 1er : 3 frags du tier le plus élevé du défi
- 2e-3e : 2 frags
- 4e-10e : 1 frag
- Participation : XP uniquement

## Paliers XP utilisateur
| Palier XP | Récompense |
|-----------|------------|
| 500 XP | 5é + 20 Lix |
| 5 000 XP | 1 frag Rare + 50 Lix |
| 10 000 XP | 2 frags Rare + 100 Lix |
| 25 000 XP | 1 frag Elite + 200 Lix |
| 50 000 XP | 1 frag Mythique + 500 Lix |

## Événements spéciaux (TARDIGRUM uniquement)
Les frags Ultimate ne sont disponibles que lors d'événements rares :
- Défis communautaires spéciaux (1 frag pour les 100 premiers)
- Événements saisonniers (Ramadan, Journée Mondiale de la Santé)
- Milestones LIXUM (10K utilisateurs, 100K utilisateurs)
- LIX-QUEST événements spéciaux
- Jamais via abonnement, jamais via caisses

---
