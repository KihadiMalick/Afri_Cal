# POLITIQUE DE CONFIDENTIALITÉ LIXUM

**Version 1.0 beta • Date d'entrée en vigueur : 19 avril 2026**

Document évolutif — toute modification substantielle déclenche une demande de re-consentement lors de votre prochaine connexion à LIXUM.

---

## Préambule — Notre philosophie

LIXUM est une application mobile de santé et de nutrition **conçue en Afrique, pour le monde**. Nous sommes fiers de nos origines : LIXUM est née au Sénégal, portée par une ambition claire — démontrer qu'une technologie de niveau mondial peut émerger du continent africain et servir tous les utilisateurs, quel que soit leur pays de résidence.

Notre philosophie fondatrice est simple : **la vie privée n'est pas une option, c'est l'architecture même de notre produit**.

Contrairement à la majorité des applications de santé, LIXUM ne collecte jamais votre nom civil, votre numéro de carte d'identité, votre numéro de sécurité sociale, ni aucun identifiant administratif. Votre identité dans LIXUM est représentée par un **LixTag** — un identifiant aléatoire unique (exemple : `LXM-QJLMVQ`) généré automatiquement à votre inscription.

Cette approche structurelle nous permet d'offrir une **pseudonymisation par conception**, conformément à l'Article 25 du Règlement Général sur la Protection des Données européen (RGPD), et constitue un engagement concret en faveur de votre autonomie numérique.

Le présent document explique en toute transparence comment LIXUM collecte, traite, conserve et protège vos données, ainsi que les droits dont vous disposez pour en reprendre le contrôle à tout moment.

---

## 1. Responsable du traitement

LIXUM est développée et opérée par :

- **Raison sociale** : LIXUM SAS (**en cours de constitution**)
- **Forme juridique prévue** : Société par Actions Simplifiée (SAS) de droit sénégalais
- **Siège social prévu** : Dakar, République du Sénégal (**adresse précise en cours de finalisation**)
- **Numéro d'Identification Nationale des Entreprises et Associations (NINEA)** : **en cours d'attribution**
- **Registre du Commerce et du Crédit Mobilier (RCCM)** : **inscription en cours**
- **Fondateur et Président** : Malick Thiam
- **Contact vie privée** : privacy@lixum.com
- **Contact Délégué à la Protection des Données (DPO)** : dpo@lixum.com

En tant que responsable du traitement au sens de la Loi sénégalaise n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel et de l'Article 4.7 du RGPD, LIXUM détermine les finalités et les moyens du traitement de vos données personnelles.

**Note transparence** : les mentions administratives marquées "en cours" seront mises à jour dans une version ultérieure de ce document dès finalisation des démarches de constitution de la société. Vous serez notifié de cette mise à jour via la procédure décrite à la section 11.

---

## 2. Champ d'application

Cette Politique de Confidentialité s'applique à :

- L'application mobile LIXUM (Android, iOS à venir)
- Les services web associés (site lixum.com à venir, interfaces administratives)
- Les communications par email, notifications push et SMS émises depuis l'écosystème LIXUM

Elle est applicable à tout utilisateur à travers le monde, quel que soit son pays de résidence. Les cadres juridiques suivants peuvent s'appliquer à vous selon votre situation géographique.

### 2.1 Cadre juridique principal — Sénégal

Siège social de LIXUM.

- **Loi n° 2008-12 du 25 janvier 2008** sur la protection des données à caractère personnel et ses révisions en cours
- Autorité de contrôle : **Commission de Protection des Données Personnelles (CDP)** basée à Dakar — www.cdp.sn

### 2.2 Cadre régional ouest-africain

- **Acte Additionnel A/SA.1/01/10** de la CEDEAO (Communauté Économique des États de l'Afrique de l'Ouest) sur la protection des données personnelles
- **Convention de Malabo** de l'Union Africaine (2014) sur la cybersécurité et la protection des données à caractère personnel

### 2.3 Cadre européen

Applicable à tout utilisateur résidant dans l'Union européenne ou l'Espace Économique Européen, quel que soit son pays d'origine.

- **Règlement (UE) 2016/679** du 27 avril 2016 (RGPD)
- **France** : Loi Informatique et Libertés modifiée, Commission Nationale de l'Informatique et des Libertés (CNIL) — www.cnil.fr
- Autorités équivalentes dans les autres États membres de l'UE

