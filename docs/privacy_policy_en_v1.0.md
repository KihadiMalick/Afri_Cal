# LIXUM PRIVACY POLICY

**Version 1.0 beta • Effective date: 19 April 2026**

Living document — any substantial modification triggers a re-consent request upon your next login to LIXUM.

---

## Preamble — Our philosophy

LIXUM is a mobile health and nutrition application **designed in Africa, for the world**. We are proud of our origins: LIXUM was born in Senegal, driven by a clear ambition — to demonstrate that world-class technology can emerge from the African continent and serve every user, regardless of their country of residence.

Our founding philosophy is straightforward: **privacy is not an option, it is the very architecture of our product**.

Unlike most health applications, LIXUM never collects your civil name, your national ID number, your social security number, or any administrative identifier. Your identity within LIXUM is represented by a **LixTag** — a unique random identifier (example: `LXM-QJLMVQ`) automatically generated upon registration.

This structural approach allows us to offer **pseudonymisation by design**, in accordance with Article 25 of the European General Data Protection Regulation (GDPR), and represents a concrete commitment to your digital autonomy.

This document transparently explains how LIXUM collects, processes, retains and protects your data, along with the rights you have to take back control at any time.

---

## 1. Data controller

LIXUM is developed and operated by:

- **Legal name**: LIXUM SAS (**in the process of incorporation**)
- **Planned legal form**: Simplified Joint-Stock Company (SAS) under Senegalese law
- **Planned registered office**: Dakar, Republic of Senegal (**precise address being finalised**)
- **National Business and Association Identification Number (NINEA)**: **pending attribution**
- **Commercial and Personal Property Credit Register (RCCM)**: **registration in progress**
- **Founder and President**: Malick Thiam
- **Privacy contact**: privacy@lixum.com
- **Data Protection Officer (DPO) contact**: dpo@lixum.com

As data controller within the meaning of Senegalese Law No. 2008-12 of 25 January 2008 on the protection of personal data and Article 4.7 of the GDPR, LIXUM determines the purposes and means of the processing of your personal data.

**Transparency note**: administrative details marked "in progress" will be updated in a subsequent version of this document once LIXUM SAS incorporation procedures are finalised. You will be notified of this update through the procedure described in section 11.

---

## 2. Scope of application

This Privacy Policy applies to:

- The LIXUM mobile application (Android, iOS forthcoming)
- Associated web services (future lixum.com website, administrative interfaces)
- Communications via email, push notifications and SMS emitted from the LIXUM ecosystem

It applies to any user worldwide, regardless of their country of residence. The following legal frameworks may apply to you depending on your geographic situation.

### 2.1 Primary legal framework — Senegal

LIXUM's registered office.

- **Law No. 2008-12 of 25 January 2008** on the protection of personal data and its ongoing revisions
- Supervisory authority: **Personal Data Protection Commission (CDP)** based in Dakar — www.cdp.sn

### 2.2 West African regional framework

- **Supplementary Act A/SA.1/01/10** of ECOWAS (Economic Community of West African States) on the protection of personal data
- **Malabo Convention** of the African Union (2014) on cybersecurity and the protection of personal data

### 2.3 European framework

Applicable to any user residing in the European Union or the European Economic Area, regardless of their country of origin.

- **Regulation (EU) 2016/679** of 27 April 2016 (GDPR)
- **France**: French Data Protection Act (Loi Informatique et Libertés), National Commission on Informatics and Liberty (CNIL) — www.cnil.fr
- Equivalent supervisory authorities in other EU Member States

### 2.4 United Kingdom

Applicable to any user residing in the United Kingdom.

- **UK GDPR** and **Data Protection Act 2018**
- Supervisory authority: **Information Commissioner's Office (ICO)** — www.ico.org.uk

### 2.5 United States

Applicable to any user residing in the United States, particularly in California.

- **California Consumer Privacy Act (CCPA)** as amended by the CPRA
- Other applicable US state privacy laws (Virginia CDPA, Colorado CPA, Connecticut CTDPA, etc.)
- **Health Insurance Portability and Accountability Act (HIPAA)**: LIXUM is not a "covered entity" under HIPAA, but we apply equivalent protection standards to your health data

