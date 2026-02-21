-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 2
-- TABLE : preparations_master
-- 118 préparations transformées simples organisées en 11 catégories
-- Note : Toutes les valeurs reflètent l'état CUIT / PRÊT À CONSOMMER
-- Sources : USDA FoodData Central · FAO West Africa FCT · CIQUAL
-- Copier-coller dans : Supabase > SQL Editor > New Query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.preparations_master (
  id                    UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  TEXT    NOT NULL,
  base_ingredient       TEXT,
  category              TEXT    NOT NULL,
  kcal_per_100g         NUMERIC NOT NULL,
  protein_per_100g      NUMERIC NOT NULL,
  carbs_per_100g        NUMERIC NOT NULL,
  fat_per_100g          NUMERIC NOT NULL,
  fiber_per_100g        NUMERIC,
  water_content_percent NUMERIC,
  source                TEXT    NOT NULL,
  created_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_preparations_name     ON public.preparations_master (name);
CREATE INDEX IF NOT EXISTS idx_preparations_category ON public.preparations_master (category);

-- =========================
-- CEREALES CUITES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Riz blanc cuit',                        'Riz blanc (cru)',        'Cereales cuites', 130, 2.7, 28.2, 0.3, 0.4,  68.4, 'USDA FoodData Central #20045'),
  ('Riz brun cuit',                          'Riz brun (cru)',         'Cereales cuites', 123, 2.7, 25.6, 1.0, 1.8,  70.3, 'USDA FoodData Central #20041'),
  ('Riz etuve cuit',                         'Riz etuve (cru)',        'Cereales cuites', 134, 2.9, 29.6, 0.3, 0.5,  67.2, 'USDA FoodData Central'),
  ('Riz jasmin cuit',                        'Riz jasmin (cru)',       'Cereales cuites', 130, 2.7, 28.2, 0.3, 0.4,  68.4, 'USDA FoodData Central'),
  ('Riz gluant cuit',                        'Riz gluant (cru)',       'Cereales cuites', 97,  2.0, 21.2, 0.2, 0.3,  76.5, 'USDA FoodData Central'),
  ('Riz a la vapeur',                        'Riz blanc (cru)',        'Cereales cuites', 129, 2.7, 28.0, 0.3, 0.4,  68.5, 'FAO West Africa FCT'),
  ('Bouillie de mais (ogi / koko)',          'Farine de mais',         'Cereales cuites', 58,  1.3, 12.7, 0.5, 0.5,  85.0, 'FAO West Africa FCT'),
  ('To de mais (pate ferme)',                'Farine de mais',         'Cereales cuites', 109, 2.5, 24.0, 0.4, 0.6,  72.0, 'FAO West Africa FCT'),
  ('Ugali (pate de mais blanche)',           'Farine de mais',         'Cereales cuites', 109, 2.1, 24.0, 0.4, 0.6,  72.0, 'FAO East Africa FCT'),
  ('Kenkey (mais fermente cuit)',            'Farine de mais',         'Cereales cuites', 134, 3.0, 29.5, 0.6, 0.8,  65.0, 'FAO West Africa FCT'),
  ('Banku (mais-manioc fermente cuit)',      'Mais + Manioc',          'Cereales cuites', 140, 3.5, 31.0, 0.7, 1.0,  63.5, 'FAO West Africa FCT'),
  ('Injera (galette de teff fermentee)',     'Farine de teff',         'Cereales cuites', 153, 4.9, 29.0, 1.5, 2.0,  63.5, 'USDA FoodData Central #18057'),
  ('Bouillie de mil (ben-saalga)',           'Farine de mil',          'Cereales cuites', 62,  1.8, 12.5, 0.6, 1.0,  84.0, 'FAO West Africa FCT'),
  ('Bouillie de sorgho',                     'Sorgho',                 'Cereales cuites', 70,  2.0, 14.5, 0.5, 1.2,  82.0, 'FAO West Africa FCT'),
  ('Bouillie de fonio',                      'Fonio',                  'Cereales cuites', 65,  1.5, 13.5, 0.3, 0.3,  83.5, 'FAO West Africa FCT'),
  ('Fonio cuit',                             'Fonio (cru)',            'Cereales cuites', 90,  2.3, 19.3, 0.3, 0.4,  77.0, 'FAO West Africa FCT'),
  ('Mil cuit (base)',                        'Mil / Millet',           'Cereales cuites', 74,  2.2, 15.9, 0.8, 1.0,  79.0, 'FAO West Africa FCT'),
  ('Sorgho cuit (base)',                     'Sorgho (grain)',         'Cereales cuites', 82,  2.7, 18.5, 0.9, 1.1,  76.0, 'USDA FoodData Central'),
  ('Mais bouilli (grain entier)',            'Mais grain (sec)',        'Cereales cuites', 108, 3.3, 23.5, 1.3, 2.7,  70.0, 'USDA FoodData Central'),
  ('Ogi fermente (akamu)',                   'Mais grain',             'Cereales cuites', 42,  1.0,  9.5, 0.3, 0.4,  88.5, 'FAO West Africa FCT');


-- =========================
-- TUBERCULES PREPARES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Manioc bouilli',                        'Manioc frais',           'Tubercules prepares', 112, 1.2, 26.8, 0.2, 1.5,  70.5, 'FAO West Africa FCT'),
  ('Manioc cuit a la vapeur',               'Manioc frais',           'Tubercules prepares', 114, 1.2, 27.2, 0.2, 1.5,  69.8, 'FAO West Africa FCT'),
  ('Manioc grille (braise)',                'Manioc frais',           'Tubercules prepares', 148, 1.4, 35.5, 0.3, 1.8,  61.5, 'FAO West Africa FCT'),
  ('Igname bouillie',                        'Igname fraiche',         'Tubercules prepares', 116, 1.5, 27.5, 0.1, 4.1,  69.6, 'USDA FoodData Central #11648'),
  ('Igname cuite a la vapeur',              'Igname fraiche',          'Tubercules prepares', 116, 1.5, 27.5, 0.1, 4.1,  69.6, 'FAO West Africa FCT'),
  ('Igname grillee (braisee)',              'Igname fraiche',          'Tubercules prepares', 128, 1.8, 30.0, 0.2, 4.2,  66.0, 'FAO West Africa FCT'),
  ('Patate douce bouillie (chair orange)',  'Patate douce',            'Tubercules prepares', 76,  1.4, 17.7, 0.1, 2.5,  80.0, 'USDA FoodData Central #11508'),
  ('Patate douce rotie au four',            'Patate douce',            'Tubercules prepares', 90,  2.0, 20.7, 0.1, 3.3,  75.5, 'USDA FoodData Central'),
  ('Taro bouilli',                           'Taro (cru)',             'Tubercules prepares', 96,  1.4, 22.8, 0.1, 3.5,  74.0, 'USDA FoodData Central'),
  ('Pomme de terre bouillie (avec peau)',   'Pomme de terre',          'Tubercules prepares', 82,  2.0, 18.7, 0.1, 1.8,  77.0, 'CIQUAL 2020'),
  ('Pomme de terre cuite au four',          'Pomme de terre',          'Tubercules prepares', 93,  2.1, 21.3, 0.1, 2.2,  75.0, 'USDA FoodData Central'),
  ('Plantain bouilli (vert)',               'Plantain vert (cru)',      'Tubercules prepares', 116, 1.0, 30.0, 0.2, 2.2,  68.0, 'FAO West Africa FCT'),
  ('Plantain bouilli (mur)',                'Plantain mur (cru)',       'Tubercules prepares', 122, 1.2, 31.5, 0.3, 1.8,  65.0, 'FAO West Africa FCT'),
  ('Plantain cuit a la vapeur',             'Plantain vert (cru)',      'Tubercules prepares', 110, 1.0, 28.5, 0.2, 2.0,  69.0, 'FAO West Africa FCT'),
  ('Macabo / cocoyam bouilli',              'Macabo / cocoyam',        'Tubercules prepares', 100, 1.7, 23.5, 0.4, 2.8,  72.0, 'FAO West Africa FCT');


-- =========================
-- SEMOULES & PATES CUITES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Couscous de ble cuit',                  'Couscous (cru)',          'Semoules & pates cuites', 112, 3.8, 23.2, 0.2, 1.4,  72.6, 'USDA FoodData Central #20028'),
  ('Couscous complet cuit',                  'Couscous complet',       'Semoules & pates cuites', 102, 4.2, 21.0, 0.5, 2.8,  74.5, 'CIQUAL 2020'),
  ('Attieke pret a consommer',              'Manioc fermente rape',    'Semoules & pates cuites', 148, 1.2, 35.0, 0.5, 1.2,  62.0, 'FAO West Africa FCT / CNRA Cote d''Ivoire'),
  ('Gari prepare (eau chaude, mou)',        'Gari (semoule manioc)',   'Semoules & pates cuites', 155, 1.0, 37.0, 0.3, 0.6,  60.0, 'FAO West Africa FCT'),
  ('Eba (gari pate ferme)',                 'Gari (semoule manioc)',   'Semoules & pates cuites', 175, 0.7, 42.0, 0.4, 2.0,  55.0, 'FAO West Africa FCT'),
  ('Gari souffle (eau froide)',             'Gari (semoule manioc)',   'Semoules & pates cuites', 184, 1.0, 44.0, 0.4, 0.5,  52.0, 'FAO West Africa FCT'),
  ('Placali (manioc fermente bouilli)',     'Manioc fermente',         'Semoules & pates cuites', 100, 0.5, 24.5, 0.3, 1.0,  74.0, 'FAO West Africa FCT'),
  ('Amala (farine igname cuite)',           'Farine d''igname',        'Semoules & pates cuites', 140, 1.8, 33.5, 0.2, 3.0,  64.0, 'FAO West Africa FCT'),
  ('Semoule de ble cuite',                  'Semoule de ble dur',      'Semoules & pates cuites', 112, 3.9, 23.1, 0.2, 1.3,  72.5, 'CIQUAL 2020'),
  ('Boulgour cuit',                          'Ble boulgour (cru)',      'Semoules & pates cuites', 83,  3.1, 18.6, 0.2, 4.5,  78.6, 'USDA FoodData Central #20014'),
  ('Polenta cuite (semoule de mais)',       'Semoule de mais fine',    'Semoules & pates cuites', 70,  1.6, 15.6, 0.3, 0.7,  82.0, 'USDA FoodData Central'),
  ('Couscous de mil cuit',                  'Couscous de mil',         'Semoules & pates cuites', 90,  2.5, 19.5, 0.9, 1.0,  77.0, 'FAO West Africa FCT'),
  ('Thiakry (couscous mil + lait caille)', 'Couscous de mil',         'Semoules & pates cuites', 148, 4.5, 25.5, 3.0, 1.0,  65.0, 'FAO West Africa FCT / Calcul AfriCalo');


-- =========================
-- PUREES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Fufu de manioc',                        'Manioc frais',           'Purees', 140, 1.0, 33.5, 0.2, 1.5,  63.5, 'FAO West Africa FCT'),
  ('Fufu d''igname (pounded yam)',          'Igname fraiche',          'Purees', 132, 1.4, 31.5, 0.1, 3.8,  65.0, 'FAO West Africa FCT'),
  ('Fufu de plantain vert',                 'Plantain vert (cru)',      'Purees', 125, 1.0, 32.5, 0.2, 2.3,  65.0, 'FAO West Africa FCT'),
  ('Fufu de mais',                          'Farine de mais',          'Purees', 105, 2.5, 23.0, 0.5, 0.8,  73.0, 'FAO West Africa FCT'),
  ('Fufu mixte (manioc + plantain)',        'Manioc + Plantain',       'Purees', 138, 1.0, 33.0, 0.2, 1.5,  64.0, 'FAO West Africa FCT / Calcul AfriCalo'),
  ('Puree d''igname nature',               'Igname fraiche',           'Purees', 118, 1.5, 28.0, 0.5, 3.5,  68.0, 'FAO West Africa FCT'),
  ('Puree de manioc simple',               'Manioc frais',             'Purees', 128, 1.0, 30.5, 0.5, 1.5,  66.0, 'FAO West Africa FCT'),
  ('Puree de pomme de terre nature',       'Pomme de terre',           'Purees', 83,  1.9, 15.9, 2.0, 1.5,  79.0, 'CIQUAL 2020'),
  ('Puree de patate douce',                'Patate douce',             'Purees', 90,  1.6, 20.5, 0.5, 2.5,  75.0, 'USDA FoodData Central / Calcul'),
  ('Puree de taro',                         'Taro (cru)',              'Purees', 100, 1.4, 23.5, 0.5, 3.2,  73.0, 'FAO West Africa FCT'),
  ('Pate d''arachide pilee',               'Arachide (grilee)',        'Purees', 588,25.0, 20.0,49.9, 8.0,   2.0, 'USDA FoodData Central #16087');


-- =========================
-- FRITURES SIMPLES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Plantain frit mur (alloco)',           'Plantain mur (cru)',       'Fritures simples', 247, 1.3, 34.5,11.5, 1.8,  52.0, 'FAO West Africa FCT / USDA'),
  ('Chips de plantain vert (fin, croustillant)', 'Plantain vert (cru)', 'Fritures simples', 519, 2.3, 66.0,27.0, 3.5,  12.0, 'USDA FoodData Central / Calcul'),
  ('Igname frite',                          'Igname fraiche',          'Fritures simples', 222, 1.8, 30.5,10.5, 3.5,  53.0, 'FAO West Africa FCT / Calcul AfriCalo'),
  ('Manioc frit',                           'Manioc frais',            'Fritures simples', 230, 1.5, 32.0,11.0, 1.5,  52.0, 'FAO West Africa FCT / Calcul'),
  ('Frite de pomme de terre',              'Pomme de terre',           'Fritures simples', 312, 3.4, 39.8,15.5, 3.8,  40.0, 'USDA FoodData Central #11408'),
  ('Chips de manioc (sec)',                'Manioc frais',             'Fritures simples', 490, 2.0, 78.0,19.0, 4.0,  3.0,  'FAO West Africa FCT / Calcul'),
  ('Patate douce frite',                   'Patate douce',             'Fritures simples', 215, 1.6, 28.5,10.5, 2.5,  55.0, 'USDA / Calcul AfriCalo'),
  ('Akara (beignet de haricots niebe)',    'Haricots niebe (crus)',    'Fritures simples', 265, 9.5, 25.0,14.5, 3.5,  48.0, 'FAO West Africa FCT'),
  ('Beignet de farine simple',             'Farine de ble T55',        'Fritures simples', 310, 6.0, 43.0,13.0, 1.5,  34.0, 'CIQUAL 2020 / Calcul AfriCalo'),
  ('Puff-puff (beignet leve)',             'Farine de ble T55',        'Fritures simples', 330, 5.5, 46.0,14.0, 1.0,  31.5, 'FAO West Africa FCT / Calcul'),
  ('Kaklo (beignet de plantain mur)',      'Plantain mur (cru)',       'Fritures simples', 280, 2.0, 40.0,12.0, 2.5,  43.0, 'FAO West Africa FCT / Calcul'),
  ('Beignet de mais (masa)',               'Farine de mais',           'Fritures simples', 278, 4.5, 33.0,14.0, 1.5,  46.0, 'FAO West Africa FCT / Calcul'),
  ('Taro frit',                             'Taro (cru)',              'Fritures simples', 210, 1.8, 28.5,10.0, 3.0,  54.0, 'FAO West Africa FCT / Calcul'),
  ('Chin-chin (friandise frite)',          'Farine de ble T55',        'Fritures simples', 490, 9.0, 68.0,22.0, 2.0,  5.0,  'FAO West Africa FCT / Calcul');


-- =========================
-- SAUCES BASES AFRICAINES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Sauce arachide base (sans viande)',    'Pate d''arachide',        'Sauces bases africaines', 215, 6.5,  8.5,18.0, 2.5,  62.0, 'FAO West Africa FCT / Calcul AfriCalo'),
  ('Sauce tomate simple (tomate + oignon + huile)', 'Tomate fraiche', 'Sauces bases africaines', 95,  1.5,  7.5, 6.5, 1.5,  80.0, 'CIQUAL 2020 / Calcul AfriCalo'),
  ('Sauce tomate concentree cuisinee',    'Concentre de tomate',      'Sauces bases africaines', 105, 2.0,  8.5, 7.0, 1.5,  78.0, 'CIQUAL 2020 / Calcul'),
  ('Sauce feuilles d''epinards',          'Feuilles d''epinards',     'Sauces bases africaines', 75,  3.5,  4.5, 5.0, 2.0,  82.0, 'FAO West Africa FCT'),
  ('Sauce feuilles de manioc (pondu)',    'Feuilles de manioc',       'Sauces bases africaines', 80,  4.5,  4.0, 4.5, 2.5,  80.0, 'FAO West Africa FCT'),
  ('Sauce gombo simple',                  'Gombo frais',              'Sauces bases africaines', 65,  2.0,  5.0, 4.0, 2.5,  83.5, 'FAO West Africa FCT'),
  ('Sauce palme simple (sans proteines)', 'Huile de palme rouge',     'Sauces bases africaines', 185, 1.0,  4.0,18.5, 0.8,  73.0, 'FAO West Africa FCT / Calcul'),
  ('Sauce graine (soupe de palme)',       'Noix de palme',            'Sauces bases africaines', 155, 2.5,  5.5,13.5, 1.5,  74.0, 'FAO West Africa FCT'),
  ('Sauce egusi (graines de courge)',     'Graines de courge (egusi)','Sauces bases africaines', 215, 8.5,  5.5,18.5, 2.0,  62.0, 'FAO West Africa FCT / Calcul'),
  ('Sauce mafe base (arachide + tomate)', 'Pate d''arachide',        'Sauces bases africaines', 190, 5.5,  9.0,15.5, 2.5,  65.0, 'FAO West Africa FCT / Calcul AfriCalo'),
  ('Sauce oignon caramelise (yassa base)','Oignon',                  'Sauces bases africaines', 95,  1.2,  8.0, 6.0, 1.0,  80.5, 'CIQUAL 2020 / Calcul AfriCalo'),
  ('Sauce pimentee simple (piment + tomate)','Piment frais',         'Sauces bases africaines', 60,  1.2,  8.5, 2.5, 2.0,  84.0, 'FAO West Africa FCT / Calcul'),
  ('Sauce moringa (feuilles pilees)',     'Feuilles de moringa',      'Sauces bases africaines', 80,  5.0,  5.5, 4.5, 2.5,  80.0, 'FAO / Analyse nutritionnelle moringa'),
  ('Sauce sesame (base)',                 'Graines de sesame',        'Sauces bases africaines', 190, 6.5,  5.0,17.0, 2.0,  65.0, 'USDA FoodData Central / Calcul'),
  ('Sauce soumbara (condiment nere)',     'Soumbara / nere',          'Sauces bases africaines', 120, 9.5,  8.5, 5.5, 3.0,  70.0, 'FAO West Africa FCT'),
  ('Sauce oseille (dah / bissap sale)',  'Fleurs d''hibiscus',       'Sauces bases africaines', 45,  1.0,  4.5, 2.5, 3.0,  87.0, 'FAO West Africa FCT / Calcul'),
  ('Sauce aubergine africaine (base)',   'Aubergine africaine',      'Sauces bases africaines', 65,  2.0,  8.0, 3.0, 2.5,  83.0, 'FAO West Africa FCT / Calcul'),
  ('Sauce legumes sautees mixtes',       'Legumes melanges',         'Sauces bases africaines', 65,  2.0,  6.5, 3.5, 2.0,  84.0, 'CIQUAL 2020 / Calcul'),
  ('Sauce claire (jus de viande)',       'Viande de boeuf',          'Sauces bases africaines', 35,  3.0,  1.5, 1.8, 0.0,  93.0, 'USDA FoodData Central / Calcul'),
  ('Sauce crevettes sechees (base)',     'Crevettes sechees',        'Sauces bases africaines', 145, 8.5,  5.0,10.5, 0.5,  71.0, 'FAO West Africa FCT / Calcul');


-- =========================
-- BOUILLONS
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Bouillon de viande boeuf maison',     'Boeuf (os + viande)',      'Bouillons', 12,  2.0, 0.5, 0.3, 0.0,  96.5, 'USDA FoodData Central #06170'),
  ('Bouillon de poulet maison',           'Poulet (carcasse)',         'Bouillons', 15,  2.5, 0.5, 0.5, 0.0,  96.0, 'USDA FoodData Central #06172'),
  ('Bouillon de poisson maison',          'Poisson entier',            'Bouillons', 18,  3.0, 0.5, 0.5, 0.0,  95.5, 'FAO West Africa FCT / Calcul'),
  ('Bouillon de legumes',                 'Legumes melanges',          'Bouillons', 8,   0.5, 1.5, 0.2, 0.3,  97.5, 'CIQUAL 2020 / Calcul'),
  ('Bouillon de mouton',                  'Mouton (os + viande)',      'Bouillons', 14,  2.2, 0.5, 0.4, 0.0,  96.5, 'USDA / FAO Calcul'),
  ('Bouillon de crevettes sechees',       'Crevettes sechees',         'Bouillons', 22,  4.0, 0.5, 0.5, 0.0,  94.5, 'FAO West Africa FCT / Calcul'),
  ('Bouillon d''os long (gelatineux)',    'Os de boeuf',               'Bouillons', 25,  3.5, 0.5, 0.8, 0.0,  94.0, 'USDA FoodData Central / Calcul'),
  ('Cube de bouillon dissous (type maggi)','Extrait viande + sel',     'Bouillons', 10,  0.8, 1.5, 0.3, 0.0,  97.0, 'CIQUAL 2020 / Calcul'),
  ('Fond de sauce brun reduit',           'Boeuf (os)',                'Bouillons', 45,  6.0, 2.0, 1.5, 0.0,  89.0, 'USDA FoodData Central / Calcul'),
  ('Eau de cuisson de poisson (sene)',    'Poisson local',             'Bouillons', 12,  2.0, 0.5, 0.3, 0.0,  96.5, 'FAO West Africa FCT');


-- =========================
-- PATES ALIMENTAIRES CUITES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Spaghetti cuits (ble dur)',            'Spaghetti (sec)',          'Pates alimentaires cuites', 158, 5.8, 30.9, 0.9, 1.8,  62.0, 'USDA FoodData Central #20124'),
  ('Macaroni cuits',                       'Macaroni (sec)',           'Pates alimentaires cuites', 158, 5.8, 31.0, 0.9, 1.8,  62.0, 'USDA FoodData Central'),
  ('Penne cuits',                          'Penne (sec)',              'Pates alimentaires cuites', 158, 5.8, 30.9, 0.9, 1.8,  62.0, 'USDA FoodData Central'),
  ('Fusilli cuits',                        'Fusilli (sec)',            'Pates alimentaires cuites', 158, 5.8, 30.9, 0.9, 1.8,  62.0, 'USDA FoodData Central'),
  ('Vermicelles de ble cuits',            'Vermicelles (sec)',         'Pates alimentaires cuites', 152, 5.3, 30.5, 0.6, 1.4,  63.5, 'USDA FoodData Central'),
  ('Pates completes cuites (ble entier)', 'Pates ble entier (seches)', 'Pates alimentaires cuites', 149, 5.8, 28.9, 1.0, 4.0,  63.0, 'USDA FoodData Central'),
  ('Pates aux oeufs cuites',              'Pates aux oeufs (seches)',  'Pates alimentaires cuites', 138, 5.5, 25.2, 2.1, 1.3,  67.0, 'CIQUAL 2020'),
  ('Nouilles chinoises cuites (egg noodles)', 'Nouilles chinoises',   'Pates alimentaires cuites', 138, 3.2, 27.2, 1.4, 0.9,  67.0, 'USDA FoodData Central'),
  ('Nouilles de riz cuites',              'Nouilles de riz',           'Pates alimentaires cuites', 109, 1.9, 25.2, 0.2, 0.9,  73.0, 'USDA FoodData Central'),
  ('Vermicelles de riz fins cuits',       'Vermicelles de riz',        'Pates alimentaires cuites', 109, 1.8, 24.9, 0.1, 0.4,  73.0, 'USDA FoodData Central'),
  ('Noodles instantanes cuits (sans sachet)', 'Noodles instantanes',  'Pates alimentaires cuites', 145, 3.5, 26.5, 3.5, 0.6,  63.0, 'USDA / Calcul AfriCalo');


-- =========================
-- PAINS & GALETTES
-- =========================
INSERT INTO public.preparations_master
  (name, base_ingredient, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, water_content_percent, source)
VALUES
  ('Pain blanc (baguette / tapalapa)',    'Farine de ble T55',        'Pains & galettes', 265, 9.0, 53.5, 1.5, 2.3,  35.0, 'CIQUAL 2020'),
  ('Pain complet (ble entier)',           'Farine de ble complete',   'Pains & galettes', 247, 9.5, 48.0, 3.3, 5.0,  38.0, 'CIQUAL 2020'),
  ('Pain de mil',                         'Farine de mil',            'Pains & galettes', 240, 7.5, 48.5, 2.8, 4.5,  39.0, 'FAO West Africa FCT / Calcul'),
  ('Galette de sorgho',                  'Farine de sorgho',         'Pains & galettes', 225, 6.5, 47.0, 2.0, 4.0,  41.0, 'FAO West Africa FCT'),
  ('Chapati (galette de ble)',           'Farine de ble T55',        'Pains & galettes', 297,10.0, 50.5, 7.0, 2.5,  32.0, 'USDA FoodData Central / Calcul'),
  ('Mandazi (beignet leve swahili)',     'Farine de ble T55',        'Pains & galettes', 348, 7.0, 48.5,15.0, 1.5,  27.0, 'FAO East Africa FCT / Calcul'),
  ('Pain de mais (cornbread)',           'Farine de mais',           'Pains & galettes', 318, 7.5, 47.5,12.5, 2.8,  30.0, 'USDA FoodData Central #18069'),
  ('Galette de manioc (cassava flatbread)','Farine de manioc',      'Pains & galettes', 250, 1.5, 59.5, 1.5, 2.5,  35.0, 'FAO West Africa FCT / Calcul'),
  ('Bofloto / bofrot (beignet dore)',    'Farine de ble T55',        'Pains & galettes', 360, 6.5, 48.0,16.5, 1.0,  25.0, 'FAO West Africa FCT / Calcul');


-- ============================================================
-- RECAPITULATIF
-- ============================================================
-- Categorie                               | Nombre
-- ----------------------------------------|-------
-- Cereales cuites                         |    20
-- Tubercules prepares                     |    15
-- Semoules & pates cuites                 |    13
-- Purees                                  |    11
-- Fritures simples                        |    14
-- Sauces bases africaines                 |    20
-- Bouillons                               |    10
-- Pates alimentaires cuites               |    11
-- Pains & galettes                        |     9
-- ----------------------------------------|-------
-- TOTAL                                   |   123
-- ============================================================
-- Sources : USDA FoodData Central | FAO West Africa FCT
--           FAO East Africa FCT   | CIQUAL 2020
--           Calcul AfriCalo (valeurs estimees a partir des ingredients crus)
-- ============================================================
-- Phase 3 (plats complets) :
--   Thiebudienne | Yassa | Mafe | Ndole | Egusi soup | Jollof rice ...
-- ============================================================

