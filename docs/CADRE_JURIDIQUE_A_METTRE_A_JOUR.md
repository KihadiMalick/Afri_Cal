# 📋 LIXUM — CADRE JURIDIQUE : ÉLÉMENTS À METTRE À JOUR

**Document de travail interne — à conserver dans Lixum Docs**

**Date de création** : 19 avril 2026
**Statut** : actif, à consulter régulièrement
**Documents concernés** : Privacy Policy FR/EN + Terms & Conditions FR/EN (table Supabase `legal_documents`)
**Version actuelle** : 1.0 beta

---

## 🎯 OBJECTIF DE CE DOCUMENT

Lister exhaustivement tous les éléments des documents légaux LIXUM qui sont actuellement marqués "**en cours**" ou en attente, et qui devront être mis à jour à mesure que la société se structure officiellement.

À chaque mise à jour, **publier une nouvelle version** dans la table Supabase `legal_documents` via la RPC `publish_legal_document()` pour préserver le versioning RGPD Article 7.

---

## 🏢 BLOC 1 — Constitution de LIXUM SAS

À mettre à jour dès que la société sera officiellement constituée à Dakar, Sénégal.

### 1.1 Raison sociale

**Mention actuelle** : "LIXUM SAS (en cours de constitution)"
**À remplacer par** : "LIXUM SAS"
**Présent dans** :
- Privacy FR & EN — Section 1 (Responsable du traitement)
- Privacy FR & EN — Footer
- T&C FR & EN — Section 1 (Définitions)
- T&C FR & EN — Section 9.3 (Marques)
- T&C FR & EN — Footer

### 1.2 Forme juridique

**Mention actuelle** : "Société par Actions Simplifiée (SAS) de droit sénégalais — forme juridique prévue"
**À remplacer par** : "Société par Actions Simplifiée (SAS) de droit sénégalais"
**Présent dans** :
- Privacy FR & EN — Section 1
- T&C FR & EN — Section 1

### 1.3 Adresse du siège social

**Mention actuelle** : "Dakar, République du Sénégal (adresse précise en cours de finalisation, sera communiquée dès constitution officielle de la société)"
**À remplacer par** : adresse postale complète et précise
**Format suggéré** : `[Numéro et nom de rue], [Quartier], [Code postal] Dakar, République du Sénégal`
**Présent dans** :
- Privacy FR & EN — Section 1 (Responsable du traitement)
- Privacy FR & EN — Section 12.3 (Contact)
- T&C FR & EN — Section 1 (Définitions)
- T&C FR & EN — Section 16.10 (Contact)

### 1.4 NINEA (Numéro d'Identification Nationale des Entreprises et Associations)

**Mention actuelle** : "en cours d'attribution"
**À remplacer par** : numéro NINEA officiel attribué par l'administration fiscale sénégalaise
**Présent dans** :
- Privacy FR & EN — Section 1

### 1.5 RCCM (Registre du Commerce et du Crédit Mobilier)

**Mention actuelle** : "inscription en cours"
**À remplacer par** : numéro RCCM officiel + tribunal d'inscription
**Format suggéré** : `RCCM SN-DKR-2026-X-XXXXX` (à confirmer selon nomenclature sénégalaise)
**Présent dans** :
- Privacy FR & EN — Section 1

### 1.6 Capital social

**Mention actuelle** : non mentionné dans les documents actuels
**À ajouter** : capital social en FCFA après constitution
**Action** : ajouter une ligne dans Section 1 des Privacy FR/EN
**Format suggéré** : "Capital social : X FCFA"

### 1.7 Représentant légal officiel

**Mention actuelle** : "Fondateur et Président : Malick Thiam"
**À vérifier/ajuster** : confirmer le titre exact selon les statuts (Président, Directeur Général, etc.)
**Présent dans** :
- Privacy FR & EN — Section 1

---

## 🌐 BLOC 2 — Site web lixum.com

À mettre à jour dès que le site web sera en ligne et opérationnel.

### 2.1 Mentions du site web

