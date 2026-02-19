-- ============================================================
-- AfriCalo - Phase 2 : SQL complet pour Supabase
-- Copier-coller ce fichier dans : Supabase > SQL Editor > New Query
-- ============================================================

-- 1. TABLE : users_profile
-- Stocke le profil de chaque utilisateur après onboarding
CREATE TABLE public.users_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  age INTEGER NOT NULL CHECK (age >= 10 AND age <= 120),
  weight NUMERIC(5,1) NOT NULL CHECK (weight > 0 AND weight <= 500),
  height NUMERIC(5,1) NOT NULL CHECK (height > 0 AND height <= 300),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  goal TEXT NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active')),
  target_months INTEGER NOT NULL DEFAULT 3 CHECK (target_months IN (1, 2, 3)),
  target_weight_loss NUMERIC(4,1) NOT NULL DEFAULT 0,
  daily_calorie_target INTEGER NOT NULL DEFAULT 0,
  bmr NUMERIC(7,1) NOT NULL DEFAULT 0,
  tdee NUMERIC(7,1) NOT NULL DEFAULT 0,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index pour recherche rapide par user_id
CREATE INDEX idx_users_profile_user_id ON public.users_profile(user_id);

-- 2. TABLE : meals
-- Stocke chaque repas enregistré
CREATE TABLE public.meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL CHECK (calories >= 0),
  image_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_meals_user_id ON public.meals(user_id);
CREATE INDEX idx_meals_date ON public.meals(user_id, date);

-- 3. TABLE : activities
-- Stocke chaque activité sportive
CREATE TABLE public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  calories_burned INTEGER NOT NULL CHECK (calories_burned >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_date ON public.activities(user_id, date);

-- 4. TABLE : daily_summary
-- Résumé journalier automatique
CREATE TABLE public.daily_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_calories_consumed INTEGER NOT NULL DEFAULT 0,
  total_calories_burned INTEGER NOT NULL DEFAULT 0,
  calorie_target INTEGER NOT NULL DEFAULT 0,
  calorie_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_summary_user_date ON public.daily_summary(user_id, date);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- Un utilisateur ne voit/modifie QUE ses propres données
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_summary ENABLE ROW LEVEL SECURITY;

-- POLICIES : users_profile
CREATE POLICY "Users can view own profile"
  ON public.users_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.users_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.users_profile FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLICIES : meals
CREATE POLICY "Users can view own meals"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

-- POLICIES : activities
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON public.activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON public.activities FOR DELETE
  USING (auth.uid() = user_id);

-- POLICIES : daily_summary
CREATE POLICY "Users can view own daily summary"
  ON public.daily_summary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summary"
  ON public.daily_summary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summary"
  ON public.daily_summary FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. TRIGGER : updated_at automatique sur users_profile
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