### 2.4 Autres juridictions

- **Côte d'Ivoire** : Loi n° 2013-450 du 19 juin 2013, Autorité de Régulation des Télécommunications de Côte d'Ivoire (ARTCI) — www.autoritedeprotection.ci
- **Cameroun** : Loi n° 2024/017 du 23 décembre 2024, applicable à partir du 23 juin 2026, Autorité de Protection des Données à Caractère Personnel (APDP Cameroun)
- **République Démocratique du Congo** : cadre juridique en cours de consolidation, principes de la Convention de Malabo appliqués
- **Burundi** : Loi n°1/012 du 30 mai 2018 portant code du numérique
- **Royaume-Uni** : UK GDPR et Data Protection Act 2018, Information Commissioner's Office (ICO)
- **États-Unis** : CCPA (Californie) et autres lois d'État applicables
- **Canada** : Loi sur la protection des renseignements personnels et les documents électroniques (LPRPDE)
- **Autres pays** : application des principes généraux de protection des données et des règles locales applicables

---

## 3. Données collectées

LIXUM distingue clairement deux catégories de données selon leur niveau de sensibilité.

### 3.1 Données techniques et d'authentification (catégorie standard)

Ces données sont nécessaires au fonctionnement de l'application :

- **Email** : utilisé pour l'authentification, la récupération de compte et les communications essentielles
- **Mot de passe** : stocké de manière chiffrée et irréversible (algorithme bcrypt via Supabase Auth, jamais accessible en clair même par LIXUM)
- **LixTag** : identifiant anonyme généré aléatoirement à l'inscription (exemple : `LXM-QJLMVQ`)
- **Display Name** : nom d'affichage que VOUS choisissez librement (prénom, pseudo, emoji, ou laissé vide). LIXUM ne vous demande jamais votre vrai nom civil
- **Données de session** : token d'authentification, date de dernière connexion
- **Données techniques** : type d'appareil (Android ou iOS), version de l'application installée, langue préférée
- **Pays de résidence** : uniquement pour les recommandations géolocalisées d'ALIXEN (jamais la géolocalisation GPS précise)

### 3.2 Données de santé et nutrition (catégorie spéciale — Article 9 RGPD)

Ces données sont traitées avec une protection renforcée, conformément à l'Article 9 du RGPD et à l'Article 15 de la Loi sénégalaise n° 2008-12. Elles ne sont jamais collectées sans votre consentement explicite et spécifique.

**Données de profil santé** :
- Âge, sexe, poids, taille
- Niveau d'activité physique déclaré
- Régime alimentaire (classique, végétarien, végan, sans gluten, halal, casher, etc.)
- Objectifs de santé (maintien du poids, perte de poids, prise de masse musculaire)
- Métabolisme de base (BMR), dépense énergétique totale (TDEE), Indice de Masse Corporelle (IMC) — ces valeurs sont calculées par LIXUM à partir des données ci-dessus

**Données de suivi quotidien** :
- Repas enregistrés (photos analysées, estimations nutritionnelles, macronutriments)
- Activités physiques (type, durée, calories dépensées estimées)
- Humeur et bien-être (mood tracking)
- Hydratation (volumes de boissons consommés)
- Sommeil (si renseigné)

**Données MediBook (optionnelles, sensibles, accès biométrique obligatoire)** :
- Diagnostics médicaux que vous choisissez de renseigner
- Médicaments en cours et posologies
- Allergies alimentaires, médicamenteuses, environnementales
- Historique de vaccinations
- Résultats d'analyses médicales
- Antécédents médicaux personnels et familiaux

**L'accès à MediBook est protégé par authentification biométrique obligatoire** (Face ID, Touch ID ou empreinte digitale Android). Voir section 8 pour plus de détails sur cette protection.

**Données Secret Pocket (chiffrement renforcé)** :
- Informations médicales que vous considérez comme particulièrement sensibles
- Chiffrement applicatif supplémentaire avant stockage en base
- Accès biométrique obligatoire (commun à MediBook)

**Données de la sous-fonctionnalité Silhouette (architecture local-first)** :

La sous-fonctionnalité **Silhouette** de Secret Pocket bénéficie d'une architecture de protection exceptionnelle qui la distingue de toutes les autres données traitées par LIXUM.

