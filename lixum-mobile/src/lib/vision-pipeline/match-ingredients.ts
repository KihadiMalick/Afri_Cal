import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  EstimatedIngredient,
  MatchedIngredient,
} from "@/types/vision-pipeline";

/** Row shape from ingredients_master */
interface IngredientRow {
  id: string;
  name: string;
  category: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number | null;
}

/** Row shape from preparations_master */
interface PreparationRow {
  id: string;
  name: string;
  category: string;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number | null;
}

/**
 * Generic fallback values for when no ingredient match is found.
 * Based on average values for common African meal components.
 */
const CATEGORY_FALLBACKS: Record<string, Omit<IngredientRow, "id" | "name" | "category">> = {
  cereale: {
    kcal_per_100g: 130,
    protein_per_100g: 2.7,
    carbs_per_100g: 28.0,
    fat_per_100g: 0.3,
    fiber_per_100g: 0.5,
  },
  viande: {
    kcal_per_100g: 165,
    protein_per_100g: 25.0,
    carbs_per_100g: 0,
    fat_per_100g: 7.0,
    fiber_per_100g: 0,
  },
  poisson: {
    kcal_per_100g: 120,
    protein_per_100g: 22.0,
    carbs_per_100g: 0,
    fat_per_100g: 3.5,
    fiber_per_100g: 0,
  },
  legume: {
    kcal_per_100g: 35,
    protein_per_100g: 1.5,
    carbs_per_100g: 6.0,
    fat_per_100g: 0.3,
    fiber_per_100g: 2.5,
  },
  huile: {
    kcal_per_100g: 884,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 100,
    fiber_per_100g: 0,
  },
  sauce: {
    kcal_per_100g: 80,
    protein_per_100g: 3.0,
    carbs_per_100g: 8.0,
    fat_per_100g: 4.0,
    fiber_per_100g: 1.5,
  },
  tubercule: {
    kcal_per_100g: 110,
    protein_per_100g: 1.5,
    carbs_per_100g: 26.0,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.0,
  },
  fruit: {
    kcal_per_100g: 55,
    protein_per_100g: 0.8,
    carbs_per_100g: 13.0,
    fat_per_100g: 0.2,
    fiber_per_100g: 2.0,
  },
  default: {
    kcal_per_100g: 100,
    protein_per_100g: 5.0,
    carbs_per_100g: 12.0,
    fat_per_100g: 3.0,
    fiber_per_100g: 1.0,
  },
};

/**
 * Keywords to detect which category fallback to use
 */
const CATEGORY_KEYWORDS: [string[], string][] = [
  [["riz", "mil", "mais", "fonio", "sorgho", "couscous", "pain", "cereale", "avoine", "semoule", "teff"], "cereale"],
  [["poulet", "boeuf", "viande", "mouton", "agneau", "porc", "brochette", "kebab"], "viande"],
  [["poisson", "crevette", "crabe", "thon", "sardine", "tilapia", "capitaine"], "poisson"],
  [["tomate", "oignon", "carotte", "chou", "gombo", "aubergine", "epinard", "poivron", "concombre", "laitue", "haricot vert", "piment", "ail"], "legume"],
  [["huile", "beurre", "graisse", "margarine"], "huile"],
  [["sauce", "soupe", "bouillon"], "sauce"],
  [["manioc", "igname", "patate", "plantain", "pomme de terre", "taro"], "tubercule"],
  [["banane", "mangue", "papaye", "orange", "ananas", "fruit", "citron"], "fruit"],
];

/**
 * Normalize text for comparison: lowercase, remove diacritics, trim.
 */
function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9\s']/g, "")
    .trim();
}

/**
 * Calculate string similarity score between two normalized strings.
 */