**Mention actuelle** : "site lixum.com **à venir**"
**À remplacer par** : "site lixum.com" (sans la mention "à venir")
**Présent dans** :
- Privacy FR & EN — Section 2 (Champ d'application)
- Privacy FR & EN — Section 9.2 (Cookies site web futur)
- T&C FR & EN — Section 5.2 (Paiements via lixum.com)

### 2.2 Bannière de consentement cookies

**Mention actuelle** : "Une bannière de consentement cookies conforme sera mise en place le moment venu"
**À remplacer par** : description précise de la bannière déployée + lien vers la politique cookies dédiée si créée
**Présent dans** :
- Privacy FR & EN — Section 9.2

### 2.3 Politique cookies dédiée

**À créer** : si le site web est lancé, prévoir éventuellement un document Cookies Policy séparé (en plus de la mention dans la Privacy Policy)
**Stockage** : ajouter `document_type='cookies'` dans la table `legal_documents` si décidé

---

## 💳 BLOC 3 — Prestataires de paiement

À mettre à jour dès qu'un prestataire de paiement sera officiellement intégré.

### 3.1 Mobile Money

**Mention actuelle** : "Mobile Money (partenariat en cours pour l'Afrique)"
**À remplacer par** : nom du prestataire Mobile Money intégré (Orange Money, Wave, MTN MoMo, etc.) + pays couverts
**Présent dans** :
- T&C FR & EN — Section 5.2 (Paiements)

### 3.2 Prestataire carte bancaire web

**Mention actuelle** : "paiement par carte bancaire via prestataire certifié PCI DSS"
**À remplacer par** : nom du prestataire (Stripe, Paystack, Flutterwave, etc.) + ajouter dans la liste des sous-traitants Privacy Policy
**Présent dans** :
- T&C FR & EN — Section 5.2
- **À ajouter** : Privacy FR & EN — Section 7 (Sous-traitants), créer une nouvelle sous-section 7.3

---

## 🔒 BLOC 4 — Implémentations techniques mentionnées

À confirmer/mettre à jour à mesure que les fonctionnalités sont effectivement implémentées et testées.

### 4.1 Authentification biométrique MediBook

**Mention actuelle** : décrite comme implémentée
**À vérifier** : confirmer l'implémentation effective avant publication grand public
**Présent dans** :
- Privacy FR & EN — Section 8.5
- T&C FR & EN — Section 2.4, Section 4.3.3
- T&C FR & EN — Section 1 (Définitions)

### 4.2 Chiffrement AES-256-GCM Silhouette

**Mention actuelle** : décrit comme implémenté
**À vérifier** : confirmer l'implémentation effective de :
- Stockage local exclusif via expo-file-system dans dossier privé app
- Chiffrement AES-256-GCM via expo-crypto
- Clé dans Secure Enclave (iOS) / Android Keystore (TEE)
**Présent dans** :
- Privacy FR & EN — Section 8.6
- T&C FR & EN — Section 4.3.5

### 4.3 Extraction locale des mesures Silhouette

**Mention actuelle** : "algorithme embarqué"
**À spécifier ultérieurement** : nom de la librairie/algo utilisé (MediaPipe Pose, TensorFlow Lite, custom)
**Action** : pas obligatoire de citer la techno précise, mais à noter pour cohérence avec implémentation
**Présent dans** :
- Privacy FR & EN — Section 3.2
- T&C FR & EN — Section 4.3.5

### 4.4 Floutage automatique du visage (V1.1+)

**Mention actuelle** : "sera disponible dans une future version"
**À mettre à jour** : dès que la fonctionnalité est livrée, transformer la mention en description du dispositif effectif
**Présent dans** :
- Privacy FR & EN — Section 8.7
- T&C FR & EN — Section 4.3.6

---

## 📧 BLOC 5 — Adresses email

À vérifier que les boîtes mail sont opérationnelles avant publication grand public.

### 5.1 Email privacy

**Adresse mentionnée** : `privacy@lixum.com`
**À configurer** : créer cette boîte mail + définir une procédure de réponse aux demandes RGPD (délai 1 mois)
**Présent dans** : tous les documents, multiples emplacements

### 5.2 Email DPO

**Adresse mentionnée** : `dpo@lixum.com`
**À configurer** : créer cette boîte mail + désigner formellement un DPO (peut être Malick lui-même initialement, mais à formaliser)
**Présent dans** : tous les documents, multiples emplacements

### 5.3 Email contact général (à envisager)

**Mention actuelle** : non utilisé spécifiquement
**À envisager** : créer `contact@lixum.com` ou `support@lixum.com` pour les demandes non-privacy
**Action** : décider si on remplace certains "privacy@lixum.com" par "support@lixum.com" pour les cas non-RGPD (ex. signalement bug, support utilisateur)

---

## 🏷️ BLOC 6 — Marques OAPI

À mettre à jour dès que les marques sont effectivement déposées auprès de l'Organisation Africaine de la Propriété Intellectuelle.

### 6.1 Marques mentionnées

**Mention actuelle** : "marques protégées de LIXUM SAS (en cours d'enregistrement ou enregistrées auprès des offices compétents)"
**À remplacer par** : "marques déposées de LIXUM SAS auprès de l'OAPI [+ autres offices selon stratégie]"
**Marques concernées** : LIXUM, ALIXEN, LixVerse, LixTag, Lix, Xscan, CartScan, MediBook, Secret Pocket, Silhouette + noms des Caractères
**Présent dans** :
- T&C FR & EN — Section 9.3 (Marques)

### 6.2 Numéros d'enregistrement

**À ajouter** : numéros d'enregistrement OAPI dès attribution
**Action** : décider si on les fait apparaître dans les documents publics ou si on les garde dans une annexe interne

---

## ⚖️ BLOC 7 — Validation juridique professionnelle

Engagement pris dans les documents qu'il faut concrétiser.

### 7.1 Cabinet juridique à mandater

**Engagement actuel** : "Nous nous engageons à faire valider et enrichir ce document par un cabinet juridique spécialisé en droit de la consommation et de la santé numérique avant le lancement grand public de LIXUM"
**Action requise** :
- Identifier 2-3 cabinets juridiques spécialisés à Dakar (OAPI + droit numérique)
- Demander des devis (estimation : 500-2000 EUR pour révision complète)
- Mandater pour révision avant lancement public V1.0
**Documents concernés** : tous les 4 (Privacy FR/EN + T&C FR/EN)

### 7.2 Mise à jour post-révision juridique

**Action** : après révision par avocat, publier la **version 1.1** des 4 documents via `publish_legal_document()`
**Important** : la version 1.0 beta restera dans l'historique (RGPD Article 7), seule la version 1.1 deviendra `is_current=true`

---

## 📅 BLOC 8 — Mises à jour conditionnelles selon évolution réglementaire

À surveiller en continu.

### 8.1 Loi sénégalaise n° 2008-12

**Mention actuelle** : "ses révisions en cours"
**À surveiller** : nouvelle loi sénégalaise sur la protection des données (projet de loi 2019 mentionné par CIPESA)
**Action** : si nouvelle loi adoptée, mettre à jour les références dans tous les documents

### 8.2 Loi camerounaise n° 2024/017

**Mention actuelle** : "applicable à partir du 23 juin 2026"
**À mettre à jour après le 23 juin 2026** : retirer la mention "à partir de" et confirmer l'application effective
**Présent dans** :
- Privacy FR & EN — Section 2.4
- T&C FR & EN — Section 1 (références juridictions)

### 8.3 Évolution RGPD

**À surveiller** : modifications du RGPD, nouveaux guidelines EDPB sur la santé numérique, jurisprudence CNIL/CDP
**Action** : revoir les sections concernées si évolution majeure

### 8.4 Évolution CCPA / lois US

**À surveiller** : nouvelles lois d'État américaines sur la privacy (les versions EN référencent CCPA + autres lois d'État)
**Action** : ajouter de nouvelles lois d'État dans Privacy EN — Section 2.5 si pertinent