- **Photos de silhouette** : stockées **exclusivement sur votre appareil** sous forme **chiffrée** (AES-256-GCM avec clé dérivée de votre biométrie via Keychain iOS ou Android Keystore matériel). Jamais transmises ni stockées sur les serveurs LIXUM, Supabase, Anthropic ou tout autre sous-traitant
- **Mesures morphométriques numériques** (contours, dimensions, ratios) : extraites **localement sur votre appareil** par un algorithme embarqué dans l'application, puis transmises et stockées sur les serveurs LIXUM pour permettre le suivi de votre évolution dans le temps. Les photos source ne quittent jamais votre appareil pour cette extraction
- **Consultation ponctuelle par ALIXEN** : si vous cliquez explicitement sur le bouton "Avoir l'avis d'ALIXEN", vos photos sont temporairement transmises à ALIXEN pour analyse, sans aucune conservation côté serveur (ni LIXUM ni Anthropic)

Cette architecture garantit que même en cas d'incident de sécurité théorique sur nos serveurs, **aucune photo de silhouette ne pourrait être compromise** — ces photos n'existent simplement pas sur nos serveurs.

**Important** : Les données MediBook et Secret Pocket ne sont jamais obligatoires. Vous pouvez utiliser LIXUM sans jamais renseigner la moindre information médicale. Si vous les renseignez, vous pouvez les consulter, les modifier ou les supprimer à tout moment depuis l'interface MedicAi (après authentification biométrique). Pour les photos Silhouette stockées localement, leur suppression est sous votre contrôle exclusif via votre appareil.

### 3.3 Données que LIXUM ne collecte JAMAIS

Pour être totalement transparent avec vous, voici ce que LIXUM ne collecte **à aucun moment** :

- Votre vrai nom civil (prénom et nom de famille)
- Votre adresse postale complète
- Votre numéro de téléphone
- Vos numéros d'identité (carte d'identité, passeport, numéro de sécurité sociale, NINEA)
- Votre géolocalisation GPS précise (seulement le pays déclaré pour les recommandations)
- Vos contacts téléphoniques
- Le contenu de vos SMS, appels ou autres applications installées sur votre appareil
- Vos données bancaires complètes (les paiements passent par des prestataires certifiés conformes à la norme PCI DSS)
- Votre historique de navigation en dehors de LIXUM
- **Vos photos de silhouette** : stockées exclusivement sur votre appareil sous forme chiffrée, jamais transmises ni conservées sur nos serveurs (sauf consultation ponctuelle par ALIXEN sur clic explicite "Avoir l'avis d'ALIXEN")
- **Vos données biométriques** (Face ID, Touch ID, empreintes) : ces données restent dans le Secure Enclave de votre appareil (iOS) ou l'Android Keystore matériel. LIXUM n'y a jamais accès, l'authentification biométrique est gérée nativement par votre système d'exploitation

---

## 4. Finalités et bases légales du traitement

Chaque donnée collectée a une finalité précise et une base légale conforme au RGPD (Article 6) et à l'Article 9 pour les données de santé.

### 4.1 Fourniture du service de base

- **Finalité** : permettre la création de compte, l'authentification, l'utilisation de l'application LIXUM
- **Base légale** : exécution du contrat que vous passez avec LIXUM en acceptant les Termes et Conditions (Article 6.1.b RGPD)
- **Données concernées** : email, mot de passe, LixTag, données techniques, données de session

### 4.2 Calcul des recommandations nutritionnelles personnalisées

- **Finalité** : permettre à ALIXEN, notre intelligence artificielle de coaching nutritionnel, de générer des recommandations adaptées à votre profil
- **Base légale** : consentement explicite que vous donnez lors de l'onboarding (Article 6.1.a et Article 9.2.a RGPD)
- **Données concernées** : données de profil santé, suivi quotidien
- **Retrait** : vous pouvez retirer ce consentement à tout moment en supprimant les données concernées ou votre compte

### 4.3 Tenue d'un journal médical personnel (MediBook)

- **Finalité** : vous permettre de centraliser vos informations médicales dans un espace personnel sécurisé accessible uniquement par vous
- **Base légale** : consentement explicite (Article 9.2.a RGPD)
- **Données concernées** : diagnostics, médicaments, allergies, vaccinations, analyses, antécédents
- **Optionnalité** : cette fonctionnalité est entièrement optionnelle. Aucune donnée n'est collectée si vous ne l'utilisez pas
- **Protection d'accès** : authentification biométrique obligatoire pour ouvrir MediBook