### 2.6 Other jurisdictions

- **Canada**: Personal Information Protection and Electronic Documents Act (PIPEDA)
- **Côte d'Ivoire**: Law No. 2013-450 of 19 June 2013, Telecommunications Regulation Authority of Côte d'Ivoire (ARTCI) — www.autoritedeprotection.ci
- **Cameroon**: Law No. 2024/017 of 23 December 2024, applicable from 23 June 2026, Personal Data Protection Authority (APDP Cameroun)
- **Democratic Republic of Congo**: legal framework under consolidation, principles of the Malabo Convention applied
- **Burundi**: Law No. 1/012 of 30 May 2018 on the Digital Code
- **Other countries**: application of general principles of data protection and applicable local rules

---

## 3. Data collected

LIXUM clearly distinguishes two categories of data according to their level of sensitivity.

### 3.1 Technical and authentication data (standard category)

This data is necessary for the functioning of the application:

- **Email**: used for authentication, account recovery, and essential communications
- **Password**: stored in encrypted and irreversible form (bcrypt algorithm via Supabase Auth, never accessible in plain text, even by LIXUM)
- **LixTag**: anonymous identifier randomly generated upon registration (example: `LXM-QJLMVQ`)
- **Display Name**: display name that YOU freely choose (first name, nickname, emoji, or left blank). LIXUM never asks for your real civil name
- **Session data**: authentication token, date of last connection
- **Technical data**: device type (Android or iOS), installed application version, preferred language
- **Country of residence**: only for ALIXEN's geolocated recommendations (never precise GPS geolocation)

### 3.2 Health and nutrition data (special category — GDPR Article 9)

This data is processed with enhanced protection, in accordance with Article 9 of the GDPR and Article 15 of Senegalese Law No. 2008-12. It is never collected without your explicit and specific consent.

**Health profile data**:
- Age, sex, weight, height
- Self-reported physical activity level
- Dietary regime (standard, vegetarian, vegan, gluten-free, halal, kosher, etc.)
- Health objectives (weight maintenance, weight loss, muscle mass gain)
- Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), Body Mass Index (BMI) — these values are calculated by LIXUM based on the data above

**Daily tracking data**:
- Recorded meals (analysed photos, nutritional estimates, macronutrients)
- Physical activities (type, duration, estimated calories burned)
- Mood and well-being (mood tracking)
- Hydration (volumes of beverages consumed)
- Sleep (if provided)

**MediBook data (optional, sensitive, mandatory biometric access)**:
- Medical diagnoses you choose to enter
- Current medications and dosages
- Food, drug, and environmental allergies
- Vaccination history
- Medical test results
- Personal and family medical history

**Access to MediBook is protected by mandatory biometric authentication** (Face ID, Touch ID, or Android fingerprint). See section 8 for more details on this protection.

**Secret Pocket data (enhanced encryption)**:
- Medical information you consider particularly sensitive
- Additional application-level encryption before database storage
- Mandatory biometric access (shared with MediBook)

**Silhouette sub-feature data (local-first architecture)**:

The **Silhouette** sub-feature of Secret Pocket benefits from an exceptional protection architecture that distinguishes it from all other data processed by LIXUM.

- **Silhouette photos**: stored **exclusively on your device** in **encrypted form** (AES-256-GCM with a key derived from your biometrics via Keychain iOS or hardware Android Keystore). Never transmitted to or stored on LIXUM servers, Supabase, Anthropic, or any other subprocessor
- **Numerical morphometric measurements** (contours, dimensions, ratios): extracted **locally on your device** by an algorithm embedded in the application, then transmitted and stored on LIXUM servers to enable tracking of your evolution over time. The source photos never leave your device for this extraction
- **One-time consultation by ALIXEN**: if you explicitly click the "Get ALIXEN's opinion" button, your photos are temporarily transmitted to ALIXEN for analysis, with no server-side retention (neither LIXUM nor Anthropic)

