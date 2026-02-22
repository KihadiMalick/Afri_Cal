-- ============================================================
-- Migration: Learning System — scan_corrections table
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- ============================================================

-- Step 1: Clean up any previous failed attempt
DROP VIEW IF EXISTS dish_correction_stats;
DROP TABLE IF EXISTS scan_corrections CASCADE;

-- Step 2: Create the table from scratch
CREATE TABLE scan_corrections (
  id                          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id                     UUID,
  original_detected_dish_name TEXT,
  original_ingredients_json   JSONB       NOT NULL DEFAULT '[]'::jsonb,
  corrected_dish_name         TEXT        NOT NULL,
  corrected_ingredients_json  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  image_hash                  TEXT,
  created_at                  TIMESTAMPTZ DEFAULT now()
);

-- Step 3: Indexes
CREATE INDEX idx_scan_corrections_user
  ON scan_corrections (user_id);

CREATE INDEX idx_scan_corrections_dish
  ON scan_corrections (corrected_dish_name);

CREATE INDEX idx_scan_corrections_image_hash
  ON scan_corrections (image_hash)
  WHERE image_hash IS NOT NULL;

CREATE INDEX idx_scan_corrections_original_dish
  ON scan_corrections (original_detected_dish_name)
  WHERE original_detected_dish_name IS NOT NULL;

-- Step 4: Enable RLS
ALTER TABLE scan_corrections ENABLE ROW LEVEL SECURITY;

-- Step 5: Policies (table-qualified to avoid column resolution errors)
CREATE POLICY "scan_corrections_select"
  ON scan_corrections
  FOR SELECT
  USING (auth.uid() = scan_corrections.user_id);

CREATE POLICY "scan_corrections_insert"
  ON scan_corrections
  FOR INSERT
  WITH CHECK (auth.uid() = scan_corrections.user_id);

-- Step 6: Aggregated view for the learning boost queries
CREATE VIEW dish_correction_stats AS
SELECT
  sc.corrected_dish_name,
  sc.original_detected_dish_name,
  COUNT(*)                    AS correction_count,
  COUNT(DISTINCT sc.user_id)  AS unique_users,
  MAX(sc.created_at)          AS last_corrected_at
FROM scan_corrections sc
GROUP BY sc.corrected_dish_name, sc.original_detected_dish_name
HAVING COUNT(*) >= 2;