### 4.4 Fonctionnement des fonctionnalités Xscan et CartScan (reconnaissance de plats et de produits)

- **Finalité** : analyse visuelle de photos de plats ou de produits pour estimer leur composition nutritionnelle
- **Base légale** : consentement explicite donné au moment de l'utilisation (Article 6.1.a RGPD)
- **Sous-traitant** : Anthropic (ALIXEN utilise la technologie Claude Vision — voir section 7)
- **Non-conservation** : les images ne sont pas conservées après analyse, seuls les résultats nutritionnels sont stockés dans votre journal de repas

### 4.5 Amélioration du service

- **Finalité** : analyser de manière agrégée et anonymisée l'utilisation de LIXUM pour améliorer l'application (statistiques d'usage, détection de bugs, priorisation des fonctionnalités)
- **Base légale** : intérêt légitime de LIXUM à améliorer son produit (Article 6.1.f RGPD)
- **Protection** : les données sont agrégées, anonymisées et jamais reliables à un utilisateur individuel
- **Opposition** : vous pouvez vous opposer à cette analyse en nous contactant

### 4.6 Communications essentielles et optionnelles

- **Finalité** : envoi d'emails transactionnels (confirmation d'inscription, code OTP, modifications importantes des conditions)
- **Base légale** : exécution du contrat pour les communications essentielles, consentement pour les notifications marketing optionnelles
- **Désactivation** : vous pouvez désactiver toutes les notifications non-essentielles à tout moment depuis votre profil

### 4.7 Obligations légales

- **Finalité** : répondre à des obligations légales (réquisitions judiciaires, prévention de la fraude, conformité fiscale)
- **Base légale** : obligation légale (Article 6.1.c RGPD)
- **Note** : ces cas sont exceptionnels et toujours documentés dans notre registre de traitement

---

## 5. Durée de conservation des données

LIXUM applique le principe de minimisation de la conservation, conformément à l'Article 5.1.e du RGPD. Les données ne sont conservées que le temps nécessaire à leur finalité.

| Type de données | Durée de conservation |
|-----------------|----------------------|
| Compte actif | Tant que le compte est actif |
| Compte supprimé par l'utilisateur | Suppression complète sous 30 jours calendaires |
| Compte inactif au-delà de 24 mois | Email de notification envoyé + suppression automatique après 3 mois supplémentaires sans réaction |
| Données de santé MediBook (serveurs) | Durée identique au compte actif. Suppression immédiate sur votre demande |
| Photos Silhouette (locales) | Sous votre contrôle exclusif. Persistent tant que vous ne les supprimez pas du device |
| Logs techniques et de sécurité | 12 mois maximum |
| Factures et données de paiement | 10 ans (obligation comptable sénégalaise) |
| Registre des consentements | Stockage daté et versionné pendant 5 ans après le retrait du consentement (preuve de conformité RGPD Article 7) |

---

## 6. Vos droits

Conformément au RGPD, à la Loi sénégalaise n° 2008-12, à la Convention de Malabo et aux autres législations applicables, vous disposez des droits suivants sur vos données personnelles.

### 6.1 Droit d'accès (Article 15 RGPD)

Vous pouvez à tout moment demander une copie complète des données personnelles que LIXUM détient sur vous. La réponse vous sera fournie sous format structuré (JSON ou équivalent) dans un délai d'un mois maximum à compter de la réception de votre demande.

**Comment exercer** : envoyez un email à privacy@lixum.com avec pour objet "Demande d'accès à mes données" et votre LixTag.

### 6.2 Droit de rectification (Article 16 RGPD)

Vous pouvez modifier directement la plupart de vos données depuis votre profil LIXUM (Paramètres → Modifier mon profil). Pour les corrections qui nécessitent notre intervention manuelle, contactez privacy@lixum.com.

### 6.3 Droit à l'effacement — droit à l'oubli (Article 17 RGPD)

Vous pouvez supprimer votre compte LIXUM à tout moment depuis l'interface (Profil → Supprimer mon compte). Toutes vos données personnelles seront effacées de nos serveurs sous 30 jours calendaires, à l'exception :