This architecture ensures that even in the event of a theoretical security incident on our servers, **no silhouette photo could be compromised** — these photos simply do not exist on our servers.

**Important**: MediBook and Secret Pocket data are never mandatory. You can use LIXUM without ever entering any medical information. If you do enter it, you can view, modify, or delete it at any time from the MedicAi interface (after biometric authentication). For locally stored Silhouette photos, their deletion is under your exclusive control via your device.

### 3.3 Data LIXUM NEVER collects

To be completely transparent with you, here is what LIXUM **never collects under any circumstances**:

- Your real civil name (first name and surname)
- Your complete postal address
- Your telephone number
- Your identity numbers (national ID card, passport, social security number, NINEA)
- Your precise GPS geolocation (only the declared country for recommendations)
- Your phone contacts
- The content of your SMS, calls, or other applications installed on your device
- Your complete banking details (payments go through PCI DSS certified providers)
- Your browsing history outside of LIXUM
- **Your silhouette photos**: stored exclusively on your device in encrypted form, never transmitted to or retained on our servers (except for one-time consultation by ALIXEN upon explicit click on "Get ALIXEN's opinion")
- **Your biometric data** (Face ID, Touch ID, fingerprints): this data remains within the Secure Enclave of your device (iOS) or hardware Android Keystore. LIXUM never has access to it; biometric authentication is handled natively by your operating system

---

## 4. Purposes and legal bases for processing

Each data item collected has a precise purpose and a legal basis compliant with the GDPR (Article 6) and Article 9 for health data.

### 4.1 Provision of the core service

- **Purpose**: to enable account creation, authentication, and use of the LIXUM application
- **Legal basis**: performance of the contract you enter into with LIXUM by accepting the Terms and Conditions (GDPR Article 6.1.b)
- **Data concerned**: email, password, LixTag, technical data, session data

### 4.2 Calculation of personalised nutritional recommendations

- **Purpose**: to enable ALIXEN, our AI nutritional coaching intelligence, to generate recommendations tailored to your profile
- **Legal basis**: explicit consent you give during onboarding (GDPR Articles 6.1.a and 9.2.a)
- **Data concerned**: health profile data, daily tracking
- **Withdrawal**: you can withdraw this consent at any time by deleting the relevant data or your account

### 4.3 Keeping a personal medical journal (MediBook)

- **Purpose**: to allow you to centralise your medical information in a personal, secure space accessible only by you
- **Legal basis**: explicit consent (GDPR Article 9.2.a)
- **Data concerned**: diagnoses, medications, allergies, vaccinations, analyses, medical history
- **Optionality**: this feature is entirely optional. No data is collected if you do not use it
- **Access protection**: mandatory biometric authentication required to open MediBook

### 4.4 Operation of Xscan and CartScan features (meal and product recognition)

- **Purpose**: visual analysis of photos of meals or products to estimate their nutritional composition
- **Legal basis**: explicit consent given at the time of use (GDPR Article 6.1.a)
- **Subprocessor**: Anthropic (ALIXEN uses Claude Vision technology — see section 7)
- **Non-retention**: images are not retained after analysis, only nutritional results are stored in your meal journal

### 4.5 Service improvement

- **Purpose**: to analyse the use of LIXUM in an aggregated and anonymised manner to improve the application (usage statistics, bug detection, feature prioritisation)
- **Legal basis**: legitimate interest of LIXUM to improve its product (GDPR Article 6.1.f)
- **Protection**: data is aggregated, anonymised, and never traceable to an individual user
- **Objection**: you can object to this analysis by contacting us

### 4.6 Essential and optional communications

- **Purpose**: sending transactional emails (registration confirmation, OTP code, important changes to terms)
- **Legal basis**: performance of the contract for essential communications, consent for optional marketing notifications
- **Deactivation**: you can deactivate all non-essential notifications at any time from your profile

### 4.7 Legal obligations

- **Purpose**: to respond to legal obligations (judicial requisitions, fraud prevention, tax compliance)
- **Legal basis**: legal obligation (GDPR Article 6.1.c)
- **Note**: these cases are exceptional and always documented in our processing register

