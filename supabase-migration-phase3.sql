-- ============================================================
-- AfriCalo - Phase 3 : Migration SQL
-- Copier-coller dans Supabase > SQL Editor > New Query > Run
-- ============================================================

-- 1. Ajouter colonnes protein, carbs, fat à meals
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS protein NUMERIC(5,1) NOT NULL DEFAULT 0;
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS carbs NUMERIC(5,1) NOT NULL DEFAULT 0;
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS fat NUMERIC(5,1) NOT NULL DEFAULT 0;

-- 2. Ajouter colonne status à daily_summary
ALTER TABLE public.daily_summary ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'green' CHECK (status IN ('green', 'red', 'gold'));