- Des données soumises à une obligation de conservation légale (factures : 10 ans en droit sénégalais)
- Des logs de sécurité déjà agrégés et anonymisés qui ne contiennent plus aucune donnée personnelle identifiable

Concernant vos photos Silhouette stockées localement sur votre appareil : leur suppression est sous votre contrôle exclusif (suppression manuelle ou désinstallation de l'application).

### 6.4 Droit à la limitation du traitement (Article 18 RGPD)

Si vous contestez l'exactitude de vos données ou la licéité de leur traitement, vous pouvez demander la suspension temporaire du traitement le temps que nous procédions à une vérification.

### 6.5 Droit à la portabilité (Article 20 RGPD)

Vous pouvez récupérer vos données dans un format structuré, couramment utilisé et lisible par machine (JSON), pour les transmettre à un autre service de santé si vous le souhaitez. LIXUM s'engage à fournir cette exportation dans un délai d'un mois.

**Comment exercer** : envoyez un email à privacy@lixum.com avec pour objet "Demande de portabilité" et votre LixTag.

### 6.6 Droit d'opposition (Article 21 RGPD)

Vous pouvez vous opposer à tout moment au traitement de vos données pour des finalités de marketing direct. **LIXUM n'utilise jamais vos données de santé à des fins commerciales et ne les transmet jamais à des tiers à cette fin.**

### 6.7 Droit de retirer son consentement (Article 7.3 RGPD)

Vous pouvez retirer à tout moment un consentement que vous avez donné. Le retrait ne remet pas en cause la licéité du traitement effectué avant le retrait. Le retrait peut entraîner la désactivation de certaines fonctionnalités dépendantes de ce consentement.

### 6.8 Droit de ne pas faire l'objet d'une décision automatisée (Article 22 RGPD)

ALIXEN produit des recommandations basées sur vos données, mais ces recommandations ne constituent jamais des décisions automatisées à caractère médical. Vous gardez toujours le contrôle final. **Les recommandations d'ALIXEN ne remplacent pas l'avis d'un professionnel de santé.**

### 6.9 Droit d'introduire une réclamation auprès d'une autorité de contrôle

Si vous estimez que LIXUM ne respecte pas vos droits, vous pouvez saisir l'autorité de contrôle compétente selon votre pays de résidence.

**Autorité principale (siège LIXUM)** :
- **Sénégal** : Commission de Protection des Données Personnelles (CDP) — www.cdp.sn

**Autres autorités selon votre résidence** :
- **France et UE** : Commission Nationale de l'Informatique et des Libertés (CNIL) — www.cnil.fr
- **Royaume-Uni** : Information Commissioner's Office (ICO) — www.ico.org.uk
- **Côte d'Ivoire** : Autorité de Régulation des Télécommunications de Côte d'Ivoire (ARTCI) — www.autoritedeprotection.ci
- **Cameroun** : Autorité de Protection des Données à Caractère Personnel (APDP Cameroun)
- **Autres pays** : autorité nationale compétente selon votre législation locale

Nous vous encourageons néanmoins à nous contacter directement à privacy@lixum.com avant toute réclamation afin que nous puissions tenter de trouver une solution amiable rapidement.

---

## 7. Sous-traitants et transferts internationaux

Pour fonctionner, LIXUM fait appel à deux sous-traitants techniques qualifiés. Nous avons choisi ces partenaires pour leur sérieux en matière de protection des données et leur conformité aux standards internationaux.

### 7.1 Supabase — Base de données et authentification

- **Rôle** : hébergement de la base de données, gestion de l'authentification, stockage chiffré des mots de passe
- **Localisation des serveurs** : Europe (Francfort, Allemagne)
- **Conformité** : Supabase Inc. est conforme au RGPD et dispose d'un Data Processing Agreement (DPA) signé avec LIXUM
- **Chiffrement** : base de données chiffrée au repos en AES-256, transmissions en TLS 1.3
- **Politique de confidentialité Supabase** : supabase.com/privacy

### 7.2 Anthropic — Technologie IA d'ALIXEN

- **Rôle** : fournisseur de la technologie Claude qui alimente ALIXEN et les fonctionnalités Xscan, CartScan, et coaching nutritionnel conversationnel
- **Traitement** : Anthropic traite les requêtes que vous envoyez à ALIXEN pour générer des réponses personnalisées en temps réel
- **Engagement non-entraînement** : LIXUM utilise l'API Anthropic configurée pour que **vos données ne soient jamais utilisées pour entraîner les modèles IA d'Anthropic**. Cet engagement est contractualisé dans les conditions d'utilisation de l'API
- **Localisation des serveurs** : États-Unis
- **Encadrement du transfert** : transfert encadré par les Clauses Contractuelles Types (CCT) de la Commission européenne, conformes à l'arrêt Schrems II
- **Politique de confidentialité Anthropic** : www.anthropic.com/privacy

### 7.3 Transferts internationaux de données

Certaines de vos données peuvent transiter vers des serveurs situés en dehors de votre pays de résidence. LIXUM s'assure que ces transferts sont encadrés juridiquement :

- **Vers l'Union européenne (Allemagne pour Supabase)** : transfert intra-EU, pas de formalité particulière
- **Vers les États-Unis (Anthropic)** : Clauses Contractuelles Types (CCT) de la Commission européenne validées, avec garanties complémentaires post-Schrems II
- **Depuis le Sénégal** : conformité à l'Article 24 de la Loi n° 2008-12 sur les transferts internationaux de données
- **Depuis la France ou l'UE** : conformité au Chapitre V du RGPD (Articles 44 à 50)

### 7.4 Engagement sur les sous-traitants futurs

Si LIXUM fait appel à de nouveaux sous-traitants à l'avenir (prestataire de paiement, service d'envoi d'emails, outil d'analytics), nous :

