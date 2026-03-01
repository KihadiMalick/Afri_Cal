-- ============================================================
-- AfriCalo — Vision Pipeline Migration
-- Ajoute le support de recherche floue (fuzzy search) et
-- les politiques RLS pour les tables nutritionnelles
-- Copier-coller dans : Supabase > SQL Editor > New Query
-- ============================================================

-- 1. Extension pg_trgm pour la recherche floue (similarity)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Index trigram sur ingredients_master.name pour recherche fuzzy
CREATE INDEX IF NOT EXISTS idx_ingredients_name_trgm
  ON public.ingredients_master USING gin (name gin_trgm_ops);

-- 3. Index trigram sur preparations_master.name pour recherche fuzzy
CREATE INDEX IF NOT EXISTS idx_preparations_name_trgm
  ON public.preparations_master USING gin (name gin_trgm_ops);

-- 4. Index trigram sur meals_master.name pour recherche fuzzy
CREATE INDEX IF NOT EXISTS idx_meals_master_name_trgm
  ON public.meals_master USING gin (name gin_trgm_ops);

-- 5. RLS : lecture publique pour ingredients_master
ALTER TABLE public.ingredients_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les ingredients"
  ON public.ingredients_master
  FOR SELECT
  USING (true);

-- 6. RLS : lecture publique pour preparations_master
ALTER TABLE public.preparations_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les preparations"
  ON public.preparations_master
  FOR SELECT
  USING (true);

-- 7. RLS : lecture publique pour meals_master
ALTER TABLE public.meals_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les plats"
  ON public.meals_master
  FOR SELECT
  USING (true);

-- 8. RLS : lecture publique pour meal_components_master
ALTER TABLE public.meal_components_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut lire les composants de plats"
  ON public.meal_components_master
  FOR SELECT
  USING (true);

-- ============================================================
-- FIN MIGRATION VISION PIPELINE
-- ============================================================
