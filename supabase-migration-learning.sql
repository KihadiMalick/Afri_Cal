-- ============================================================
-- Migration: Learning System — scan_corrections table
-- Stores user corrections for progressive learning
-- ============================================================

-- Table: scan_corrections
-- Stores every user correction with original + corrected data
-- NOTE: scan_id is stored as plain UUID (no FK) to avoid
--       dependency on scan_history table existence order.
CREATE TABLE IF NOT EXISTS scan_corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Soft reference to scan_history (no FK constraint to avoid dependency issues)
  scan_id UUID,

  -- Original detection data
  original_detected_dish_name TEXT,
  original_ingredients_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Corrected data
  corrected_dish_name TEXT NOT NULL,
  corrected_ingredients_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Image fingerprint for grouping similar images
  image_hash TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for learning queries
CREATE INDEX IF NOT EXISTS idx_scan_corrections_user
  ON scan_corrections(user_id);

CREATE INDEX IF NOT EXISTS idx_scan_corrections_dish
  ON scan_corrections(corrected_dish_name);

CREATE INDEX IF NOT EXISTS idx_scan_corrections_image_hash
  ON scan_corrections(image_hash)
  WHERE image_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scan_corrections_original_dish
  ON scan_corrections(original_detected_dish_name)
  WHERE original_detected_dish_name IS NOT NULL;

-- RLS: users can only see/modify their own corrections
ALTER TABLE scan_corrections ENABLE ROW LEVEL SECURITY;

-- Use table-qualified column name to avoid "column does not exist" errors
DROP POLICY IF EXISTS "Users can view own corrections" ON scan_corrections;
CREATE POLICY "Users can view own corrections"
  ON scan_corrections FOR SELECT
  USING (auth.uid() = scan_corrections.user_id);

DROP POLICY IF EXISTS "Users can insert own corrections" ON scan_corrections;
CREATE POLICY "Users can insert own corrections"
  ON scan_corrections FOR INSERT
  WITH CHECK (auth.uid() = scan_corrections.user_id);

-- ============================================================
-- View: dish_correction_stats
-- Aggregated correction statistics for learning boost
-- ============================================================
CREATE OR REPLACE VIEW dish_correction_stats AS
SELECT
  corrected_dish_name,
  original_detected_dish_name,
  COUNT(*) AS correction_count,
  COUNT(DISTINCT user_id) AS unique_users,
  MAX(created_at) AS last_corrected_at
FROM scan_corrections
GROUP BY corrected_dish_name, original_detected_dish_name
HAVING COUNT(*) >= 2;