1. Les mentionnerons explicitement dans une version mise à jour de cette Politique
2. Vous informerons via notification in-app de cette mise à jour
3. Ne les ferons intervenir qu'après avoir signé un DPA garantissant le même niveau de protection de vos données

---

## 8. Sécurité des données

LIXUM prend la sécurité de vos données très au sérieux. Notre architecture de sécurité repose sur **plusieurs couches complémentaires**, chacune renforçant la précédente.

### 8.1 Chiffrement standard

- **Données au repos sur serveurs** : base de données chiffrée en AES-256 via Supabase
- **Données en transit** : toutes les communications entre votre appareil et les serveurs LIXUM utilisent TLS 1.3
- **Mots de passe** : stockés sous forme de hash bcrypt (impossible à déchiffrer, même par LIXUM)

### 8.2 Authentification standard

- **Mot de passe requis** : minimum 8 caractères
- **Confirmation par email OTP** : code à 6 chiffres envoyé à chaque nouvelle inscription, expiration 10 minutes
- **Sessions sécurisées** : tokens d'authentification à durée limitée avec rotation automatique

### 8.3 Contrôle d'accès serveur

- **Row Level Security (RLS)** : chaque utilisateur ne peut accéder qu'à ses propres données grâce à des politiques de sécurité au niveau base de données
- **Principe du moindre privilège** : seuls les processus strictement nécessaires ont accès aux données
- **Journalisation des accès** : tous les accès aux données sensibles sont tracés pour détection d'anomalies

### 8.4 Pseudonymisation structurelle

Grâce au système LixTag, même en cas de compromission théorique de la base de données, un attaquant n'obtiendrait que des LixTags anonymes, des emails et des données de santé — mais aucun nom civil, aucune adresse, aucun identifiant administratif qui permettrait de vous identifier facilement dans le monde réel.

### 8.5 Authentification biométrique pour MediBook

Compte tenu de la nature particulièrement sensible des données médicales (diagnostics, médicaments, allergies, vaccinations, antécédents personnels et familiaux), **l'accès à MediBook est protégé par authentification biométrique obligatoire** :

- **Face ID** sur iOS
- **Touch ID** sur iOS
- **Empreinte digitale** sur Android
- **Reconnaissance faciale** sur Android (selon disponibilité du device)

**Garanties de cette protection** :

- Si vous prêtez votre téléphone déverrouillé à quelqu'un, MediBook reste verrouillé sans biométrie
- En cas de vol de votre téléphone, MediBook est inaccessible sans votre biométrie
- L'authentification biométrique est gérée nativement par votre système d'exploitation (iOS ou Android). **LIXUM n'a jamais accès à vos données biométriques** — elles restent dans le Secure Enclave (iOS) ou l'Android Keystore matériel
- Verrouillage automatique en cas d'inactivité prolongée
- Verrouillage automatique en cas de mise en arrière-plan de l'application