---

## 5. Data retention periods

LIXUM applies the principle of storage limitation, in accordance with Article 5.1.e of the GDPR. Data is retained only for the time necessary for its purpose.

| Type of data | Retention period |
|-----------------|----------------------|
| Active account | As long as the account is active |
| Account deleted by user | Complete deletion within 30 calendar days |
| Account inactive beyond 24 months | Email notification sent + automatic deletion after 3 additional months without response |
| MediBook health data (servers) | Duration identical to active account. Immediate deletion upon your request |
| Silhouette photos (local) | Under your exclusive control. Persist as long as you do not delete them from the device |
| Technical and security logs | 12 months maximum |
| Invoices and payment data | 10 years (Senegalese accounting obligation) |
| Register of consents | Dated and versioned storage for 5 years after consent withdrawal (GDPR Article 7 compliance proof) |

---

## 6. Your rights

In accordance with the GDPR, Senegalese Law No. 2008-12, the Malabo Convention, the UK GDPR, the CCPA, PIPEDA, and other applicable legislations, you have the following rights over your personal data.

### 6.1 Right of access (GDPR Article 15 / CCPA Right to Know)

You can at any time request a complete copy of the personal data that LIXUM holds about you. The response will be provided in a structured format (JSON or equivalent) within a maximum of one month from receipt of your request (45 days under CCPA, extendable to 90 days).

**How to exercise**: send an email to privacy@lixum.com with the subject "Data access request" and your LixTag.

### 6.2 Right to rectification (GDPR Article 16 / CCPA Right to Correct)

You can directly modify most of your data from your LIXUM profile (Settings → Edit my profile). For corrections that require our manual intervention, contact privacy@lixum.com.

### 6.3 Right to erasure — "right to be forgotten" (GDPR Article 17 / CCPA Right to Delete)

You can delete your LIXUM account at any time from the interface (Profile → Delete my account). All your personal data will be erased from our servers within 30 calendar days, with the exception of:

- Data subject to a legal retention obligation (invoices: 10 years under Senegalese law)
- Already aggregated and anonymised security logs that no longer contain any identifiable personal data

Regarding your Silhouette photos stored locally on your device: their deletion is under your exclusive control (manual deletion or uninstallation of the application).

### 6.4 Right to restriction of processing (GDPR Article 18)

If you contest the accuracy of your data or the lawfulness of its processing, you can request a temporary suspension of processing while we verify.

### 6.5 Right to data portability (GDPR Article 20)

You can retrieve your data in a structured, commonly used, and machine-readable format (JSON), to transmit it to another health service if you wish. LIXUM undertakes to provide this export within one month.

**How to exercise**: send an email to privacy@lixum.com with the subject "Portability request" and your LixTag.

### 6.6 Right to object (GDPR Article 21 / CCPA Right to Opt-Out)

You can object at any time to the processing of your data for direct marketing purposes. **LIXUM never uses your health data for commercial purposes and never transmits it to third parties for such purposes.**

**CCPA specific**: if you are a California resident, you have the right to opt out of the "sale" or "sharing" of your personal information. LIXUM does not sell or share your personal information with third parties for monetary or other valuable consideration.

### 6.7 Right to withdraw consent (GDPR Article 7.3)

You can withdraw at any time a consent you have given. Withdrawal does not affect the lawfulness of processing carried out before withdrawal. Withdrawal may result in the deactivation of certain features dependent on that consent.

### 6.8 Right not to be subject to automated decision-making (GDPR Article 22)

ALIXEN produces recommendations based on your data, but these recommendations never constitute automated decisions of a medical nature. You always retain final control. **ALIXEN's recommendations do not replace the advice of a healthcare professional.**

### 6.9 Right to non-discrimination (CCPA specific)

If you are a California resident, LIXUM will not discriminate against you for exercising your CCPA rights. We will not deny you services, charge different prices, or provide different quality of service solely because you exercised your rights.

### 6.10 Right to lodge a complaint with a supervisory authority

