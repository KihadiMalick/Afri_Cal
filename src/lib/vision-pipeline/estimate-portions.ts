import type {
  VisionDetectionResult,
  EstimatedIngredient,
  TextureType,
} from "@/types/vision-pipeline";

/**
 * Texture-based caloric density multipliers.
 * These adjust the effective weight for calorie calculation purposes:
 * - oily: fried/oil-heavy foods are calorically denser
 * - saucy: sauces have variable density depending on oil content
 * - dry: grilled/baked foods tend to be less calorically dense per gram
 * - mixed: no adjustment
 */
const TEXTURE_WEIGHT_MULTIPLIERS: Record<TextureType, number> = {
  oily: 1.0,   // weight stays same, caloric adjustment happens in nutrition calc
  saucy: 1.0,
  dry: 1.0,
  mixed: 1.0,
};

/**
 * Caloric density adjustment factors applied during nutrition calculation.
 * Exported for use in calculate-nutrition module.
 */
export const TEXTURE_CALORIE_ADJUSTMENTS: Record<TextureType, number> = {
  oily: 1.15,   // +15% calories (frying adds oil absorption)
  saucy: 1.05,  // +5% calories (sauce typically adds some fat)
  dry: 0.95,    // -5% (grilling/baking renders some fat out)
  mixed: 1.0,   // neutral
};

/**
 * Normalize common ingredient names from AI detection to French database format.
 * Maps English or informal names to standard French ingredient names.
 */
const SYNONYM_MAP: Record<string, string> = {
  // English to French
  "chicken breast": "poulet",
  "chicken": "poulet",
  "chicken thigh": "poulet (cuisse)",
  "white rice": "riz blanc cuit",
  "rice": "riz blanc cuit",
  "cooked rice": "riz blanc cuit",
  "steamed rice": "riz blanc cuit",
  "brown rice": "riz brun cuit",
  "beef": "boeuf",
  "fish": "poisson",
  "grilled fish": "poisson grille",
  "fried fish": "poisson frit",
  "smoked fish": "poisson fume",
  "tomato": "tomate",
  "tomatoes": "tomate",
  "tomato sauce": "concentre de tomate",
  "onion": "oignon",
  "onions": "oignon",
  "garlic": "ail",
  "palm oil": "huile de palme",
  "vegetable oil": "huile vegetale",
  "oil": "huile vegetale",
  "cooking oil": "huile vegetale",
  "olive oil": "huile d'olive",
  "butter": "beurre",
  "peanut butter": "pate d'arachide",
  "peanut paste": "pate d'arachide",
  "groundnut paste": "pate d'arachide",
  "cassava": "manioc frais",
  "yam": "igname fraiche",
  "plantain": "plantain vert (cru)",
  "ripe plantain": "plantain mur (cru)",
  "fried plantain": "alloco (banane plantain frite)",
  "sweet potato": "patate douce",
  "potato": "pomme de terre",
  "carrot": "carotte",
  "carrots": "carotte",
  "cabbage": "chou vert",
  "okra": "gombo frais",
  "eggplant": "aubergine",
  "spinach": "epinard frais",
  "pepper": "piment frais",
  "hot pepper": "piment frais",
  "bell pepper": "poivron",
  "salt": "sel",
  "sugar": "sucre blanc",
  "millet": "mil / millet (cru)",
  "sorghum": "sorgho (cru)",
  "corn": "mais grain (sec)",
  "maize": "mais grain (sec)",
  "beans": "haricots blancs (secs)",
  "black beans": "haricots noirs (secs)",
  "red beans": "haricots rouges (secs)",
  "lentils": "lentilles vertes (seches)",
  "chickpeas": "pois chiches (secs)",
  "egg": "oeuf entier",
  "eggs": "oeuf entier",
  "milk": "lait entier",
  "yogurt": "yaourt nature",
  "cheese": "fromage",
  "bread": "pain blanc de boulangerie",
  "lettuce": "laitue",
  "cucumber": "concombre",
  "lime": "citron vert",
  "lemon": "citron",

  // French synonyms normalization
  "riz": "riz blanc cuit",
  "riz blanc": "riz blanc cuit",
  "poulet grille": "poulet (grille)",
  "boeuf": "boeuf (viande maigre)",
  "viande de boeuf": "boeuf (viande maigre)",
  "viande": "boeuf (viande maigre)",
  "mouton": "agneau/mouton",
  "agneau": "agneau/mouton",
  "huile": "huile vegetale",
  "huile d'arachide": "huile d'arachide",
  "chou": "chou vert",
  "tomate concentree": "concentre de tomate",
  "sauce tomate": "concentre de tomate",
  "manioc": "manioc frais",
  "igname": "igname fraiche",
  "patate douce": "patate douce (chair orange)",
  "banane plantain": "plantain vert (cru)",
  "gombo": "gombo frais",
  "piment": "piment frais",
  "arachide": "arachide decortiquee",
  "cacahuete": "arachide decortiquee",
  "noix de coco": "noix de coco (chair fraiche)",
  "lait de coco": "lait de coco",
  "crevette": "crevette",
  "crevettes": "crevette",
  "poisson fume": "poisson fume",
};

/**
 * Normalize an ingredient name: lowercase, remove diacritics, trim.
 */
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['']/g, "'")
    .trim();
}

/**
 * Phase 2: Estimate ingredient weights from vision detection result.
 *
 * Takes the total estimated weight and distributes it among ingredients
 * based on their detected ratios. Normalizes names via synonym mapping.
 */
export function estimateIngredientWeights(
  detection: VisionDetectionResult
): EstimatedIngredient[] {
  const totalWeight = detection.estimated_total_weight_grams;
  const ingredients = detection.ingredients_detected;

  if (ingredients.length === 0) return [];

  // Normalize ratios to sum to 1.0
  const ratioSum = ingredients.reduce((sum, ing) => sum + ing.estimated_ratio, 0);
  const normalizedRatios = ingredients.map((ing) => ({
    ...ing,
    estimated_ratio: ratioSum > 0 ? ing.estimated_ratio / ratioSum : 1 / ingredients.length,
  }));

  return normalizedRatios.map((ing) => {
    const rawWeight = totalWeight * ing.estimated_ratio;
    const textureMultiplier = TEXTURE_WEIGHT_MULTIPLIERS[ing.texture_type];
    const estimatedWeight = Math.round(rawWeight * textureMultiplier);

    // Normalize name through synonym map
    const normalizedKey = normalizeText(ing.name);
    const normalizedName = SYNONYM_MAP[normalizedKey] || ing.name;

    return {
      normalized_name: normalizedName,
      original_name: ing.name,
      estimated_weight_grams: Math.max(5, estimatedWeight), // minimum 5g
      texture_type: ing.texture_type,
      confidence: ing.confidence,
    };
  });
}