---

## 🎁 BLOC 9 — Sous-traitants futurs

À mettre à jour dès qu'un nouveau sous-traitant est intégré.

### 9.1 Sous-traitants actuels mentionnés

- ✅ Supabase (DB + Auth) — Section 7.1
- ✅ Anthropic (ALIXEN IA) — Section 7.2

### 9.2 Sous-traitants à intégrer probablement

- **Expo / EAS** : si traitement de données (notamment notifications push)
- **Prestataire email** (Resend, SendGrid, AWS SES) : pour les emails transactionnels et OTP
- **Prestataire de paiement web** (Stripe, Paystack, Flutterwave) : voir Bloc 3
- **Prestataire Mobile Money** : voir Bloc 3
- **Prestataire d'analytics** (PostHog, Mixpanel, Amplitude) : si décidé
- **Prestataire de monitoring** (Sentry, LogRocket) : si décidé

**Procédure d'ajout** :
1. Signer un Data Processing Agreement (DPA) avec le nouveau sous-traitant
2. Ajouter une sous-section dans Section 7 (Sous-traitants) de Privacy FR/EN
3. Publier nouvelle version Privacy via `publish_legal_document()` avec notes "Ajout sous-traitant [nom]"
4. Déclencher re-consent flow utilisateurs (modification substantielle au sens Section 11.3)

---

## 🔄 BLOC 10 — Procédure de mise à jour