If you believe that LIXUM does not respect your rights, you can contact the competent supervisory authority according to your country of residence.

**Primary authority (LIXUM registered office)**:
- **Senegal**: Personal Data Protection Commission (CDP) — www.cdp.sn

**Other authorities depending on your residence**:
- **France and EU**: National Commission on Informatics and Liberty (CNIL) — www.cnil.fr
- **United Kingdom**: Information Commissioner's Office (ICO) — www.ico.org.uk
- **California, USA**: California Privacy Protection Agency (CPPA) — cppa.ca.gov
- **Other US states**: your State Attorney General's office
- **Canada**: Office of the Privacy Commissioner of Canada — www.priv.gc.ca
- **Côte d'Ivoire**: Telecommunications Regulation Authority (ARTCI) — www.autoritedeprotection.ci
- **Cameroon**: Personal Data Protection Authority (APDP Cameroon)
- **Other countries**: competent national authority according to your local legislation

We nevertheless encourage you to contact us directly at privacy@lixum.com before any complaint, so that we can attempt to find an amicable solution quickly.

---

## 7. Subprocessors and international transfers

To operate, LIXUM relies on two qualified technical subprocessors. We have chosen these partners for their seriousness in data protection and their compliance with international standards.

### 7.1 Supabase — Database and authentication

- **Role**: database hosting, authentication management, encrypted password storage
- **Server location**: Europe (Frankfurt, Germany)
- **Compliance**: Supabase Inc. is GDPR-compliant and has a Data Processing Agreement (DPA) signed with LIXUM
- **Encryption**: database encrypted at rest in AES-256, transmissions in TLS 1.3
- **Supabase privacy policy**: supabase.com/privacy

### 7.2 Anthropic — ALIXEN AI technology

- **Role**: provider of Claude technology that powers ALIXEN and the Xscan, CartScan, and conversational nutritional coaching features
- **Processing**: Anthropic processes the queries you send to ALIXEN to generate real-time personalised responses
- **Non-training commitment**: LIXUM uses the Anthropic API configured so that **your data is never used to train Anthropic's AI models**. This commitment is contractualised in the API terms of use
- **Server location**: United States
- **Transfer framework**: transfer framed by the European Commission's Standard Contractual Clauses (SCCs), compliant with the Schrems II ruling
- **Anthropic privacy policy**: www.anthropic.com/privacy

### 7.3 International data transfers

Some of your data may transit to servers located outside your country of residence. LIXUM ensures these transfers are legally framed:

- **To the European Union (Germany for Supabase)**: intra-EU transfer, no particular formality
- **To the United States (Anthropic)**: validated European Commission Standard Contractual Clauses (SCCs), with supplementary safeguards post-Schrems II
- **From Senegal**: compliance with Article 24 of Law No. 2008-12 on international data transfers
- **From France or the EU**: compliance with Chapter V of the GDPR (Articles 44 to 50)
- **From the UK**: compliance with the UK International Data Transfer Agreement (IDTA) or equivalent
- **From California**: compliance with CCPA provisions on out-of-state transfers

### 7.4 Commitment on future subprocessors

If LIXUM engages new subprocessors in the future (payment provider, email sending service, analytics tool), we will:

1. Explicitly mention them in an updated version of this Policy
2. Inform you via in-app notification of this update
3. Only engage them after signing a DPA guaranteeing the same level of protection for your data

---

## 8. Data security

LIXUM takes the security of your data very seriously. Our security architecture relies on **multiple complementary layers**, each reinforcing the previous one.

### 8.1 Standard encryption

- **Data at rest on servers**: database encrypted in AES-256 via Supabase
- **Data in transit**: all communications between your device and LIXUM servers use TLS 1.3
- **Passwords**: stored as bcrypt hashes (impossible to decrypt, even by LIXUM)

### 8.2 Standard authentication

- **Required password**: minimum 8 characters
- **Email OTP confirmation**: 6-digit code sent at each new registration, 10-minute expiration
- **Secure sessions**: authentication tokens with limited duration and automatic rotation