function calculateSimilarity(a: string, b: string): number {
  const na = normalizeForSearch(a);
  const nb = normalizeForSearch(b);

  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  // Word overlap scoring
  const wordsA = na.split(/\s+/);
  const wordsB = nb.split(/\s+/);
  let matchCount = 0;

  for (const wa of wordsA) {
    for (const wb of wordsB) {
      if (wa === wb) { matchCount += 1; break; }
      if (wa.length > 3 && wb.length > 3 && (wa.includes(wb) || wb.includes(wa))) {
        matchCount += 0.7;
        break;
      }
    }
  }

  const totalWords = Math.max(wordsA.length, wordsB.length);
  return totalWords > 0 ? matchCount / totalWords : 0;
}

/**
 * Detect a category from ingredient name for fallback purposes.
 */
function detectCategory(name: string): string {
  const normalized = normalizeForSearch(name);
  for (const [keywords, category] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category;
    }
  }
  return "default";
}

/**
 * Phase 3: Match estimated ingredients against Supabase database.
 *
 * Search strategy:
 * 1. Try exact ILIKE match on ingredients_master
 * 2. Try fuzzy match with word overlap on ingredients_master
 * 3. Try same on preparations_master (for cooked items like "riz blanc cuit")
 * 4. Fall back to category-based estimation
 */
export async function matchIngredientsToDatabase(
  supabase: SupabaseClient,
  ingredients: EstimatedIngredient[]
): Promise<MatchedIngredient[]> {
  if (ingredients.length === 0) return [];

  // Fetch ingredient and preparation databases
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const [ingredientsResult, preparationsResult] = await Promise.all([
    (supabase as any)
      .from("ingredients_master")
      .select("id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g"),
    (supabase as any)
      .from("preparations_master")
      .select("id, name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g"),
  ]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  const allIngredients: IngredientRow[] = ingredientsResult.data || [];
  const allPreparations: PreparationRow[] = preparationsResult.data || [];

  return ingredients.map((estimated) => {
    const searchName = normalizeForSearch(estimated.normalized_name);

    // 1. Try exact match on ingredients_master
    let bestMatch: IngredientRow | PreparationRow | null = null;
    let bestScore = 0;
    let matchType: MatchedIngredient["match_type"] = "approximate_estimation";

    for (const row of allIngredients) {
      const score = calculateSimilarity(searchName, row.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = row;
      }
    }

    // 2. Try preparations_master too (often better for cooked items)
    for (const row of allPreparations) {
      const score = calculateSimilarity(searchName, row.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = row;
      }
    }

    // Determine match type
    if (bestScore >= 0.95) {
      matchType = "exact";
    } else if (bestScore >= 0.5) {
      matchType = "fuzzy";
    } else if (bestScore >= 0.3) {
      matchType = "category_fallback";
    }

    // 3. If no good match, use category fallback
    if (bestScore < 0.3 || !bestMatch) {
      const category = detectCategory(estimated.normalized_name);
      const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;

      return {
        ingredient_id: null,
        name: estimated.normalized_name,
        original_detected_name: estimated.original_name,
        kcal_per_100g: fallback.kcal_per_100g,
        protein_per_100g: fallback.protein_per_100g,
        carbs_per_100g: fallback.carbs_per_100g,
        fat_per_100g: fallback.fat_per_100g,
        fiber_per_100g: fallback.fiber_per_100g || 0,
        matched_weight_grams: estimated.estimated_weight_grams,
        match_type: "approximate_estimation" as const,
        match_confidence: 0.3,
      };
    }

    return {
      ingredient_id: bestMatch.id,
      name: bestMatch.name,
      original_detected_name: estimated.original_name,
      kcal_per_100g: Number(bestMatch.kcal_per_100g),
      protein_per_100g: Number(bestMatch.protein_per_100g),
      carbs_per_100g: Number(bestMatch.carbs_per_100g),
      fat_per_100g: Number(bestMatch.fat_per_100g),
      fiber_per_100g: Number(bestMatch.fiber_per_100g || 0),
      matched_weight_grams: estimated.estimated_weight_grams,
      match_type: matchType,
      match_confidence: bestScore,
    };
  });
}
