-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 1
-- TABLE : ingredients_master
-- 202 ingrédients bruts organisés en 9 catégories
-- Sources : USDA FoodData Central · FAO West Africa FCT · CIQUAL
-- Copier-coller dans : Supabase > SQL Editor > New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ingredients_master (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT    NOT NULL,
  category         TEXT    NOT NULL,
  kcal_per_100g    NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  carbs_per_100g   NUMERIC NOT NULL,
  fat_per_100g     NUMERIC NOT NULL,
  fiber_per_100g   NUMERIC,
  source           TEXT    NOT NULL,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Index de recherche par nom et catégorie
CREATE INDEX IF NOT EXISTS idx_ingredients_name     ON public.ingredients_master (name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON public.ingredients_master (category);


-- =========================
-- CÉRÉALES & FÉCULENTS
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Riz blanc (cru)',                    'Céréales & Féculents', 365, 7.1,  80.0, 0.7,  1.3,  'USDA FoodData Central'),
  ('Riz brun (cru)',                     'Céréales & Féculents', 370, 7.9,  77.2, 2.9,  3.5,  'USDA FoodData Central'),
  ('Riz étuvé (cru)',                    'Céréales & Féculents', 371, 7.5,  81.5, 0.6,  1.4,  'USDA FoodData Central'),
  ('Riz jasmin (cru)',                   'Céréales & Féculents', 365, 7.1,  80.0, 0.7,  1.3,  'USDA FoodData Central'),
  ('Maïs grain (sec)',                   'Céréales & Féculents', 365, 9.4,  74.3, 4.7,  7.3,  'USDA FoodData Central'),
  ('Farine de maïs (blanche)',           'Céréales & Féculents', 361, 8.1,  76.8, 3.6,  7.3,  'USDA FoodData Central'),
  ('Semoule de maïs fine',               'Céréales & Féculents', 370, 8.7,  78.0, 3.9,  4.4,  'USDA FoodData Central'),
  ('Mil / Millet (cru)',                 'Céréales & Féculents', 378, 11.0, 72.9, 4.2,  8.5,  'USDA FoodData Central'),
  ('Farine de mil',                      'Céréales & Féculents', 354, 9.8,  71.7, 4.1,  8.3,  'FAO West Africa FCT'),
  ('Sorgho (cru)',                       'Céréales & Féculents', 329, 10.6, 72.1, 3.5,  6.3,  'USDA FoodData Central'),
  ('Fonio (cru)',                        'Céréales & Féculents', 362, 8.6,  75.5, 1.0,  1.0,  'FAO West Africa FCT'),
  ('Teff (cru)',                         'Céréales & Féculents', 367, 13.3, 73.1, 2.4,  8.0,  'USDA FoodData Central'),
  ('Quinoa (cru)',                       'Céréales & Féculents', 368, 14.1, 64.2, 6.1,  7.0,  'USDA FoodData Central'),
  ('Manioc frais',                       'Céréales & Féculents', 160, 1.4,  38.1, 0.3,  1.8,  'FAO West Africa FCT'),
  ('Farine de manioc (sèche)',           'Céréales & Féculents', 355, 1.7,  86.0, 0.5,  3.7,  'FAO West Africa FCT'),
  ('Gari (semoule manioc fermentée)',    'Céréales & Féculents', 357, 1.1,  85.7, 0.6,  5.0,  'FAO West Africa FCT'),
  ('Igname fraîche',                     'Céréales & Féculents', 118, 1.5,  27.9, 0.2,  4.1,  'FAO West Africa FCT'),
  ('Farine d''igname',                   'Céréales & Féculents', 342, 4.4,  79.0, 0.7,  5.0,  'FAO West Africa FCT'),
  ('Plantain vert (cru)',                'Céréales & Féculents', 122, 1.3,  31.9, 0.4,  2.3,  'USDA FoodData Central'),
  ('Plantain mûr (cru)',                 'Céréales & Féculents', 122, 1.3,  31.9, 0.4,  2.3,  'USDA FoodData Central'),
  ('Patate douce (chair orange)',        'Céréales & Féculents',  86, 1.6,  20.1, 0.1,  3.0,  'USDA FoodData Central'),
  ('Patate douce (chair blanche)',       'Céréales & Féculents',  91, 2.0,  21.3, 0.1,  3.0,  'USDA FoodData Central'),
  ('Pomme de terre',                     'Céréales & Féculents',  77, 2.0,  17.5, 0.1,  2.1,  'USDA FoodData Central'),
  ('Taro (cru)',                         'Céréales & Féculents', 112, 1.5,  26.5, 0.2,  4.1,  'USDA FoodData Central'),
  ('Couscous (cru)',                     'Céréales & Féculents', 376, 12.8, 77.4, 0.6,  5.0,  'USDA FoodData Central'),
  ('Semoule de blé dur',                 'Céréales & Féculents', 360, 12.7, 73.2, 1.1,  4.5,  'USDA FoodData Central'),
  ('Farine de blé T55',                  'Céréales & Féculents', 364, 10.3, 76.3, 1.2,  2.7,  'CIQUAL'),
  ('Avoine (flocons)',                   'Céréales & Féculents', 389, 17.0, 66.3, 7.0,  10.6, 'USDA FoodData Central'),
  ('Tapioca (perles)',                   'Céréales & Féculents', 358, 0.2,  88.7, 0.0,  0.9,  'USDA FoodData Central'),
  ('Pain blanc de boulangerie',          'Céréales & Féculents', 265, 9.0,  51.0, 3.3,  2.4,  'CIQUAL');


-- =========================
-- LÉGUMINEUSES
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Niébé / Cowpea (sec)',               'Légumineuses', 336, 23.5, 60.0, 1.3,  10.6, 'FAO West Africa FCT'),
  ('Haricots blancs (secs)',             'Légumineuses', 333, 23.4, 60.3, 0.8,  15.2, 'USDA FoodData Central'),
  ('Haricots rouges (secs)',             'Légumineuses', 337, 22.5, 61.3, 1.1,  15.2, 'USDA FoodData Central'),
  ('Haricots noirs (secs)',              'Légumineuses', 341, 21.6, 62.4, 1.4,  15.5, 'USDA FoodData Central'),
  ('Lentilles vertes (sèches)',          'Légumineuses', 352, 25.8, 60.1, 1.1,  10.7, 'USDA FoodData Central'),
  ('Lentilles rouges (sèches)',          'Légumineuses', 352, 24.6, 60.1, 1.1,  10.9, 'USDA FoodData Central'),
  ('Pois chiches (secs)',                'Légumineuses', 378, 20.5, 62.9, 6.1,  12.2, 'USDA FoodData Central'),
  ('Pois d''Angole / Cajanus (secs)',    'Légumineuses', 343, 21.7, 62.8, 1.5,  15.0, 'FAO West Africa FCT'),
  ('Voandzou / Bambaranut (secs)',       'Légumineuses', 367, 18.0, 63.0, 6.5,  5.0,  'FAO West Africa FCT'),
  ('Fèves (sèches)',                     'Légumineuses', 341, 26.1, 58.3, 1.5,  25.0, 'USDA FoodData Central'),
  ('Pois cassés jaunes (secs)',          'Légumineuses', 348, 24.6, 62.8, 1.1,  16.4, 'USDA FoodData Central'),
  ('Petits pois (frais)',                'Légumineuses',  81, 5.4,  14.5, 0.4,  5.1,  'USDA FoodData Central'),
  ('Soja graines (sèches)',              'Légumineuses', 446, 36.5, 30.2, 19.9, 9.3,  'USDA FoodData Central'),
  ('Arachides / Cacahuètes (crues)',     'Légumineuses', 567, 25.8, 16.1, 49.2, 8.5,  'USDA FoodData Central'),
  ('Arachides rôties',                   'Légumineuses', 585, 23.7, 21.5, 49.7, 8.4,  'USDA FoodData Central'),
  ('Graines de sésame',                  'Légumineuses', 573, 17.7, 23.5, 49.7, 11.8, 'USDA FoodData Central'),
  ('Graines d''égusi (courge)',          'Légumineuses', 561, 32.4, 12.0, 47.0, 0.5,  'FAO West Africa FCT'),
  ('Graines de tournesol',               'Légumineuses', 584, 20.8, 20.0, 51.5, 8.6,  'USDA FoodData Central'),
  ('Soumbala / Néré fermenté',           'Légumineuses', 360, 35.0, 34.5, 12.0, 5.0,  'FAO West Africa FCT');


-- =========================
-- LÉGUMES
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Tomate fraîche',                     'Légumes',  18, 0.9,  3.9,  0.2, 1.2,  'USDA FoodData Central'),
  ('Tomate cerise',                      'Légumes',  18, 0.9,  3.9,  0.2, 1.2,  'USDA FoodData Central'),
  ('Oignon rouge',                       'Légumes',  40, 1.1,  9.3,  0.1, 1.7,  'USDA FoodData Central'),
  ('Oignon blanc',                       'Légumes',  42, 1.4,  9.8,  0.2, 1.8,  'USDA FoodData Central'),
  ('Ail',                                'Légumes', 149, 6.4,  33.1, 0.5, 2.1,  'USDA FoodData Central'),
  ('Gombo / Okra (frais)',               'Légumes',  33, 1.9,  7.5,  0.2, 3.2,  'USDA FoodData Central'),
  ('Gombo séché',                        'Légumes', 316, 17.8, 60.5, 2.7, 11.3, 'FAO West Africa FCT'),
  ('Aubergine africaine / Garden egg',   'Légumes',  24, 1.0,  5.7,  0.2, 3.0,  'FAO West Africa FCT'),
  ('Aubergine européenne',               'Légumes',  25, 1.0,  5.9,  0.2, 3.0,  'USDA FoodData Central'),
  ('Poivron rouge',                      'Légumes',  31, 1.0,  6.0,  0.3, 2.1,  'USDA FoodData Central'),
  ('Poivron vert',                       'Légumes',  20, 0.9,  4.6,  0.2, 1.7,  'USDA FoodData Central'),
  ('Poivron jaune',                      'Légumes',  27, 1.0,  6.3,  0.2, 0.9,  'USDA FoodData Central'),
  ('Piment frais rouge',                 'Légumes',  40, 1.9,  8.8,  0.4, 1.5,  'USDA FoodData Central'),
  ('Piment séché',                       'Légumes', 282, 12.8, 49.7, 8.4, 27.2, 'USDA FoodData Central'),
  ('Amarante / Épinards africains',      'Légumes',  23, 2.5,  4.0,  0.3, 2.2,  'FAO West Africa FCT'),
  ('Feuilles de manioc / isombé (fraîches)',      'Légumes', 102, 7.0,  18.6, 0.4, 3.7,  'FAO West Africa FCT'),
  ('Feuilles de patate douce (fraîches)','Légumes',  84, 5.2,  17.0, 0.5, 3.0,  'FAO West Africa FCT'),
  ('Feuilles de baobab (fraîches)',      'Légumes',  63, 5.7,  12.0, 0.3, 8.0,  'FAO West Africa FCT'),
  ('Feuilles de moringa (fraîches)',     'Légumes',  64, 9.4,  8.3,  1.4, 2.0,  'FAO West Africa FCT'),
  ('Oseille de Guinée / Bissap feuilles','Légumes',  49, 1.6,  11.3, 0.6, 2.2,  'FAO West Africa FCT'),
  ('Chou blanc',                         'Légumes',  25, 1.3,  5.8,  0.1, 2.5,  'USDA FoodData Central'),
  ('Chou vert frisé (kale)',             'Légumes',  49, 4.3,  8.8,  0.9, 3.6,  'USDA FoodData Central'),
  ('Épinards (frais)',                   'Légumes',  23, 2.9,  3.6,  0.4, 2.2,  'USDA FoodData Central'),
  ('Carotte',                            'Légumes',  41, 0.9,  9.6,  0.2, 2.8,  'USDA FoodData Central'),
  ('Courge / Citrouille',                'Légumes',  26, 1.0,  6.5,  0.1, 0.5,  'USDA FoodData Central'),
  ('Concombre',                          'Légumes',  15, 0.7,  3.6,  0.1, 0.5,  'USDA FoodData Central'),
  ('Haricots verts (frais)',             'Légumes',  31, 1.8,  7.1,  0.1, 2.7,  'USDA FoodData Central'),
  ('Maïs doux (grain frais)',            'Légumes',  86, 3.2,  19.0, 1.2, 2.7,  'USDA FoodData Central'),
  ('Ciboulette / Oignon vert',           'Légumes',  30, 1.8,  6.9,  0.2, 2.6,  'USDA FoodData Central'),
  ('Persil frais',                       'Légumes',  36, 3.0,  6.3,  0.8, 3.3,  'USDA FoodData Central'),
  ('Coriandre fraîche',                  'Légumes',  23, 2.1,  3.7,  0.5, 2.8,  'USDA FoodData Central'),
  ('Gingembre frais',                    'Légumes',  80, 1.8,  17.8, 0.8, 2.0,  'USDA FoodData Central'),
  ('Céleri (tige)',                      'Légumes',  16, 0.7,  3.0,  0.2, 1.6,  'USDA FoodData Central'),
  ('Brocoli',                            'Légumes',  34, 2.8,  6.6,  0.4, 2.6,  'USDA FoodData Central'),
  ('Citronnelle (fraîche)',              'Légumes',  99, 1.8,  25.3, 0.5, 0.0,  'USDA FoodData Central'),
  ('Laitue (feuilles)',                  'Légumes',  15, 1.4,  2.9,  0.2, 1.3,  'USDA FoodData Central'),
  ('Betterave rouge (crue)',             'Légumes',  43, 1.6,  9.6,  0.2, 2.8,  'USDA FoodData Central'),
  ('Navet (cru)',                        'Légumes',  28, 0.9,  6.4,  0.1, 1.8,  'USDA FoodData Central'),
  ('Poireau',                            'Légumes',  61, 1.5,  14.2, 0.3, 1.8,  'USDA FoodData Central'),
  ('Tomate séchée',                      'Légumes', 258, 14.1, 55.8, 3.0, 12.3, 'USDA FoodData Central');


-- =========================
-- FRUITS
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Banane mûre',                        'Fruits',  89, 1.1,  22.8, 0.3,  2.6,  'USDA FoodData Central'),
  ('Mangue fraîche',                     'Fruits',  60, 0.8,  15.0, 0.4,  1.6,  'USDA FoodData Central'),
  ('Mangue séchée',                      'Fruits', 319, 2.4,  78.6, 1.2,  2.4,  'USDA FoodData Central'),
  ('Papaye fraîche',                     'Fruits',  43, 0.5,  10.8, 0.3,  1.7,  'USDA FoodData Central'),
  ('Ananas frais',                       'Fruits',  50, 0.5,  13.1, 0.1,  1.4,  'USDA FoodData Central'),
  ('Avocat',                             'Fruits', 160, 2.0,  8.5,  14.7, 6.7,  'USDA FoodData Central'),
  ('Orange',                             'Fruits',  47, 0.9,  11.8, 0.1,  2.4,  'USDA FoodData Central'),
  ('Citron',                             'Fruits',  29, 1.1,  9.3,  0.3,  2.8,  'USDA FoodData Central'),
  ('Citron vert',                        'Fruits',  30, 0.7,  10.5, 0.2,  2.8,  'USDA FoodData Central'),
  ('Pastèque',                           'Fruits',  30, 0.6,  7.6,  0.2,  0.4,  'USDA FoodData Central'),
  ('Goyave',                             'Fruits',  68, 2.6,  14.3, 1.0,  5.4,  'USDA FoodData Central'),
  ('Noix de coco (chair fraîche)',       'Fruits', 354, 3.3,  15.2, 33.5, 9.0,  'USDA FoodData Central'),
  ('Lait de coco (liquide)',             'Fruits', 197, 2.0,  2.8,  21.3, 0.0,  'USDA FoodData Central'),
  ('Datte (sèche)',                      'Fruits', 282, 2.5,  75.0, 0.4,  8.0,  'USDA FoodData Central'),
  ('Fruit du baobab (pulpe sèche)',      'Fruits', 227, 2.3,  79.4, 0.3,  44.5, 'FAO West Africa FCT'),
  ('Tamarin (pulpe)',                     'Fruits', 239, 2.8,  62.5, 0.6,  5.1,  'USDA FoodData Central'),
  ('Jujube africain (ziziphus)',         'Fruits',  79, 1.2,  20.2, 0.2,  0.6,  'FAO West Africa FCT'),
  ('Fruit de la passion (grenadille)',   'Fruits',  97, 2.2,  23.4, 0.7,  10.4, 'USDA FoodData Central'),
  ('Melon cantaloup',                    'Fruits',  34, 0.8,  8.2,  0.2,  0.9,  'USDA FoodData Central'),
  ('Figue fraîche',                      'Fruits',  74, 0.8,  19.2, 0.3,  2.9,  'USDA FoodData Central'),
  ('Corossol / Soursop',                 'Fruits',  66, 1.0,  16.8, 0.3,  3.3,  'USDA FoodData Central'),
  ('Pomme',                              'Fruits',  52, 0.3,  13.8, 0.2,  2.4,  'USDA FoodData Central');


-- =========================
-- VIANDES
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Poulet (blanc / filet, cru)',        'Viandes', 110, 23.1, 0.0, 1.2,  0.0, 'USDA FoodData Central'),
  ('Poulet (cuisse sans peau, cru)',     'Viandes', 124, 17.9, 0.0, 5.7,  0.0, 'USDA FoodData Central'),
  ('Poulet (aile, cru)',                 'Viandes', 127, 18.3, 0.0, 5.7,  0.0, 'USDA FoodData Central'),
  ('Poulet (avec peau, cru)',            'Viandes', 172, 17.4, 0.0, 11.1, 0.0, 'USDA FoodData Central'),
  ('Foie de poulet (cru)',              'Viandes', 119, 16.9, 0.7, 4.8,  0.0, 'USDA FoodData Central'),
  ('Gésier de poulet (cru)',             'Viandes',  94, 17.7, 0.0, 2.1,  0.0, 'USDA FoodData Central'),
  ('Bœuf maigre (cru)',                  'Viandes', 143, 21.4, 0.0, 5.5,  0.0, 'USDA FoodData Central'),
  ('Bœuf basse côte (cru)',              'Viandes', 215, 17.7, 0.0, 15.4, 0.0, 'USDA FoodData Central'),
  ('Foie de bœuf (cru)',                 'Viandes', 135, 20.4, 3.9, 3.8,  0.0, 'USDA FoodData Central'),
  ('Tripes de bœuf (crues)',             'Viandes',  85, 14.8, 0.0, 2.5,  0.0, 'USDA FoodData Central'),
  ('Cœur de bœuf (cru)',                 'Viandes', 112, 17.7, 0.1, 3.9,  0.0, 'USDA FoodData Central'),
  ('Bœuf séché / Kilishi',               'Viandes', 215, 36.1, 5.3, 4.7,  0.0, 'FAO West Africa FCT'),
  ('Mouton / Agneau épaule (cru)',       'Viandes', 235, 15.6, 0.0, 19.1, 0.0, 'USDA FoodData Central'),
  ('Foie d''agneau (cru)',               'Viandes', 139, 20.0, 2.2, 5.1,  0.0, 'USDA FoodData Central'),
  ('Chèvre (cru)',                       'Viandes', 109, 20.6, 0.0, 2.3,  0.0, 'USDA FoodData Central'),
  ('Porc filet (cru)',                   'Viandes', 143, 21.3, 0.0, 5.8,  0.0, 'USDA FoodData Central'),
  ('Porc poitrine (cru)',                'Viandes', 330, 14.5, 0.0, 29.8, 0.0, 'USDA FoodData Central'),
  ('Dinde (blanc, cru)',                 'Viandes', 104, 24.0, 0.0, 1.0,  0.0, 'USDA FoodData Central'),
  ('Canard (sans peau, cru)',            'Viandes', 140, 17.8, 0.0, 6.8,  0.0, 'USDA FoodData Central'),
  ('Pintade (cru)',                      'Viandes', 158, 20.6, 0.0, 8.1,  0.0, 'FAO West Africa FCT'),
  ('Lapin (cru)',                        'Viandes', 136, 20.1, 0.0, 5.5,  0.0, 'CIQUAL'),
  ('Escargot / Toufa (cru)',                     'Viandes',  90, 16.1, 2.0, 1.4,  0.0, 'USDA FoodData Central');


-- =========================
-- POISSONS & FRUITS DE MER
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Tilapia (cru)',                      'Poissons & Fruits de mer',  96, 20.1, 0.0, 1.7,  0.0, 'USDA FoodData Central'),
  ('Capitaine / Perche du Nil (cru)',    'Poissons & Fruits de mer',  92, 18.5, 0.0, 1.7,  0.0, 'FAO West Africa FCT'),
  ('Maquereau (cru)',                    'Poissons & Fruits de mer', 205, 18.6, 0.0, 13.9, 0.0, 'USDA FoodData Central'),
  ('Thon frais (cru)',                   'Poissons & Fruits de mer', 132, 28.9, 0.0, 1.3,  0.0, 'USDA FoodData Central'),
  ('Sardine fraîche (crue)',             'Poissons & Fruits de mer', 208, 24.6, 0.0, 11.5, 0.0, 'USDA FoodData Central'),
  ('Crevettes (crues)',                  'Poissons & Fruits de mer',  85, 18.8, 0.9, 0.6,  0.0, 'USDA FoodData Central'),
  ('Crevettes séchées',                  'Poissons & Fruits de mer', 295, 62.9, 1.5, 3.0,  0.0, 'FAO West Africa FCT'),
  ('Carpe (crue)',                       'Poissons & Fruits de mer', 127, 17.8, 0.0, 5.6,  0.0, 'USDA FoodData Central'),
  ('Sole (crue)',                        'Poissons & Fruits de mer',  70, 12.4, 0.0, 1.9,  0.0, 'USDA FoodData Central'),
  ('Thon en conserve (eau)',             'Poissons & Fruits de mer', 116, 25.5, 0.0, 0.8,  0.0, 'USDA FoodData Central'),
  ('Sardine en conserve (huile)',        'Poissons & Fruits de mer', 208, 24.6, 0.0, 11.5, 0.0, 'USDA FoodData Central'),
  ('Poisson-chat / Silure (cru)',        'Poissons & Fruits de mer',  95, 16.4, 0.0, 2.8,  0.0, 'USDA FoodData Central'),
  ('Poisson fumé / Kong (générique)',           'Poissons & Fruits de mer', 200, 35.0, 0.0, 5.0,  0.0, 'FAO West Africa FCT'),
  ('Poisson séché / Gejj (générique)',   'Poissons & Fruits de mer', 290, 62.0, 0.0, 3.0,  0.0, 'FAO West Africa FCT'),
  ('Crabe (cru)',                        'Poissons & Fruits de mer',  83, 17.4, 0.0, 1.1,  0.0, 'USDA FoodData Central'),
  ('Calamar (cru)',                       'Poissons & Fruits de mer',  92, 15.6, 3.1, 1.4,  0.0, 'USDA FoodData Central'),
  ('Moules (crues)',                     'Poissons & Fruits de mer',  86, 11.9, 3.7, 2.2,  0.0, 'USDA FoodData Central'),
  ('Hareng / Yaboy (cru)',                       'Poissons & Fruits de mer', 158, 17.9, 0.0, 9.0,  0.0, 'USDA FoodData Central'),
  ('Saumon (cru)',                       'Poissons & Fruits de mer', 208, 20.4, 0.0, 13.4, 0.0, 'USDA FoodData Central'),
  ('Bar / Loup de mer (cru)',            'Poissons & Fruits de mer',  97, 18.4, 0.0, 2.0,  0.0, 'CIQUAL'),
  ('Daurade (crue)',                     'Poissons & Fruits de mer', 109, 20.3, 0.0, 2.7,  0.0, 'CIQUAL'),
  ('Homard / Langouste (cru)',                       'Poissons & Fruits de mer',  90, 18.8, 0.5, 0.9,  0.0, 'USDA FoodData Central');


-- =========================
-- PRODUITS LAITIERS & ŒUFS
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Lait de vache entier (3,5%)',        'Produits laitiers & Œufs',  61, 3.2,  4.8,  3.3,  0.0, 'USDA FoodData Central'),
  ('Lait écrémé (0%)',                   'Produits laitiers & Œufs',  35, 3.4,  5.0,  0.1,  0.0, 'USDA FoodData Central'),
  ('Yaourt nature entier',               'Produits laitiers & Œufs',  61, 3.5,  4.7,  3.3,  0.0, 'USDA FoodData Central'),
  ('Yaourt nature maigre (0%)',          'Produits laitiers & Œufs',  56, 3.7,  7.7,  0.4,  0.0, 'CIQUAL'),
  ('Fromage frais (type Philadelphia)',  'Produits laitiers & Œufs', 170, 8.5,  4.0,  13.0, 0.0, 'CIQUAL'),
  ('Fromage cheddar',                    'Produits laitiers & Œufs', 402, 24.9, 1.3,  33.1, 0.0, 'USDA FoodData Central'),
  ('Beurre (doux)',                      'Produits laitiers & Œufs', 717, 0.9,  0.1,  81.1, 0.0, 'USDA FoodData Central'),
  ('Crème fraîche entière (30%)',        'Produits laitiers & Œufs', 292, 2.1,  3.4,  30.0, 0.0, 'CIQUAL'),
  ('Lait en poudre entier',              'Produits laitiers & Œufs', 496, 26.3, 38.4, 26.7, 0.0, 'USDA FoodData Central'),
  ('Lait caillé / Nono',                 'Produits laitiers & Œufs',  38, 3.0,  4.5,  0.5,  0.0, 'FAO West Africa FCT'),
  ('Œuf entier (poule)',                 'Produits laitiers & Œufs', 155, 12.6, 1.1,  10.6, 0.0, 'USDA FoodData Central'),
  ('Blanc d''œuf (cru)',                 'Produits laitiers & Œufs',  52, 10.9, 0.7,  0.2,  0.0, 'USDA FoodData Central'),
  ('Jaune d''œuf (cru)',                 'Produits laitiers & Œufs', 322, 15.9, 3.6,  26.5, 0.0, 'USDA FoodData Central');


-- =========================
-- MATIÈRES GRASSES
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Huile de palme rouge',               'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile de palme raffinée (blanche)',  'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile d''arachide',                  'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile de sésame',                    'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile de coco vierge',               'Matières grasses', 862, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile de tournesol',                 'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile d''olive vierge extra',        'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Huile de maïs',                      'Matières grasses', 884, 0.0, 0.0, 100.0, 0.0, 'USDA FoodData Central'),
  ('Beurre de karité',                   'Matières grasses', 900, 0.0, 0.0, 100.0, 0.0, 'FAO West Africa FCT'),
  ('Beurre d''arachide / Pâte',          'Matières grasses', 588, 25.0, 20.0, 50.0, 6.0, 'USDA FoodData Central'),
  ('Margarine',                          'Matières grasses', 717, 0.2, 0.7,  80.0, 0.0, 'USDA FoodData Central'),
  ('Graisse de bœuf / Suif',             'Matières grasses', 902, 0.0, 0.0,  100.0, 0.0, 'USDA FoodData Central');


-- =========================
-- CONDIMENTS & ÉPICES
-- =========================
INSERT INTO public.ingredients_master
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
  ('Sel (chlorure de sodium)',            'Condiments & Épices',   0, 0.0,  0.0,  0.0,  0.0,  'USDA FoodData Central'),
  ('Sucre blanc raffiné',                'Condiments & Épices', 387, 0.0,  99.8, 0.0,  0.0,  'USDA FoodData Central'),
  ('Sucre de canne roux',                'Condiments & Épices', 377, 0.1,  97.3, 0.0,  0.0,  'USDA FoodData Central'),
  ('Miel',                               'Condiments & Épices', 304, 0.3,  82.4, 0.0,  0.2,  'USDA FoodData Central'),
  ('Poivre noir moulu',                  'Condiments & Épices', 251, 10.4, 63.9, 3.3,  25.3, 'USDA FoodData Central'),
  ('Poivre blanc moulu',                 'Condiments & Épices', 296, 10.4, 68.6, 2.1,  26.2, 'USDA FoodData Central'),
  ('Cumin (graines)',                    'Condiments & Épices', 375, 17.8, 44.2, 22.3, 10.5, 'USDA FoodData Central'),
  ('Coriandre (graines moulues)',        'Condiments & Épices', 298, 12.4, 54.9, 17.8, 41.9, 'USDA FoodData Central'),
  ('Curcuma moulu',                      'Condiments & Épices', 312, 9.7,  67.1, 3.3,  22.7, 'USDA FoodData Central'),
  ('Paprika doux',                       'Condiments & Épices', 282, 14.1, 53.9, 12.9, 34.9, 'USDA FoodData Central'),
  ('Piment de Cayenne moulu',            'Condiments & Épices', 318, 12.0, 56.6, 17.3, 27.2, 'USDA FoodData Central'),
  ('Noix de muscade moulue',             'Condiments & Épices', 525, 5.8,  49.3, 36.3, 20.8, 'USDA FoodData Central'),
  ('Cannelle moulue',                    'Condiments & Épices', 247, 4.0,  80.6, 1.2,  53.1, 'USDA FoodData Central'),
  ('Cardamome (graines)',                'Condiments & Épices', 311, 10.8, 68.5, 6.7,  28.0, 'USDA FoodData Central'),
  ('Clou de girofle moulu',              'Condiments & Épices', 274, 6.0,  65.5, 13.0, 33.9, 'USDA FoodData Central'),
  ('Fenugrec (graines)',                 'Condiments & Épices', 323, 23.0, 58.4, 6.4,  24.6, 'USDA FoodData Central'),
  ('Anis étoilé',                        'Condiments & Épices', 337, 17.6, 50.0, 15.9, 14.6, 'USDA FoodData Central'),
  ('Bouillon cube (générique)',           'Condiments & Épices', 370, 13.0, 35.0, 20.0, 0.0,  'Composition générique industrielle'),
  ('Sauce soja',                         'Condiments & Épices',  53, 8.1,  4.9,  0.6,  0.8,  'USDA FoodData Central'),
  ('Vinaigre blanc',                     'Condiments & Épices',  18, 0.0,  0.0,  0.0,  0.0,  'USDA FoodData Central'),
  ('Concentré de tomate',                'Condiments & Épices',  82, 4.3,  18.9, 0.5,  4.1,  'USDA FoodData Central'),
  ('Noix de cola (fraîche)',             'Condiments & Épices', 228, 3.7,  48.0, 0.4,  5.0,  'FAO West Africa FCT');


-- =========================
-- VÉRIFICATION FINALE
-- =========================
-- SELECT category, COUNT(*) as total FROM ingredients_master GROUP BY category ORDER BY category;
-- Résultat attendu : 9 catégories, ~202 ingrédients au total
