-- =============================================
-- PHASE 5 : IA SCAN REPAS - MIGRATION SQL
-- À copier-coller dans Supabase > SQL Editor
-- =============================================

-- 1. TABLE : Base de données plats africains
CREATE TABLE IF NOT EXISTS public.african_food_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  typical_ingredients JSONB NOT NULL DEFAULT '[]',
  calories_per_100g NUMERIC(6,1) NOT NULL,
  density_estimate NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par nom
CREATE INDEX IF NOT EXISTS idx_african_food_name
  ON public.african_food_database USING gin (to_tsvector('french', name));

-- RLS sur african_food_database (lecture publique, pas de modification)
ALTER TABLE public.african_food_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les plats africains"
  ON public.african_food_database
  FOR SELECT
  USING (true);

-- 2. TABLE : Historique des scans
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  detected_dish TEXT NOT NULL,
  estimated_calories NUMERIC(7,1) NOT NULL,
  estimated_weight NUMERIC(6,1),
  confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_history_user
  ON public.scan_history(user_id, created_at DESC);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs propres scans"
  ON public.scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs propres scans"
  ON public.scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs propres scans"
  ON public.scan_history FOR DELETE
  USING (auth.uid() = user_id);

-- 3. TABLE : Corrections utilisateur
CREATE TABLE IF NOT EXISTS public.scan_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scan_history(id) ON DELETE CASCADE,
  corrected_dish TEXT,
  corrected_calories NUMERIC(7,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scan_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient corrections de leurs scans"
  ON public.scan_corrections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.scan_history
      WHERE scan_history.id = scan_corrections.scan_id
      AND scan_history.user_id = auth.uid()
    )
  );

CREATE POLICY "Utilisateurs peuvent corriger leurs propres scans"
  ON public.scan_corrections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scan_history
      WHERE scan_history.id = scan_corrections.scan_id
      AND scan_history.user_id = auth.uid()
    )
  );

-- 4. TABLE : Limites de scan par jour
CREATE TABLE IF NOT EXISTS public.user_scan_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  scans_today INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.user_scan_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs voient leurs propres limites"
  ON public.user_scan_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs limites"
  ON public.user_scan_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent mettre à jour leurs limites"
  ON public.user_scan_limits FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- DONNÉES EXEMPLES : PLATS AFRICAINS
-- =============================================

INSERT INTO public.african_food_database (name, country, typical_ingredients, calories_per_100g, density_estimate) VALUES

-- Sénégal
('Thiéboudienne', 'Sénégal',
 '["riz", "poisson", "tomate", "oignon", "carotte", "chou", "manioc", "aubergine", "piment", "huile végétale"]',
 165.0, 1.1),

('Yassa Poulet', 'Sénégal',
 '["poulet", "oignon", "citron", "moutarde", "huile", "olive", "riz"]',
 155.0, 1.0),

('Mafé', 'Sénégal',
 '["viande de boeuf", "pâte d''arachide", "tomate", "oignon", "patate douce", "carotte", "chou"]',
 180.0, 1.1),

('Thiéré', 'Sénégal',
 '["couscous de mil", "lait caillé", "sucre", "beurre"]',
 145.0, 0.9),

-- Côte d''Ivoire
('Attiéké Poisson', 'Côte d''Ivoire',
 '["attiéké", "poisson braisé", "oignon", "tomate", "piment", "huile"]',
 170.0, 0.9),

('Alloco', 'Côte d''Ivoire',
 '["plantain", "huile de palme", "piment", "oignon"]',
 250.0, 1.0),

('Garba', 'Côte d''Ivoire',
 '["attiéké", "thon frit", "oignon", "tomate", "piment", "huile"]',
 195.0, 0.9),

('Foutou Banane + Sauce Graine', 'Côte d''Ivoire',
 '["banane plantain", "manioc", "graine de palme", "viande", "poisson fumé", "aubergine"]',
 200.0, 1.2),

-- Burundi / Afrique de l''Est
('Fufu + Okra Soup', 'Burundi',
 '["farine de manioc", "gombo", "poisson fumé", "huile de palme", "piment", "oignon"]',
 160.0, 1.2),

('Isombe', 'Burundi',
 '["feuilles de manioc", "pâte d''arachide", "huile de palme", "oignon"]',
 120.0, 1.0),

('Igisafuria', 'Burundi',
 '["haricots", "banane plantain", "épinards", "tomate", "oignon"]',
 135.0, 1.0),

-- Plats communs Afrique de l''Ouest
('Riz Gras', 'Afrique de l''Ouest',
 '["riz", "huile", "tomate", "oignon", "viande", "carotte", "poivron", "laurier"]',
 175.0, 1.1),

('Brochettes', 'Afrique de l''Ouest',
 '["viande de boeuf", "oignon", "poivron", "épices", "huile"]',
 210.0, 0.8),

('Plantain Frit', 'Afrique de l''Ouest',
 '["plantain mûr", "huile végétale", "sel"]',
 260.0, 0.9),

('Jollof Rice', 'Afrique de l''Ouest',
 '["riz", "tomate", "oignon", "piment", "huile", "poulet", "épices"]',
 170.0, 1.1),

('Ndolé', 'Cameroun',
 '["feuilles de ndolé", "arachide", "crevettes", "viande", "huile de palme"]',
 155.0, 1.0),

('Poulet DG', 'Cameroun',
 '["poulet", "plantain mûr", "légumes", "tomate", "oignon", "poivron", "huile"]',
 190.0, 1.0),

('Dégué', 'Mali',
 '["couscous de mil", "lait caillé", "sucre", "vanille", "muscade"]',
 130.0, 0.9),

('Sauce Arachide', 'Afrique de l''Ouest',
 '["pâte d''arachide", "tomate", "oignon", "viande", "gombo", "huile"]',
 195.0, 1.1),

('Riz au Gras de Mouton', 'Sénégal',
 '["riz", "mouton", "tomate", "oignon", "carotte", "huile", "épices"]',
 185.0, 1.1);

-- =============================================
-- FIN MIGRATION PHASE 5
-- =============================================
