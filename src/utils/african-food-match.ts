import type { SupabaseClient } from "@supabase/supabase-js";
import type { ScanResult } from "@/types";

export async function matchAfricanFood(
  supabase: SupabaseClient,
  scanResult: ScanResult
): Promise<ScanResult> {
  // Fetch all african foods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: foods } = await (supabase as any)
    .from("african_food_database")
    .select("*");

  if (!foods || foods.length === 0) return scanResult;

  const dishNameLower = scanResult.dish_name.toLowerCase();

  // Try to find a match by name similarity
  let bestMatch = null;
  let bestScore = 0;

  for (const food of foods) {
    const foodNameLower = food.name.toLowerCase();
    const score = calculateSimilarity(dishNameLower, foodNameLower);

    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = food;
    }
  }

  if (bestMatch) {
    // Adjust calories using african food database
    const weightGrams = scanResult.estimated_weight_grams || 300;
    const adjustedCalories = Math.round(
      (bestMatch.calories_per_100g / 100) * weightGrams
    );

    return {
      ...scanResult,
      matched_african_dish: bestMatch.name,
      adjusted_calories: adjustedCalories,
    };
  }

  return scanResult;
}

function calculateSimilarity(a: string, b: string): number {
  // Normalize strings
  const na = normalize(a);
  const nb = normalize(b);

  // Exact match
  if (na === nb) return 1.0;

  // Check if one contains the other
  if (na.includes(nb) || nb.includes(na)) return 0.8;

  // Check word overlap
  const wordsA = na.split(/\s+/);
  const wordsB = nb.split(/\s+/);
  let matchingWords = 0;

  for (const wordA of wordsA) {
    for (const wordB of wordsB) {
      if (wordA === wordB || wordA.includes(wordB) || wordB.includes(wordA)) {
        matchingWords++;
        break;
      }
    }
  }

  const totalWords = Math.max(wordsA.length, wordsB.length);
  return matchingWords / totalWords;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}