### 8.3 Server-side access control

- **Row Level Security (RLS)**: each user can access only their own data thanks to database-level security policies
- **Principle of least privilege**: only strictly necessary processes have access to data
- **Access logging**: all access to sensitive data is traced for anomaly detection

### 8.4 Structural pseudonymisation

Thanks to the LixTag system, even in the theoretical event of a database compromise, an attacker would only obtain anonymous LixTags, emails, and health data — but no civil name, no address, no administrative identifier that would easily identify you in the real world.

### 8.5 Mandatory biometric authentication for MediBook

Given the particularly sensitive nature of medical data (diagnoses, medications, allergies, vaccinations, personal and family medical history), **access to MediBook is protected by mandatory biometric authentication**:

- **Face ID** on iOS
- **Touch ID** on iOS
- **Fingerprint** on Android
- **Facial recognition** on Android (depending on device availability)

**Guarantees of this protection**:

- If you lend your unlocked phone to someone, MediBook remains locked without biometrics
- In case of phone theft, MediBook is inaccessible without your biometrics
- Biometric authentication is handled natively by your operating system (iOS or Android). **LIXUM never has access to your biometric data** — it remains within the Secure Enclave (iOS) or hardware Android Keystore
- Automatic lockout in case of prolonged inactivity
- Automatic lockout when the application moves to the background

This protection covers the entirety of MediBook: standard medical data, Secret Pocket, and the Silhouette feature.

### 8.6 Local-first architecture and enhanced encryption for Silhouette

For the **Silhouette** feature of Secret Pocket, LIXUM applies the **highest level of protection of the application** through a combination of local-first architecture and hardware encryption.

**Exclusive local storage**

Silhouette photos are stored **exclusively on your device** in the LIXUM application's private folder (system isolation zone managed by iOS/Android). They are never transmitted to or stored on LIXUM servers, Supabase, Anthropic, or any other subprocessor.

**AES-256-GCM application-level encryption**

Before being written to your device's disk, each Silhouette photo is locally encrypted with:

- **AES-256-GCM** algorithm (Advanced Encryption Standard 256 bits, Galois/Counter Mode)
- Unique encryption key per user, stored in the **Secure Enclave** (iOS) or hardware **Android Keystore** (TEE — Trusted Execution Environment)
- The key is derived from your biometric authentication: without your Face ID, Touch ID, or fingerprint, the decryption key is inaccessible

**Practical consequences of this dual protection**:

- If someone accesses the LIXUM application folder on your phone (via Android root or iOS jailbreak), they will find unreadable encrypted files
- Without your biometrics, these files can never be decrypted
- LIXUM itself cannot decrypt these photos (the key only exists on your device)
- iCloud / Google Drive backups do not contain these photos in clear (the private app folder is excluded by default)

**Application of GDPR principles**

This architecture is the direct application of the principles of **data minimisation** (GDPR Article 5.1.c) and **data protection by design** (GDPR Article 25). It represents our strongest commitment to privacy by design.

### 8.7 Photo guide and complementary protections (Silhouette)

To further reinforce the protection of your morphological data, LIXUM provides a **photo guide** each time you add a Silhouette photo. This guide notably recommends:

- **Not including your face** in the framing (frame from the neck down to the feet)
- Positioning yourself in front of a plain wall
- Taking photos in natural light for better measurement accuracy
- Wearing fitted clothing for consistent measurements over time

**Future evolution**: an **automatic face blurring** feature will be available in a future version of LIXUM. This feature will use 100% local face detection (without cloud transmission) to automatically apply Gaussian blurring to the face area before encryption and storage.

### 8.8 Data breach obligations

In accordance with Article 33 of the GDPR and Senegalese Law No. 2008-12, in the event of a high-risk personal data breach, LIXUM undertakes to:

1. Notify the competent supervisory authority (CDP Senegal as priority, CNIL if EU users concerned, ICO if UK users concerned) within 72 hours
2. Inform you directly if the breach presents a high risk to your rights and freedoms
3. Document any breach, even non-notifiable, in our internal register