Cette protection couvre l'intégralité de MediBook : données médicales standard, Secret Pocket, et fonctionnalité Silhouette.

### 8.6 Architecture local-first et chiffrement renforcé pour Silhouette

Pour la fonctionnalité **Silhouette** de Secret Pocket, LIXUM applique le **niveau de protection le plus élevé de l'application** grâce à une combinaison d'architecture local-first et de chiffrement matériel.

**Stockage local exclusif**

Les photos de Silhouette sont stockées **exclusivement sur votre appareil** dans le dossier privé de l'application LIXUM (zone d'isolation système gérée par iOS/Android). Elles ne sont jamais transmises ni stockées sur les serveurs LIXUM, Supabase, Anthropic ou tout autre sous-traitant.

**Chiffrement applicatif AES-256-GCM**

Avant écriture sur le disque de votre appareil, chaque photo Silhouette est chiffrée localement avec :

- Algorithme **AES-256-GCM** (Advanced Encryption Standard 256 bits, mode Galois/Counter Mode)
- Clé de chiffrement unique par utilisateur, stockée dans le **Secure Enclave** (iOS) ou l'**Android Keystore matériel** (TEE — Trusted Execution Environment)
- La clé est dérivée de votre authentification biométrique : sans votre Face ID, Touch ID ou empreinte, la clé de déchiffrement est inaccessible

**Conséquences pratiques de cette double protection** :

