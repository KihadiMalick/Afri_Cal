import type {
  VisionDetectionResult,
  EstimatedIngredient,
  TextureType,
} from "@/types/vision-pipeline";

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
 * Map free-text texture from AI (French) to our typed TextureType.
 */
const TEXTURE_MAP: Record<string, TextureType> = {
  huileux: "oily",
  frit: "oily",
  friture: "oily",
  frite: "oily",
  huile: "oily",
  sec: "dry",
  grille: "dry",
  roti: "dry",
  sauce: "saucy",
  bouillon: "saucy",
  soupe: "saucy",
  mixte: "mixed",
  melange: "mixed",
};

/**
 * Resolve the free-text texture string from AI to a typed TextureType.
 */
export function resolveTextureType(texture: string): TextureType {
  const normalized = texture
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  for (const [key, value] of Object.entries(TEXTURE_MAP)) {
    if (normalized.includes(key)) return value;
  }
  return "mixed";
}

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
 * Phase 2: Map vision detection ingredients to EstimatedIngredient[].
 *
 * In the optimized format, Claude already provides estimated_weight_g
 * per ingredient, so we just normalize names and map the texture.
 */
export function estimateIngredientWeights(
  detection: VisionDetectionResult
): EstimatedIngredient[] {
  const ingredients = detection.ingredients;
  if (ingredients.length === 0) return [];

  const globalTexture = resolveTextureType(detection.texture);

  return ingredients.map((ing) => {
    // Normalize name through synonym map
    const normalizedKey = normalizeText(ing.name);
    const normalizedName = SYNONYM_MAP[normalizedKey] || ing.name;

    return {
      normalized_name: normalizedName,
      original_name: ing.name,
      estimated_weight_grams: Math.max(5, ing.estimated_weight_g),
      texture_type: globalTexture,
      confidence: ing.confidence / 100, // convert 0-100 to 0-1 for downstream
    };
  });
}