**Important note**: thanks to our local-first architecture for Silhouette and hardware encryption, silhouette photos could never be subject to a server-side data breach — they simply do not exist on our infrastructure.

---

## 9. Cookies and trackers

Since LIXUM is primarily a mobile application, cookie usage is limited.

### 9.1 Mobile application

The LIXUM mobile application does not use cookies in the classic sense. It only uses:

- An **authentication token** stored locally on your device (necessary for operation, non-tracking)
- A **local cache** to improve performance (images, recently consulted data)
- **Local storage** to preserve your progress in case of application closure
- **Encrypted local storage** for Silhouette photos (see section 8.6)

### 9.2 Future lixum.com website

When the lixum.com website goes live, it may use:

- **Essential cookies** for site operation (not subject to consent)
- **Aggregated and anonymised audience measurement cookies** (subject to explicit consent compliant with CNIL, CDP, and ICO requirements)

A compliant cookie consent banner will be put in place at that time.

---

## 10. Minors

LIXUM is designed for users aged **16 years or older**, in accordance with Article 8 of the GDPR applicable to European Union users.

- This minimum age also applies in other jurisdictions, by alignment with the most protective European standard
- In the United States, LIXUM complies with the Children's Online Privacy Protection Act (COPPA) and does not knowingly collect data from children under 13
- If you are under 16, you must not create a LIXUM account without the explicit authorisation of a legal representative
- If we learn that a minor user has created an account without parental authorisation, we will delete their account and data as soon as possible
- Parents and legal guardians may contact us at privacy@lixum.com to request the deletion of a minor's account

---

## 11. Modifications to this Policy

This Privacy Policy is a living document that will evolve with LIXUM and with applicable legal frameworks.

### 11.1 Versioning

Each version of this document is archived and dated. The current version is always accessible from your LIXUM profile.

### 11.2 Minor modifications

Minor modifications (typographical corrections, clarifications without change in scope, update of administrative information such as NINEA, RCCM, precise head office address after official incorporation of LIXUM SAS) are published without particular notification. You can consult the version history at any time.

### 11.3 Substantial modifications

Substantial modifications (new categories of data collected, new subprocessors, new processing purposes) trigger:

1. An **in-app notification** upon your next login
2. A **mandatory re-consent screen** presenting the changes
3. **Preservation of your previous consent** in our register, dated to the exact version you had seen

You may refuse substantial modifications, in which case you will have to either accept to continue using LIXUM, or delete your account.

---

## 12. Final provisions

### 12.1 Applicable law

This Policy is governed by Senegalese law. For users residing in the European Union, the mandatory provisions of the GDPR also apply. For users residing in the United Kingdom, the mandatory provisions of the UK GDPR also apply. For users residing in California, the mandatory provisions of the CCPA also apply.

### 12.2 Competent jurisdiction

Any dispute relating to this Policy that could not be resolved amicably will be submitted to the competent jurisdiction of Dakar, Senegal, subject to mandatory jurisdiction rules protecting consumers in certain jurisdictions (notably the European Union, the United Kingdom, and certain US states).

### 12.3 Contact

For any question relating to this Privacy Policy or your personal data:

- **General privacy email**: privacy@lixum.com
- **Data Protection Officer (DPO) email**: dpo@lixum.com
- **Postal mail**: LIXUM SAS — Dakar, Senegal (**precise address being finalised, will be communicated upon official incorporation of the company**)

### 12.4 Commitment to professional evolution

This version 1.0 beta has been drafted with particular care based on applicable legal frameworks. We commit to having this document validated and enriched by a law firm specialised in data protection before the public launch of LIXUM. Any updates resulting from this professional review will be communicated to you according to the procedure provided in section 11.3.

---

**Version 1.0 beta • 19 April 2026**

**LIXUM SAS (in the process of incorporation) • Dakar, Senegal**

**privacy@lixum.com • dpo@lixum.com**

**An application designed in Africa, for the world.**

This document is updated regularly. Substantial modifications trigger a re-consent request upon your next login to LIXUM.