- Si quelqu'un accède au dossier de l'application LIXUM sur votre téléphone (par root Android ou jailbreak iOS), il trouvera des fichiers chiffrés illisibles
- Sans votre biométrie, ces fichiers ne peuvent jamais être déchiffrés
- LIXUM elle-même ne peut pas déchiffrer ces photos (la clé n'existe que dans votre device)
- Les sauvegardes iCloud / Google Drive ne contiennent pas ces photos en clair (le dossier privé app est exclu par défaut)

**Application des principes RGPD**

Cette architecture est l'application directe des principes de **minimisation des données** (Article 5.1.c RGPD) et de **protection des données dès la conception** (Article 25 RGPD). Elle représente notre engagement le plus fort en matière de privacy by design.

### 8.7 Guide photo et protections complémentaires (Silhouette)

Pour renforcer encore la protection de vos données morphologiques, LIXUM met à votre disposition un **guide photo** lors de chaque ajout de photo Silhouette. Ce guide vous recommande notamment :

- De ne **pas inclure votre visage** dans le cadrage (cadrer du cou aux pieds)
- De vous positionner face à un mur uni
- De prendre les photos en lumière naturelle pour une meilleure précision des mesures
- De porter des vêtements ajustés pour des mesures cohérentes dans le temps

**Évolution future** : une fonctionnalité de **floutage automatique du visage** sera disponible dans une future version de LIXUM. Cette fonctionnalité utilisera une détection de visage 100% locale (sans transmission cloud) pour appliquer automatiquement un floutage gaussien sur la zone du visage avant chiffrement et stockage.

### 8.8 Obligations en cas de violation de données

Conformément à l'Article 33 du RGPD et à la Loi sénégalaise n° 2008-12, en cas de violation de données personnelles à haut risque, LIXUM s'engage à :

1. Notifier l'autorité de contrôle compétente (CDP Sénégal en priorité, CNIL si utilisateurs UE concernés) dans un délai de 72 heures
2. Vous informer directement si la violation présente un risque élevé pour vos droits et libertés
3. Documenter toute violation, même non notifiable, dans notre registre interne

**Note importante** : grâce à notre architecture local-first pour Silhouette et au chiffrement matériel, les photos de silhouette ne pourraient jamais faire l'objet d'une violation de données côté serveur — elles n'existent simplement pas sur nos infrastructures.

---

## 9. Cookies et traceurs

LIXUM étant principalement une application mobile, l'usage de cookies est limité.

### 9.1 Application mobile

L'application mobile LIXUM n'utilise pas de cookies au sens classique du terme. Elle utilise uniquement :

- Un **token d'authentification** stocké localement sur votre appareil (nécessaire au fonctionnement, non traçant)
- Un **cache local** pour améliorer les performances (images, données consultées récemment)
- Un **stockage local** pour préserver votre progression en cas de fermeture de l'application
- Un **stockage chiffré local** pour les photos Silhouette (voir section 8.6)

### 9.2 Site web futur lixum.com

Lorsque le site web lixum.com sera en ligne, il pourra utiliser :

- Des **cookies essentiels** pour le fonctionnement du site (non soumis à consentement)
- Des **cookies de mesure d'audience** agrégée et anonymisée (soumis à consentement explicite conforme aux exigences de la CNIL et de la CDP)

Une bannière de consentement cookies conforme sera mise en place le moment venu.

---

## 10. Mineurs

LIXUM est conçue pour les utilisateurs âgés de **16 ans ou plus**, conformément à l'Article 8 du RGPD applicable aux utilisateurs de l'Union européenne.

- Cet âge minimum s'applique également dans les autres juridictions, par alignement sur le standard européen le plus protecteur
- Si vous avez moins de 16 ans, vous ne devez pas créer de compte LIXUM sans l'autorisation explicite d'un représentant légal
- Si nous apprenons qu'un utilisateur mineur a créé un compte sans autorisation parentale, nous supprimons son compte et ses données dans les meilleurs délais
- Les parents et tuteurs légaux peuvent nous contacter à privacy@lixum.com pour demander la suppression du compte d'un mineur

---

## 11. Modifications de cette Politique

Cette Politique de Confidentialité est un document vivant qui évoluera avec LIXUM et avec les cadres juridiques applicables.

### 11.1 Versioning

Chaque version de ce document est archivée et datée. La version courante est toujours accessible depuis votre profil LIXUM.

### 11.2 Modifications mineures

Les modifications mineures (corrections typographiques, clarifications sans changement de portée, mise à jour des informations administratives telles que NINEA, RCCM, adresse précise du siège après constitution officielle de LIXUM SAS) sont publiées sans notification particulière. Vous pouvez consulter l'historique des versions à tout moment.

### 11.3 Modifications substantielles

Les modifications substantielles (nouvelles catégories de données collectées, nouveaux sous-traitants, nouvelles finalités de traitement) déclenchent :

1. Une **notification in-app** lors de votre prochaine connexion
2. Un **écran de re-consentement** obligatoire présentant les changements
3. La **conservation de votre consentement précédent** dans notre registre, daté à la version exacte que vous aviez vue

Vous pouvez refuser les modifications substantielles, auquel cas vous devrez soit accepter pour continuer à utiliser LIXUM, soit supprimer votre compte.

---

## 12. Dispositions finales

### 12.1 Droit applicable

Cette Politique est soumise au droit sénégalais. Pour les utilisateurs résidant dans l'Union européenne, les dispositions impératives du RGPD s'appliquent également.

### 12.2 Juridiction compétente

Tout litige relatif à cette Politique qui n'aurait pas pu être résolu à l'amiable sera soumis à la juridiction compétente de Dakar, Sénégal, sous réserve des règles de compétence impératives protégeant les consommateurs dans certaines juridictions (notamment l'Union européenne).

### 12.3 Contact

Pour toute question relative à cette Politique de Confidentialité ou à vos données personnelles :

- **Email privacy général** : privacy@lixum.com
- **Email Délégué à la Protection des Données (DPO)** : dpo@lixum.com
- **Courrier postal** : LIXUM SAS — Dakar, Sénégal (**adresse précise en cours de finalisation, sera communiquée dès constitution officielle de la société**)

### 12.4 Engagement d'évolution professionnelle

Cette version 1.0 beta a été rédigée avec un soin particulier en s'appuyant sur les cadres juridiques applicables. Nous nous engageons à faire valider et enrichir ce document par un cabinet juridique spécialisé en droit de la protection des données avant le lancement grand public de LIXUM. Les éventuelles mises à jour issues de cette révision professionnelle vous seront communiquées selon la procédure prévue à la section 11.3.

---

**Version 1.0 beta • 19 avril 2026**

**LIXUM SAS (en cours de constitution) • Dakar, Sénégal**

**privacy@lixum.com • dpo@lixum.com**

**Une application conçue en Afrique, pour le monde.**

Ce document est mis à jour régulièrement. Les modifications substantielles déclenchent une demande de re-consentement lors de votre prochaine connexion à LIXUM.