Quand tu fais une mise à jour, suis cette procédure :

### Étape 1 — Identifier les changements

- Modification mineure (typo, clarification) → version mineure (1.0 → 1.0.1)
- Modification substantielle (nouvelles données, nouveaux sous-traitants, nouvelles finalités) → version majeure (1.0 → 1.1)

### Étape 2 — Mettre à jour les fichiers Markdown locaux

Dans le dossier `Lixum Docs` sur ton téléphone :
- `privacy_policy_fr_v1.X.md`
- `privacy_policy_en_v1.X.md`
- `terms_conditions_fr_v1.X.md`
- `terms_conditions_en_v1.X.md`

### Étape 3 — Publier dans Supabase

Pour chaque document mis à jour, exécuter dans Supabase SQL Editor :

```sql
SELECT publish_legal_document(
  'privacy',  -- ou 'terms'
  'fr',       -- ou 'en'
  '1.X',      -- nouvelle version
  '<contenu Markdown complet>',
  'Notes : description courte de la modification'
);
```

La RPC s'occupe automatiquement de :
- Marquer l'ancienne version `is_current=false`
- Insérer la nouvelle version avec `is_current=true`
- Préserver l'ancienne version dans l'historique pour RGPD Article 7

### Étape 4 — Notifier les utilisateurs si modification substantielle

- Activer le re-consent flow dans l'app
- Envoyer notification in-app aux utilisateurs lors de leur prochaine connexion
- Conserver le consentement précédent (preuve de conformité Article 7)

### Étape 5 — Archiver dans ce document de référence

Mettre à jour ce fichier avec :
- Date de la mise à jour
- Nouvelle version publiée
- Bloc(s) concerné(s) marqué(s) comme ✅ TRAITÉ ou ⏳ EN COURS

---

## 📌 ÉTAT D'AVANCEMENT (à maintenir à jour)

### ✅ Fait au 19 avril 2026

- ✅ Création table `legal_documents` Supabase + RLS + RPCs
- ✅ Rédaction Privacy FR v1.0 beta
- ✅ Rédaction Privacy EN v1.0 beta (en attente actualisation Silhouette)
- ✅ Rédaction Terms FR v1.0 beta finale
- ⏳ Rédaction Terms EN v1.0 beta (en attente)

### ⏳ En attente (court terme)

- ⏳ Finalisation Privacy EN avec architecture Silhouette + biométrie
- ⏳ Rédaction Terms EN v1.0 beta
- ⏳ INSERT SQL des 4 documents validés
- ⏳ Intégration Modals ProfilePage (showPrivacy + showTerms)

### ⏳ En attente (moyen terme — à mesure que la société se structure)

- ⏳ Bloc 1 — Constitution LIXUM SAS (NINEA, RCCM, adresse, capital)
- ⏳ Bloc 2 — Lancement site web lixum.com
- ⏳ Bloc 3 — Intégration prestataires de paiement
- ⏳ Bloc 5 — Configuration boîtes mail privacy@ et dpo@
- ⏳ Bloc 6 — Dépôt marques OAPI

### ⏳ En attente (long terme — avant lancement public)

- ⏳ Bloc 7 — Mandater cabinet juridique spécialisé pour révision V1.1

---

## 📞 RAPPELS IMPORTANTS

1. **Versioning RGPD strict** : ne JAMAIS écraser une version dans Supabase. Toujours utiliser `publish_legal_document()` qui crée une nouvelle ligne et marque l'ancienne `is_current=false`. Cela permet de prouver à un régulateur (CDP Sénégal, CNIL, ICO) à quelle version exacte chaque utilisateur a consenti et à quelle date.

2. **Cohérence FR ↔ EN** : à chaque mise à jour FR, faire la mise à jour EN miroir dans la même publication. Sinon risque de désynchronisation.

3. **Cohérence Privacy ↔ T&C** : si on modifie un point dans Privacy, vérifier si le T&C est impacté et vice versa. Les 2 documents doivent rester alignés.

4. **Engagement professionnel** : la mention "Nous nous engageons à faire valider par un cabinet juridique avant le lancement grand public" doit être tenue. Sinon, on est en violation de notre propre engagement contractuel.

5. **Date du document** : changer la date d'entrée en vigueur à chaque nouvelle version publiée.

---

**Document à conserver dans `Lixum Docs` sur le téléphone Z Fold 5.**

**Dernière mise à jour de ce document de suivi** : 19 avril 2026 (création initiale)
