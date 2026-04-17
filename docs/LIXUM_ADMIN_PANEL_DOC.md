# LIXUM ADMIN PANEL — DOCUMENTATION STRATÉGIQUE ET TECHNIQUE

**Date de création** : 17 Avril 2026  
**Auteur** : Session de réflexion stratégique avec Malick (fondateur LIXUM)  
**Objectif** : Document de référence pour construire un Admin Panel web permettant à l'équipe LIXUM (responsable communication, responsable partenariats, partenaires externes comme ministères de santé et OMS) de publier des notifications, créer des défis, et modérer le contenu sans dépendre de commandes SQL directes.

**⚠️ Ce document est une vision future, pas un projet à construire maintenant.** Il doit être rangé et ressorti dans 6-12 mois, une fois que LIXUM aura validé le product-market fit avec 1000+ utilisateurs actifs.

---

## 1. CONTEXTE STRATÉGIQUE

### Pourquoi un admin panel ?

LIXUM se positionne comme premier compagnon santé IA africain avec ambitions partenariats institutionnels (ministères santé Burundi/Sénégal/Côte d'Ivoire, OMS Afrique). Ces partenaires auront besoin de publier :
- Alertes sanitaires urgentes (épidémies, rappels vaccinaux régionaux)
- Messages de sensibilisation santé publique
- Coordination des défis communautaires santé

Sans admin panel, toutes ces publications dépendent du fondateur pour taper du SQL. **C'est un goulot d'étranglement qui tue le scaling opérationnel**.

### Quand construire (pas maintenant)

Phase de validation (maintenant → 1000 utilisateurs actifs) : gestion manuelle par le fondateur via SQL documentés. Objectif : comprendre le vrai besoin avant d'outiller.

Phase de scaling (1000-10000 utilisateurs) : construire l'admin panel avec les insights accumulés pendant la phase manuelle.

Phase institutionnelle (10000+ utilisateurs + partenariats signés) : étendre l'admin panel avec comptes partenaires externes et ciblage avancé.

### Qui utilisera l'admin panel

- **Malick (fondateur)** : super-admin, tous droits
- **Responsable communication LIXUM** : publier notifs publiques (LixVerse), créer défis, modérer Wall of Health
- **Responsable partenariats LIXUM** : gérer les comptes admin_source partenaires
- **Partenaires externes** (ministères santé, OMS) : comptes avec droits limités — publier alertes dans leur target_country uniquement, avec validation LIXUM pour les alertes urgentes
- **Modérateur communauté** (futur) : modérer Wall of Health, gérer signalements

---

## 2. ARCHITECTURE SUPABASE ACTUELLE (pertinente pour l'admin panel)

### Tables notifications (3 tables distinctes par design)

#### `alixen_notifications` — Notifs santé personnelles

Notifications générées automatiquement par la RPC `check_and_generate_notifications` (10 triggers métier : déficit calorique 3j, sédentarité 5j, vaccins en retard, médicaments actifs, streak milestones, micronutriments si Hawk Eye MAX équipé, humeur basse si Gipsy MAX équipé, hydratation si Coral Dolphin MAX équipé).

Colonnes : id, user_id (UUID, référence l'utilisateur), type, title, body, data (JSONB), scheduled_at, sent_at, read_at, status, created_at, notification_expo_id, reference_id, trigger_key, message, icon, color, character_slug.

**L'admin panel N'ÉCRIRA PAS directement dans cette table** — c'est le système qui génère ces notifs automatiquement. L'admin panel ne doit PAS y toucher.

#### `lixverse_notifications` — Feed public communauté

Notifications publiques visibles par tous (pas de user_id, pas de read_at). Alimentent la barre horizontale défilante en haut de la page LixVerse.

Colonnes : id, notification_type, lixtag (auteur public), message, character_id, challenge_id, color, created_at, priority, display_until, is_admin, is_urgent, admin_source, target_country.

**Usage admin panel** : l'admin pourra publier des actualités communauté (ex: "Nouveau défi Marathon Hydratation disponible", "Maintenance prévue samedi 14h").

#### `lixverse_user_notifications` — Notifs personnelles LixVerse (créée 17 Avril 2026)

Nouvelle table pour notifs personnelles non-MedicAi (pokes, invitations binôme, défis rejoints, alertes urgentes ministère ciblées par pays).

Colonnes : id, user_id, notification_type, title, message, icon, color, reference_id, sender_lixtag, is_admin, admin_source, is_urgent, target_country, priority, read_at, display_until, created_at.

**Usage admin panel principal** : c'est ICI que les ministères/OMS publieront leurs alertes ciblées. Les champs `is_admin`, `admin_source` et `target_country` sont conçus pour ça.

### RPCs notifications existantes

Sur `alixen_notifications` :
- `check_and_generate_notifications(p_user_id uuid)` — génère auto les notifs santé (245 lignes PL/pgSQL)
- `get_unread_notifications(p_user_id uuid)` — lecture
- `mark_notification_read(p_user_id uuid, p_notification_id uuid)` — marquer 1 lu
- `mark_all_notifications_read(p_user_id uuid)` — tout marquer lu

Sur `lixverse_user_notifications` (créées 17 Avril) :
- `get_unread_lixverse_notifications(p_user_id uuid)` — lecture
- `mark_lixverse_notification_read(p_user_id uuid, p_notification_id uuid)`
- `mark_all_lixverse_notifications_read(p_user_id uuid)`

### Autres tables concernées par l'admin panel

- `lixverse_challenges` — défis actifs (is_active, start_date, end_date)
- `wall_stickers` — Wall of Health (modération)
- `wall_sticker_catalog` — catalogue stickers disponibles
- `lixverse_group_members` — groupes communauté
- `users_profile` — pour ciblage géographique (colonne pays/ville)

### Configuration Supabase

- URL : `https://yuhordnzfpcswztujovi.supabase.co`
- Projet : AfriCalo
- Anon key (stockée dans `src/config/supabase.js`) : `eyJhbGciOiJIUzI1NiIs...`
- Règle IDs critique : `users_profile.id` (profileUUID) ≠ `user_id` (auth.uid())
- Tables avec user_id : meals, moods, hydration_logs, daily_summary, transactions_lix
- Tables avec profile_id : diagnostics, vaccinations, allergies, medications, medical_analyses

---

## 3. HELPERS SQL À CRÉER MAINTENANT (gratuits, gain immédiat)

Même sans admin panel, ces helpers SQL permettent au fondateur de publier des notifs en 1 ligne au lieu de 15.

### Helper 1 : Publier alerte santé ciblée par pays

```sql
CREATE OR REPLACE FUNCTION public.send_health_alert(
  p_title TEXT,
  p_message TEXT,
  p_target_country TEXT DEFAULT NULL,
  p_is_urgent BOOLEAN DEFAULT FALSE,
  p_admin_source TEXT DEFAULT 'LIXUM',
  p_display_until TIMESTAMPTZ DEFAULT NULL
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_count INTEGER := 0;
  v_user RECORD;
BEGIN
  FOR v_user IN 
    SELECT up.user_id 
    FROM users_profile up 
    WHERE p_target_country IS NULL 
       OR up.country = p_target_country
  LOOP
    INSERT INTO lixverse_user_notifications (
      user_id, notification_type, title, message, 
      is_admin, admin_source, is_urgent, target_country,
      icon, color, priority, display_until
    ) VALUES (
      v_user.user_id, 'health_alert', p_title, p_message,
      TRUE, p_admin_source, p_is_urgent, p_target_country,
      CASE WHEN p_is_urgent THEN '🚨' ELSE '📢' END,
      CASE WHEN p_is_urgent THEN '#FF3B5C' ELSE '#4DA6FF' END,
      CASE WHEN p_is_urgent THEN 10 ELSE 5 END,
      COALESCE(p_display_until, NOW() + INTERVAL '7 days')
    );
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_health_alert(TEXT, TEXT, TEXT, BOOLEAN, TEXT, TIMESTAMPTZ) TO postgres;
```

**Usage** :
```sql
-- Alerte choléra Bujumbura
SELECT send_health_alert(
  'Épidémie choléra détectée',
  'Cas confirmés à Bujumbura. Consultez votre médecin en cas de symptômes (diarrhée, déshydratation). Lavez-vous les mains régulièrement.',
  'BI',
  TRUE,
  'Ministère Santé Burundi',
  NOW() + INTERVAL '14 days'
);
```

### Helper 2 : Publier actualité communauté

```sql
CREATE OR REPLACE FUNCTION public.publish_community_news(
  p_message TEXT,
  p_target_country TEXT DEFAULT NULL,
  p_is_urgent BOOLEAN DEFAULT FALSE,
  p_admin_source TEXT DEFAULT 'LIXUM',
  p_priority INTEGER DEFAULT 0,
  p_display_until TIMESTAMPTZ DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO lixverse_notifications (
    notification_type, lixtag, message, 
    is_admin, admin_source, is_urgent, target_country,
    priority, display_until, color
  ) VALUES (
    'community_news', 'SYSTEM', p_message,
    TRUE, p_admin_source, p_is_urgent, p_target_country,
    p_priority, COALESCE(p_display_until, NOW() + INTERVAL '30 days'),
    CASE WHEN p_is_urgent THEN '#FF3B5C' ELSE '#D4AF37' END
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_community_news(TEXT, TEXT, BOOLEAN, TEXT, INTEGER, TIMESTAMPTZ) TO postgres;
```

**Usage** :
```sql
SELECT publish_community_news(
  'Nouveau défi Marathon Hydratation disponible ! Rejoignez l''équipe.',
  NULL,
  FALSE,
  'LIXUM',
  5,
  NOW() + INTERVAL '14 days'
);
```

### Helper 3 : Créer un défi LixVerse

```sql
CREATE OR REPLACE FUNCTION public.create_challenge(
  p_name TEXT,
  p_description TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_reward_lix INTEGER DEFAULT 100,
  p_target_country TEXT DEFAULT NULL,
  p_challenge_type TEXT DEFAULT 'individual'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO lixverse_challenges (
    name, description, start_date, end_date, 
    reward_lix, target_country, challenge_type, is_active
  ) VALUES (
    p_name, p_description, p_start_date, p_end_date,
    p_reward_lix, p_target_country, p_challenge_type, TRUE
  ) RETURNING id INTO v_id;
  
  -- Publier une actualité automatiquement
  PERFORM publish_community_news(
    '🏆 Nouveau défi : ' || p_name || ' — ' || p_description || ' (Récompense : ' || p_reward_lix || ' Lix)',
    p_target_country,
    FALSE,
    'LIXUM',
    7,
    p_end_date
  );
  
  RETURN v_id;
END;
$$;
```

**Note** : cette fonction suppose que `lixverse_challenges` a les colonnes mentionnées. Si ce n'est pas le cas, adapter selon la structure réelle.

### Helper 4 : Modération Wall of Health

```sql
CREATE OR REPLACE FUNCTION public.moderate_wall_sticker(
  p_sticker_id UUID,
  p_action TEXT, -- 'hide', 'delete', 'warn'
  p_reason TEXT DEFAULT NULL,
  p_moderator TEXT DEFAULT 'LIXUM'
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF p_action = 'hide' THEN
    UPDATE wall_stickers SET is_visible = FALSE, 
      moderation_reason = p_reason, moderated_by = p_moderator, moderated_at = NOW()
    WHERE id = p_sticker_id;
  ELSIF p_action = 'delete' THEN
    DELETE FROM wall_stickers WHERE id = p_sticker_id;
  END IF;
  RETURN FOUND;
END;
$$;
```

**Note** : nécessite d'ajouter colonnes `moderation_reason`, `moderated_by`, `moderated_at` à `wall_stickers` si absentes.

---

## 4. SPÉCIFICATIONS TECHNIQUES ADMIN PANEL V1 (pour le jour J)

### Stack recommandée

- **Framework** : Next.js 14 App Router (Malick maîtrise déjà via ECODREUM)
- **UI** : shadcn/ui + Tailwind CSS (cohérent avec le stack moderne)
- **Auth** : Supabase Auth avec rôles personnalisés (colonne `admin_role` sur `auth.users`)
- **Déploiement** : Vercel (gratuit pour usage interne)
- **Domaine suggéré** : `admin.lixum.com`

### Structure des rôles

Ajouter une table `admin_roles` :

```sql
CREATE TABLE IF NOT EXISTS public.admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'comm_manager', 'partnership_manager', 'partner_external', 'moderator')),
  admin_source TEXT, -- ex: 'Ministère Santé Burundi', 'OMS Afrique'
  allowed_countries TEXT[], -- ex: ARRAY['BI', 'SN', 'CI']
  can_send_urgent BOOLEAN DEFAULT FALSE,
  needs_approval_for_urgent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Fonctionnalités par priorité (MVP → V2 → V3)

#### MVP Admin Panel (à construire en premier)

**Module 1 : Authentification**
- Login Supabase Auth
- Redirection selon rôle
- Session persistante

**Module 2 : Publier notification publique** (lixverse_notifications)
- Formulaire : message, is_urgent, target_country (dropdown), display_until
- Preview avant publication
- Bouton "Publier"
- Historique des publications (derniers 50)

**Module 3 : Publier alerte santé ciblée** (lixverse_user_notifications)
- Formulaire : title, message, target_country, is_urgent, admin_source
- Preview (combien d'utilisateurs vont recevoir, estimation)
- Validation 2 niveaux si is_urgent = true (2ème admin doit approuver)
- Publication → appel `send_health_alert()`
- Historique

**Module 4 : Gérer les défis LixVerse**
- Liste des défis actifs (is_active = true)
- Créer un défi (nom, description, dates, reward, target_country, type)
- Modifier un défi existant
- Terminer un défi (is_active = false)

**Module 5 : Dashboard overview**
- Nombre d'utilisateurs actifs (30j)
- Nombre de notifs envoyées (7j)
- Taux de lecture notifs (read_at / created_at)
- Défis actifs
- Alertes santé actives

#### V2 Admin Panel (3-6 mois après MVP)

**Module 6 : Modération Wall of Health**
- Liste stickers récents avec image
- Actions rapides : masquer, supprimer, avertir
- Signalements utilisateurs

**Module 7 : Gestion partenaires**
- Créer compte partenaire (ministère, OMS, etc.)
- Assigner rôle + pays autorisés + droits urgence
- Audit trail des actions partenaires

**Module 8 : Analytics avancés**
- Graphs engagement utilisateurs
- Conversion notifs → action in-app
- Segmentation géographique

#### V3 Admin Panel (6-12 mois après V2)

**Module 9 : Gestion contenu éditorial**
- Articles blog santé
- Recettes africaines (édition DB)
- Programmes défis pré-configurés

**Module 10 : Intégration Mobile Money**
- Dashboard revenus
- Gestion abonnements
- Remboursements

**Module 11 : Ministères santé interface dédiée**
- Dashboard épidémies régionales
- Intégration OMS data feeds
- Alertes automatiques selon seuils

---

## 5. SÉCURITÉ ET AUDIT

### Règles critiques

**1. Double validation pour alertes urgentes**
Toute alerte avec `is_urgent = TRUE` doit être validée par 2 admins distincts avant publication. Table `pending_urgent_notifications` avec workflow d'approbation.

**2. Audit trail complet**
Table `admin_audit_log` :
```sql
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL, -- 'publish_notif', 'create_challenge', 'moderate', 'create_partner', etc.
  target_table TEXT,
  target_id UUID,
  payload JSONB, -- contenu complet de l'action
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3. Rate limiting**
Max 10 notifs urgentes par admin par 24h (hors super_admin). Évite un admin compromis ne spamme des fausses alertes.

**4. Ciblage géographique strict**
Un `partner_external` ne peut publier QUE dans ses `allowed_countries`. Enforced côté RPC via `auth.uid()` check.

**5. Confirmation texte pour actions destructives**
Suppression d'un défi, d'un user, d'une notif déjà publiée → demande de taper le nom exact de la ressource.

### RLS Policies

```sql
-- Seuls les admins peuvent lire admin_audit_log
CREATE POLICY "admin_audit_log_read" ON public.admin_audit_log
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() 
    AND ar.role IN ('super_admin', 'partnership_manager')
  )
);

-- Seuls super_admin peuvent insérer admin_roles
CREATE POLICY "admin_roles_insert" ON public.admin_roles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_roles ar 
    WHERE ar.user_id = auth.uid() AND ar.role = 'super_admin'
  )
);
```

---

## 6. CAS D'USAGE CONCRETS (scénarios réels)

### Scénario 1 : Épidémie choléra Bujumbura (urgent)

**Flow** :
1. Ministère Santé Burundi contacte Malick (WhatsApp) : "Alerte choléra, à publier"
2. Partenaire externe se connecte à admin.lixum.com
3. Sélectionne "Publier alerte santé"
4. Remplit : Title "Épidémie choléra détectée", Message détaillé, target_country=BI, is_urgent=TRUE
5. Preview : "14 523 utilisateurs vont recevoir cette alerte urgente au Burundi"
6. Soumet → statut PENDING
7. Notification interne à Malick (super_admin) : "Approbation requise"
8. Malick review, approuve
9. Notif publiée instantanément aux 14 523 users Burundi
10. Audit log enregistre tout

### Scénario 2 : Lancement défi hydratation Afrique de l'Ouest

**Flow** :
1. Responsable comm LIXUM ouvre admin panel
2. Module Défis → "Créer un défi"
3. Nom : "Mission Hydratation Mars", Description, dates, reward=500 Lix
4. Target countries : SN, CI, ML, BF, GN
5. Publie → appel `create_challenge()` qui crée le défi ET publie l'actualité
6. Tous les users de ces 5 pays voient le nouveau défi dans LixVerse

### Scénario 3 : Modération Wall of Health

**Flow** :
1. User signale un sticker (bouton "Signaler" dans l'app)
2. Notification au modérateur dans l'admin panel
3. Modérateur review le sticker + contexte (photo, auteur, rapports)
4. Décision : masquer, supprimer, ou ignorer
5. Action + raison + timestamp → audit log
6. Si "masquer" répété pour même user → flag automatique pour review super_admin

### Scénario 4 : Publication alerte OMS régionale

**Flow** :
1. OMS publie un avis paludisme Afrique Centrale via leur API
2. Webhook Next.js reçoit l'avis
3. Mapping automatique target_countries selon la région OMS
4. Création notification DRAFT dans admin panel
5. Super_admin review et approuve (manual safety)
6. Publication ciblée aux users concernés

---

## 7. ESTIMATION EFFORT DÉVELOPPEMENT

Basée sur un dev full-stack expérimenté + Claude Code :

| Module | Effort | Priorité |
|--------|--------|----------|
| Auth + rôles | 3 jours | MVP |
| Publier notif publique | 2 jours | MVP |
| Publier alerte santé | 3 jours | MVP |
| Gérer défis | 4 jours | MVP |
| Dashboard overview | 3 jours | MVP |
| **MVP TOTAL** | **15 jours** | — |
| Modération Wall | 4 jours | V2 |
| Gestion partenaires | 5 jours | V2 |
| Analytics avancés | 7 jours | V2 |
| **V2 TOTAL** | **16 jours** | — |

Estimation MVP solo avec Claude Code : 3-4 semaines à temps plein.

---

## 8. CHECKLIST AVANT DE COMMENCER LE DÉVELOPPEMENT

Le jour où tu décides de construire l'admin panel :

- [ ] LIXUM a 1000+ utilisateurs actifs sur l'app mobile
- [ ] Au moins 1 partenariat signé (ministère, OMS, ou autre)
- [ ] Premier mois d'opérations manuelles documenté (quels SQL tapés, fréquence, types)
- [ ] Modèle économique validé (pas de refonte attendue)
- [ ] Équipe pour l'utiliser identifiée (pas juste Malick)
- [ ] Budget dev/hébergement prévu (Vercel Pro ~$20/mois, Supabase Pro si upgrade)
- [ ] Stratégie de sécurité réfléchie (double validation urgent, audit log, RLS)

Si tu peux cocher au moins 5/7, c'est le bon moment.

---

## 9. PRÉPARATION AUJOURD'HUI (sans construire l'admin panel)

### À faire dans les semaines qui viennent (petits investissements gratuits)

**1. Créer les 4 helpers SQL** (section 3 de ce doc) dans Supabase — 30 minutes

**2. Utiliser les helpers manuellement** pour publier les notifs des premiers utilisateurs test — ça te fait sentir le besoin réel et documenter les vrais cas d'usage.

**3. Tenir un log Notion** : "Notifs publiées manuellement"
Colonnes : date, type, contenu, target, temps pris, frictions rencontrées.

Ce log sera TON brief quand tu commenceras l'admin panel. Les features MVP du panel ne seront pas devinées, elles seront déduites de données réelles.

**4. Mentionner l'admin panel comme roadmap V2** dans tes pitchs investisseurs. Ça montre que tu penses scaling opérationnel, pas juste product.

---

## 10. RESSOURCES ET RÉFÉRENCES

### Documents LIXUM pertinents

- `LIXUM-APP/docs/architecture.md` (à créer) — structure globale
- `LIXUM-APP/docs/database-schema.md` (à créer) — toutes les tables
- `LIXUM-APP/docs/supabase-rpcs.md` (à créer) — toutes les RPCs

### Tables Supabase à documenter spécifiquement pour admin panel

- `users_profile` (ajouter colonne `country` si absente)
- `alixen_notifications` (ne pas toucher via admin)
- `lixverse_notifications` (écriture admin via helpers)
- `lixverse_user_notifications` (écriture admin via helpers)
- `lixverse_challenges` (écriture admin)
- `wall_stickers` (modération admin)
- `admin_roles` (à créer)
- `admin_audit_log` (à créer)

### Outils pour le jour J

- Next.js 14 App Router documentation
- shadcn/ui components
- Supabase JS client v2 (avec attention au bug PostgrestFilterBuilder.catch() résolu par Promise.resolve() wrapper)
- Recharts ou Tremor pour les graphs analytics

---

## 11. RÉSUMÉ EXÉCUTIF

**Objectif** : permettre à l'équipe LIXUM et partenaires de publier des notifs santé, gérer les défis, et modérer le contenu sans dépendre du fondateur.

**Quand** : dans 6-12 mois, après validation PMF avec 1000+ utilisateurs.

**Comment** : Next.js 14 + Supabase Auth + shadcn/ui, avec 4 helpers SQL créés dès maintenant pour préparer le terrain.

**Critères de succès** : 
- Responsable comm publie 80%+ des notifs sans demander à Malick
- Ministère santé peut publier une alerte en < 5 minutes de leur côté
- Zéro incident de sécurité (fausse alerte publiée par erreur)
- Audit trail 100% complet pour compliance

**Ce document est vivant**. Mets-le à jour chaque fois que tu apprends quelque chose de nouveau pendant la phase manuelle.

---

*Fin du document — LIXUM Admin Panel v1.0 spec, 17 Avril 2026.*
