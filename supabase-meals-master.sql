-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 3
-- TABLES : meals_master + meal_components_master
-- ~100 plats africains emblématiques organisés par région
-- S'appuie sur : ingredients_master (Phase 1) + preparations_master (Phase 2)
-- Sources : FAO West Africa FCT · USDA · Études nutritionnelles régionales
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- ============================================================

-- ============================================================
-- CRÉATION DES TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.meals_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    country_origin TEXT,
    region TEXT,
    category TEXT,
    description TEXT,
    kcal_per_100g NUMERIC,
    protein_per_100g NUMERIC,
    carbs_per_100g NUMERIC,
    fat_per_100g NUMERIC,
    fiber_per_100g NUMERIC,
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meal_components_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_id UUID REFERENCES public.meals_master(id) ON DELETE CASCADE,
    component_type TEXT CHECK (component_type IN ('ingredient', 'preparation')),
    component_name TEXT NOT NULL,
    percentage_estimate NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index de recherche
CREATE INDEX IF NOT EXISTS idx_meals_name ON public.meals_master (name);
CREATE INDEX IF NOT EXISTS idx_meals_region ON public.meals_master (region);
CREATE INDEX IF NOT EXISTS idx_meals_category ON public.meals_master (category);
CREATE INDEX IF NOT EXISTS idx_meal_components_meal_id ON public.meal_components_master (meal_id);


-- ============================================================
-- AFRIQUE DE L'OUEST
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- Sénégal
('Thiéboudienne', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Plat national sénégalais : riz brisé cuit dans sauce tomate avec poisson et légumes', 
 148, 9.2, 20.5, 3.8, 1.4, 'FAO West Africa FCT / Étude nutritionnelle Sénégal'),

('Yassa Poulet', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Poulet mariné au citron et oignons, mijoté, servi avec riz blanc',
 155, 13.8, 16.2, 4.5, 1.1, 'FAO West Africa FCT'),

('Mafé', 'Sénégal / Mali', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût en sauce arachide avec viande de bœuf ou agneau, servi avec riz',
 178, 10.5, 14.8, 9.2, 1.6, 'FAO West Africa FCT'),

('Caldou', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe de poisson légère aux légumes et riz brisé, version allégée du thiéboudienne',
 112, 7.8, 15.6, 2.1, 1.2, 'FAO West Africa FCT'),

('Thiou Yapp', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Riz à la viande sauce tomate, variante du thiéboudienne à la viande de bœuf',
 160, 10.3, 20.1, 4.8, 1.0, 'FAO West Africa FCT'),

('Domoda', 'Gambie / Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût sauce arachide aux légumes et viande, servi avec riz',
 170, 9.8, 14.5, 8.5, 1.5, 'FAO West Africa FCT'),

-- Nigeria / Ghana
('Jollof Rice Nigeria', 'Nigeria', 'Afrique de l''Ouest', 'Plat principal',
 'Riz cuit en sauce tomate épicée avec poulet ou viande, plat emblématique ouest-africain',
 152, 8.6, 22.3, 3.9, 1.2, 'FAO West Africa FCT / USDA Adaptation'),

('Jollof Rice Ghana', 'Ghana', 'Afrique de l''Ouest', 'Plat principal',
 'Version ghanéenne du jollof rice, légèrement fumée, souvent servie avec poulet grillé',
 148, 8.2, 21.8, 3.7, 1.1, 'FAO West Africa FCT'),

('Egusi Soup', 'Nigeria', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe épaisse aux graines d''égusi (courge), feuilles de légumes, viande/poisson fumé',
 198, 11.4, 8.2, 14.5, 2.2, 'FAO West Africa FCT / USDA'),

('Okra Soup', 'Nigeria / Ghana', 'Afrique de l''Ouest', 'Soupe',
 'Soupe gluante au gombo, poisson fumé et crevettes séchées, servie avec fufu',
 85, 5.8, 8.4, 3.2, 3.1, 'FAO West Africa FCT'),

('Fufu', 'Ghana / Nigeria', 'Afrique de l''Ouest', 'Accompagnement',
 'Pâte de manioc et plantain pilés, accompagnement traditionnel des soupes',
 124, 1.2, 29.8, 0.4, 2.0, 'FAO West Africa FCT'),

('Banku', 'Ghana', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule fermentée de maïs et manioc, servie avec soupes ou tilapia grillé',
 110, 2.5, 24.8, 0.5, 1.8, 'FAO West Africa FCT'),

('Kenkey', 'Ghana', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de maïs fermenté cuite à la vapeur, version ghanéenne du banku',
 108, 2.2, 24.2, 0.6, 1.6, 'FAO West Africa FCT'),

('Kelewele', 'Ghana', 'Afrique de l''Ouest', 'Snack / Entrée',
 'Dés de plantain mûr épicés et frits, en-cas de rue très populaire',
 195, 1.4, 32.5, 7.2, 2.3, 'FAO West Africa FCT / USDA Adaptation'),

('Waakye', 'Ghana', 'Afrique de l''Ouest', 'Plat principal',
 'Mélange de riz et haricots rouges cuits ensemble, servi avec ragoût et sauces variées',
 142, 6.8, 26.4, 2.1, 3.5, 'FAO West Africa FCT'),

('Suya', 'Nigeria', 'Afrique de l''Ouest', 'Snack / Plat principal',
 'Brochettes de bœuf mariné aux épices suya (spice mix de cacahuètes), grillées',
 220, 25.5, 4.8, 11.2, 1.2, 'FAO West Africa FCT / USDA'),

('Akara', 'Nigeria / Bénin', 'Afrique de l''Ouest', 'Snack / Petit-déjeuner',
 'Beignets de niébé (pois à œil noir) frits, consommés au petit-déjeuner',
 218, 9.2, 20.1, 11.5, 4.5, 'FAO West Africa FCT'),

('Moin Moin', 'Nigeria', 'Afrique de l''Ouest', 'Plat / Accompagnement',
 'Pudding vapeur de niébé mixé avec poivrons et œufs, cuit en feuille de bananier',
 145, 8.8, 16.5, 5.2, 3.8, 'FAO West Africa FCT'),

('Pepper Soup', 'Nigeria', 'Afrique de l''Ouest', 'Soupe',
 'Soupe épicée légère à base de viande ou poisson, bouillon riche aux épices locales',
 62, 7.5, 2.8, 2.0, 0.5, 'FAO West Africa FCT'),

('Pounded Yam', 'Nigeria', 'Afrique de l''Ouest', 'Accompagnement',
 'Igname pilée en pâte lisse et élastique, accompagnement principal des soupes',
 118, 1.5, 27.5, 0.3, 3.8, 'FAO West Africa FCT'),

-- Côte d'Ivoire
('Kedjenou', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût de poulet ou pintade mijoté à l''étouffée avec légumes en canari',
 148, 17.5, 5.2, 7.0, 1.0, 'FAO West Africa FCT'),

('Attiéké Poisson', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Plat principal',
 'Semoule de manioc fermentée avec poisson grillé, tomates et oignons',
 162, 11.8, 22.5, 3.4, 1.8, 'FAO West Africa FCT'),

('Aloko', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Accompagnement / Snack',
 'Tranches de plantain mûr frites, servi avec poisson frit ou attiéké',
 188, 1.2, 31.0, 7.0, 2.2, 'FAO West Africa FCT / USDA Adaptation'),

('Sauce Graine / Moambe Côte d''Ivoire', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Plat principal',
 'Sauce à base de noix de palme avec poulet, servi avec riz ou foutou',
 195, 12.0, 6.5, 14.0, 1.8, 'FAO West Africa FCT'),

('Foutou Banane', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de plantain et manioc pilés, accompagnement des sauces ivoiriennes',
 132, 1.4, 31.5, 0.5, 2.5, 'FAO West Africa FCT'),

-- Mali / Burkina Faso / Guinée
('Tô', 'Mali / Burkina Faso', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de mil ou sorgho cuite en pâte épaisse, base alimentaire du Sahel',
 105, 3.2, 22.0, 1.2, 2.8, 'FAO West Africa FCT'),

('Sauce Arachide Mali', 'Mali', 'Afrique de l''Ouest', 'Sauce / Plat principal',
 'Sauce à base de pâte d''arachide avec viande de bœuf et légumes',
 195, 9.5, 10.2, 13.5, 2.0, 'FAO West Africa FCT'),

('Riz Gras Guinée', 'Guinée', 'Afrique de l''Ouest', 'Plat principal',
 'Riz cuit dans bouillon gras avec viande, légumes et huile de palme',
 168, 8.8, 22.5, 5.0, 1.0, 'FAO West Africa FCT'),

-- Sénégal / Mauritanie
('Thiakry', 'Sénégal', 'Afrique de l''Ouest', 'Dessert / Petit-déjeuner',
 'Couscous de mil avec lait caillé sucré et yogourt, dessert ou petit-déjeuner',
 178, 5.2, 32.5, 3.8, 1.5, 'FAO West Africa FCT'),

('Lakh', 'Sénégal', 'Afrique de l''Ouest', 'Petit-déjeuner / Dessert',
 'Bouillie de mil au lait de vache et sucre, petit-déjeuner traditionnel',
 122, 4.0, 22.5, 2.5, 1.2, 'FAO West Africa FCT'),

('Benachin', 'Gambie', 'Afrique de l''Ouest', 'Plat principal',
 'Version gambienne du jollof rice avec viande et légumes, cuisson one-pot',
 150, 9.0, 21.5, 4.0, 1.2, 'FAO West Africa FCT'),

-- Togo / Bénin
('Amiwo', 'Togo / Bénin', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de maïs cuite dans sauce tomate rouge, accompagnement traditionnel',
 125, 2.5, 26.0, 1.5, 1.5, 'FAO West Africa FCT'),

('Gboma Dessi', 'Togo / Bénin', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe aux feuilles de gombo (amarante) avec poisson fumé et épices',
 88, 6.2, 8.5, 3.5, 3.0, 'FAO West Africa FCT');


-- ============================================================
-- AFRIQUE CENTRALE
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- Cameroun
('Ndolé', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Plat national camerounais : feuilles amères de ndolé, arachides, crevettes et viande',
 195, 12.8, 8.5, 13.5, 3.5, 'FAO / Étude MINRESI Cameroun'),

('Poulet DG', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Poulet frit avec plantains mûrs, légumes et sauce tomate, plat de prestige',
 215, 16.5, 18.5, 9.0, 2.2, 'FAO West Africa FCT / Adaptation Cameroun'),

('Eru', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Feuilles d''eru (Gnetum africanum) cuites avec waterleaf, huile de palme et viande fumée',
 168, 9.5, 5.2, 12.5, 4.5, 'FAO / Études nutritionnelles Cameroun'),

('Koki', 'Cameroun', 'Afrique Centrale', 'Plat / Accompagnement',
 'Gâteau de haricots niébé mixés avec huile de palme, cuit en feuilles de bananier',
 188, 10.5, 18.5, 8.5, 5.0, 'FAO West Africa FCT'),

('Mbongo Tchobi', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Ragoût de poisson ou viande en sauce noire aux épices camerounaises (bois de Calabar)',
 175, 14.5, 5.5, 11.0, 1.2, 'FAO / Adaptation Cameroun'),

('Bobolo', 'Cameroun', 'Afrique Centrale', 'Accompagnement',
 'Bâton de manioc fermenté cuit en feuilles de bananier, accompagnement classique',
 165, 0.8, 39.5, 0.4, 1.5, 'FAO West Africa FCT'),

-- Congo / RDC
('Pondu / Saka-Saka', 'RD Congo', 'Afrique Centrale', 'Plat principal',
 'Feuilles de manioc pilées cuites avec huile de palme et poisson fumé ou viande',
 138, 6.5, 10.2, 8.5, 4.8, 'FAO / Étude nutritionnelle INERA Congo'),

('Moambe Poulet', 'Congo / Angola', 'Afrique Centrale', 'Plat principal',
 'Poulet mijoté en sauce de noix de palme (huile de palme rouge épaisse) avec épices',
 210, 14.8, 5.5, 15.5, 1.5, 'FAO / Analyse nutritionnelle régionale'),

('Fufu de Manioc', 'RD Congo / Congo', 'Afrique Centrale', 'Accompagnement',
 'Pâte de farine de manioc cuite à l''eau, base alimentaire principale en Afrique Centrale',
 138, 0.7, 33.0, 0.2, 1.5, 'FAO West Africa FCT'),

('Liboke de Poisson', 'RD Congo', 'Afrique Centrale', 'Plat principal',
 'Poisson mariné aux épices et herbes, cuit en papillote dans feuilles de bananier',
 148, 16.5, 3.8, 7.5, 0.8, 'FAO / Adaptation'),

-- Gabon / Guinée Équatoriale
('Nyembwe', 'Gabon', 'Afrique Centrale', 'Plat principal',
 'Poulet ou poisson en sauce de noix de palme traditionnelle gabonaise',
 208, 13.5, 5.0, 15.8, 1.2, 'FAO / Analyse régionale Gabon'),

('Poisson Braisé Africain', 'Cameroun / Congo', 'Afrique Centrale', 'Plat principal',
 'Poisson entier épicé grillé sur braises, servi avec plantain frit ou attiéké',
 185, 20.5, 8.5, 8.5, 0.8, 'USDA / FAO Adaptation'),

-- Tchad / Centrafrique
('Daraba', 'Tchad', 'Afrique Centrale', 'Plat principal',
 'Ragoût de gombo séché avec viande et sauce arachide, accompagné de boule de mil',
 158, 8.5, 15.5, 7.5, 3.5, 'FAO / Études nutritionnelles Tchad');


-- ============================================================
-- AFRIQUE DE L'EST
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- Kenya / Tanzanie
('Ugali Nyama', 'Kenya / Tanzanie', 'Afrique de l''Est', 'Plat principal',
 'Polenta de maïs (ugali) servie avec viande en ragoût (nyama choma ou stew)',
 142, 8.5, 22.8, 3.2, 1.8, 'FAO East Africa FCT / Kenya MoH'),

('Ugali Sukuma Wiki', 'Kenya', 'Afrique de l''Est', 'Plat principal',
 'Polenta de maïs avec légumes verts (kale) sautés aux oignons et tomates',
 112, 3.8, 20.5, 2.5, 2.8, 'FAO East Africa FCT'),

('Nyama Choma', 'Kenya', 'Afrique de l''Est', 'Plat principal',
 'Viande de chèvre ou bœuf grillée à la braise, plat de fête et convivialité',
 218, 24.5, 0.0, 12.8, 0.0, 'USDA / Kenya MoH'),

('Pilau Kenya', 'Kenya', 'Afrique de l''Est', 'Plat principal',
 'Riz épicé aux épices swahili (cardamome, clou girofle, cumin) avec viande',
 175, 9.8, 24.5, 5.2, 0.8, 'FAO East Africa FCT'),

('Biryani Swahili', 'Kenya / Tanzanie', 'Afrique de l''Est', 'Plat principal',
 'Riz parfumé aux épices swahili avec poulet ou bœuf, version côte est-africaine',
 182, 10.5, 24.8, 5.5, 0.8, 'FAO East Africa FCT / USDA'),

('Maharagwe', 'Kenya', 'Afrique de l''Est', 'Plat / Accompagnement',
 'Haricots rouges cuits en sauce tomate crémeuse au lait de coco, servi avec ugali',
 118, 6.5, 18.5, 2.8, 5.5, 'FAO East Africa FCT'),

-- Éthiopie / Érythrée
('Doro Wat sur Injera', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de poulet épicé au berbéré avec œufs durs, servi sur injera',
 175, 12.5, 16.8, 7.5, 2.5, 'FAO / Ethiopian Institute of Nutrition'),

('Misir Wat sur Injera', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de lentilles rouges au berbéré et niter kibbeh, servi sur injera',
 148, 7.5, 22.5, 4.2, 5.2, 'Ethiopian Institute of Nutrition'),

('Tibs', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Bœuf ou agneau sauté aux oignons, tomates et épices, servi avec injera',
 198, 18.5, 5.5, 11.5, 0.8, 'FAO / Ethiopian Institute of Nutrition'),

('Injera', 'Éthiopie / Érythrée', 'Afrique de l''Est', 'Accompagnement',
 'Pain plat fermenté au teff (farine de teff), base de la cuisine éthiopienne',
 165, 5.8, 32.5, 1.5, 2.8, 'Ethiopian Institute of Nutrition / USDA'),

('Shiro Wat', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Ragoût épais de farine de pois chiches aux épices berbéré, végétarien',
 138, 6.5, 19.5, 4.5, 4.5, 'Ethiopian Institute of Nutrition'),

('Ful Éthiopien', 'Éthiopie', 'Afrique de l''Est', 'Petit-déjeuner / Plat',
 'Fèves mijotées au beurre clarifié et épices, petit-déjeuner éthiopien',
 145, 7.8, 20.5, 4.2, 6.5, 'FAO / Ethiopian Institute of Nutrition'),

-- Ouganda / Rwanda / Burundi
('Matoke', 'Ouganda', 'Afrique de l''Est', 'Plat principal',
 'Bananes plantain vertes cuites à la vapeur et pilées avec sauce aux arachides ou viande',
 125, 2.0, 29.5, 1.5, 3.5, 'FAO East Africa FCT / Uganda MoH'),

('Rolex Ouganda', 'Ouganda', 'Afrique de l''Est', 'Snack',
 'Chapati roulé avec omelette aux légumes (tomates, oignons, chou), street food populaire',
 215, 8.5, 28.5, 8.0, 1.5, 'Adaptation USDA / FAO'),

('Isombe', 'Rwanda / Burundi', 'Afrique de l''Est', 'Plat principal',
 'Feuilles de manioc pilées cuites avec arachides et huile, plat traditionnel rwandais',
 148, 5.8, 14.5, 8.5, 4.5, 'FAO East Africa FCT'),

-- Somalie / Djibouti
('Bariis Iskukaris', 'Somalie', 'Afrique de l''Est', 'Plat principal',
 'Riz parfumé somalien aux épices (cardamome, cannelle, cumin) avec viande caprins',
 188, 10.5, 26.5, 5.2, 0.8, 'FAO / Analyse nutritionnelle'),

('Canjeero', 'Somalie / Djibouti', 'Afrique de l''Est', 'Petit-déjeuner',
 'Pain fermenté somalien similaire à l''injera, au sorgho ou maïs, servi avec miel',
 168, 4.8, 34.5, 1.8, 1.8, 'FAO / Analyse régionale');


-- ============================================================
-- AFRIQUE DU NORD
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- Maroc
('Couscous Royal', 'Maroc', 'Afrique du Nord', 'Plat principal',
 'Couscous de semoule avec méchoui (agneau), merguez, légumes et bouillon parfumé',
 175, 9.8, 24.5, 5.2, 2.8, 'CIQUAL / Tables composition Maghreb'),

('Tajine Poulet Olives', 'Maroc', 'Afrique du Nord', 'Plat principal',
 'Tajine de poulet aux olives et citrons confits, cuit lentement aux épices marocaines',
 165, 14.5, 5.8, 9.5, 1.5, 'CIQUAL / Tables Maroc'),

('Tajine Agneau Pruneaux', 'Maroc', 'Afrique du Nord', 'Plat principal',
 'Tajine d''agneau aux pruneaux et amandes, sauce sucrée-salée aux épices',
 218, 14.2, 16.5, 10.5, 2.0, 'CIQUAL / Tables Maroc'),

('Harira', 'Maroc / Algérie', 'Afrique du Nord', 'Soupe',
 'Soupe épaisse de lentilles, pois chiches et tomates avec herbes, soupe du Ramadan',
 95, 5.5, 15.8, 1.8, 4.5, 'CIQUAL / Tables composition Maghreb'),

('Bastilla au Pigeon', 'Maroc', 'Afrique du Nord', 'Entrée / Plat',
 'Feuilleté de briouates au pigeon ou poulet, amandes, sucre et cannelle',
 285, 12.5, 22.5, 16.5, 1.5, 'CIQUAL / Tables Maroc'),

('Mechoui', 'Maroc / Algérie', 'Afrique du Nord', 'Plat principal',
 'Agneau entier rôti à la braise avec cumin et ail, plat de fête',
 235, 22.5, 0.0, 16.0, 0.0, 'CIQUAL / USDA'),

-- Tunisie / Algérie
('Chakchouka / Shakshuka', 'Tunisie / Algérie', 'Afrique du Nord', 'Plat principal',
 'Œufs pochés dans sauce tomate épicée aux poivrons et merguez',
 118, 7.5, 8.5, 6.5, 2.5, 'CIQUAL / Tables Maghreb'),

('Couscous à la Viande Algérie', 'Algérie', 'Afrique du Nord', 'Plat principal',
 'Couscous semoule de blé avec agneau, merguez, légumes et bouillon harissa',
 168, 8.5, 23.5, 4.8, 2.5, 'CIQUAL / Tables Algérie'),

('Brik à l''Œuf', 'Tunisie', 'Afrique du Nord', 'Entrée / Snack',
 'Feuille de brick croustillante fourrée à l''œuf et thon, frite',
 245, 9.5, 20.5, 14.5, 0.8, 'CIQUAL / Tables Tunisie'),

('Lablabi', 'Tunisie', 'Afrique du Nord', 'Plat principal',
 'Soupe de pois chiches épicée au cumin et harissa, garnie de croûtons et œuf',
 135, 7.5, 20.5, 3.2, 5.5, 'CIQUAL / Tables Tunisie'),

-- Égypte / Libye
('Kushari', 'Égypte', 'Afrique du Nord', 'Plat principal',
 'Mélange de riz, lentilles, macaroni, sauce tomate épicée et oignons frits',
 185, 7.5, 33.5, 3.8, 4.0, 'USDA / Tables Égypte'),

('Ful Medames', 'Égypte', 'Afrique du Nord', 'Petit-déjeuner / Plat',
 'Fèves mijotées à l''ail et citron avec huile d''olive, petit-déjeuner national égyptien',
 132, 8.5, 18.5, 3.2, 7.5, 'USDA FoodData Central / Tables Égypte'),

('Molokhia', 'Égypte', 'Afrique du Nord', 'Soupe / Plat principal',
 'Soupe aux feuilles de corète (molokhia) avec poulet ou lapin, servie avec riz',
 85, 5.5, 9.5, 2.8, 2.5, 'USDA / Tables Composition Égypte'),

('Feteer Meshaltit', 'Égypte', 'Afrique du Nord', 'Petit-déjeuner / Snack',
 'Pâte feuilletée beurrée égyptienne, servie sucrée (miel) ou salée (fromage)',
 312, 7.5, 38.5, 15.0, 0.8, 'CIQUAL Adaptation / Tables Égypte');


-- ============================================================
-- AFRIQUE AUSTRALE
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- Afrique du Sud
('Bobotie', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Hachis de viande épicé aux raisins secs et abricots, recouvert d''appareil à l''œuf',
 188, 14.5, 10.5, 10.5, 1.2, 'USDA / South Africa NFCS'),

('Pap & Chakalaka', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Polenta de maïs (pap) accompagnée de relish épicée aux haricots et légumes',
 128, 3.5, 23.5, 2.8, 3.5, 'South Africa NFCS / USDA'),

('Umngqusho', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Plat traditionnel Xhosa de maïs concassé et haricots borlotti cuits ensemble',
 148, 6.5, 28.5, 1.5, 5.5, 'South Africa NFCS / FAO'),

('Braai Lamb Chops', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Côtelettes d''agneau marinées aux épices braai, grillées sur braises',
 245, 22.5, 0.0, 17.0, 0.0, 'USDA FoodData Central / South Africa'),

('Biltong', 'Afrique du Sud', 'Afrique Australe', 'Snack',
 'Viande de bœuf séchée et épicée, snack iconique sud-africain',
 268, 43.5, 2.5, 8.5, 0.0, 'USDA / South Africa NFCS'),

('Boerewors', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Saucisse fermière épicée au coriandre et vinaigre, grillée au braai',
 312, 15.5, 2.5, 27.0, 0.0, 'South Africa NFCS / USDA'),

-- Zimbabwe / Zambie
('Sadza Nhemba', 'Zimbabwe', 'Afrique Australe', 'Plat principal',
 'Polenta de maïs (sadza) avec haricots noirs ou ragoût de légumes',
 142, 5.0, 27.5, 1.8, 4.5, 'FAO East Africa FCT / Adaptation Zimbabwe'),

('Nshima & Ndiwo', 'Zambie', 'Afrique Australe', 'Plat principal',
 'Polenta épaisse de maïs (nshima) avec légumes-feuilles ou poisson (ndiwo)',
 130, 4.5, 25.5, 1.5, 3.0, 'FAO / Zambia Food Composition'),

-- Madagascar
('Romazava', 'Madagascar', 'Afrique Australe', 'Plat principal',
 'Plat national malgache : viande de bœuf et pork avec brèdes variées (feuilles vertes)',
 142, 12.5, 6.5, 8.5, 2.5, 'FAO / Analyse nutritionnelle Madagascar'),

('Ravitoto', 'Madagascar', 'Afrique Australe', 'Plat principal',
 'Feuilles de manioc pilées cuites avec porc, ail et huile, servi avec riz',
 178, 10.5, 10.5, 11.5, 3.5, 'FAO / Analyse Madagascar'),

('Vary Amin''anana', 'Madagascar', 'Afrique Australe', 'Plat principal',
 'Riz cuit avec feuilles vertes (brèdes) et viande ou poisson, plat quotidien',
 132, 6.5, 22.5, 2.5, 1.8, 'FAO / Analyse Madagascar'),

-- Mozambique
('Matapa', 'Mozambique', 'Afrique Australe', 'Plat principal',
 'Feuilles de manioc pilées cuites dans lait de coco avec crevettes ou crabe',
 168, 8.5, 10.5, 11.5, 3.5, 'FAO / Analyse nutritionnelle Mozambique'),

('Caril de Peixe Moçambicano', 'Mozambique', 'Afrique Australe', 'Plat principal',
 'Curry de poisson au lait de coco, tomates et épices, servi avec riz',
 178, 14.5, 10.5, 9.5, 1.5, 'USDA / FAO Adaptation Mozambique');


-- ============================================================
-- PLATS PANAFRICAINS / TRANSRÉGIONAUX
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Sauce Tomate Africaine', 'Panafricain', 'Panafricain', 'Sauce / Base',
 'Sauce tomate de base avec oignon, ail, huile de palme ou arachide, épices locales',
 68, 1.8, 8.5, 3.5, 1.8, 'FAO West Africa FCT / USDA'),

('Riz Gras au Poulet', 'Panafricain', 'Panafricain', 'Plat principal',
 'Riz cuit dans bouillon de poulet avec légumes et épices, version panafricaine',
 158, 9.5, 22.0, 4.0, 1.0, 'FAO / USDA Adaptation'),

('Soupe de Poisson Africaine', 'Panafricain', 'Panafricain', 'Soupe',
 'Bouillon de poisson frais aux légumes et épices locales, plat côtier commun',
 72, 8.5, 4.5, 2.0, 0.8, 'FAO / USDA'),

('Brochettes Africaines', 'Panafricain', 'Panafricain', 'Plat / Snack',
 'Brochettes de viande (bœuf / agneau / poulet) marinées et grillées',
 205, 22.5, 2.5, 11.5, 0.2, 'USDA FoodData Central'),

('Ragoût de Légumineuses', 'Panafricain', 'Panafricain', 'Plat principal',
 'Haricots ou niébé cuits en sauce tomate et oignons, plat végétarien quotidien',
 115, 7.5, 18.5, 1.8, 6.5, 'FAO / USDA'),

('Bouillie de Mil', 'Panafricain', 'Panafricain', 'Petit-déjeuner',
 'Bouillie de farine de mil ou maïs au lait et sucre, petit-déjeuner africain commun',
 95, 3.2, 18.5, 1.5, 1.2, 'FAO West Africa FCT'),

('Plantain Bouilli', 'Panafricain', 'Panafricain', 'Accompagnement',
 'Plantain vert ou semi-mûr bouilli à l''eau, accompagnement simple et nutritif',
 118, 1.2, 28.5, 0.4, 2.2, 'USDA FoodData Central / FAO');


-- ============================================================
-- MEAL COMPONENTS — AFRIQUE DE L'OUEST
-- ============================================================

-- Thiéboudienne
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz brisé (cru)', 45 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 25 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 5 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 5 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chou blanc', 5 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Thiéboudienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Thiéboudienne';

-- Yassa Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 35 FROM public.meals_master WHERE name = 'Yassa Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 38 FROM public.meals_master WHERE name = 'Yassa Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Yassa Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 5 FROM public.meals_master WHERE name = 'Yassa Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 4 FROM public.meals_master WHERE name = 'Yassa Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Moutarde (préparation)', 2 FROM public.meals_master WHERE name = 'Yassa Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Yassa Poulet';

-- Mafé
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 30 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide / Pâte', 15 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 30 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 7 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 3 FROM public.meals_master WHERE name = 'Mafé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Mafé';

-- Jollof Rice Nigeria
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 55 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc / filet, cru)', 15 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 3 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 1 FROM public.meals_master WHERE name = 'Jollof Rice Nigeria';

-- Egusi Soup
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Graines d''égusi (courge)', 25 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 20 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 10 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 15 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 10 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 5 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Egusi Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Egusi Soup';

-- Fufu
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 60 FROM public.meals_master WHERE name = 'Fufu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 40 FROM public.meals_master WHERE name = 'Fufu';

-- Banku
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 65 FROM public.meals_master WHERE name = 'Banku';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gari (semoule manioc fermentée)', 35 FROM public.meals_master WHERE name = 'Banku';

-- Kelewele
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 80 FROM public.meals_master WHERE name = 'Kelewele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 10 FROM public.meals_master WHERE name = 'Kelewele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 5 FROM public.meals_master WHERE name = 'Kelewele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Kelewele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Kelewele';

-- Suya
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 70 FROM public.meals_master WHERE name = 'Suya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides rôties', 15 FROM public.meals_master WHERE name = 'Suya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 5 FROM public.meals_master WHERE name = 'Suya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 5 FROM public.meals_master WHERE name = 'Suya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 3 FROM public.meals_master WHERE name = 'Suya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Suya';

-- Akara
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 55 FROM public.meals_master WHERE name = 'Akara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 20 FROM public.meals_master WHERE name = 'Akara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Akara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Akara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Akara';

-- Kedjenou
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 60 FROM public.meals_master WHERE name = 'Kedjenou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Kedjenou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Kedjenou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 8 FROM public.meals_master WHERE name = 'Kedjenou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Kedjenou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Kedjenou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 1 FROM public.meals_master WHERE name = 'Kedjenou';

-- Attiéké Poisson
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gari (semoule manioc fermentée)', 45 FROM public.meals_master WHERE name = 'Attiéké Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 35 FROM public.meals_master WHERE name = 'Attiéké Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Attiéké Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Attiéké Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Attiéké Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Attiéké Poisson';

-- Tô
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 90 FROM public.meals_master WHERE name = 'Tô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Tô';

-- Waakye
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 55 FROM public.meals_master WHERE name = 'Waakye';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 35 FROM public.meals_master WHERE name = 'Waakye';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Waakye';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Waakye';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 3 FROM public.meals_master WHERE name = 'Waakye';


-- ============================================================
-- MEAL COMPONENTS — AFRIQUE CENTRALE
-- ============================================================

-- Ndolé
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 25 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 10 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 20 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 25 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Ndolé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Ndolé';

-- Poulet DG
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 40 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 25 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 7 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 5 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Poulet DG';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Poulet DG';

-- Pondu / Saka-Saka
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 60 FROM public.meals_master WHERE name = 'Pondu / Saka-Saka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Pondu / Saka-Saka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Pondu / Saka-Saka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Pondu / Saka-Saka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Pondu / Saka-Saka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Pondu / Saka-Saka';

-- Moambe Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 55 FROM public.meals_master WHERE name = 'Moambe Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 25 FROM public.meals_master WHERE name = 'Moambe Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Moambe Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Moambe Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Moambe Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Moambe Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Moambe Poulet';

-- Fufu de Manioc
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 90 FROM public.meals_master WHERE name = 'Fufu de Manioc';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Fufu de Manioc';


-- ============================================================
-- MEAL COMPONENTS — AFRIQUE DE L'EST
-- ============================================================

-- Ugali Nyama
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 55 FROM public.meals_master WHERE name = 'Ugali Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 30 FROM public.meals_master WHERE name = 'Ugali Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Ugali Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Ugali Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Ugali Nyama';

-- Doro Wat sur Injera
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 30 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 35 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (poule)', 8 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 8 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 4 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Doro Wat sur Injera';

-- Misir Wat sur Injera
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 35 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles rouges (sèches)', 35 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 8 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 5 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Misir Wat sur Injera';

-- Injera
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 90 FROM public.meals_master WHERE name = 'Injera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Injera';

-- Matoke
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 70 FROM public.meals_master WHERE name = 'Matoke';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 15 FROM public.meals_master WHERE name = 'Matoke';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Matoke';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Matoke';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Matoke';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Matoke';

-- Pilau Kenya
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 25 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 2 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Clou de girofle moulu', 1 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Pilau Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Pilau Kenya';


-- ============================================================
-- MEAL COMPONENTS — AFRIQUE DU NORD
-- ============================================================

-- Couscous Royal
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Couscous (cru)', 40 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 25 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 8 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courge / Citrouille', 8 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon blanc', 5 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches (secs)', 5 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 4 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 2 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Couscous Royal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Couscous Royal';

-- Tajine Poulet Olives
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 55 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 8 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 8 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 3 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Tajine Poulet Olives';

-- Harira
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles vertes (sèches)', 20 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches (secs)', 15 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 15 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 5 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 5 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 5 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Harira';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 2 FROM public.meals_master WHERE name = 'Harira';

-- Chakchouka
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 35 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (poule)', 25 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 15 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 8 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 1 FROM public.meals_master WHERE name = 'Chakchouka / Shakshuka';

-- Kushari
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 30 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles vertes (sèches)', 20 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule de blé dur', 15 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre blanc', 3 FROM public.meals_master WHERE name = 'Kushari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Kushari';

-- Ful Medames
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves (sèches)', 65 FROM public.meals_master WHERE name = 'Ful Medames';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 10 FROM public.meals_master WHERE name = 'Ful Medames';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 10 FROM public.meals_master WHERE name = 'Ful Medames';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Ful Medames';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 3 FROM public.meals_master WHERE name = 'Ful Medames';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 4 FROM public.meals_master WHERE name = 'Ful Medames';


-- ============================================================
-- MEAL COMPONENTS — AFRIQUE AUSTRALE
-- ============================================================

-- Bobotie
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 50 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (poule)', 12 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 8 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain blanc de boulangerie', 5 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 3 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Bobotie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Bobotie';

-- Pap & Chakalaka
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 50 FROM public.meals_master WHERE name = 'Pap & Chakalaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 20 FROM public.meals_master WHERE name = 'Pap & Chakalaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Pap & Chakalaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Pap & Chakalaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 6 FROM public.meals_master WHERE name = 'Pap & Chakalaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 4 FROM public.meals_master WHERE name = 'Pap & Chakalaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Pap & Chakalaka';

-- Romazava
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 35 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc filet (cru)', 15 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 20 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 10 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Romazava';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Romazava';

-- Matapa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 45 FROM public.meals_master WHERE name = 'Matapa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 25 FROM public.meals_master WHERE name = 'Matapa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 15 FROM public.meals_master WHERE name = 'Matapa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 8 FROM public.meals_master WHERE name = 'Matapa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Matapa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 3 FROM public.meals_master WHERE name = 'Matapa';


-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================
-- SELECT region, COUNT(*) as total FROM meals_master GROUP BY region ORDER BY region;
-- SELECT m.name, COUNT(mc.id) as nb_composants
-- FROM meals_master m
-- LEFT JOIN meal_components_master mc ON mc.meal_id = m.id
-- GROUP BY m.name ORDER BY m.name;

-- ============================================================
-- PHASE 3 — EXTENSION AFRIQUE DE L'OUEST
-- PARTIE 1 : Bénin · Burkina Faso · Cap-Vert · Côte d'Ivoire
--            Gambie · Ghana · Guinée · Guinée-Bissau
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- ============================================================
-- BÉNIN
-- Sources : FAO West Africa FCT · USDA · Etude CREDESA Bénin
-- ============================================================

('Akassa', 'Bénin', 'Afrique de l''Ouest', 'Accompagnement',
 'Bouillie fermentée de maïs blanc moulue, emballée en feuille de bananier, base alimentaire du Bénin',
 92, 1.8, 21.2, 0.4, 1.2, 'FAO West Africa FCT / CREDESA Bénin'),

('Ablo', 'Bénin', 'Afrique de l''Ouest', 'Accompagnement / Snack',
 'Galette de riz fermenté cuite à la vapeur, texture spongieuse, servie avec sauce ou poisson',
 145, 3.2, 30.5, 1.2, 1.5, 'FAO West Africa FCT / CREDESA Bénin'),

('Abobô', 'Bénin', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe de crabe ou crevettes en sauce de noix de palme avec légumes, plat côtier béninois',
 185, 12.2, 6.5, 12.8, 1.5, 'FAO West Africa FCT / USDA Adaptation'),

('Kluiklui', 'Bénin', 'Afrique de l''Ouest', 'Snack',
 'Beignets de pâte d''arachide frits en forme de spirale, snack très populaire au Bénin',
 478, 17.5, 36.5, 30.5, 4.2, 'USDA FoodData Central / FAO Adaptation Bénin'),

('Amiwo au Poisson', 'Bénin', 'Afrique de l''Ouest', 'Plat principal',
 'Boule de maïs cuite en sauce tomate rouge avec poisson fumé, version enrichie de l''amiwo',
 155, 10.2, 21.5, 3.8, 1.8, 'FAO West Africa FCT / CREDESA Bénin'),

('Sauce Feuilles Bénin', 'Bénin', 'Afrique de l''Ouest', 'Plat principal',
 'Sauce aux feuilles de morelle noire (crincrin) avec poisson fumé et huile de palme',
 98, 6.5, 6.8, 5.5, 3.2, 'FAO West Africa FCT / CREDESA'),

-- ============================================================
-- BURKINA FASO
-- Sources : FAO West Africa FCT · INSS Burkina Faso · USDA
-- ============================================================

('Babenda', 'Burkina Faso', 'Afrique de l''Ouest', 'Plat principal',
 'Feuilles vertes séchées (moringa, feuilles de baobab) cuites avec soumbala et arachides',
 168, 8.5, 9.2, 11.2, 4.0, 'FAO West Africa FCT / INSS Burkina Faso'),

('Riz Gras Burkina', 'Burkina Faso', 'Afrique de l''Ouest', 'Plat principal',
 'Riz cuit dans bouillon de viande de mouton avec légumes et huile, plat de fête burkinabè',
 165, 7.8, 23.5, 4.8, 0.8, 'FAO West Africa FCT / INSS Burkina Faso'),

('Dégué Burkina', 'Burkina Faso', 'Afrique de l''Ouest', 'Dessert / Petit-déjeuner',
 'Couscous de mil avec lait caillé sucré (yaourt local), dessert et petit-déjeuner traditionnel',
 162, 5.0, 28.5, 3.5, 1.5, 'FAO West Africa FCT / INSS Burkina Faso'),

('Soupe de Feuilles au Soumbala', 'Burkina Faso', 'Afrique de l''Ouest', 'Soupe',
 'Bouillon aux feuilles de bao-bab et soumbala (graines de néré fermentées), épicé',
 78, 3.8, 9.5, 3.0, 2.8, 'FAO West Africa FCT / INSS Burkina Faso'),

('Ragout d''Agneau Burkina', 'Burkina Faso', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût d''agneau aux légumes racines et arachides, servi avec tô de mil ou riz',
 178, 13.2, 11.5, 8.8, 1.5, 'FAO West Africa FCT / INSS Burkina Faso'),

('Tô de Sorgho', 'Burkina Faso', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de sorgho cuite en pâte épaisse, variante du tô de mil, base alimentaire du Burkina',
 108, 3.0, 22.8, 1.0, 3.0, 'FAO West Africa FCT / INSS Burkina Faso'),

-- ============================================================
-- CAP-VERT
-- Sources : FAO / USDA / Instituto Nacional de Saúde Pública Cap-Vert
-- ============================================================

('Cachupa Rica', 'Cap-Vert', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût emblématique du Cap-Vert : maïs concassé, haricots, viandes variées (porc, bœuf, chorizo)',
 175, 11.2, 22.5, 5.2, 4.5, 'USDA / Instituto Nacional Saúde Pública Cap-Vert'),

('Cachupa Pobre', 'Cap-Vert', 'Afrique de l''Ouest', 'Plat principal',
 'Version végétarienne de la cachupa : maïs et haricots sans viande, plat quotidien des plus modestes',
 138, 6.5, 24.8, 2.2, 5.8, 'USDA / FAO / INSPV Cap-Vert'),

('Caldo de Peixe Cap-Vert', 'Cap-Vert', 'Afrique de l''Ouest', 'Soupe',
 'Bouillon de poisson frais aux légumes (banane, manioc, patate douce), plat côtier cap-verdien',
 88, 10.2, 7.5, 2.5, 1.2, 'FAO / USDA Adaptation Cap-Vert'),

('Xerém com Chouriço', 'Cap-Vert', 'Afrique de l''Ouest', 'Plat principal',
 'Gruau de maïs grossier (xerém) cuit avec chorizo cap-verdien et légumes, plat réconfortant',
 198, 9.2, 28.5, 5.8, 2.2, 'USDA / FAO Adaptation Cap-Vert'),

('Pastéis de Atum Cap-Vert', 'Cap-Vert', 'Afrique de l''Ouest', 'Snack / Entrée',
 'Chaussons frits farcis au thon, oignons et épices, en-cas populaire dans les îles',
 242, 10.8, 21.5, 13.2, 1.2, 'USDA FoodData Central / FAO Adaptation'),

('Arroz de Marisco Cap-Vert', 'Cap-Vert', 'Afrique de l''Ouest', 'Plat principal',
 'Riz aux fruits de mer (crevettes, palourdes, calamar), cuisiné à la tomate et ail',
 162, 11.5, 22.0, 3.5, 0.8, 'USDA / FAO Adaptation Cap-Vert'),

-- ============================================================
-- CÔTE D''IVOIRE (compléments)
-- Sources : FAO West Africa FCT / CNRA Côte d''Ivoire
-- ============================================================

('Garba', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Plat principal',
 'Attiéké (semoule de manioc) servi avec thon albacore frit entier, tomates et piment, street food iconique d''Abidjan',
 192, 14.5, 23.5, 4.8, 1.8, 'FAO West Africa FCT / CNRA Côte d''Ivoire'),

('Placali', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Accompagnement',
 'Pâte de manioc fermenté gélatineuse, accompagnement des sauces ivoiriennes, texture lisse',
 132, 0.8, 32.0, 0.3, 1.2, 'FAO West Africa FCT / CNRA Côte d''Ivoire'),

('Soupe de Gombo Ivoirienne', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Soupe',
 'Soupe au gombo frais avec poisson fumé, escargot et huile de palme, accompagne le placali',
 98, 6.8, 7.5, 4.8, 3.5, 'FAO West Africa FCT'),

('Alloco Poisson Frit', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Plat principal',
 'Plantain mûr frit accompagné de poisson frit entier et sauce pimentée, plat complet ivoirien',
 225, 13.5, 27.5, 7.5, 2.5, 'FAO West Africa FCT / USDA Adaptation'),

('Djoumblé', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Soupe',
 'Soupe gluante aux feuilles de jute (corète), viande de bœuf et épices, plat nord ivoirien',
 92, 5.8, 7.8, 4.2, 3.8, 'FAO West Africa FCT'),

('Foufou Igname', 'Côte d''Ivoire', 'Afrique de l''Ouest', 'Accompagnement',
 'Igname pilée en pâte lisse et élastique, variante ivoirienne servie avec sauces en feuilles',
 120, 1.8, 27.8, 0.3, 4.0, 'FAO West Africa FCT / CNRA Côte d''Ivoire'),

-- ============================================================
-- GAMBIE (compléments)
-- Sources : FAO West Africa FCT / MRC Gambia / USDA
-- ============================================================

('Soupe kanja', 'Gambie', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe épaisse au gombo avec huile de palme, poisson fumé et légumes, plat national gambien',
 148, 9.2, 8.5, 8.8, 4.2, 'FAO West Africa FCT / MRC Gambia'),

('Plasas', 'Gambie', 'Afrique de l''Ouest', 'Plat principal',
 'Feuilles de manioc cuites avec huile de palme, viande de bœuf et poisson fumé, servi avec riz',
 158, 10.5, 7.2, 9.8, 3.8, 'FAO West Africa FCT / MRC Gambia'),

('Afra Gambie', 'Gambie', 'Afrique de l''Ouest', 'Plat principal',
 'Viande de bœuf ou chèvre grillée sur braises aux épices, accompagnée de pain et oignons',
 215, 23.5, 2.2, 12.5, 0.2, 'USDA FoodData Central / MRC Gambia'),

('Chéré', 'Gambie', 'Afrique de l''Ouest', 'Accompagnement / Dessert',
 'Couscous de mil cuit à la vapeur avec lait caillé et sucre, plat festif gambien',
 158, 4.5, 30.2, 2.8, 2.0, 'FAO West Africa FCT / MRC Gambia'),

('Mbahal', 'Gambie', 'Afrique de l''Ouest', 'Plat principal',
 'Riz et haricots noirs cuits ensemble avec huile de palme et poisson fumé',
 165, 7.5, 25.5, 3.8, 3.2, 'FAO West Africa FCT / MRC Gambia'),

-- ============================================================
-- GHANA (compléments)
-- Sources : FAO West Africa FCT / Ghana Health Service / USDA
-- ============================================================

('Light Soup Ghana', 'Ghana', 'Afrique de l''Ouest', 'Soupe',
 'Soupe claire au poulet ou poisson avec tomates, piment et épices, base de la cuisine ghanéenne',
 68, 5.8, 5.2, 2.5, 1.2, 'FAO West Africa FCT / Ghana Health Service'),

('Groundnut Soup Ghana', 'Ghana', 'Afrique de l''Ouest', 'Soupe / Plat principal',
 'Soupe riche à la pâte d''arachide avec poulet ou bœuf, servie avec fufu ou riz',
 198, 11.8, 8.2, 14.5, 2.5, 'FAO West Africa FCT / Ghana Health Service'),

('Kontomire Stew', 'Ghana', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût de feuilles de taro (kontomire) avec huile de palme, poisson fumé et œufs durs',
 145, 8.2, 7.2, 9.5, 3.8, 'FAO West Africa FCT / Ghana Health Service'),

('Omo Tuo', 'Ghana', 'Afrique de l''Ouest', 'Accompagnement',
 'Boulettes de riz cuit mou et élastique, servies avec light soup ou groundnut soup',
 118, 2.5, 26.5, 0.5, 0.8, 'FAO West Africa FCT / Ghana Health Service'),

('Red Red', 'Ghana', 'Afrique de l''Ouest', 'Plat principal',
 'Haricots noirs cuits en sauce tomate et huile de palme, servi avec alloco (plantain frit)',
 178, 7.8, 24.5, 6.5, 6.2, 'FAO West Africa FCT / USDA'),

('Tilapia Frit Ghana', 'Ghana', 'Afrique de l''Ouest', 'Plat principal',
 'Tilapia entier épicé et frit, servi avec banku ou kenkey et sauce pimentée',
 215, 22.5, 3.5, 12.5, 0.5, 'USDA FoodData Central / FAO West Africa FCT'),

-- ============================================================
-- GUINÉE (compléments)
-- Sources : FAO West Africa FCT / DNSP Guinée / USDA
-- ============================================================

('Soupe Kandia', 'Guinée', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe de noix de palme avec poulet ou viande de bœuf et légumes, plat emblématique guinéen',
 188, 11.2, 7.8, 13.2, 2.5, 'FAO West Africa FCT / DNSP Guinée'),

('Tiga Dèguè Guinée', 'Guinée', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût de viande en sauce arachide avec légumes (aubergine africaine, gombo), servi avec riz',
 195, 8.8, 11.5, 13.5, 2.2, 'FAO West Africa FCT / DNSP Guinée'),

('Ragout de Chèvre Guinée', 'Guinée', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût de viande de chèvre aux épices locales et oignons, servi avec riz gras',
 188, 18.5, 4.2, 11.2, 0.5, 'USDA / FAO West Africa FCT'),

('Fouti au Gombo', 'Guinée', 'Afrique de l''Ouest', 'Plat principal',
 'Riz blanc servi avec sauce gombo épaisse au poisson fumé, repas quotidien en Guinée',
 148, 7.5, 22.5, 3.5, 2.5, 'FAO West Africa FCT / DNSP Guinée'),

('Riz au Poulet Guinée', 'Guinée', 'Afrique de l''Ouest', 'Plat principal',
 'Riz à la tomate avec poulet rôti aux épices locales, version guinéenne du riz gras',
 172, 10.5, 22.0, 5.5, 0.8, 'FAO West Africa FCT / DNSP Guinée'),

-- ============================================================
-- GUINÉE-BISSAU
-- Sources : FAO West Africa FCT / WHO Guinea-Bissau / USDA
-- ============================================================

('Caldo de Mancarra', 'Guinée-Bissau', 'Afrique de l''Ouest', 'Plat principal',
 'Soupe épaisse à la pâte d''arachide avec poulet et légumes, plat national de Guinée-Bissau',
 192, 9.8, 10.2, 13.2, 2.2, 'FAO West Africa FCT / WHO Guinea-Bissau'),

('Arroz de Marisco Guinée-Bissau', 'Guinée-Bissau', 'Afrique de l''Ouest', 'Plat principal',
 'Riz aux fruits de mer (crevettes, crabe) à la tomate, typique des zones côtières de Bissau',
 165, 12.2, 21.5, 3.8, 0.8, 'FAO West Africa FCT / USDA Adaptation'),

('Benachin Guinée-Bissau', 'Guinée-Bissau', 'Afrique de l''Ouest', 'Plat principal',
 'Riz one-pot cuisiné avec viande et légumes en sauce tomate, variante bissau-guinéenne',
 152, 8.5, 21.5, 4.2, 1.2, 'FAO West Africa FCT / WHO Guinea-Bissau'),

('Peixe Grelhado com Pirão', 'Guinée-Bissau', 'Afrique de l''Ouest', 'Plat principal',
 'Poisson grillé servi avec pirão (bouillie de farine de manioc cuite dans bouillon de poisson)',
 178, 18.8, 10.5, 7.2, 1.2, 'FAO West Africa FCT / USDA'),

('Jamba Guinée-Bissau', 'Guinée-Bissau', 'Afrique de l''Ouest', 'Plat principal',
 'Riz fermenté cuit avec huile de palme et viande séchée, plat rural traditionnel',
 148, 4.2, 28.5, 2.8, 1.0, 'FAO West Africa FCT / WHO Guinea-Bissau'),

('Mancarra Cozida', 'Guinée-Bissau', 'Afrique de l''Ouest', 'Accompagnement / Snack',
 'Arachides bouillies avec sel, en-cas très consommé dans toute la Guinée-Bissau',
 310, 13.5, 14.5, 23.5, 5.5, 'USDA FoodData Central');


-- ============================================================
-- MEAL COMPONENTS — BÉNIN
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 85 FROM public.meals_master WHERE name = 'Akassa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Akassa';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 75 FROM public.meals_master WHERE name = 'Ablo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 15 FROM public.meals_master WHERE name = 'Ablo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ablo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crabe (cru)', 35 FROM public.meals_master WHERE name = 'Abobô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 20 FROM public.meals_master WHERE name = 'Abobô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Abobô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Abobô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 10 FROM public.meals_master WHERE name = 'Abobô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Abobô';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 5 FROM public.meals_master WHERE name = 'Abobô';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 70 FROM public.meals_master WHERE name = 'Kluiklui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 20 FROM public.meals_master WHERE name = 'Kluiklui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 8 FROM public.meals_master WHERE name = 'Kluiklui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Kluiklui';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 40 FROM public.meals_master WHERE name = 'Amiwo au Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 20 FROM public.meals_master WHERE name = 'Amiwo au Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Amiwo au Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Amiwo au Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Amiwo au Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 4 FROM public.meals_master WHERE name = 'Amiwo au Poisson';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 50 FROM public.meals_master WHERE name = 'Sauce Feuilles Bénin';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 20 FROM public.meals_master WHERE name = 'Sauce Feuilles Bénin';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Sauce Feuilles Bénin';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Sauce Feuilles Bénin';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 5 FROM public.meals_master WHERE name = 'Sauce Feuilles Bénin';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Sauce Feuilles Bénin';

-- ============================================================
-- MEAL COMPONENTS — BURKINA FASO
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 40 FROM public.meals_master WHERE name = 'Babenda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 25 FROM public.meals_master WHERE name = 'Babenda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Babenda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Babenda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 8 FROM public.meals_master WHERE name = 'Babenda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Babenda';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Riz Gras Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 25 FROM public.meals_master WHERE name = 'Riz Gras Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Riz Gras Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Riz Gras Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 5 FROM public.meals_master WHERE name = 'Riz Gras Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Riz Gras Burkina';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 55 FROM public.meals_master WHERE name = 'Dégué Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 35 FROM public.meals_master WHERE name = 'Dégué Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Dégué Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vanille', 2 FROM public.meals_master WHERE name = 'Dégué Burkina';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 55 FROM public.meals_master WHERE name = 'Soupe de Feuilles au Soumbala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Soupe de Feuilles au Soumbala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Soupe de Feuilles au Soumbala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 10 FROM public.meals_master WHERE name = 'Soupe de Feuilles au Soumbala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 5 FROM public.meals_master WHERE name = 'Soupe de Feuilles au Soumbala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Soupe de Feuilles au Soumbala';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 45 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 15 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 8 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Ragout d''Agneau Burkina';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 88 FROM public.meals_master WHERE name = 'Tô de Sorgho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Tô de Sorgho';

-- ============================================================
-- MEAL COMPONENTS — CAP-VERT
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 30 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 15 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc filet (cru)', 15 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 10 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Patate douce (crue)', 10 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Cachupa Rica';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Cachupa Rica';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 45 FROM public.meals_master WHERE name = 'Cachupa Pobre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 30 FROM public.meals_master WHERE name = 'Cachupa Pobre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Patate douce (crue)', 10 FROM public.meals_master WHERE name = 'Cachupa Pobre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Cachupa Pobre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Cachupa Pobre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Cachupa Pobre';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 40 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Patate douce (crue)', 20 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 15 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 3 FROM public.meals_master WHERE name = 'Caldo de Peixe Cap-Vert';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 55 FROM public.meals_master WHERE name = 'Xerém com Chouriço';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc filet (cru)', 25 FROM public.meals_master WHERE name = 'Xerém com Chouriço';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Xerém com Chouriço';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Xerém com Chouriço';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Xerém com Chouriço';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 4 FROM public.meals_master WHERE name = 'Xerém com Chouriço';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 35 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thon (en conserve, égoutté)', 30 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 18 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (poule)', 3 FROM public.meals_master WHERE name = 'Pastéis de Atum Cap-Vert';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 45 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 25 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 5 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 2 FROM public.meals_master WHERE name = 'Arroz de Marisco Cap-Vert';

-- ============================================================
-- MEAL COMPONENTS — CÔTE D''IVOIRE (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gari (semoule manioc fermentée)', 40 FROM public.meals_master WHERE name = 'Garba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thon (en conserve, égoutté)', 35 FROM public.meals_master WHERE name = 'Garba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Garba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Garba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Garba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Garba';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 90 FROM public.meals_master WHERE name = 'Placali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Placali';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 40 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 20 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 5 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Soupe de Gombo Ivoirienne';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 45 FROM public.meals_master WHERE name = 'Alloco Poisson Frit';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 35 FROM public.meals_master WHERE name = 'Alloco Poisson Frit';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 12 FROM public.meals_master WHERE name = 'Alloco Poisson Frit';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Alloco Poisson Frit';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Alloco Poisson Frit';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 45 FROM public.meals_master WHERE name = 'Djoumblé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 20 FROM public.meals_master WHERE name = 'Djoumblé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Djoumblé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Djoumblé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Djoumblé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 5 FROM public.meals_master WHERE name = 'Djoumblé';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Igname blanche (crue)', 90 FROM public.meals_master WHERE name = 'Foufou Igname';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Foufou Igname';

-- ============================================================
-- MEAL COMPONENTS — GAMBIE (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 30 FROM public.meals_master WHERE name = 'Superkanja';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 20 FROM public.meals_master WHERE name = 'Superkanja';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 18 FROM public.meals_master WHERE name = 'Superkanja';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 15 FROM public.meals_master WHERE name = 'Superkanja';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Superkanja';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Superkanja';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Superkanja';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 45 FROM public.meals_master WHERE name = 'Plasas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Plasas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 15 FROM public.meals_master WHERE name = 'Plasas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 10 FROM public.meals_master WHERE name = 'Plasas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Plasas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Plasas';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 65 FROM public.meals_master WHERE name = 'Afra Gambie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Afra Gambie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 8 FROM public.meals_master WHERE name = 'Afra Gambie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Afra Gambie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Afra Gambie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 3 FROM public.meals_master WHERE name = 'Afra Gambie';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 60 FROM public.meals_master WHERE name = 'Cheré';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 28 FROM public.meals_master WHERE name = 'Cheré';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Cheré';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Cheré';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 40 FROM public.meals_master WHERE name = 'Mbahal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 30 FROM public.meals_master WHERE name = 'Mbahal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 12 FROM public.meals_master WHERE name = 'Mbahal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 10 FROM public.meals_master WHERE name = 'Mbahal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Mbahal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Mbahal';

-- ============================================================
-- MEAL COMPONENTS — GHANA (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 40 FROM public.meals_master WHERE name = 'Light Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 25 FROM public.meals_master WHERE name = 'Light Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Light Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 10 FROM public.meals_master WHERE name = 'Light Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 6 FROM public.meals_master WHERE name = 'Light Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Light Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 3 FROM public.meals_master WHERE name = 'Light Soup Ghana';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 25 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 35 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Groundnut Soup Ghana';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de taro (fraîches)', 40 FROM public.meals_master WHERE name = 'Kontomire Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Kontomire Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Kontomire Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (poule)', 12 FROM public.meals_master WHERE name = 'Kontomire Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Kontomire Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Kontomire Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Kontomire Stew';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 90 FROM public.meals_master WHERE name = 'Omo Tuo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Omo Tuo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 40 FROM public.meals_master WHERE name = 'Red Red';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 25 FROM public.meals_master WHERE name = 'Red Red';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 12 FROM public.meals_master WHERE name = 'Red Red';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Red Red';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Red Red';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Red Red';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 65 FROM public.meals_master WHERE name = 'Tilapia Frit Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 15 FROM public.meals_master WHERE name = 'Tilapia Frit Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Tilapia Frit Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Tilapia Frit Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Tilapia Frit Ghana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Tilapia Frit Ghana';

-- ============================================================
-- MEAL COMPONENTS — GUINÉE (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 40 FROM public.meals_master WHERE name = 'Soupe Kandia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 25 FROM public.meals_master WHERE name = 'Soupe Kandia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 15 FROM public.meals_master WHERE name = 'Soupe Kandia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Soupe Kandia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Soupe Kandia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Soupe Kandia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Soupe Kandia';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 30 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide / Pâte', 20 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 10 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine africaine', 8 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 5 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Tiga Dèguè Guinée';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 55 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 8 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Ragout de Chèvre Guinée';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 45 FROM public.meals_master WHERE name = 'Fouti au Gombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 25 FROM public.meals_master WHERE name = 'Fouti au Gombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Fouti au Gombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Fouti au Gombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Fouti au Gombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Fouti au Gombo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 45 FROM public.meals_master WHERE name = 'Riz au Poulet Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 30 FROM public.meals_master WHERE name = 'Riz au Poulet Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Riz au Poulet Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Riz au Poulet Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 5 FROM public.meals_master WHERE name = 'Riz au Poulet Guinée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Riz au Poulet Guinée';

-- ============================================================
-- MEAL COMPONENTS — GUINÉE-BISSAU
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 35 FROM public.meals_master WHERE name = 'Caldo de Mancarra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide / Pâte', 22 FROM public.meals_master WHERE name = 'Caldo de Mancarra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Caldo de Mancarra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Caldo de Mancarra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Caldo de Mancarra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Caldo de Mancarra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Caldo de Mancarra';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 45 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 25 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 4 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 2 FROM public.meals_master WHERE name = 'Arroz de Marisco Guinée-Bissau';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 52 FROM public.meals_master WHERE name = 'Benachin Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 22 FROM public.meals_master WHERE name = 'Benachin Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Benachin Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Benachin Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 5 FROM public.meals_master WHERE name = 'Benachin Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Benachin Guinée-Bissau';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 45 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 25 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 5 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 4 FROM public.meals_master WHERE name = 'Peixe Grelhado com Pirão';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 65 FROM public.meals_master WHERE name = 'Jamba Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Jamba Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 12 FROM public.meals_master WHERE name = 'Jamba Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Jamba Guinée-Bissau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Jamba Guinée-Bissau';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 95 FROM public.meals_master WHERE name = 'Mancarra Cozida';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 5 FROM public.meals_master WHERE name = 'Mancarra Cozida';

-- ============================================================
-- PHASE 3 — EXTENSION AFRIQUE DE L'OUEST
-- PARTIE 2 : Liberia · Mali · Mauritanie · Niger
--            Nigeria · Sénégal · Sierra Leone · Togo
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- ============================================================
-- LIBERIA
-- Sources : FAO West Africa FCT / WHO Liberia / USDA
-- ============================================================

('Palava Sauce', 'Liberia', 'Afrique de l''Ouest', 'Plat principal',
 'Feuilles de jute ou de manioc cuites en sauce avec viande fumée et huile de palme, plat national libérien',
 165, 10.2, 7.8, 10.8, 3.8, 'FAO West Africa FCT / WHO Liberia'),

('Dumboy', 'Liberia', 'Afrique de l''Ouest', 'Accompagnement',
 'Manioc bouilli puis pilé en pâte élastique, équivalent libérien du fufu, servi avec soupes',
 128, 1.2, 30.5, 0.4, 2.0, 'FAO West Africa FCT / USDA Adaptation'),

('Jollof Rice Liberia', 'Liberia', 'Afrique de l''Ouest', 'Plat principal',
 'Riz cuisiné en sauce tomate épicée avec poulet, version libérienne légèrement fumée',
 150, 8.8, 22.0, 3.8, 1.2, 'FAO West Africa FCT / WHO Liberia'),

('Pepper Soup Liberia', 'Liberia', 'Afrique de l''Ouest', 'Soupe',
 'Bouillon très épicé de viande de chèvre ou bœuf aux épices locales, plat populaire libérien',
 65, 7.5, 2.5, 2.2, 0.5, 'FAO West Africa FCT / USDA'),

('Cassava Leaf Stew Liberia', 'Liberia', 'Afrique de l''Ouest', 'Plat principal',
 'Feuilles de manioc pilées cuites avec poisson fumé et huile de palme, base de l''alimentation libérienne',
 158, 9.8, 8.8, 9.8, 4.2, 'FAO West Africa FCT / WHO Liberia'),

('Kala', 'Liberia', 'Afrique de l''Ouest', 'Snack / Accompagnement',
 'Beignets de plantain mûr frits, en-cas populaire libérien consommé en rue',
 198, 1.5, 32.5, 7.5, 2.2, 'USDA FoodData Central / FAO Adaptation'),

-- ============================================================
-- MALI (compléments)
-- Sources : FAO West Africa FCT / IER Mali / USDA
-- ============================================================

('Sombi Mali', 'Mali', 'Afrique de l''Ouest', 'Dessert / Petit-déjeuner',
 'Bouillie de riz au lait de vache sucré et vanille, dessert et petit-déjeuner malien',
 165, 4.5, 30.5, 3.0, 0.8, 'FAO West Africa FCT / IER Mali'),

('Tiguadèguèna', 'Mali', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût de viande en sauce épaisse à la pâte d''arachide, aubergine africaine et gombo, servi avec riz',
 198, 9.0, 11.8, 13.5, 2.5, 'FAO West Africa FCT / IER Mali'),

('Riz au Gras Mali', 'Mali', 'Afrique de l''Ouest', 'Plat principal',
 'Riz cuit dans bouillon de bœuf gras avec légumes et épices, plat festif malien',
 168, 8.5, 23.0, 5.2, 0.8, 'FAO West Africa FCT / IER Mali'),

('Fonio au Beurre de Karité', 'Mali', 'Afrique de l''Ouest', 'Accompagnement',
 'Grain de fonio cuit à l''eau avec beurre de karité, céréale ancestrale du Sahel',
 122, 3.0, 25.5, 1.8, 1.5, 'FAO West Africa FCT / USDA / IER Mali'),

('Dégué Mali', 'Mali', 'Afrique de l''Ouest', 'Dessert',
 'Couscous de mil fermenté avec lait caillé, sucre et parfum de vanille, dessert festif malien',
 168, 5.5, 29.5, 3.5, 1.5, 'FAO West Africa FCT / IER Mali'),

-- ============================================================
-- MAURITANIE
-- Sources : FAO West Africa FCT / Enquête Nutritionnelle Mauritanie / USDA
-- ============================================================

('Thiéboudienne Mauritanienne', 'Mauritanie', 'Afrique de l''Ouest', 'Plat principal',
 'Version mauritanienne du riz au poisson : riz brisé, poisson de mer, légumes en sauce tomate',
 145, 8.8, 20.5, 3.5, 1.2, 'FAO West Africa FCT / Enquête Nutritionnelle Mauritanie'),

('Assida Mauritanie', 'Mauritanie', 'Afrique de l''Ouest', 'Accompagnement / Petit-déjeuner',
 'Bouillie épaisse de blé ou sorgho au beurre de vache clarifié, petit-déjeuner mauritanien',
 118, 3.5, 23.5, 1.8, 2.0, 'FAO West Africa FCT / Enquête Nutritionnelle Mauritanie'),

('Méchoui Mauritanien', 'Mauritanie', 'Afrique de l''Ouest', 'Plat principal',
 'Agneau entier ou demi-agneau rôti au four ou sur braises, plat de cérémonie mauritanien',
 232, 22.5, 0.0, 15.5, 0.0, 'USDA FoodData Central / FAO'),

('Thiébou Yapp Mauritanien', 'Mauritanie', 'Afrique de l''Ouest', 'Plat principal',
 'Riz à la viande de bœuf ou d''agneau sauce tomate, version mauritanienne avec épices sahéliennes',
 162, 9.5, 21.5, 4.8, 1.0, 'FAO West Africa FCT / Enquête Nutritionnelle Mauritanie'),

('Harees Mauritanie', 'Mauritanie', 'Afrique de l''Ouest', 'Plat principal',
 'Blé concassé cuit lentement avec viande de mouton jusqu''à consistance crémeuse, plat du Ramadan',
 165, 8.8, 20.5, 5.5, 1.2, 'FAO / USDA Adaptation Mauritanie'),

('Zrig', 'Mauritanie', 'Afrique de l''Ouest', 'Boisson / Petit-déjeuner',
 'Mélange de lait de chamelle fermenté et eau avec dattes, boisson nutritive mauritanienne',
 68, 3.5, 8.5, 2.5, 0.0, 'FAO / Enquête Nutritionnelle Mauritanie'),

-- ============================================================
-- NIGER
-- Sources : FAO West Africa FCT / Institut National de la Nutrition Niger / USDA
-- ============================================================

('Dambou', 'Niger', 'Afrique de l''Ouest', 'Accompagnement',
 'Couscous de mil cuit à la vapeur, accompagnement de base dans tout le Niger',
 148, 4.5, 28.5, 2.5, 2.8, 'FAO West Africa FCT / INN Niger'),

('Masa Niger', 'Niger', 'Afrique de l''Ouest', 'Snack / Petit-déjeuner',
 'Galettes de riz fermenté frites dans huile végétale, petit-déjeuner et snack populaire au Niger',
 188, 5.5, 32.5, 5.2, 1.5, 'FAO West Africa FCT / INN Niger'),

('Fura da Nono', 'Niger', 'Afrique de l''Ouest', 'Boisson / Petit-déjeuner',
 'Boules de mil fermenté (fura) mélangées avec lait caillé de vache (nono), boisson nutritive sahélienne',
 125, 5.2, 20.5, 2.8, 1.8, 'FAO West Africa FCT / INN Niger'),

('Ragout de Mouton Niger', 'Niger', 'Afrique de l''Ouest', 'Plat principal',
 'Viande de mouton mijotée aux épices sahéliennes, tomates et oignons, servi avec riz ou dambou',
 185, 15.2, 8.5, 10.8, 1.2, 'FAO West Africa FCT / INN Niger'),

('Tuo Masara', 'Niger', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de maïs blanc cuite en pâte épaisse, accompagnement des soupes au Niger et régions voisines',
 118, 2.8, 25.8, 0.8, 2.8, 'FAO West Africa FCT / INN Niger'),

('Kilishi', 'Niger', 'Afrique de l''Ouest', 'Snack',
 'Viande de bœuf séchée et épicée à la pâte d''arachide et épices, variante nigérienne du biltong',
 312, 38.5, 10.5, 12.5, 1.5, 'USDA FoodData Central / FAO Adaptation Niger'),

-- ============================================================
-- NIGERIA (compléments)
-- Sources : FAO West Africa FCT / USDA / Okeke et al. African Journal of Food Science
-- ============================================================

('Banga Soup', 'Nigeria', 'Afrique de l''Ouest', 'Soupe',
 'Soupe riche de noix de palme avec viande de bœuf, poisson fumé et épices banga, servie avec pounded yam',
 195, 11.5, 7.2, 14.5, 2.5, 'FAO West Africa FCT / Okeke et al. AJFS'),

('Ogbono Soup', 'Nigeria', 'Afrique de l''Ouest', 'Soupe',
 'Soupe gluante aux graines d''ogbono (Irvingia gabonensis) moulues, viande et légumes verts',
 185, 11.2, 6.5, 13.5, 3.2, 'FAO West Africa FCT / USDA / Ajayi et al.'),

('Efo Riro', 'Nigeria', 'Afrique de l''Ouest', 'Plat principal',
 'Ragoût de feuilles d''épinards africains (soko) à l''huile de palme, viande et poisson fumé, cuisine Yoruba',
 145, 10.2, 6.2, 9.8, 3.8, 'FAO West Africa FCT / USDA'),

('Oha Soup', 'Nigeria', 'Afrique de l''Ouest', 'Soupe',
 'Soupe aux feuilles d''oha (Pterocarpus mildbraedii) avec cocoyam, viande et huile de palme, cuisine Igbo',
 165, 10.5, 7.0, 11.2, 2.8, 'FAO West Africa FCT / Okeke et al. AJFS'),

('Abacha', 'Nigeria', 'Afrique de l''Ouest', 'Plat principal',
 'Salade africaine de manioc séché râpé avec huile de palme, poisson fumé, oignons et ugba, cuisine Igbo',
 178, 5.5, 22.5, 8.8, 3.2, 'FAO West Africa FCT / USDA Adaptation'),

('Edikaikong Soup', 'Nigeria', 'Afrique de l''Ouest', 'Soupe',
 'Soupe concentrée aux feuilles de fluted pumpkin et waterleaf, huile de palme et fruits de mer, cuisine Efik',
 155, 10.8, 5.8, 10.5, 4.2, 'FAO West Africa FCT / Okeke et al. AJFS'),

-- ============================================================
-- SÉNÉGAL (compléments)
-- Sources : FAO West Africa FCT / CNNTA Sénégal / USDA
-- ============================================================

('Ngalakh', 'Sénégal', 'Afrique de l''Ouest', 'Dessert',
 'Couscous de mil avec pâte d''arachide, jus de baobab et sucre, dessert de fête sénégalais',
 228, 5.8, 38.5, 6.8, 2.2, 'FAO West Africa FCT / CNNTA Sénégal'),

('Pastels Sénégalais', 'Sénégal', 'Afrique de l''Ouest', 'Snack / Entrée',
 'Chaussons frits farcis au thon, oignons, persil et épices, street food iconique du Sénégal',
 245, 10.2, 22.5, 13.2, 1.5, 'FAO West Africa FCT / USDA / CNNTA Sénégal'),

('Mbaxal u Saloum', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Riz au niébé cuisiné en sauce tomate avec poisson fumé, spécialité de la région du Saloum',
 172, 9.2, 22.5, 5.2, 3.5, 'FAO West Africa FCT / CNNTA Sénégal'),

('Thiou Guinar', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Riz sénégalais au poulet en sauce tomate et légumes, version allégée et domestique du thiéboudienne',
 158, 10.2, 19.8, 4.5, 1.0, 'FAO West Africa FCT / CNNTA Sénégal'),

('Bassi Salté', 'Sénégal', 'Afrique de l''Ouest', 'Plat principal',
 'Couscous de mil au lait caillé avec viande de bœuf ou mouton, spécialité festive sénégalaise',
 182, 9.0, 25.5, 5.2, 2.0, 'FAO West Africa FCT / CNNTA Sénégal'),

-- ============================================================
-- SIERRA LEONE
-- Sources : FAO West Africa FCT / WHO Sierra Leone / USDA
-- ============================================================

('Cassava Leaves Stew Sierra Leone', 'Sierra Leone', 'Afrique de l''Ouest', 'Plat principal',
 'Feuilles de manioc pilées cuites avec viande de bœuf, poisson fumé et huile de palme, plat national',
 155, 9.2, 7.8, 9.5, 4.8, 'FAO West Africa FCT / WHO Sierra Leone'),

('Groundnut Soup Sierra Leone', 'Sierra Leone', 'Afrique de l''Ouest', 'Soupe',
 'Soupe à la pâte d''arachide avec poulet et légumes, version sierra-léonaise plus légère',
 195, 10.8, 9.2, 14.2, 2.5, 'FAO West Africa FCT / WHO Sierra Leone'),

('Jollof Rice Sierra Leone', 'Sierra Leone', 'Afrique de l''Ouest', 'Plat principal',
 'Riz sauce tomate épicée avec poulet, version sierra-léonaise avec épices locales et poisson fumé',
 148, 8.2, 21.5, 3.8, 1.2, 'FAO West Africa FCT / WHO Sierra Leone'),

('Oleleh', 'Sierra Leone', 'Afrique de l''Ouest', 'Plat / Accompagnement',
 'Pudding de niébé mixé et fermenté cuit à la vapeur en feuille de bananier, plat traditionnel',
 155, 9.2, 16.5, 5.5, 4.5, 'FAO West Africa FCT / WHO Sierra Leone'),

('Saka Saka Sierra Leone', 'Sierra Leone', 'Afrique de l''Ouest', 'Plat principal',
 'Feuilles de manioc et de patate douce pilées avec huile de palme et poisson fumé',
 138, 6.2, 10.2, 8.5, 4.8, 'FAO West Africa FCT / WHO Sierra Leone'),

('Fufu Sierra Leone', 'Sierra Leone', 'Afrique de l''Ouest', 'Accompagnement',
 'Manioc et plantain pilés en pâte élastique, accompagnement standard des soupes sierra-léonaises',
 122, 1.2, 29.0, 0.4, 2.0, 'FAO West Africa FCT / USDA Adaptation'),

-- ============================================================
-- TOGO (compléments)
-- Sources : FAO West Africa FCT / Ministère de la Santé Togo / USDA
-- ============================================================

('Akpan', 'Togo', 'Afrique de l''Ouest', 'Petit-déjeuner / Dessert',
 'Bouillie fermentée de maïs au lait caillé sucré, petit-déjeuner et dessert togolais',
 95, 3.2, 18.5, 1.2, 1.5, 'FAO West Africa FCT / Ministère Santé Togo'),

('Sauce Gombo Togo', 'Togo', 'Afrique de l''Ouest', 'Sauce / Plat principal',
 'Soupe de gombo frais avec poisson fumé, crevettes séchées et huile de palme, accompagne l''akumé',
 88, 5.8, 7.2, 4.8, 3.5, 'FAO West Africa FCT / Ministère Santé Togo'),

('Koklo Meme', 'Togo', 'Afrique de l''Ouest', 'Plat principal',
 'Poulet grillé entier aux épices togolaises sur braises, servi avec pâte et sauce pimentée',
 210, 22.8, 3.2, 12.5, 0.5, 'FAO West Africa FCT / USDA Adaptation'),

('Akumé', 'Togo', 'Afrique de l''Ouest', 'Accompagnement',
 'Boule de maïs blanc cuite en pâte lisse et ferme, accompagnement central de la cuisine togolaise',
 125, 2.8, 26.8, 0.8, 1.8, 'FAO West Africa FCT / Ministère Santé Togo'),

('Ragout de Mouton Togo', 'Togo', 'Afrique de l''Ouest', 'Plat principal',
 'Mouton mijoté aux épices et tomates avec légumes, plat de fête dans tout le Togo',
 182, 14.8, 7.2, 10.8, 1.2, 'FAO West Africa FCT / Ministère Santé Togo'),

('Atiéké Crabe Togo', 'Togo', 'Afrique de l''Ouest', 'Plat principal',
 'Semoule de manioc fermentée servie avec crabe entier grillé et sauce pimentée, plat côtier lomé',
 158, 14.2, 18.5, 4.2, 1.5, 'FAO West Africa FCT / USDA Adaptation');


-- ============================================================
-- MEAL COMPONENTS — LIBERIA
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 38 FROM public.meals_master WHERE name = 'Palava Sauce';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Palava Sauce';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 18 FROM public.meals_master WHERE name = 'Palava Sauce';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 12 FROM public.meals_master WHERE name = 'Palava Sauce';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Palava Sauce';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Palava Sauce';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Palava Sauce';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 90 FROM public.meals_master WHERE name = 'Dumboy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Dumboy';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 52 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 22 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 2 FROM public.meals_master WHERE name = 'Jollof Rice Liberia';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 55 FROM public.meals_master WHERE name = 'Pepper Soup Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 15 FROM public.meals_master WHERE name = 'Pepper Soup Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Pepper Soup Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Pepper Soup Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 8 FROM public.meals_master WHERE name = 'Pepper Soup Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 4 FROM public.meals_master WHERE name = 'Pepper Soup Liberia';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 55 FROM public.meals_master WHERE name = 'Cassava Leaf Stew Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Cassava Leaf Stew Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Cassava Leaf Stew Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 8 FROM public.meals_master WHERE name = 'Cassava Leaf Stew Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 4 FROM public.meals_master WHERE name = 'Cassava Leaf Stew Liberia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Cassava Leaf Stew Liberia';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 80 FROM public.meals_master WHERE name = 'Kala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 15 FROM public.meals_master WHERE name = 'Kala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Kala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Kala';

-- ============================================================
-- MEAL COMPONENTS — MALI (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Sombi Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 38 FROM public.meals_master WHERE name = 'Sombi Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Sombi Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Sombi Mali';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Tiguadèguèna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide / Pâte', 22 FROM public.meals_master WHERE name = 'Tiguadèguèna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine africaine', 15 FROM public.meals_master WHERE name = 'Tiguadèguèna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 12 FROM public.meals_master WHERE name = 'Tiguadèguèna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Tiguadèguèna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Tiguadèguèna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 5 FROM public.meals_master WHERE name = 'Tiguadèguèna';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Riz au Gras Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 25 FROM public.meals_master WHERE name = 'Riz au Gras Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Riz au Gras Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Riz au Gras Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 5 FROM public.meals_master WHERE name = 'Riz au Gras Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Riz au Gras Mali';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fonio (cru)', 88 FROM public.meals_master WHERE name = 'Fonio au Beurre de Karité';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Fonio au Beurre de Karité';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 52 FROM public.meals_master WHERE name = 'Dégué Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 35 FROM public.meals_master WHERE name = 'Dégué Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Dégué Mali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vanille', 3 FROM public.meals_master WHERE name = 'Dégué Mali';

-- ============================================================
-- MEAL COMPONENTS — MAURITANIE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz brisé (cru)', 42 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 25 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 8 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 6 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 5 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Thiéboudienne Mauritanienne';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 72 FROM public.meals_master WHERE name = 'Assida Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 12 FROM public.meals_master WHERE name = 'Assida Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Assida Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Assida Mauritanie';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 85 FROM public.meals_master WHERE name = 'Méchoui Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Méchoui Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 4 FROM public.meals_master WHERE name = 'Méchoui Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Méchoui Mauritanien';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 48 FROM public.meals_master WHERE name = 'Thiébou Yapp Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 28 FROM public.meals_master WHERE name = 'Thiébou Yapp Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Thiébou Yapp Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Thiébou Yapp Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 4 FROM public.meals_master WHERE name = 'Thiébou Yapp Mauritanien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Thiébou Yapp Mauritanien';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Couscous (cru)', 45 FROM public.meals_master WHERE name = 'Harees Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 35 FROM public.meals_master WHERE name = 'Harees Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Harees Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 5 FROM public.meals_master WHERE name = 'Harees Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 3 FROM public.meals_master WHERE name = 'Harees Mauritanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Harees Mauritanie';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 80 FROM public.meals_master WHERE name = 'Zrig';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 12 FROM public.meals_master WHERE name = 'Zrig';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Zrig';

-- ============================================================
-- MEAL COMPONENTS — NIGER
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 88 FROM public.meals_master WHERE name = 'Dambou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Dambou';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 65 FROM public.meals_master WHERE name = 'Masa Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 18 FROM public.meals_master WHERE name = 'Masa Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Masa Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Masa Niger';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 55 FROM public.meals_master WHERE name = 'Fura da Nono';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 38 FROM public.meals_master WHERE name = 'Fura da Nono';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 5 FROM public.meals_master WHERE name = 'Fura da Nono';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir moulu', 2 FROM public.meals_master WHERE name = 'Fura da Nono';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 52 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 8 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Ragout de Mouton Niger';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 88 FROM public.meals_master WHERE name = 'Tuo Masara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Tuo Masara';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 55 FROM public.meals_master WHERE name = 'Kilishi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides rôties', 20 FROM public.meals_master WHERE name = 'Kilishi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 10 FROM public.meals_master WHERE name = 'Kilishi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 8 FROM public.meals_master WHERE name = 'Kilishi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Kilishi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Kilishi';

-- ============================================================
-- MEAL COMPONENTS — NIGERIA (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 22 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 8 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Banga Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 5 FROM public.meals_master WHERE name = 'Banga Soup';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 12 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 15 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 8 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 6 FROM public.meals_master WHERE name = 'Ogbono Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 3 FROM public.meals_master WHERE name = 'Ogbono Soup';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 42 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 18 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 10 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 5 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Efo Riro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Efo Riro';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 38 FROM public.meals_master WHERE name = 'Oha Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Oha Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 20 FROM public.meals_master WHERE name = 'Oha Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 8 FROM public.meals_master WHERE name = 'Oha Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Oha Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Oha Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 3 FROM public.meals_master WHERE name = 'Oha Soup';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 45 FROM public.meals_master WHERE name = 'Abacha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Abacha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Abacha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Abacha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 5 FROM public.meals_master WHERE name = 'Abacha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Abacha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Abacha';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 35 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 18 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 10 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 8 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Edikaikong Soup';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 2 FROM public.meals_master WHERE name = 'Edikaikong Soup';

-- ============================================================
-- MEAL COMPONENTS — SÉNÉGAL (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 38 FROM public.meals_master WHERE name = 'Ngalakh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide / Pâte', 25 FROM public.meals_master WHERE name = 'Ngalakh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 18 FROM public.meals_master WHERE name = 'Ngalakh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 12 FROM public.meals_master WHERE name = 'Ngalakh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vanille', 4 FROM public.meals_master WHERE name = 'Ngalakh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de coco râpée (sèche)', 3 FROM public.meals_master WHERE name = 'Ngalakh';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 38 FROM public.meals_master WHERE name = 'Pastels Sénégalais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thon (en conserve, égoutté)', 28 FROM public.meals_master WHERE name = 'Pastels Sénégalais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 18 FROM public.meals_master WHERE name = 'Pastels Sénégalais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Pastels Sénégalais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Pastels Sénégalais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Pastels Sénégalais';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 38 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 25 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Mbaxal u Saloum';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 48 FROM public.meals_master WHERE name = 'Thiou Guinar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 28 FROM public.meals_master WHERE name = 'Thiou Guinar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Thiou Guinar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Thiou Guinar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 4 FROM public.meals_master WHERE name = 'Thiou Guinar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Thiou Guinar';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Couscous (cru)', 40 FROM public.meals_master WHERE name = 'Bassi Salté';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 25 FROM public.meals_master WHERE name = 'Bassi Salté';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 18 FROM public.meals_master WHERE name = 'Bassi Salté';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Bassi Salté';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 5 FROM public.meals_master WHERE name = 'Bassi Salté';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 4 FROM public.meals_master WHERE name = 'Bassi Salté';

-- ============================================================
-- MEAL COMPONENTS — SIERRA LEONE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 50 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 15 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 10 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Cassava Leaves Stew Sierra Leone';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 28 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 35 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 6 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Groundnut Soup Sierra Leone';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 52 FROM public.meals_master WHERE name = 'Jollof Rice Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 22 FROM public.meals_master WHERE name = 'Jollof Rice Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Jollof Rice Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 5 FROM public.meals_master WHERE name = 'Jollof Rice Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Jollof Rice Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Jollof Rice Sierra Leone';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 58 FROM public.meals_master WHERE name = 'Oleleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Oleleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Oleleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Oleleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 4 FROM public.meals_master WHERE name = 'Oleleh';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 38 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 18 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Saka Saka Sierra Leone';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 60 FROM public.meals_master WHERE name = 'Fufu Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 38 FROM public.meals_master WHERE name = 'Fufu Sierra Leone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Fufu Sierra Leone';

-- ============================================================
-- MEAL COMPONENTS — TOGO (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 55 FROM public.meals_master WHERE name = 'Akpan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 32 FROM public.meals_master WHERE name = 'Akpan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Akpan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Akpan';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 42 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 20 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 8 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Sauce Gombo Togo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 70 FROM public.meals_master WHERE name = 'Koklo Meme';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Koklo Meme';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Koklo Meme';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Koklo Meme';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Koklo Meme';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 3 FROM public.meals_master WHERE name = 'Koklo Meme';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 88 FROM public.meals_master WHERE name = 'Akumé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Akumé';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 50 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 8 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 4 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Ragout de Mouton Togo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gari (semoule manioc fermentée)', 38 FROM public.meals_master WHERE name = 'Atiéké Crabe Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crabe (cru)', 40 FROM public.meals_master WHERE name = 'Atiéké Crabe Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Atiéké Crabe Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Atiéké Crabe Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Atiéké Crabe Togo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Atiéké Crabe Togo';

-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 3
-- EXTENSION AFRIQUE DE L'EST — PARTIE 1
-- Pays : Burundi · Comores · Djibouti · Érythrée · Éthiopie · Kenya
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : FAO East Africa FCT · USDA FoodData Central
--           Ethiopian Institute of Nutrition · Kenya MoH
--           WHO country offices · Publications scientifiques régionales
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- ============================================================
-- BURUNDI
-- Sources : FAO East Africa FCT · USDA · ISTEEBU Burundi 2021
--           Niyongabo et al. Afr. J. Food Sci. 2018
-- ============================================================

('Ugali wa Mtama Burundi', 'Burundi', 'Afrique de l''Est', 'Accompagnement',
 'Boule de sorgho cuite en pâte épaisse, accompagnement quotidien au Burundi avec sauce ou haricots',
 108, 2.8, 23.2, 0.9, 2.5, 'FAO East Africa FCT / ISTEEBU Burundi 2021'),

('Ibiharage', 'Burundi', 'Afrique de l''Est', 'Plat principal',
 'Haricots rouges mijotés avec oignons, tomates et huile, plat de base de l''alimentation burundaise',
 118, 7.2, 19.5, 1.8, 6.2, 'FAO East Africa FCT / ISTEEBU Burundi 2021'),

('Ibirayi na Inyama', 'Burundi', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de pommes de terre et viande de bœuf aux oignons et tomates, plat familial courant',
 128, 8.5, 14.5, 4.2, 2.0, 'FAO East Africa FCT / USDA Adaptation'),

('Ubugari', 'Burundi', 'Afrique de l''Est', 'Accompagnement',
 'Bouillie épaisse de farine de maïs blanc, version burundaise de l''ugali, servi avec légumes ou haricots',
 112, 2.5, 24.8, 0.6, 1.8, 'FAO East Africa FCT / ISTEEBU Burundi 2021'),

('Igisafuliya', 'Burundi', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de poulet cuit à l''étouffée avec pommes de terre, carottes et épices locales en cocotte',
 145, 14.2, 10.5, 5.8, 1.5, 'FAO East Africa FCT / USDA Adaptation Burundi'),

('Umutsima', 'Burundi', 'Afrique de l''Est', 'Accompagnement',
 'Mélange de maïs concassé et manioc cuits ensemble, accompagnement traditionnel des collines burundaises',
 118, 2.2, 26.5, 0.5, 2.2, 'FAO East Africa FCT / ISTEEBU Burundi 2021'),

('Inyama y''Inka Ibiraswa', 'Burundi', 'Afrique de l''Est', 'Plat principal',
 'Bœuf grillé sur braises aux épices locales, servi avec ugali et légumes, plat festif burundais',
 198, 22.5, 1.2, 11.5, 0.0, 'USDA FoodData Central / FAO East Africa FCT'),

-- Sources Burundi : FAO East Africa FCT 2012 · ISTEEBU Rapport Nutritionnel 2021
--                  Niyongabo et al. Afr. J. Food Sci. 2018 · USDA FoodData Central

-- ============================================================
-- COMORES
-- Sources : FAO · USDA · Enquête Nationale Nutrition Comores 2012
--           Mze et al. Rev. Comorienne Sci. 2015
-- ============================================================

('Langouste Grillée Comores', 'Comores', 'Afrique de l''Est', 'Plat principal',
 'Langouste entière grillée au citron et ail, plat emblématique des îles comoriennes',
 112, 20.8, 1.2, 2.5, 0.0, 'USDA FoodData Central / FAO Adaptation Comores'),

('Mkatra Foutra', 'Comores', 'Afrique de l''Est', 'Petit-déjeuner / Snack',
 'Crêpe de farine de riz et lait de coco cuite sur plaque, petit-déjeuner traditionnel comorien',
 215, 4.2, 38.5, 5.5, 0.8, 'FAO / Enquête Nationale Nutrition Comores 2012'),

('Romazava Comores', 'Comores', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de viande de bœuf et feuilles vertes locales au lait de coco, version comorienne',
 158, 12.5, 7.8, 9.5, 2.2, 'FAO / Enquête Nationale Nutrition Comores 2012'),

('Pilaou Comores', 'Comores', 'Afrique de l''Est', 'Plat principal',
 'Riz épicé aux épices arabes (cardamome, cannelle, clou de girofle) avec viande de chèvre',
 185, 10.2, 25.8, 5.2, 0.8, 'FAO East Africa FCT / USDA Adaptation Comores'),

('Mchozi wa Nazi', 'Comores', 'Afrique de l''Est', 'Plat principal',
 'Curry de poisson au lait de coco et épices locales, plat côtier comorien quotidien',
 162, 13.8, 8.5, 9.2, 0.8, 'FAO / Enquête Nationale Nutrition Comores 2012'),

('Wali wa Nazi', 'Comores', 'Afrique de l''Est', 'Accompagnement',
 'Riz cuit dans lait de coco légèrement salé, accompagnement de base aux Comores',
 188, 3.2, 32.5, 5.8, 0.5, 'FAO East Africa FCT / USDA'),

('Mdzudzumia', 'Comores', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de banane verte et viande de bœuf aux épices, plat traditionnel des ménages comoriens',
 142, 9.5, 17.8, 4.5, 2.5, 'FAO / Enquête Nationale Nutrition Comores 2012'),

-- Sources Comores : FAO East Africa FCT · Enquête Nationale Nutrition Comores 2012
--                   Mze et al. Rev. Comorienne Sci. 2015 · USDA FoodData Central

-- ============================================================
-- DJIBOUTI
-- Sources : FAO East Africa FCT · USDA · Enquête EDSF/PAPFAM Djibouti 2012
--           WHO Djibouti Nutrition Report 2019
-- ============================================================

('Skoudehkaris', 'Djibouti', 'Afrique de l''Est', 'Plat principal',
 'Riz épicé à la viande de chèvre ou d''agneau aux épices somaliennes, plat national djiboutien',
 192, 11.5, 26.2, 5.5, 0.8, 'FAO East Africa FCT / WHO Djibouti 2019'),

('Fah-fah', 'Djibouti', 'Afrique de l''Est', 'Soupe',
 'Soupe épaisse aux tripes de bœuf et légumes secs, plat populaire des marchés djiboutiens',
 88, 8.5, 7.5, 3.2, 1.5, 'FAO East Africa FCT / WHO Djibouti 2019'),

('Laxoox Djibouti', 'Djibouti', 'Afrique de l''Est', 'Petit-déjeuner',
 'Pain fermenté spongieux de sorgho ou maïs cuit sur plaque, équivalent djiboutien de l''injera',
 165, 4.5, 33.5, 1.8, 2.0, 'FAO East Africa FCT / USDA Adaptation'),

('Baasto Hilib', 'Djibouti', 'Afrique de l''Est', 'Plat principal',
 'Pâtes cuites en sauce de viande de bœuf épicée aux tomates, plat urbain très populaire à Djibouti',
 175, 10.2, 22.5, 5.2, 1.5, 'FAO East Africa FCT / WHO Djibouti 2019'),

('Maraq Djibouti', 'Djibouti', 'Afrique de l''Est', 'Soupe',
 'Bouillon de viande de chèvre aux épices et légumes, soupe réconfortante servie en entrée',
 72, 7.8, 3.5, 2.5, 0.5, 'FAO East Africa FCT / WHO Djibouti 2019'),

('Cambuulo', 'Djibouti', 'Afrique de l''Est', 'Plat principal',
 'Haricots adzuki cuits avec beurre de vache clarifié et sucre, plat du soir très consommé',
 195, 8.5, 32.5, 4.8, 7.5, 'FAO East Africa FCT / USDA'),

('Muqmad', 'Djibouti', 'Afrique de l''Est', 'Plat principal',
 'Viande de bœuf séchée cuite dans son propre gras et épices, conserve traditionnelle djiboutienne',
 285, 28.5, 1.2, 18.5, 0.0, 'USDA FoodData Central / FAO Adaptation'),

-- Sources Djibouti : FAO East Africa FCT · WHO Djibouti Nutrition Report 2019
--                    Enquête EDSF/PAPFAM Djibouti 2012 · USDA FoodData Central

-- ============================================================
-- ÉRYTHRÉE
-- Sources : FAO East Africa FCT · USDA · Enquête Nutrition Érythrée 2010
--           Gebremichael et al. Nutr. J. 2016
-- ============================================================

('Tsebhi Derho', 'Érythrée', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de poulet épicé au berbéré et beurre clarifié (tesmi), servi sur injera, plat de fête érythréen',
 172, 13.2, 15.5, 7.2, 2.2, 'FAO East Africa FCT / Gebremichael et al. Nutr. J. 2016'),

('Ful Érythréen', 'Érythrée', 'Afrique de l''Est', 'Petit-déjeuner / Plat',
 'Fèves mijotées à l''ail, tomates, piment et huile, petit-déjeuner national érythréen',
 142, 8.2, 19.8, 3.8, 7.2, 'FAO East Africa FCT / USDA'),

('Zigni', 'Érythrée', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de bœuf haché épicé au berbéré avec oignons et tomates, servi sur injera',
 188, 15.5, 8.5, 10.5, 1.8, 'FAO East Africa FCT / Gebremichael et al. Nutr. J. 2016'),

('Injera Érythréenne', 'Érythrée', 'Afrique de l''Est', 'Accompagnement',
 'Pain plat fermenté au teff ou sorgho, base alimentaire érythréenne, légèrement différent de la version éthiopienne',
 158, 5.5, 31.8, 1.2, 2.5, 'FAO East Africa FCT / USDA'),

('Shahan Ful', 'Érythrée', 'Afrique de l''Est', 'Petit-déjeuner',
 'Fèves écrasées servies avec fromage blanc (ayib), beurre clarifié et piment, petit-déjeuner érythréen',
 165, 9.5, 18.5, 5.8, 6.5, 'FAO East Africa FCT / Gebremichael et al. Nutr. J. 2016'),

('Dorho Tsebhi', 'Érythrée', 'Afrique de l''Est', 'Plat principal',
 'Poulet entier cuit lentement dans sauce tomate épicée, version domestique moins grasse',
 162, 14.8, 7.2, 8.5, 1.5, 'FAO East Africa FCT / USDA Adaptation'),

('Hamli', 'Érythrée', 'Afrique de l''Est', 'Plat principal',
 'Épinards ou feuilles vertes locales sautés avec oignons et épices berbéré, plat végétarien érythréen',
 68, 3.8, 7.5, 2.8, 3.5, 'FAO East Africa FCT / Gebremichael et al. Nutr. J. 2016'),

-- Sources Érythrée : FAO East Africa FCT · Gebremichael et al. Nutr. J. 2016
--                    Enquête Nationale Nutrition Érythrée 2010 · USDA FoodData Central

-- ============================================================
-- ÉTHIOPIE (compléments — plats non encore présents)
-- Sources : Ethiopian Institute of Nutrition · FAO East Africa FCT
--           Roba et al. BMC Nutrition 2021 · USDA FoodData Central
-- ============================================================

('Kitfo', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Bœuf haché finement mélangé au beurre clarifié épicé (mitmita) et fromage blanc, plat Gurage',
 235, 18.5, 1.5, 17.5, 0.2, 'Ethiopian Institute of Nutrition / USDA'),

('Gored Gored', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Dés de bœuf crus assaisonnés au beurre clarifié et berbéré, version en cubes du kitfo',
 228, 17.8, 1.2, 17.2, 0.0, 'Ethiopian Institute of Nutrition / USDA FoodData Central'),

('Firfir', 'Éthiopie', 'Afrique de l''Est', 'Petit-déjeuner / Plat',
 'Morceaux d''injera émiettés et réchauffés dans sauce berbéré et beurre clarifié, plat anti-gaspi',
 168, 5.8, 28.5, 5.2, 2.5, 'Ethiopian Institute of Nutrition / Roba et al. BMC Nutrition 2021'),

('Kategna', 'Éthiopie', 'Afrique de l''Est', 'Snack / Petit-déjeuner',
 'Injera grillée sur braises badigeonnée de berbéré et beurre clarifié, en-cas populaire éthiopien',
 195, 6.2, 32.5, 6.8, 2.2, 'Ethiopian Institute of Nutrition / FAO East Africa FCT'),

('Ayib be Gomen', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Fromage blanc frais éthiopien (ayib) mélangé avec kale sauté aux épices, plat végétarien',
 112, 8.5, 6.8, 5.5, 2.8, 'Ethiopian Institute of Nutrition / USDA'),

('Bozena Shiro', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Shiro (pois chiches en poudre) épaissi cuisiné avec viande de bœuf ou agneau, version enrichie',
 175, 11.5, 16.5, 7.5, 3.8, 'Ethiopian Institute of Nutrition / Roba et al. BMC Nutrition 2021'),

('Enqulal Tibs', 'Éthiopie', 'Afrique de l''Est', 'Plat principal',
 'Œufs brouillés sautés aux oignons, tomates, piment jalapeño et épices, version éthiopienne',
 148, 10.5, 5.5, 10.2, 1.2, 'Ethiopian Institute of Nutrition / USDA FoodData Central'),

-- Sources Éthiopie : Ethiopian Institute of Nutrition · FAO East Africa FCT
--                    Roba et al. BMC Nutrition 2021 · USDA FoodData Central

-- ============================================================
-- KENYA (compléments — plats non encore présents)
-- Sources : Kenya MoH Food Composition Tables · FAO East Africa FCT
--           Ngala et al. J. Nutr. Food Sci. 2019 · USDA FoodData Central
-- ============================================================

('Mukimo', 'Kenya', 'Afrique de l''Est', 'Plat principal',
 'Mélange de pommes de terre, maïs, haricots et légumes verts écrasés ensemble, plat Kikuyu traditionnel',
 128, 4.5, 22.5, 2.8, 4.5, 'Kenya MoH Food Composition Tables / FAO East Africa FCT'),

('Mutura', 'Kenya', 'Afrique de l''Est', 'Snack / Plat',
 'Boudin de sang et viande haché épicé cuit dans boyaux de bœuf, street food populaire au Kenya',
 218, 15.5, 5.5, 15.5, 0.5, 'Kenya MoH Food Composition Tables / USDA'),

('Githeri', 'Kenya', 'Afrique de l''Est', 'Plat principal',
 'Maïs et haricots borlotti cuits ensemble, plat quotidien simple et nutritif de la cuisine Kikuyu',
 135, 6.8, 23.8, 1.5, 5.8, 'Kenya MoH Food Composition Tables / FAO East Africa FCT'),

('Irio', 'Kenya', 'Afrique de l''Est', 'Accompagnement',
 'Pommes de terre, pois verts et maïs cuits puis écrasés ensemble, accompagnement Kikuyu classique',
 118, 3.8, 23.2, 1.2, 4.2, 'Kenya MoH Food Composition Tables / FAO East Africa FCT'),

('Mandazi', 'Kenya', 'Afrique de l''Est', 'Snack / Petit-déjeuner',
 'Beignets légèrement sucrés à la cardamome et lait de coco, frits, consommés au petit-déjeuner',
 312, 6.2, 45.5, 12.5, 1.2, 'Kenya MoH Food Composition Tables / USDA FoodData Central'),

('Chapati Kenya', 'Kenya', 'Afrique de l''Est', 'Accompagnement',
 'Pain plat de blé légèrement huilé cuit sur plaque, accompagnement populaire influencé par la cuisine indienne',
 285, 8.2, 42.5, 9.5, 2.2, 'Kenya MoH Food Composition Tables / USDA'),

('Kachumbari', 'Kenya', 'Afrique de l''Est', 'Salade / Accompagnement',
 'Salade fraîche de tomates et oignons au piment et citron, condiment incontournable de la cuisine kenyane',
 32, 1.2, 6.5, 0.4, 1.8, 'Kenya MoH Food Composition Tables / FAO East Africa FCT');

-- Sources Kenya : Kenya MoH Food Composition Tables · FAO East Africa FCT
--                 Ngala et al. J. Nutr. Food Sci. 2019 · USDA FoodData Central


-- ============================================================
-- MEAL COMPONENTS — BURUNDI
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 88 FROM public.meals_master WHERE name = 'Ugali wa Mtama Burundi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ugali wa Mtama Burundi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 70 FROM public.meals_master WHERE name = 'Ibiharage';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Ibiharage';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Ibiharage';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Ibiharage';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Ibiharage';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 45 FROM public.meals_master WHERE name = 'Ibirayi na Inyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 35 FROM public.meals_master WHERE name = 'Ibirayi na Inyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Ibirayi na Inyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Ibirayi na Inyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Ibirayi na Inyama';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 88 FROM public.meals_master WHERE name = 'Ubugari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ubugari';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 50 FROM public.meals_master WHERE name = 'Igisafuliya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 22 FROM public.meals_master WHERE name = 'Igisafuliya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 10 FROM public.meals_master WHERE name = 'Igisafuliya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Igisafuliya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Igisafuliya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Igisafuliya';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 55 FROM public.meals_master WHERE name = 'Umutsima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 40 FROM public.meals_master WHERE name = 'Umutsima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Umutsima';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 80 FROM public.meals_master WHERE name = 'Inyama y''Inka Ibiraswa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Inyama y''Inka Ibiraswa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 5 FROM public.meals_master WHERE name = 'Inyama y''Inka Ibiraswa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Inyama y''Inka Ibiraswa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Inyama y''Inka Ibiraswa';

-- ============================================================
-- MEAL COMPONENTS — COMORES
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Langouste (crue)', 80 FROM public.meals_master WHERE name = 'Langouste Grillée Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 8 FROM public.meals_master WHERE name = 'Langouste Grillée Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Langouste Grillée Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 4 FROM public.meals_master WHERE name = 'Langouste Grillée Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Langouste Grillée Comores';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de riz', 55 FROM public.meals_master WHERE name = 'Mkatra Foutra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 35 FROM public.meals_master WHERE name = 'Mkatra Foutra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 6 FROM public.meals_master WHERE name = 'Mkatra Foutra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Mkatra Foutra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 2 FROM public.meals_master WHERE name = 'Mkatra Foutra';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 38 FROM public.meals_master WHERE name = 'Romazava Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 18 FROM public.meals_master WHERE name = 'Romazava Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 20 FROM public.meals_master WHERE name = 'Romazava Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Romazava Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Romazava Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Romazava Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Romazava Comores';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 28 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Clou de girofle moulu', 2 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Pilaou Comores';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Pilaou Comores';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 45 FROM public.meals_master WHERE name = 'Mchozi wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 30 FROM public.meals_master WHERE name = 'Mchozi wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Mchozi wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Mchozi wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Mchozi wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Mchozi wa Nazi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 65 FROM public.meals_master WHERE name = 'Wali wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 32 FROM public.meals_master WHERE name = 'Wali wa Nazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Wali wa Nazi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 40 FROM public.meals_master WHERE name = 'Mdzudzumia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 35 FROM public.meals_master WHERE name = 'Mdzudzumia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Mdzudzumia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Mdzudzumia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Mdzudzumia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Mdzudzumia';

-- ============================================================
-- MEAL COMPONENTS — DJIBOUTI
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 48 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 28 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Skoudehkaris';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Skoudehkaris';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 40 FROM public.meals_master WHERE name = 'Fah-fah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 20 FROM public.meals_master WHERE name = 'Fah-fah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Fah-fah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Fah-fah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Fah-fah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Fah-fah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Fah-fah';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 60 FROM public.meals_master WHERE name = 'Laxoox Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 28 FROM public.meals_master WHERE name = 'Laxoox Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Laxoox Djibouti';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule de blé dur', 40 FROM public.meals_master WHERE name = 'Baasto Hilib';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Baasto Hilib';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Baasto Hilib';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Baasto Hilib';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Baasto Hilib';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Baasto Hilib';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Baasto Hilib';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 55 FROM public.meals_master WHERE name = 'Maraq Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Maraq Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Maraq Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Maraq Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 4 FROM public.meals_master WHERE name = 'Maraq Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 3 FROM public.meals_master WHERE name = 'Maraq Djibouti';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Maraq Djibouti';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 75 FROM public.meals_master WHERE name = 'Cambuulo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 12 FROM public.meals_master WHERE name = 'Cambuulo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Cambuulo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Cambuulo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 70 FROM public.meals_master WHERE name = 'Muqmad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 15 FROM public.meals_master WHERE name = 'Muqmad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 8 FROM public.meals_master WHERE name = 'Muqmad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Muqmad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Muqmad';

-- ============================================================
-- MEAL COMPONENTS — ÉRYTHRÉE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 48 FROM public.meals_master WHERE name = 'Tsebhi Derho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 28 FROM public.meals_master WHERE name = 'Tsebhi Derho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Tsebhi Derho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 6 FROM public.meals_master WHERE name = 'Tsebhi Derho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 4 FROM public.meals_master WHERE name = 'Tsebhi Derho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Tsebhi Derho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 1 FROM public.meals_master WHERE name = 'Tsebhi Derho';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves (sèches)', 68 FROM public.meals_master WHERE name = 'Ful Érythréen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Ful Érythréen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Ful Érythréen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive vierge extra', 6 FROM public.meals_master WHERE name = 'Ful Érythréen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Ful Érythréen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Ful Érythréen';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 48 FROM public.meals_master WHERE name = 'Zigni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 22 FROM public.meals_master WHERE name = 'Zigni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Zigni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Zigni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 5 FROM public.meals_master WHERE name = 'Zigni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 4 FROM public.meals_master WHERE name = 'Zigni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Zigni';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 65 FROM public.meals_master WHERE name = 'Injera Érythréenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 25 FROM public.meals_master WHERE name = 'Injera Érythréenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Injera Érythréenne';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves (sèches)', 52 FROM public.meals_master WHERE name = 'Shahan Ful';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 15 FROM public.meals_master WHERE name = 'Shahan Ful';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 10 FROM public.meals_master WHERE name = 'Shahan Ful';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Shahan Ful';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Shahan Ful';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 5 FROM public.meals_master WHERE name = 'Shahan Ful';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 55 FROM public.meals_master WHERE name = 'Dorho Tsebhi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Dorho Tsebhi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Dorho Tsebhi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Dorho Tsebhi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 5 FROM public.meals_master WHERE name = 'Dorho Tsebhi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Dorho Tsebhi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 60 FROM public.meals_master WHERE name = 'Hamli';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Hamli';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 10 FROM public.meals_master WHERE name = 'Hamli';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Hamli';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 4 FROM public.meals_master WHERE name = 'Hamli';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Hamli';

-- ============================================================
-- MEAL COMPONENTS — ÉTHIOPIE (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 65 FROM public.meals_master WHERE name = 'Kitfo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 20 FROM public.meals_master WHERE name = 'Kitfo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 8 FROM public.meals_master WHERE name = 'Kitfo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 4 FROM public.meals_master WHERE name = 'Kitfo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Kitfo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 68 FROM public.meals_master WHERE name = 'Gored Gored';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 18 FROM public.meals_master WHERE name = 'Gored Gored';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 8 FROM public.meals_master WHERE name = 'Gored Gored';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Gored Gored';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Gored Gored';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 55 FROM public.meals_master WHERE name = 'Firfir';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 20 FROM public.meals_master WHERE name = 'Firfir';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 12 FROM public.meals_master WHERE name = 'Firfir';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Firfir';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Firfir';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Firfir';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Teff (cru)', 70 FROM public.meals_master WHERE name = 'Kategna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 18 FROM public.meals_master WHERE name = 'Kategna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 10 FROM public.meals_master WHERE name = 'Kategna';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Kategna';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 45 FROM public.meals_master WHERE name = 'Ayib be Gomen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Ayib be Gomen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 10 FROM public.meals_master WHERE name = 'Ayib be Gomen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Ayib be Gomen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Ayib be Gomen';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Bozena Shiro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches (secs)', 38 FROM public.meals_master WHERE name = 'Bozena Shiro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Bozena Shiro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 10 FROM public.meals_master WHERE name = 'Bozena Shiro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment de Cayenne moulu', 6 FROM public.meals_master WHERE name = 'Bozena Shiro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Bozena Shiro';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (poule)', 55 FROM public.meals_master WHERE name = 'Enqulal Tibs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Enqulal Tibs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Enqulal Tibs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 8 FROM public.meals_master WHERE name = 'Enqulal Tibs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Enqulal Tibs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Enqulal Tibs';

-- ============================================================
-- MEAL COMPONENTS — KENYA (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 38 FROM public.meals_master WHERE name = 'Mukimo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 22 FROM public.meals_master WHERE name = 'Mukimo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 18 FROM public.meals_master WHERE name = 'Mukimo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 15 FROM public.meals_master WHERE name = 'Mukimo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Mukimo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Mukimo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 55 FROM public.meals_master WHERE name = 'Mutura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Mutura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 12 FROM public.meals_master WHERE name = 'Mutura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Mutura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Mutura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Mutura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Mutura';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 50 FROM public.meals_master WHERE name = 'Githeri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 38 FROM public.meals_master WHERE name = 'Githeri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Githeri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Githeri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Githeri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 2 FROM public.meals_master WHERE name = 'Githeri';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 50 FROM public.meals_master WHERE name = 'Irio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 25 FROM public.meals_master WHERE name = 'Irio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches (secs)', 15 FROM public.meals_master WHERE name = 'Irio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 8 FROM public.meals_master WHERE name = 'Irio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Irio';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 52 FROM public.meals_master WHERE name = 'Mandazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 20 FROM public.meals_master WHERE name = 'Mandazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 15 FROM public.meals_master WHERE name = 'Mandazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Mandazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Mandazi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Mandazi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 68 FROM public.meals_master WHERE name = 'Chapati Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 18 FROM public.meals_master WHERE name = 'Chapati Kenya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Chapati Kenya';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 55 FROM public.meals_master WHERE name = 'Kachumbari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 28 FROM public.meals_master WHERE name = 'Kachumbari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 8 FROM public.meals_master WHERE name = 'Kachumbari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Kachumbari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 4 FROM public.meals_master WHERE name = 'Kachumbari';

-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 3
-- EXTENSION AFRIQUE DE L'EST — PARTIE 2
-- Pays : Madagascar · Malawi · Maurice · Rwanda · Seychelles
--        Somalie · Tanzanie · Ouganda
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : FAO East Africa FCT · USDA FoodData Central
--           WHO country offices · Publications scientifiques régionales
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- ============================================================
-- MADAGASCAR (compléments — plats non encore présents)
-- Sources : FAO East Africa FCT · USDA · Enquête Nutrition Madagascar INSTAT 2021
--           Randriamampionona et al. J. Afr. Nutr. Diet. 2018
-- ============================================================

('Henakisoa sy Anamamy', 'Madagascar', 'Afrique Australe', 'Plat principal',
 'Porc mijoté avec brèdes mafane (feuilles de cresson africain) aux épices, plat quotidien malgache',
 172, 14.5, 5.5, 11.2, 2.0, 'FAO East Africa FCT / INSTAT Madagascar 2021'),

('Mofo Baolina', 'Madagascar', 'Afrique Australe', 'Snack / Petit-déjeuner',
 'Beignets ronds de farine de riz légèrement sucrés et frits, en-cas de rue très populaire',
 298, 4.8, 42.5, 12.5, 0.8, 'FAO / INSTAT Madagascar 2021 / USDA Adaptation'),

('Lasopy', 'Madagascar', 'Afrique Australe', 'Soupe',
 'Soupe de légumes variés (carottes, chou, pommes de terre) avec viande, bouillon quotidien des Hauts Plateaux',
 68, 5.5, 8.5, 1.8, 2.2, 'FAO East Africa FCT / INSTAT Madagascar 2021'),

('Akoho sy Voanio', 'Madagascar', 'Afrique Australe', 'Plat principal',
 'Poulet mijoté au lait de coco avec gingembre, tomates et oignons, plat festif des côtes malgaches',
 185, 14.8, 7.5, 11.5, 1.2, 'FAO East Africa FCT / Randriamampionona et al. 2018'),

('Koba Akondro', 'Madagascar', 'Afrique Australe', 'Dessert / Snack',
 'Pâte de banane et arachides moulues sucrée, enveloppée en feuille de bananier et cuite, douceur malgache',
 285, 6.8, 42.5, 10.5, 3.5, 'FAO / INSTAT Madagascar 2021 / USDA'),

('Kabaro', 'Madagascar', 'Afrique Australe', 'Plat principal',
 'Haricots rouges cuits avec riz en bouillon légèrement épicé, plat rural économique des Hauts Plateaux',
 125, 6.2, 22.5, 1.2, 5.5, 'FAO East Africa FCT / INSTAT Madagascar 2021'),

('Ro sy Vari', 'Madagascar', 'Afrique Australe', 'Soupe / Plat principal',
 'Bouillon de bœuf léger servi avec riz blanc, repas de base des foyers malgaches des zones rurales',
 88, 6.8, 12.5, 1.8, 0.5, 'FAO East Africa FCT / INSTAT Madagascar 2021'),

-- Sources Madagascar : FAO East Africa FCT · INSTAT Madagascar Enquête 2021
--                      Randriamampionona et al. J. Afr. Nutr. Diet. 2018 · USDA FoodData Central

-- ============================================================
-- MALAWI
-- Sources : FAO East Africa FCT · USDA · Malawi Food Composition Tables MoH 2019
--           Mtimuni et al. Malawi Med. J. 2015
-- ============================================================

('Nsima ya Chimanga', 'Malawi', 'Afrique de l''Est', 'Accompagnement',
 'Boule de farine de maïs blanc cuite en pâte épaisse ferme, accompagnement de base national du Malawi',
 118, 2.5, 26.2, 0.5, 1.8, 'Malawi Food Composition Tables MoH 2019 / FAO East Africa FCT'),

('Ndiwo wa Nkhwani', 'Malawi', 'Afrique de l''Est', 'Plat principal',
 'Feuilles de courge (nkhwani) cuites en sauce aux arachides et bicarbonate, accompagne la nsima',
 88, 4.8, 7.5, 4.5, 3.8, 'Malawi Food Composition Tables MoH 2019 / FAO East Africa FCT'),

('Chambo Wofuwa', 'Malawi', 'Afrique de l''Est', 'Plat principal',
 'Tilapia du lac Malawi (chambo) grillé entier aux épices et citron, plat national très apprécié',
 178, 24.5, 2.5, 8.2, 0.0, 'Malawi Food Composition Tables MoH 2019 / USDA'),

('Nthochi', 'Malawi', 'Afrique de l''Est', 'Snack / Accompagnement',
 'Beignets de banane mûre et farine légèrement sucrés et frits, snack populaire au Malawi',
 228, 3.2, 38.5, 8.5, 2.2, 'Malawi Food Composition Tables MoH 2019 / USDA Adaptation'),

('Chipande', 'Malawi', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de poulet ou bœuf aux arachides pilées, tomates et oignons, servi avec nsima',
 175, 12.5, 9.5, 10.5, 2.5, 'Malawi Food Composition Tables MoH 2019 / FAO East Africa FCT'),

('Beans and Nsima Malawi', 'Malawi', 'Afrique de l''Est', 'Plat principal',
 'Haricots rouges mijotés en sauce tomate servis avec nsima de maïs, repas quotidien standard',
 128, 6.8, 22.5, 1.8, 6.0, 'Malawi Food Composition Tables MoH 2019 / FAO East Africa FCT'),

('Zitumbuwa', 'Malawi', 'Afrique de l''Est', 'Snack',
 'Beignets de maïs et banane frits, en-cas de rue populaire servi au marché',
 215, 3.5, 35.5, 8.0, 2.5, 'Malawi Food Composition Tables MoH 2019 / USDA Adaptation'),

-- Sources Malawi : Malawi Food Composition Tables MoH 2019 · FAO East Africa FCT
--                  Mtimuni et al. Malawi Med. J. 2015 · USDA FoodData Central

-- ============================================================
-- MAURICE
-- Sources : USDA FoodData Central · FAO · Mauritius Food Composition Table 2017
--           Ministry of Health Mauritius Nutrition Survey 2015
-- ============================================================

('Riz Biryani Mauricien', 'Maurice', 'Afrique de l''Est', 'Plat principal',
 'Riz parfumé aux épices indiennes (safran, cardamome, cannelle) avec poulet ou agneau, fête mauricienne',
 198, 10.8, 26.5, 6.2, 0.8, 'Mauritius Food Composition Table 2017 / USDA'),

('Dholl Puri', 'Maurice', 'Afrique de l''Est', 'Snack / Plat',
 'Galette de farine de blé fourrée aux pois cassés jaunes épicés, street food emblématique mauricien',
 278, 9.5, 42.5, 8.5, 4.2, 'Mauritius Food Composition Table 2017 / USDA FoodData Central'),

('Rougaille Saucisses', 'Maurice', 'Afrique de l''Est', 'Plat principal',
 'Saucisses cuisinées en sauce tomate épicée au gingembre, ail et thym, plat créole mauricien',
 218, 10.5, 8.5, 16.5, 1.5, 'Mauritius Food Composition Table 2017 / USDA'),

('Vindaye de Poisson', 'Maurice', 'Afrique de l''Est', 'Plat principal',
 'Poisson frit puis mariné au curcuma, moutarde, oignons et vinaigre, marinade créole mauricienne',
 195, 18.5, 8.5, 10.2, 1.0, 'Mauritius Food Composition Table 2017 / USDA'),

('Mine Frite Mauricienne', 'Maurice', 'Afrique de l''Est', 'Plat principal',
 'Nouilles sautées aux légumes, crevettes ou poulet aux épices sino-mauriciennes, plat de rue très populaire',
 185, 9.8, 25.5, 5.8, 2.0, 'Mauritius Food Composition Table 2017 / USDA'),

('Gato Piment', 'Maurice', 'Afrique de l''Est', 'Snack',
 'Beignets de haricots split mungo épicés au piment et cumin, frits, street food mauricien incontournable',
 285, 12.5, 28.5, 14.5, 5.5, 'Mauritius Food Composition Table 2017 / USDA FoodData Central'),

('Cari Poulet Mauricien', 'Maurice', 'Afrique de l''Est', 'Plat principal',
 'Curry de poulet aux épices indiennes (curcuma, cumin, coriandre) et tomates, plat familial mauricien',
 168, 14.5, 7.5, 9.2, 1.5, 'Mauritius Food Composition Table 2017 / USDA'),

-- Sources Maurice : Mauritius Food Composition Table 2017 · Ministry of Health Mauritius 2015
--                   USDA FoodData Central · FAO

-- ============================================================
-- RWANDA
-- Sources : FAO East Africa FCT · USDA · Rwanda Food Composition Table RNLA 2018
--           Niyibituronsa et al. Food Sci. Nutr. 2019
-- ============================================================

('Ubugali Rwanda', 'Rwanda', 'Afrique de l''Est', 'Accompagnement',
 'Boule de farine de maïs ou sorgho cuite en pâte ferme, accompagnement de base rwanda identique à l''ugali',
 112, 2.5, 24.8, 0.6, 1.8, 'Rwanda Food Composition Table RNLA 2018 / FAO East Africa FCT'),

('Ibiharage bya Rwanda', 'Rwanda', 'Afrique de l''Est', 'Plat principal',
 'Haricots rouges cuits en sauce tomate et oignons avec huile, plat de base des ménages rwandais',
 118, 7.0, 19.8, 1.8, 6.5, 'Rwanda Food Composition Table RNLA 2018 / FAO East Africa FCT'),

('Ikivuguto', 'Rwanda', 'Afrique de l''Est', 'Boisson / Petit-déjeuner',
 'Lait fermenté traditionnel rwandais légèrement aigre, boisson nutritive et rafraîchissante',
 62, 3.5, 5.2, 3.2, 0.0, 'Rwanda Food Composition Table RNLA 2018 / USDA'),

('Umutsima Rwanda', 'Rwanda', 'Afrique de l''Est', 'Accompagnement',
 'Mélange de manioc et maïs concassés cuits ensemble, accompagnement traditionnel des collines rwandaises',
 115, 2.2, 25.5, 0.5, 2.0, 'Rwanda Food Composition Table RNLA 2018 / FAO East Africa FCT'),

('Inzoga y''Uburo', 'Rwanda', 'Afrique de l''Est', 'Boisson',
 'Bière traditionnelle de sorgho légèrement fermentée, boisson cérémonielle rwandaise faiblement alcoolisée',
 48, 0.8, 9.5, 0.2, 0.5, 'Rwanda Food Composition Table RNLA 2018 / FAO'),

('Mizuzu', 'Rwanda', 'Afrique de l''Est', 'Accompagnement / Snack',
 'Tranches de plantain mûr frites à l''huile, accompagnement populaire dans tout le Rwanda',
 188, 1.2, 31.5, 7.2, 2.2, 'USDA FoodData Central / Rwanda Food Composition Table RNLA 2018'),

('Akabenz', 'Rwanda', 'Afrique de l''Est', 'Plat principal',
 'Morceaux de poulet grillés épicés aux oignons et piment, plat de rue populaire à Kigali',
 210, 22.5, 4.2, 12.2, 0.5, 'USDA FoodData Central / Rwanda Food Composition Table RNLA 2018'),

-- Sources Rwanda : Rwanda Food Composition Table RNLA 2018 · FAO East Africa FCT
--                  Niyibituronsa et al. Food Sci. Nutr. 2019 · USDA FoodData Central

-- ============================================================
-- SEYCHELLES
-- Sources : USDA FoodData Central · FAO · Seychelles National Nutrition Survey 2016
--           Ministry of Health Seychelles
-- ============================================================

('Bouillon de Poisson Seychellois', 'Seychelles', 'Afrique de l''Est', 'Soupe',
 'Bouillon léger de poisson frais aux légumes, citronnelle et épices créoles seychelloises',
 68, 8.8, 4.5, 1.8, 0.8, 'Seychelles National Nutrition Survey 2016 / FAO'),

('Ladob Banane', 'Seychelles', 'Afrique de l''Est', 'Dessert / Accompagnement',
 'Bananes ou patates douces cuites dans lait de coco sucré à la vanille, dessert créole seychellois',
 185, 1.8, 38.5, 4.5, 2.5, 'Seychelles National Nutrition Survey 2016 / USDA'),

('Satini Requins', 'Seychelles', 'Afrique de l''Est', 'Plat principal',
 'Viande de requin séchée et effilochée cuite en chutney aux épices et oignons, plat seychellois traditionnel',
 145, 18.5, 5.5, 6.2, 0.8, 'Seychelles National Nutrition Survey 2016 / USDA FoodData Central'),

('Cari de Poulet Seychellois', 'Seychelles', 'Afrique de l''Est', 'Plat principal',
 'Curry de poulet créole seychellois au lait de coco, curcuma et feuilles de cari, servi avec riz',
 172, 13.8, 8.2, 10.2, 1.2, 'Seychelles National Nutrition Survey 2016 / USDA'),

('Riz Créole Seychellois', 'Seychelles', 'Afrique de l''Est', 'Accompagnement',
 'Riz blanc cuit à l''eau légèrement salé, accompagnement de base de la cuisine seychelloise',
 142, 2.8, 31.5, 0.4, 0.5, 'Seychelles National Nutrition Survey 2016 / USDA'),

('Tec-Tec', 'Seychelles', 'Afrique de l''Est', 'Soupe',
 'Soupe de coques (petits bivalves locaux) aux herbes et épices créoles, spécialité seychelloise',
 62, 8.2, 4.5, 1.5, 0.5, 'Seychelles National Nutrition Survey 2016 / FAO'),

('Gratin de Coco Seychellois', 'Seychelles', 'Afrique de l''Est', 'Plat principal',
 'Légumes racines gratinés au lait de coco et épices, plat végétarien créole des Seychelles',
 148, 3.5, 22.5, 6.5, 3.2, 'Seychelles National Nutrition Survey 2016 / FAO / USDA Adaptation'),

-- Sources Seychelles : Seychelles National Nutrition Survey 2016 · Ministry of Health Seychelles
--                      FAO · USDA FoodData Central

-- ============================================================
-- SOMALIE (compléments — plats non encore présents)
-- Sources : FAO East Africa FCT · USDA · WHO Somalia Nutrition Report 2020
--           Abdullahi et al. Somali Med. J. 2017
-- ============================================================

('Sabaayad', 'Somalie', 'Afrique de l''Est', 'Petit-déjeuner / Accompagnement',
 'Galette de farine de blé croustillante légèrement feuilletée cuite sur plaque, pain quotidien somalien',
 312, 8.5, 45.5, 11.5, 1.8, 'FAO East Africa FCT / WHO Somalia 2020'),

('Muqmad Somalie', 'Somalie', 'Afrique de l''Est', 'Plat principal',
 'Viande de chameau ou bœuf séchée conservée dans son propre gras, provision traditionnelle nomade',
 272, 27.8, 0.8, 17.5, 0.0, 'USDA FoodData Central / WHO Somalia 2020'),

('Hilib Ari', 'Somalie', 'Afrique de l''Est', 'Plat principal',
 'Viande de chèvre mijotée aux épices somaliennes et oignons, servi avec riz ou laxoox, plat familial',
 188, 18.5, 3.5, 11.8, 0.5, 'FAO East Africa FCT / WHO Somalia 2020'),

('Suqaar', 'Somalie', 'Afrique de l''Est', 'Plat principal',
 'Dés de viande de bœuf ou chèvre sautés aux oignons, poivrons et épices, plat rapide somalien',
 195, 20.5, 5.5, 11.2, 1.0, 'FAO East Africa FCT / WHO Somalia 2020'),

('Xalwo', 'Somalie', 'Afrique de l''Est', 'Dessert',
 'Confiserie sucrée à base de sucre, ghee, fécule de maïs et cardamome, friandise somalienne traditionnelle',
 385, 2.5, 62.5, 15.5, 0.5, 'USDA FoodData Central / Abdullahi et al. Somali Med. J. 2017'),

('Maraq Faah Faah Somalie', 'Somalie', 'Afrique de l''Est', 'Soupe',
 'Bouillon épicé aux légumes (aubergine, poivron) et viande, soupe populaire dans toutes les villes somaliennes',
 78, 7.5, 6.5, 2.8, 1.5, 'FAO East Africa FCT / WHO Somalia 2020'),

-- Sources Somalie : FAO East Africa FCT · WHO Somalia Nutrition Report 2020
--                   Abdullahi et al. Somali Med. J. 2017 · USDA FoodData Central

-- ============================================================
-- TANZANIE
-- Sources : FAO East Africa FCT · USDA · Tanzania Food Composition Tables TFNC 2008
--           Lukmanji et al. TFNC/MUHAS 2008
-- ============================================================

('Ugali wa Sembe', 'Tanzanie', 'Afrique de l''Est', 'Accompagnement',
 'Boule de farine de maïs blanc (sembe) cuite en pâte épaisse, accompagnement de base en Tanzanie',
 118, 2.5, 26.5, 0.5, 1.8, 'Tanzania Food Composition Tables TFNC 2008 / FAO East Africa FCT'),

('Mchuzi wa Samaki', 'Tanzanie', 'Afrique de l''Est', 'Plat principal',
 'Curry de poisson au lait de coco, tomates et épices swahili, plat côtier tanzanien très répandu',
 162, 14.2, 8.5, 9.2, 1.2, 'Tanzania Food Composition Tables TFNC 2008 / USDA'),

('Mshikaki', 'Tanzanie', 'Afrique de l''Est', 'Snack / Plat principal',
 'Brochettes de bœuf mariné aux épices et lait de coco grillées, street food iconic de Dar es Salaam',
 215, 22.5, 4.5, 12.5, 0.5, 'USDA FoodData Central / Tanzania Food Composition Tables TFNC 2008'),

('Vitumbua', 'Tanzanie', 'Afrique de l''Est', 'Petit-déjeuner / Snack',
 'Petites galettes rondes de riz et lait de coco fermentés cuites dans un moule spécial, petit-déjeuner côtier',
 198, 4.5, 33.5, 6.2, 1.2, 'Tanzania Food Composition Tables TFNC 2008 / USDA'),

('Ndizi na Nyama', 'Tanzanie', 'Afrique de l''Est', 'Plat principal',
 'Plantain vert cuit avec viande de bœuf en ragoût, plat familial tanzanien très courant',
 148, 10.2, 19.5, 4.5, 2.8, 'Tanzania Food Composition Tables TFNC 2008 / FAO East Africa FCT'),

('Mchuzi wa Mboga', 'Tanzanie', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de légumes variés (aubergine, tomates, haricots verts) en sauce tomate épicée, plat végétarien',
 72, 3.2, 12.5, 2.0, 3.5, 'Tanzania Food Composition Tables TFNC 2008 / FAO East Africa FCT'),

('Wali Pilau Tanzanie', 'Tanzanie', 'Afrique de l''Est', 'Plat principal',
 'Riz pilau tanzanien aux épices swahili (cumin, cardamome, poivre) avec bœuf ou poulet, version de Zanzibar',
 178, 9.5, 24.8, 5.2, 0.8, 'Tanzania Food Composition Tables TFNC 2008 / USDA'),

-- Sources Tanzanie : Tanzania Food Composition Tables TFNC 2008 · FAO East Africa FCT
--                    Lukmanji et al. TFNC/MUHAS 2008 · USDA FoodData Central

-- ============================================================
-- OUGANDA (compléments — plats non encore présents)
-- Sources : FAO East Africa FCT · USDA · Uganda Food Composition Tables MoH 2012
--           Agea et al. Afr. J. Food Agric. Nutr. Dev. 2010
-- ============================================================

('Luwombo', 'Ouganda', 'Afrique de l''Est', 'Plat principal',
 'Poulet ou bœuf mijoté à l''étouffée avec arachides et légumes en feuilles de bananier, plat royal Buganda',
 178, 14.8, 8.5, 10.5, 2.2, 'Uganda Food Composition Tables MoH 2012 / FAO East Africa FCT'),

('Posho Uganda', 'Ouganda', 'Afrique de l''Est', 'Accompagnement',
 'Boule de farine de maïs blanc cuite en pâte ferme, équivalent ougandais de l''ugali',
 118, 2.5, 26.2, 0.5, 1.8, 'Uganda Food Composition Tables MoH 2012 / FAO East Africa FCT'),

('Groundnut Stew Uganda', 'Ouganda', 'Afrique de l''Est', 'Plat principal',
 'Ragoût de poulet ou bœuf en sauce épaisse aux arachides pilées et légumes, plat de base ougandais',
 195, 12.8, 9.5, 13.5, 2.5, 'Uganda Food Composition Tables MoH 2012 / FAO East Africa FCT'),

('Nakati', 'Ouganda', 'Afrique de l''Est', 'Plat principal',
 'Feuilles de morelle noire (nakati) sautées avec oignons et tomates, légume-feuille traditionnel ougandais',
 55, 3.5, 7.2, 1.5, 4.2, 'Uganda Food Composition Tables MoH 2012 / FAO East Africa FCT'),

('Katogo', 'Ouganda', 'Afrique de l''Est', 'Plat principal',
 'Plantain vert (matooke) cuit avec abats de bœuf, haricots ou arachides dans un seul pot, petit-déjeuner urbain',
 148, 7.5, 22.5, 4.5, 3.2, 'Uganda Food Composition Tables MoH 2012 / FAO East Africa FCT'),

('Nsenene', 'Ouganda', 'Afrique de l''Est', 'Snack / Plat',
 'Sauterelles des marais sautées avec oignons, sel et piment, mets saisonnier traditionnel ougandais riche en protéines',
 198, 28.5, 5.5, 8.5, 2.5, 'Uganda Food Composition Tables MoH 2012 / Agea et al. 2010'),

('Obushera', 'Ouganda', 'Afrique de l''Est', 'Boisson / Petit-déjeuner',
 'Bouillie fermentée de sorgho ou mil légèrement sucrée, boisson nutritive traditionnelle de l''Ouganda occidental',
 72, 2.2, 14.5, 0.8, 1.5, 'Uganda Food Composition Tables MoH 2012 / FAO East Africa FCT');

-- Sources Ouganda : Uganda Food Composition Tables MoH 2012 · FAO East Africa FCT
--                   Agea et al. Afr. J. Food Agric. Nutr. Dev. 2010 · USDA FoodData Central


-- ============================================================
-- MEAL COMPONENTS — MADAGASCAR (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc filet (cru)', 50 FROM public.meals_master WHERE name = 'Henakisoa sy Anamamy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 28 FROM public.meals_master WHERE name = 'Henakisoa sy Anamamy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Henakisoa sy Anamamy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Henakisoa sy Anamamy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Henakisoa sy Anamamy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Henakisoa sy Anamamy';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de riz', 55 FROM public.meals_master WHERE name = 'Mofo Baolina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 22 FROM public.meals_master WHERE name = 'Mofo Baolina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 12 FROM public.meals_master WHERE name = 'Mofo Baolina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 8 FROM public.meals_master WHERE name = 'Mofo Baolina';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Mofo Baolina';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 30 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 18 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 18 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Lasopy';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Lasopy';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 48 FROM public.meals_master WHERE name = 'Akoho sy Voanio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 25 FROM public.meals_master WHERE name = 'Akoho sy Voanio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Akoho sy Voanio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Akoho sy Voanio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 5 FROM public.meals_master WHERE name = 'Akoho sy Voanio';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Akoho sy Voanio';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 48 FROM public.meals_master WHERE name = 'Koba Akondro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 30 FROM public.meals_master WHERE name = 'Koba Akondro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 18 FROM public.meals_master WHERE name = 'Koba Akondro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Koba Akondro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vanille', 2 FROM public.meals_master WHERE name = 'Koba Akondro';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 40 FROM public.meals_master WHERE name = 'Kabaro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 45 FROM public.meals_master WHERE name = 'Kabaro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Kabaro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Kabaro';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Kabaro';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 38 FROM public.meals_master WHERE name = 'Ro sy Vari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 38 FROM public.meals_master WHERE name = 'Ro sy Vari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Ro sy Vari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 6 FROM public.meals_master WHERE name = 'Ro sy Vari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Ro sy Vari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ro sy Vari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 2 FROM public.meals_master WHERE name = 'Ro sy Vari';

-- ============================================================
-- MEAL COMPONENTS — MALAWI
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 90 FROM public.meals_master WHERE name = 'Nsima ya Chimanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Nsima ya Chimanga';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 48 FROM public.meals_master WHERE name = 'Ndiwo wa Nkhwani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 25 FROM public.meals_master WHERE name = 'Ndiwo wa Nkhwani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Ndiwo wa Nkhwani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Ndiwo wa Nkhwani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Ndiwo wa Nkhwani';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 75 FROM public.meals_master WHERE name = 'Chambo Wofuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 10 FROM public.meals_master WHERE name = 'Chambo Wofuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 6 FROM public.meals_master WHERE name = 'Chambo Wofuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Chambo Wofuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 4 FROM public.meals_master WHERE name = 'Chambo Wofuwa';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 62 FROM public.meals_master WHERE name = 'Nthochi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 18 FROM public.meals_master WHERE name = 'Nthochi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 12 FROM public.meals_master WHERE name = 'Nthochi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 5 FROM public.meals_master WHERE name = 'Nthochi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Nthochi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 40 FROM public.meals_master WHERE name = 'Chipande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 22 FROM public.meals_master WHERE name = 'Chipande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Chipande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Chipande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Chipande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 4 FROM public.meals_master WHERE name = 'Chipande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Chipande';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 42 FROM public.meals_master WHERE name = 'Beans and Nsima Malawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 35 FROM public.meals_master WHERE name = 'Beans and Nsima Malawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Beans and Nsima Malawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Beans and Nsima Malawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Beans and Nsima Malawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Beans and Nsima Malawi';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 50 FROM public.meals_master WHERE name = 'Zitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 25 FROM public.meals_master WHERE name = 'Zitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 15 FROM public.meals_master WHERE name = 'Zitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 6 FROM public.meals_master WHERE name = 'Zitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 4 FROM public.meals_master WHERE name = 'Zitumbuwa';

-- ============================================================
-- MEAL COMPONENTS — MAURICE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 48 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 30 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 2 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Riz Biryani Mauricien';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 48 FROM public.meals_master WHERE name = 'Dholl Puri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches (secs)', 30 FROM public.meals_master WHERE name = 'Dholl Puri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 12 FROM public.meals_master WHERE name = 'Dholl Puri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 4 FROM public.meals_master WHERE name = 'Dholl Puri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 3 FROM public.meals_master WHERE name = 'Dholl Puri';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Dholl Puri';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc filet (cru)', 35 FROM public.meals_master WHERE name = 'Rougaille Saucisses';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 28 FROM public.meals_master WHERE name = 'Rougaille Saucisses';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Rougaille Saucisses';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 8 FROM public.meals_master WHERE name = 'Rougaille Saucisses';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Rougaille Saucisses';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Rougaille Saucisses';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Rougaille Saucisses';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 52 FROM public.meals_master WHERE name = 'Vindaye de Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Vindaye de Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 12 FROM public.meals_master WHERE name = 'Vindaye de Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre blanc', 8 FROM public.meals_master WHERE name = 'Vindaye de Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 5 FROM public.meals_master WHERE name = 'Vindaye de Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Vindaye de Poisson';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Vindaye de Poisson';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule de blé dur', 45 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 20 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 8 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Mine Frite Mauricienne';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 50 FROM public.meals_master WHERE name = 'Gato Piment';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 25 FROM public.meals_master WHERE name = 'Gato Piment';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Gato Piment';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Gato Piment';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 4 FROM public.meals_master WHERE name = 'Gato Piment';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Gato Piment';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 50 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 4 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Cari Poulet Mauricien';

-- ============================================================
-- MEAL COMPONENTS — RWANDA
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 88 FROM public.meals_master WHERE name = 'Ubugali Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ubugali Rwanda';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 72 FROM public.meals_master WHERE name = 'Ibiharage bya Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Ibiharage bya Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Ibiharage bya Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Ibiharage bya Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ibiharage bya Rwanda';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de vache entier (3,5%)', 95 FROM public.meals_master WHERE name = 'Ikivuguto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 5 FROM public.meals_master WHERE name = 'Ikivuguto';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 52 FROM public.meals_master WHERE name = 'Umutsima Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 42 FROM public.meals_master WHERE name = 'Umutsima Rwanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Umutsima Rwanda';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 90 FROM public.meals_master WHERE name = 'Inzoga y''Uburo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Inzoga y''Uburo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 80 FROM public.meals_master WHERE name = 'Mizuzu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 15 FROM public.meals_master WHERE name = 'Mizuzu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Mizuzu';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 72 FROM public.meals_master WHERE name = 'Akabenz';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Akabenz';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Akabenz';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Akabenz';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Akabenz';

-- ============================================================
-- MEAL COMPONENTS — SEYCHELLES
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 50 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 6 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 4 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 5 FROM public.meals_master WHERE name = 'Bouillon de Poisson Seychellois';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 55 FROM public.meals_master WHERE name = 'Ladob Banane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 30 FROM public.meals_master WHERE name = 'Ladob Banane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Ladob Banane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vanille', 5 FROM public.meals_master WHERE name = 'Ladob Banane';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 55 FROM public.meals_master WHERE name = 'Satini Requins';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Satini Requins';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 10 FROM public.meals_master WHERE name = 'Satini Requins';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Satini Requins';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Satini Requins';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 4 FROM public.meals_master WHERE name = 'Satini Requins';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 48 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 22 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 4 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Cari de Poulet Seychellois';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 90 FROM public.meals_master WHERE name = 'Riz Créole Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Riz Créole Seychellois';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 60 FROM public.meals_master WHERE name = 'Tec-Tec';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Tec-Tec';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 10 FROM public.meals_master WHERE name = 'Tec-Tec';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Tec-Tec';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 4 FROM public.meals_master WHERE name = 'Tec-Tec';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Tec-Tec';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Manioc frais', 38 FROM public.meals_master WHERE name = 'Gratin de Coco Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 30 FROM public.meals_master WHERE name = 'Gratin de Coco Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Patate douce (crue)', 18 FROM public.meals_master WHERE name = 'Gratin de Coco Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Gratin de Coco Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Gratin de Coco Seychellois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 2 FROM public.meals_master WHERE name = 'Gratin de Coco Seychellois';

-- ============================================================
-- MEAL COMPONENTS — SOMALIE (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé T55', 72 FROM public.meals_master WHERE name = 'Sabaayad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 18 FROM public.meals_master WHERE name = 'Sabaayad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Sabaayad';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 72 FROM public.meals_master WHERE name = 'Muqmad Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 15 FROM public.meals_master WHERE name = 'Muqmad Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 8 FROM public.meals_master WHERE name = 'Muqmad Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Muqmad Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Muqmad Somalie';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 62 FROM public.meals_master WHERE name = 'Hilib Ari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Hilib Ari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Hilib Ari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 4 FROM public.meals_master WHERE name = 'Hilib Ari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 3 FROM public.meals_master WHERE name = 'Hilib Ari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Hilib Ari';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Hilib Ari';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 58 FROM public.meals_master WHERE name = 'Suqaar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Suqaar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 10 FROM public.meals_master WHERE name = 'Suqaar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Suqaar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Suqaar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Suqaar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 1 FROM public.meals_master WHERE name = 'Suqaar';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 52 FROM public.meals_master WHERE name = 'Xalwo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (doux)', 28 FROM public.meals_master WHERE name = 'Xalwo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 12 FROM public.meals_master WHERE name = 'Xalwo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 6 FROM public.meals_master WHERE name = 'Xalwo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de coco râpée (sèche)', 2 FROM public.meals_master WHERE name = 'Xalwo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 38 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 10 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 5 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 4 FROM public.meals_master WHERE name = 'Maraq Faah Faah Somalie';

-- ============================================================
-- MEAL COMPONENTS — TANZANIE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 90 FROM public.meals_master WHERE name = 'Ugali wa Sembe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Ugali wa Sembe';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 45 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 25 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 3 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Mchuzi wa Samaki';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 62 FROM public.meals_master WHERE name = 'Mshikaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 15 FROM public.meals_master WHERE name = 'Mshikaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Mshikaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Mshikaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Mshikaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Mshikaki';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 2 FROM public.meals_master WHERE name = 'Mshikaki';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de riz', 52 FROM public.meals_master WHERE name = 'Vitumbua';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 32 FROM public.meals_master WHERE name = 'Vitumbua';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Vitumbua';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 4 FROM public.meals_master WHERE name = 'Vitumbua';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 4 FROM public.meals_master WHERE name = 'Vitumbua';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 45 FROM public.meals_master WHERE name = 'Ndizi na Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 32 FROM public.meals_master WHERE name = 'Ndizi na Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Ndizi na Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Ndizi na Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Ndizi na Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Ndizi na Nyama';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 30 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 20 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 15 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 10 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 12 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Mchuzi wa Mboga';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 25 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin (graines)', 3 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome (graines)', 3 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 4 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Wali Pilau Tanzanie';

-- ============================================================
-- MEAL COMPONENTS — OUGANDA (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 45 FROM public.meals_master WHERE name = 'Luwombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 22 FROM public.meals_master WHERE name = 'Luwombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Luwombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Luwombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Luwombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Luwombo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Luwombo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (blanche)', 90 FROM public.meals_master WHERE name = 'Posho Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Posho Uganda';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 32 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 28 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Groundnut Stew Uganda';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards (frais)', 72 FROM public.meals_master WHERE name = 'Nakati';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Nakati';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Nakati';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Nakati';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 48 FROM public.meals_master WHERE name = 'Katogo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 22 FROM public.meals_master WHERE name = 'Katogo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 15 FROM public.meals_master WHERE name = 'Katogo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Katogo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Katogo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Katogo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 15 FROM public.meals_master WHERE name = 'Nsenene';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Nsenene';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 8 FROM public.meals_master WHERE name = 'Nsenene';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 4 FROM public.meals_master WHERE name = 'Nsenene';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 82 FROM public.meals_master WHERE name = 'Obushera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 12 FROM public.meals_master WHERE name = 'Obushera';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Obushera';

-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 3
-- EXTENSION AFRIQUE CENTRALE
-- Pays : Angola · Cameroun · Centrafrique · Tchad · RD Congo
--        République du Congo · Guinée Équatoriale · Gabon · São Tomé-et-Príncipe
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : FAO Central Africa FCT · USDA FoodData Central
--           WHO country offices · Publications scientifiques régionales
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

-- ============================================================
-- ANGOLA
-- Sources : FAO / USDA / Instituto Nacional de Saúde Angola
--           Enquête Nationale Nutrition Angola PNUD 2019
-- ============================================================

('Muamba de Galinha', 'Angola', 'Afrique Centrale', 'Plat principal',
 'Poulet mijoté dans sauce de noix de palme (muamba) avec okra, ail et piment, plat national angolais',
 205, 14.2, 6.8, 14.5, 2.2, 'FAO / Instituto Nacional de Saúde Angola / USDA'),

('Funje', 'Angola', 'Afrique Centrale', 'Accompagnement',
 'Pâte de farine de manioc cuite à l''eau, accompagnement de base de l''alimentation angolaise',
 142, 0.8, 34.2, 0.3, 1.5, 'FAO / Instituto Nacional de Saúde Angola 2019'),

('Calulu de Peixe', 'Angola', 'Afrique Centrale', 'Plat principal',
 'Poisson séché et légumes frais (tomates, gombos, aubergine) cuits en sauce tomate, plat côtier angolais',
 145, 13.5, 9.5, 6.2, 3.2, 'FAO / Instituto Nacional de Saúde Angola / USDA Adaptation'),

('Funge com Feijão', 'Angola', 'Afrique Centrale', 'Plat principal',
 'Funje (pâte de manioc) servi avec ragoût de haricots rouges, repas quotidien par excellence en Angola',
 138, 5.8, 27.5, 1.5, 5.5, 'FAO / Instituto Nacional de Saúde Angola 2019'),

('Pirão', 'Angola', 'Afrique Centrale', 'Accompagnement',
 'Bouillie de farine de manioc cuite dans bouillon de poisson, accompagnement côtier angolais très courant',
 112, 2.5, 25.5, 0.8, 1.2, 'FAO / Instituto Nacional de Saúde Angola / USDA'),

('Arroz de Banana Angolano', 'Angola', 'Afrique Centrale', 'Plat principal',
 'Riz cuisiné avec banane plantain mûre, huile de palme et épices locales, plat familial angolais',
 162, 3.2, 30.5, 4.2, 2.0, 'FAO / Instituto Nacional de Saúde Angola / USDA Adaptation'),

('Mufete', 'Angola', 'Afrique Centrale', 'Plat principal',
 'Poisson grillé sur braises servi avec funje, haricots et salade de légumes, plat de fête angolais',
 178, 18.5, 15.5, 5.8, 2.5, 'FAO / Instituto Nacional de Saúde Angola / USDA'),

-- Sources Angola : Instituto Nacional de Saúde Angola · FAO Central Africa FCT
--                  Enquête Nationale Nutrition Angola PNUD 2019 · USDA FoodData Central

-- ============================================================
-- CAMEROUN (compléments — plats non encore présents)
-- Sources : FAO / MINRESI Cameroun / USDA
--           Etude Nutritionnelle IRESCO Cameroun 2018
-- ============================================================

('Kondre', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Ragoût de plantain vert immature et viande de mouton ou cabri, cuisiné aux épices, plat bamiléké',
 175, 11.2, 18.5, 7.5, 3.5, 'FAO / MINRESI Cameroun / IRESCO 2018'),

('Nkui', 'Cameroun', 'Afrique Centrale', 'Soupe',
 'Soupe gluante aux feuilles de mauve (Corchorus), viande de bœuf et poisson fumé, plat de l''Ouest',
 88, 6.8, 7.5, 3.8, 4.5, 'FAO / MINRESI Cameroun / IRESCO 2018'),

('Sanga', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Maïs concassé cuit avec haricots rouges et huile de palme, plat paysan très répandu au Cameroun',
 148, 7.2, 24.5, 3.5, 5.8, 'FAO / MINRESI Cameroun / IRESCO 2018'),

('Beignets Haricots Cameroun', 'Cameroun', 'Afrique Centrale', 'Snack / Petit-déjeuner',
 'Beignets de pâte de niébé mixée avec oignons et piment, frits, street food iconique de Yaoundé et Douala',
 238, 10.2, 22.5, 12.5, 4.8, 'USDA FoodData Central / FAO / MINRESI Cameroun'),

('Okok', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Feuilles de Gnetum africanum (okok/eru) cuites finement avec arachides moulues et huile de palme',
 172, 9.8, 6.2, 12.5, 4.8, 'FAO / MINRESI Cameroun / IRESCO Cameroun 2018'),

('Riz Sauté Camerounais', 'Cameroun', 'Afrique Centrale', 'Plat principal',
 'Riz blanc sauté avec légumes, poulet ou crevettes, sauce tomate et épices, plat urbain très populaire',
 168, 9.5, 23.5, 4.5, 1.2, 'FAO / USDA Adaptation / MINRESI Cameroun'),

-- Sources Cameroun (compléments) : MINRESI Cameroun · FAO Central Africa FCT
--                                   IRESCO Cameroun 2018 · USDA FoodData Central

-- ============================================================
-- RÉPUBLIQUE CENTRAFRICAINE
-- Sources : FAO / WHO RCA Nutrition Report 2020
--           Enquête SMART Centrafrique 2019 · USDA
-- ============================================================

('Gozo', 'République Centrafricaine', 'Afrique Centrale', 'Accompagnement',
 'Boule de farine de manioc ou de maïs cuite en pâte ferme, accompagnement de base en RCA',
 128, 2.2, 29.5, 0.5, 1.8, 'FAO / WHO RCA Nutrition Report 2020 / Enquête SMART RCA 2019'),

('Ngouza', 'République Centrafricaine', 'Afrique Centrale', 'Plat principal',
 'Feuilles de manioc pilées cuites avec arachides moulues et huile de palme, plat quotidien centrafricain',
 155, 7.5, 9.5, 10.2, 4.5, 'FAO / WHO RCA 2020 / Enquête SMART RCA 2019'),

('Saka-Madesu', 'République Centrafricaine', 'Afrique Centrale', 'Plat principal',
 'Feuilles de manioc pilées mélangées avec haricots blancs cuits, huile de palme et épices',
 148, 9.2, 16.5, 6.8, 5.5, 'FAO / WHO RCA 2020 / Enquête SMART RCA 2019'),

('Poulet Rôti Centrafricain', 'République Centrafricaine', 'Afrique Centrale', 'Plat principal',
 'Poulet entier mariné aux épices locales (ail, piment, gingembre), rôti ou grillé, plat de fête en RCA',
 198, 22.5, 2.5, 11.5, 0.2, 'USDA FoodData Central / FAO / WHO RCA 2020'),

('Haricots à l''Huile de Palme RCA', 'République Centrafricaine', 'Afrique Centrale', 'Plat principal',
 'Haricots rouges cuits longuement avec huile de palme, oignons et sel, repas de subsistance quotidien',
 125, 7.8, 18.8, 3.5, 6.8, 'FAO / WHO RCA 2020 / Enquête SMART RCA 2019'),

('Poisson Fumé en Sauce RCA', 'République Centrafricaine', 'Afrique Centrale', 'Plat principal',
 'Poisson fumé cuit en sauce tomate et gombos avec huile de palme, servi avec gozo',
 138, 14.5, 7.5, 6.8, 2.5, 'FAO / WHO RCA 2020 / USDA Adaptation'),

-- Sources RCA : FAO Central Africa FCT · WHO RCA Nutrition Report 2020
--               Enquête SMART Centrafrique 2019 · USDA FoodData Central

-- ============================================================
-- TCHAD
-- Sources : FAO / WHO Tchad Nutrition Report 2021
--           Enquête SMART Tchad 2020 · USDA · INSEED Tchad
-- ============================================================

('Boule de Mil Tchadienne', 'Tchad', 'Afrique Centrale', 'Accompagnement',
 'Boule de farine de mil cuite en pâte ferme, base alimentaire principale de tout le Tchad',
 118, 3.2, 24.8, 1.2, 3.0, 'FAO / WHO Tchad 2021 / Enquête SMART Tchad 2020'),

('Jarret de Bœuf à la Sauce Gombo Tchad', 'Tchad', 'Afrique Centrale', 'Plat principal',
 'Jarret de bœuf mijoté avec gombo séché pilé et épices locales, servi avec boule de mil',
 168, 14.5, 8.8, 7.8, 4.5, 'FAO / WHO Tchad 2021 / Enquête SMART Tchad 2020'),

('Alyam Alyam', 'Tchad', 'Afrique Centrale', 'Plat principal',
 'Riz cuit dans bouillon de viande de mouton avec légumes et épices sahéliennes, plat populaire N''Djamena',
 172, 9.5, 24.2, 4.8, 1.0, 'FAO / WHO Tchad 2021 / USDA Adaptation'),

('Lalo Tchad', 'Tchad', 'Afrique Centrale', 'Soupe / Plat principal',
 'Soupe gluante aux feuilles de baobab séchées avec viande et poisson fumé, accompagne la boule de mil',
 82, 5.8, 8.2, 3.2, 5.5, 'FAO / WHO Tchad 2021 / Enquête SMART Tchad 2020'),

('Kisser', 'Tchad', 'Afrique Centrale', 'Petit-déjeuner / Accompagnement',
 'Galette fermentée de sorgho cuite sur plaque en fonte, pain traditionnel du Tchad septentrional',
 158, 4.8, 33.5, 1.5, 2.5, 'FAO / WHO Tchad 2021 / USDA Adaptation'),

('Agashe', 'Tchad', 'Afrique Centrale', 'Plat principal',
 'Ragoût de viande de bœuf séché (tikwas) avec épices, tomates et oignons, plat des régions sahéliennes',
 178, 18.5, 5.5, 9.5, 0.8, 'FAO / WHO Tchad 2021 / USDA FoodData Central'),

-- Sources Tchad : FAO Central Africa FCT · WHO Tchad Nutrition Report 2021
--                 Enquête SMART Tchad 2020 · INSEED Tchad · USDA FoodData Central

-- ============================================================
-- RÉPUBLIQUE DÉMOCRATIQUE DU CONGO (compléments — plats non encore présents)
-- Sources : FAO / USDA / PRONANUT RDC 2019
--           Enquête MICS RDC 2018 · Lukusa et al. Afr. J. Food Sci. 2017
-- ============================================================

('Chikwanga', 'RD Congo', 'Afrique Centrale', 'Accompagnement',
 'Bâton de manioc fermenté et cuit à la vapeur en feuille de bananier, variante du bobolo, très consommé en RDC',
 158, 0.9, 38.2, 0.4, 1.8, 'FAO / PRONANUT RDC 2019 / Enquête MICS RDC 2018'),

('Madesu ya Mafuta', 'RD Congo', 'Afrique Centrale', 'Plat principal',
 'Haricots rouges cuits longuement avec huile de palme rouge, plat national de la RDC servi avec fufu',
 132, 8.2, 19.5, 3.8, 7.2, 'FAO / PRONANUT RDC 2019 / Lukusa et al. Afr. J. Food Sci. 2017'),

('Lituma', 'RD Congo', 'Afrique Centrale', 'Accompagnement',
 'Plantain vert ou semi-mûr bouilli puis pilé en pâte, accompagnement typique des provinces équatoriales',
 118, 1.5, 27.5, 0.5, 3.2, 'FAO / PRONANUT RDC 2019 / USDA Adaptation'),

('Mosaka', 'RD Congo', 'Afrique Centrale', 'Plat principal',
 'Ragoût d''aubergines africaines avec viande de bœuf, sauce tomate et épices, plat urbain congolais',
 128, 9.5, 10.5, 5.8, 3.8, 'FAO / PRONANUT RDC 2019 / Lukusa et al. Afr. J. Food Sci. 2017'),

('Mbisi ya Kolela', 'RD Congo', 'Afrique Centrale', 'Plat principal',
 'Poisson frais (tilapia ou capitaine) frit à l''huile de palme avec oignons, tomates et piment',
 188, 20.5, 5.5, 10.5, 0.8, 'FAO / PRONANUT RDC 2019 / USDA FoodData Central'),

('Bindele', 'RD Congo', 'Afrique Centrale', 'Plat principal',
 'Chenilles comestibles (larves de coléoptères) sautées avec oignons, sel et piment, mets protéiné traditionnel',
 215, 20.5, 8.5, 12.5, 1.8, 'FAO / PRONANUT RDC 2019 / Lukusa et al. Afr. J. Food Sci. 2017'),

-- Sources RDC (compléments) : PRONANUT RDC 2019 · Enquête MICS RDC 2018
--                              Lukusa et al. Afr. J. Food Sci. 2017 · FAO · USDA FoodData Central

-- ============================================================
-- RÉPUBLIQUE DU CONGO
-- Sources : FAO / WHO Congo Nutrition Report 2018
--           CNSEE Congo 2015 · USDA · FAO Central Africa FCT
-- ============================================================

('Saka-Saka Congo', 'République du Congo', 'Afrique Centrale', 'Plat principal',
 'Feuilles de manioc pilées cuites avec poisson fumé et huile de palme rouge, plat national congolais',
 138, 6.8, 10.0, 8.5, 5.0, 'FAO / WHO Congo 2018 / CNSEE Congo 2015'),

('Gombo Frais Congo', 'République du Congo', 'Afrique Centrale', 'Soupe',
 'Soupe gluante de gombos frais avec poisson fumé, crevettes séchées et huile de palme, accompagne le foufou',
 82, 5.2, 7.8, 3.8, 4.2, 'FAO / WHO Congo 2018 / CNSEE Congo 2015'),

('Foufou Congo', 'République du Congo', 'Afrique Centrale', 'Accompagnement',
 'Pâte de farine de manioc épaisse cuite à l''eau, accompagnement universel de la cuisine congolaise',
 135, 0.7, 32.5, 0.3, 1.5, 'FAO Central Africa FCT / WHO Congo 2018'),

('Poulet Moambe Congo', 'République du Congo', 'Afrique Centrale', 'Plat principal',
 'Poulet cuit dans sauce épaisse de noix de palme avec ail, oignons et épices, plat festif congolais',
 208, 14.5, 5.8, 15.2, 1.5, 'FAO / WHO Congo 2018 / USDA Adaptation'),

('Porc au Piment Congo', 'République du Congo', 'Afrique Centrale', 'Plat principal',
 'Porc mijoté avec piment frais, oignons, ail et tomates, plat très apprécié dans les foyers brazzavillois',
 218, 16.5, 5.2, 15.2, 0.8, 'FAO / WHO Congo 2018 / USDA FoodData Central'),

('Ntaba', 'République du Congo', 'Afrique Centrale', 'Plat principal',
 'Chèvre grillée sur braises, marinée au piment et épices locales, plat de fête et de marché en République du Congo',
 215, 22.5, 2.2, 13.2, 0.0, 'USDA FoodData Central / FAO / WHO Congo 2018'),

-- Sources Congo : FAO Central Africa FCT · WHO Congo Nutrition Report 2018
--                 CNSEE Congo 2015 · USDA FoodData Central

-- ============================================================
-- GUINÉE ÉQUATORIALE
-- Sources : FAO / WHO Guinée Équatoriale · USDA
--           MINSABS Guinée Équatoriale 2016
-- ============================================================

('Sopa de Pescado Ecuatoguineana', 'Guinée Équatoriale', 'Afrique Centrale', 'Soupe',
 'Soupe de poisson frais aux légumes, plantain vert et épices locales, plat côtier emblématique de Malabo',
 88, 9.5, 8.5, 2.5, 1.8, 'FAO / WHO Guinée Équatoriale / MINSABS 2016'),

('Eru Guinée Équatoriale', 'Guinée Équatoriale', 'Afrique Centrale', 'Plat principal',
 'Feuilles d''eru (Gnetum africanum) hachées cuites avec waterleaf, huile de palme et crevettes fumées',
 165, 9.2, 5.5, 12.5, 5.2, 'FAO / MINSABS Guinée Équatoriale 2016 / USDA Adaptation'),

('Pescado a la Plancha Ecuatoguineano', 'Guinée Équatoriale', 'Afrique Centrale', 'Plat principal',
 'Poisson entier grillé sur plaque avec épices locales, ail et citron, plat quotidien très répandu à Bata',
 162, 22.5, 2.5, 7.5, 0.0, 'USDA FoodData Central / FAO / MINSABS 2016'),

('Foufou Guinée Équatoriale', 'Guinée Équatoriale', 'Afrique Centrale', 'Accompagnement',
 'Pâte de manioc ou plantain pilé, accompagnement de base des repas en Guinée Équatoriale',
 132, 1.2, 31.5, 0.4, 2.0, 'FAO Central Africa FCT / MINSABS Guinée Équatoriale 2016'),

('Pollo en Salsa de Cacahuete', 'Guinée Équatoriale', 'Afrique Centrale', 'Plat principal',
 'Poulet mijoté en sauce arachide épaisse avec tomates et épices, plat familial très populaire',
 195, 15.5, 8.5, 12.5, 2.2, 'FAO / MINSABS Guinée Équatoriale 2016 / USDA Adaptation'),

('Arroz con Pollo Ecuatoguineano', 'Guinée Équatoriale', 'Afrique Centrale', 'Plat principal',
 'Riz au poulet cuisiné en sauce tomate avec légumes et épices locales, plat courant en milieu urbain',
 168, 10.5, 22.5, 5.2, 1.0, 'FAO / USDA Adaptation / MINSABS Guinée Équatoriale 2016'),

-- Sources Guinée Équatoriale : FAO Central Africa FCT · WHO Guinée Équatoriale
--                               MINSABS Guinée Équatoriale 2016 · USDA FoodData Central

-- ============================================================
-- GABON (compléments — plats non encore présents)
-- Sources : FAO / USDA / DGS Gabon 2017
--           Enquête Nutritionnelle CENAME Gabon 2018
-- ============================================================

('Atanga', 'Gabon', 'Afrique Centrale', 'Accompagnement / Snack',
 'Prune africaine (Dacryodes edulis) bouillie ou grillée, consommée avec pain ou fufu, en-cas national gabonais',
 175, 2.8, 12.5, 13.5, 4.5, 'FAO / DGS Gabon 2017 / CENAME Gabon 2018'),

('Nzang Meyong', 'Gabon', 'Afrique Centrale', 'Plat principal',
 'Poisson de rivière cuit à l''étouffée en feuilles de bananier avec épices et herbes locales gabonaises',
 148, 18.5, 2.5, 7.5, 0.5, 'FAO / DGS Gabon 2017 / CENAME Gabon 2018'),

('Mbourou-Mbourou', 'Gabon', 'Afrique Centrale', 'Accompagnement',
 'Bâton de manioc fermenté emballé en feuille de bananier cuit à la vapeur, accompagnement courant au Gabon',
 162, 0.8, 38.8, 0.3, 1.5, 'FAO / DGS Gabon 2017 / USDA Adaptation'),

('Viande de Brousse Braisée Gabon', 'Gabon', 'Afrique Centrale', 'Plat principal',
 'Antilope ou sanglier grillé sur braises aux épices locales, mets prisé dans les marchés gabonais',
 188, 24.5, 1.2, 9.5, 0.0, 'USDA FoodData Central / FAO / DGS Gabon 2017'),

('Pilé de Plantain Gabon', 'Gabon', 'Afrique Centrale', 'Accompagnement',
 'Plantain vert bouilli puis pilé en pâte lisse, accompagnement de base servi avec soupes et sauces gabonaises',
 118, 1.5, 27.5, 0.5, 3.0, 'FAO Central Africa FCT / DGS Gabon 2017 / USDA'),

('Poulet au Nyembwe Gabon', 'Gabon', 'Afrique Centrale', 'Plat principal',
 'Poulet préparé dans sauce de noix de palme (nyembwe) avec piment et épices, plat emblématique gabonais',
 205, 13.8, 5.2, 15.5, 1.5, 'FAO / DGS Gabon 2017 / CENAME Gabon 2018'),

-- Sources Gabon (compléments) : FAO Central Africa FCT · DGS Gabon 2017
--                                CENAME Gabon 2018 · USDA FoodData Central

-- ============================================================
-- SÃO TOMÉ-ET-PRÍNCIPE
-- Sources : FAO / USDA / Ministère de la Santé São Tomé-et-Príncipe
--           Enquête Nutritionnelle UNICEF São Tomé 2014
-- ============================================================

('Calulu de São Tomé', 'São Tomé-et-Príncipe', 'Afrique Centrale', 'Plat principal',
 'Poisson séché et légumes (tomates, aubergines, gombos, feuilles de manioc) en sauce tomate, plat national',
 148, 13.8, 9.5, 6.5, 3.5, 'FAO / Ministère Santé São Tomé / Enquête UNICEF São Tomé 2014'),

('Arroz de Coco São Tomé', 'São Tomé-et-Príncipe', 'Afrique Centrale', 'Accompagnement',
 'Riz cuit dans lait de coco légèrement salé, accompagnement de base de la cuisine santoméenne',
 185, 3.0, 32.2, 5.8, 0.5, 'FAO / USDA Adaptation / Ministère Santé São Tomé'),

('Banana Cozida com Peixe', 'São Tomé-et-Príncipe', 'Afrique Centrale', 'Plat principal',
 'Banane plantain bouillie servie avec poisson frais grillé ou cuit en sauce, repas quotidien des foyers',
 158, 12.5, 22.5, 3.5, 3.0, 'FAO / Ministère Santé São Tomé / Enquête UNICEF São Tomé 2014'),

('Moqueca Santoméense', 'São Tomé-et-Príncipe', 'Afrique Centrale', 'Plat principal',
 'Ragoût de poisson ou fruits de mer au lait de coco, tomates et épices locales, version insulaire africaine',
 172, 14.5, 9.5, 9.2, 1.5, 'FAO / USDA Adaptation / Ministère Santé São Tomé'),

('Feijão Frade São Tomé', 'São Tomé-et-Príncipe', 'Afrique Centrale', 'Plat principal',
 'Haricots à œil noir (niébé) cuits avec huile de coco, ail et épices locales, plat végétarien très consommé',
 125, 8.0, 20.5, 2.5, 7.2, 'FAO / Ministère Santé São Tomé / USDA FoodData Central'),

('Frango Grelhado São Tomé', 'São Tomé-et-Príncipe', 'Afrique Centrale', 'Plat principal',
 'Poulet mariné au citron, ail, piment et épices locales, grillé sur braises, plat populaire en milieu urbain',
 192, 22.5, 2.5, 10.5, 0.2, 'USDA FoodData Central / FAO / Ministère Santé São Tomé');

-- Sources São Tomé-et-Príncipe : FAO Central Africa FCT · Ministère de la Santé São Tomé-et-Príncipe
--                                  Enquête Nutritionnelle UNICEF São Tomé 2014 · USDA FoodData Central


-- ============================================================
-- MEAL COMPONENTS — ANGOLA
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 48 FROM public.meals_master WHERE name = 'Muamba de Galinha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 22 FROM public.meals_master WHERE name = 'Muamba de Galinha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 12 FROM public.meals_master WHERE name = 'Muamba de Galinha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Muamba de Galinha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Muamba de Galinha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Muamba de Galinha';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 90 FROM public.meals_master WHERE name = 'Funje';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Funje';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 30 FROM public.meals_master WHERE name = 'Calulu de Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Calulu de Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 18 FROM public.meals_master WHERE name = 'Calulu de Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine africaine', 12 FROM public.meals_master WHERE name = 'Calulu de Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Calulu de Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 6 FROM public.meals_master WHERE name = 'Calulu de Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Calulu de Peixe';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 52 FROM public.meals_master WHERE name = 'Funge com Feijão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 38 FROM public.meals_master WHERE name = 'Funge com Feijão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Funge com Feijão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 3 FROM public.meals_master WHERE name = 'Funge com Feijão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Funge com Feijão';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 68 FROM public.meals_master WHERE name = 'Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 25 FROM public.meals_master WHERE name = 'Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Pirão';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Pirão';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 45 FROM public.meals_master WHERE name = 'Arroz de Banana Angolano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 35 FROM public.meals_master WHERE name = 'Arroz de Banana Angolano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 10 FROM public.meals_master WHERE name = 'Arroz de Banana Angolano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Arroz de Banana Angolano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Arroz de Banana Angolano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Arroz de Banana Angolano';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 42 FROM public.meals_master WHERE name = 'Mufete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 25 FROM public.meals_master WHERE name = 'Mufete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 18 FROM public.meals_master WHERE name = 'Mufete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Mufete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Mufete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Mufete';

-- ============================================================
-- MEAL COMPONENTS — CAMEROUN (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 42 FROM public.meals_master WHERE name = 'Kondre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 32 FROM public.meals_master WHERE name = 'Kondre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Kondre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Kondre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Kondre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Kondre';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 42 FROM public.meals_master WHERE name = 'Nkui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 22 FROM public.meals_master WHERE name = 'Nkui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Nkui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Nkui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Nkui';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Nkui';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (gritz)', 48 FROM public.meals_master WHERE name = 'Sanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 38 FROM public.meals_master WHERE name = 'Sanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 8 FROM public.meals_master WHERE name = 'Sanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 4 FROM public.meals_master WHERE name = 'Sanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Sanga';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 58 FROM public.meals_master WHERE name = 'Beignets Haricots Cameroun';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 22 FROM public.meals_master WHERE name = 'Beignets Haricots Cameroun';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Beignets Haricots Cameroun';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 6 FROM public.meals_master WHERE name = 'Beignets Haricots Cameroun';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 4 FROM public.meals_master WHERE name = 'Beignets Haricots Cameroun';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 45 FROM public.meals_master WHERE name = 'Okok';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 25 FROM public.meals_master WHERE name = 'Okok';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Okok';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 8 FROM public.meals_master WHERE name = 'Okok';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 4 FROM public.meals_master WHERE name = 'Okok';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 22 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 5 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Riz Sauté Camerounais';

-- ============================================================
-- MEAL COMPONENTS — RÉPUBLIQUE CENTRAFRICAINE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 88 FROM public.meals_master WHERE name = 'Gozo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Gozo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 52 FROM public.meals_master WHERE name = 'Ngouza';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 22 FROM public.meals_master WHERE name = 'Ngouza';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Ngouza';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Ngouza';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Ngouza';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Ngouza';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 38 FROM public.meals_master WHERE name = 'Saka-Madesu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 35 FROM public.meals_master WHERE name = 'Saka-Madesu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Saka-Madesu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Saka-Madesu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Saka-Madesu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Saka-Madesu';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 78 FROM public.meals_master WHERE name = 'Poulet Rôti Centrafricain';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Poulet Rôti Centrafricain';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 6 FROM public.meals_master WHERE name = 'Poulet Rôti Centrafricain';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Poulet Rôti Centrafricain';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Poulet Rôti Centrafricain';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 2 FROM public.meals_master WHERE name = 'Poulet Rôti Centrafricain';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 72 FROM public.meals_master WHERE name = 'Haricots à l''Huile de Palme RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Haricots à l''Huile de Palme RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Haricots à l''Huile de Palme RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Haricots à l''Huile de Palme RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Haricots à l''Huile de Palme RCA';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 38 FROM public.meals_master WHERE name = 'Poisson Fumé en Sauce RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Poisson Fumé en Sauce RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 18 FROM public.meals_master WHERE name = 'Poisson Fumé en Sauce RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 12 FROM public.meals_master WHERE name = 'Poisson Fumé en Sauce RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Poisson Fumé en Sauce RCA';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Poisson Fumé en Sauce RCA';

-- ============================================================
-- MEAL COMPONENTS — TCHAD
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil', 88 FROM public.meals_master WHERE name = 'Boule de Mil Tchadienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Boule de Mil Tchadienne';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 40 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 28 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 10 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Jarret de Bœuf à la Sauce Gombo Tchad';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Alyam Alyam';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 28 FROM public.meals_master WHERE name = 'Alyam Alyam';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Alyam Alyam';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Alyam Alyam';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''arachide', 4 FROM public.meals_master WHERE name = 'Alyam Alyam';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Alyam Alyam';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 55 FROM public.meals_master WHERE name = 'Lalo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 18 FROM public.meals_master WHERE name = 'Lalo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 12 FROM public.meals_master WHERE name = 'Lalo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Lalo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 5 FROM public.meals_master WHERE name = 'Lalo Tchad';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Lalo Tchad';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 88 FROM public.meals_master WHERE name = 'Kisser';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Kisser';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 62 FROM public.meals_master WHERE name = 'Agashe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Agashe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Agashe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 5 FROM public.meals_master WHERE name = 'Agashe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Agashe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Agashe';

-- ============================================================
-- MEAL COMPONENTS — RD CONGO (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 90 FROM public.meals_master WHERE name = 'Chikwanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Chikwanga';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots rouges (secs)', 72 FROM public.meals_master WHERE name = 'Madesu ya Mafuta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Madesu ya Mafuta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Madesu ya Mafuta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Madesu ya Mafuta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Madesu ya Mafuta';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 90 FROM public.meals_master WHERE name = 'Lituma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Lituma';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine africaine', 40 FROM public.meals_master WHERE name = 'Mosaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Mosaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Mosaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Mosaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Mosaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Mosaka';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 65 FROM public.meals_master WHERE name = 'Mbisi ya Kolela';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Mbisi ya Kolela';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Mbisi ya Kolela';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Mbisi ya Kolela';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Mbisi ya Kolela';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 15 FROM public.meals_master WHERE name = 'Bindele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 18 FROM public.meals_master WHERE name = 'Bindele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Bindele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Bindele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Bindele';

-- ============================================================
-- MEAL COMPONENTS — RÉPUBLIQUE DU CONGO
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 58 FROM public.meals_master WHERE name = 'Saka-Saka Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 18 FROM public.meals_master WHERE name = 'Saka-Saka Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 15 FROM public.meals_master WHERE name = 'Saka-Saka Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Saka-Saka Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Saka-Saka Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Saka-Saka Congo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 45 FROM public.meals_master WHERE name = 'Gombo Frais Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 22 FROM public.meals_master WHERE name = 'Gombo Frais Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 15 FROM public.meals_master WHERE name = 'Gombo Frais Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 8 FROM public.meals_master WHERE name = 'Gombo Frais Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Gombo Frais Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Gombo Frais Congo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 90 FROM public.meals_master WHERE name = 'Foufou Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Foufou Congo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 52 FROM public.meals_master WHERE name = 'Poulet Moambe Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 28 FROM public.meals_master WHERE name = 'Poulet Moambe Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Poulet Moambe Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Poulet Moambe Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Poulet Moambe Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Poulet Moambe Congo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc filet (cru)', 58 FROM public.meals_master WHERE name = 'Porc au Piment Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 15 FROM public.meals_master WHERE name = 'Porc au Piment Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Porc au Piment Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Porc au Piment Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Porc au Piment Congo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Porc au Piment Congo';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton / Agneau épaule (cru)', 80 FROM public.meals_master WHERE name = 'Ntaba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 8 FROM public.meals_master WHERE name = 'Ntaba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Ntaba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Ntaba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Ntaba';

-- ============================================================
-- MEAL COMPONENTS — GUINÉE ÉQUATORIALE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 38 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 22 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Sopa de Pescado Ecuatoguineana';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amarante / Épinards africains', 42 FROM public.meals_master WHERE name = 'Eru Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 22 FROM public.meals_master WHERE name = 'Eru Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes séchées', 18 FROM public.meals_master WHERE name = 'Eru Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Eru Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Eru Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Eru Guinée Équatoriale';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 75 FROM public.meals_master WHERE name = 'Pescado a la Plancha Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Pescado a la Plancha Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 6 FROM public.meals_master WHERE name = 'Pescado a la Plancha Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Pescado a la Plancha Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Pescado a la Plancha Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Pescado a la Plancha Ecuatoguineano';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 58 FROM public.meals_master WHERE name = 'Foufou Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 38 FROM public.meals_master WHERE name = 'Foufou Guinée Équatoriale';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Foufou Guinée Équatoriale';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 42 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides / Cacahuètes (crues)', 22 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 3 FROM public.meals_master WHERE name = 'Pollo en Salsa de Cacahuete';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 50 FROM public.meals_master WHERE name = 'Arroz con Pollo Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 28 FROM public.meals_master WHERE name = 'Arroz con Pollo Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Arroz con Pollo Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Arroz con Pollo Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Arroz con Pollo Ecuatoguineano';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Arroz con Pollo Ecuatoguineano';

-- ============================================================
-- MEAL COMPONENTS — GABON (compléments)
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 88 FROM public.meals_master WHERE name = 'Atanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Atanga';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 65 FROM public.meals_master WHERE name = 'Nzang Meyong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Nzang Meyong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Nzang Meyong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 6 FROM public.meals_master WHERE name = 'Nzang Meyong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Nzang Meyong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Nzang Meyong';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de manioc (sèche)', 90 FROM public.meals_master WHERE name = 'Mbourou-Mbourou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Mbourou-Mbourou';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 80 FROM public.meals_master WHERE name = 'Viande de Brousse Braisée Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Viande de Brousse Braisée Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Viande de Brousse Braisée Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 4 FROM public.meals_master WHERE name = 'Viande de Brousse Braisée Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Viande de Brousse Braisée Gabon';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain vert (cru)', 88 FROM public.meals_master WHERE name = 'Pilé de Plantain Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Pilé de Plantain Gabon';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 48 FROM public.meals_master WHERE name = 'Poulet au Nyembwe Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 28 FROM public.meals_master WHERE name = 'Poulet au Nyembwe Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Poulet au Nyembwe Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Poulet au Nyembwe Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 5 FROM public.meals_master WHERE name = 'Poulet au Nyembwe Gabon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Poulet au Nyembwe Gabon';

-- ============================================================
-- MEAL COMPONENTS — SÃO TOMÉ-ET-PRÍNCIPE
-- ============================================================

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson fumé / Kong (générique)', 28 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine africaine', 15 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 12 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de manioc / isombé (fraîches)', 10 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 5 FROM public.meals_master WHERE name = 'Calulu de São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Calulu de São Tomé';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 62 FROM public.meals_master WHERE name = 'Arroz de Coco São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 32 FROM public.meals_master WHERE name = 'Arroz de Coco São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Arroz de Coco São Tomé';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Plantain mûr (cru)', 45 FROM public.meals_master WHERE name = 'Banana Cozida com Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 42 FROM public.meals_master WHERE name = 'Banana Cozida com Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Banana Cozida com Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Banana Cozida com Peixe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 3 FROM public.meals_master WHERE name = 'Banana Cozida com Peixe';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tilapia (cru)', 42 FROM public.meals_master WHERE name = 'Moqueca Santoméense';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 28 FROM public.meals_master WHERE name = 'Moqueca Santoméense';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 14 FROM public.meals_master WHERE name = 'Moqueca Santoméense';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Moqueca Santoméense';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Moqueca Santoméense';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 2 FROM public.meals_master WHERE name = 'Moqueca Santoméense';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de palme rouge', 2 FROM public.meals_master WHERE name = 'Moqueca Santoméense';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Niébé / Cowpea (sec)', 72 FROM public.meals_master WHERE name = 'Feijão Frade São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (liquide)', 15 FROM public.meals_master WHERE name = 'Feijão Frade São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Feijão Frade São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Feijão Frade São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Feijão Frade São Tomé';

INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (avec peau, cru)', 78 FROM public.meals_master WHERE name = 'Frango Grelhado São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron', 8 FROM public.meals_master WHERE name = 'Frango Grelhado São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Frango Grelhado São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais rouge', 4 FROM public.meals_master WHERE name = 'Frango Grelhado São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel (chlorure de sodium)', 2 FROM public.meals_master WHERE name = 'Frango Grelhado São Tomé';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Frango Grelhado São Tomé';

-- ============================================================
-- AfriCalo — Base Nutritionnelle Africaine — PHASE 3 EXTENSION
-- AFRIQUE DU NORD : Algérie, Égypte, Libye, Maroc, Soudan, Tunisie
-- COMPOSANTS COMPLETS POUR TOUS LES PLATS — PARTIE 1/2
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : FAO · USDA FoodData Central · CIQUAL · Publications académiques
-- ============================================================


-- ============================================================
-- ALGÉRIE — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
('Chorba Frik', 'Algérie', 'Afrique du Nord', 'Soupe',
 'Soupe traditionnelle algérienne au blé vert concassé (frik), tomates, agneau et coriandre, incontournable du Ramadan',
 88, 5.8, 12.5, 1.8, 2.5, 'FAO / Tables composition Maghreb / Étude CIQUAL adaptation Algérie'),
('Chakhchoukha', 'Algérie', 'Afrique du Nord', 'Plat principal',
 'Galettes de blé dur émiettées (rougag) nappées d''un ragoût d''agneau et pois chiches en sauce rouge épicée',
 195, 9.5, 26.5, 5.8, 2.8, 'FAO Maghreb / CIQUAL / Étude nutritionnelle INS Algérie 2018'),
('Rechta', 'Algérie', 'Afrique du Nord', 'Plat principal',
 'Pâtes fines de blé dur maison (rechta) avec poulet, navets et sauce blanche au smen et cannelle',
 178, 10.2, 24.8, 4.5, 1.5, 'CIQUAL / Tables composition Algérie / FAO North Africa FCT'),
('Berkoukes', 'Algérie', 'Afrique du Nord', 'Plat principal',
 'Grosses billes de pâte de semoule cuite dans bouillon de viande avec légumes de saison et pois chiches',
 168, 7.8, 26.2, 3.8, 3.0, 'FAO Maghreb / CIQUAL / Analyse nutritionnelle Algérie'),
('Couscous Bidawi', 'Algérie', 'Afrique du Nord', 'Plat principal',
 'Couscous de semoule fine d''Alger avec poulet, légumes (courgette, navet, carotte) et bouillon parfumé au safran',
 172, 9.0, 24.2, 4.8, 2.8, 'CIQUAL / FAO North Africa FCT / Tables composition Algérie'),
('Zitouna / Rfiss Tmar', 'Algérie', 'Afrique du Nord', 'Petit-déjeuner / Dessert',
 'Galette de semoule émiettée avec dattes, huile d''argan ou beurre clarifié (smen) et miel',
 385, 5.2, 55.5, 16.5, 4.5, 'CIQUAL / USDA FoodData Central adaptation / FAO'),
('Garantita', 'Algérie', 'Afrique du Nord', 'Snack / Plat principal',
 'Tarte épaisse de farine de pois chiches cuite au four, dorée à l''huile, assaisonnée de cumin et harissa',
 178, 7.5, 20.5, 7.5, 3.2, 'CIQUAL / Tables composition Algérie / FAO Legumes FCT');

-- Sources Algérie : FAO North Africa FCT · CIQUAL 2020 · INSP Algérie · ONSA 2018


-- ============================================================
-- ÉGYPTE — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
('Mahshi Kousa', 'Égypte', 'Afrique du Nord', 'Plat principal',
 'Courgettes farcies de riz, viande hachée, herbes et épices, cuites dans sauce tomate',
 105, 5.5, 13.5, 3.2, 1.8, 'USDA FoodData Central / Tables composition Égypte NIN'),
('Hawawshi', 'Égypte', 'Afrique du Nord', 'Plat principal',
 'Pain de semoule croustillant farci de viande hachée épicée aux oignons, poivrons et persil, cuit au four',
 265, 13.5, 25.5, 12.0, 1.5, 'USDA FoodData Central / NIN Egypt / FAO North Africa'),
('Om Ali', 'Égypte', 'Afrique du Nord', 'Dessert',
 'Dessert égyptien traditionnel : couches de pain feuilleté ou pâte phyllo, lait chaud, noix, raisins secs et sucre',
 285, 6.5, 38.5, 12.5, 1.0, 'USDA FoodData Central / Tables composition Égypte'),
('Fattah', 'Égypte', 'Afrique du Nord', 'Plat principal',
 'Riz sur pain grillé imbibé de bouillon d''agneau, nappé de sauce tomate à l''ail et vinaigre',
 188, 9.5, 28.5, 4.5, 1.2, 'USDA / NIN Egypt / FAO North Africa FCT'),
('Foul Nabet', 'Égypte', 'Afrique du Nord', 'Petit-déjeuner / Plat',
 'Fèves germées ou fèves fraîches sautées à l''ail, huile d''olive et citron, version printanière du ful',
 118, 7.8, 16.5, 3.0, 6.8, 'USDA FoodData Central / NIN Egypt'),
('Koshari Égypte', 'Égypte', 'Afrique du Nord', 'Plat principal',
 'Mélange de riz, lentilles brunes, macaroni, sauce tomate pimentée et oignons croustillants frits',
 182, 7.2, 33.0, 3.5, 4.2, 'USDA FoodData Central / NIN Egypt / FAO North Africa'),
('Bamya bil Lahma', 'Égypte', 'Afrique du Nord', 'Plat principal',
 'Ragoût de gombo aux tomates et viande d''agneau ou bœuf, servi avec riz blanc',
 112, 7.5, 10.5, 4.5, 3.5, 'USDA FoodData Central / NIN Egypt / FAO');

-- Sources Égypte : USDA FoodData Central 2023 · NIN Egypt · FAO North Africa FCT · MOH Egypt 2019


-- ============================================================
-- LIBYE — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
('Bazeen', 'Libye', 'Afrique du Nord', 'Plat principal',
 'Boule ferme de farine d''orge ou blé dur cuite à l''eau, servie avec ragoût d''agneau, œufs et harissa',
 188, 7.5, 32.5, 3.8, 3.2, 'FAO North Africa FCT / USDA adaptation / Étude nutritionnelle Libye'),
('Asida Libiya', 'Libye', 'Afrique du Nord', 'Plat principal / Petit-déjeuner',
 'Bouillie épaisse de semoule ou farine de blé, servie avec miel, beurre clarifié (smen) ou ragoût de viande',
 182, 4.5, 34.5, 4.5, 1.5, 'FAO North Africa FCT / USDA / Analyse nutritionnelle régionale Libye'),
('Sharba Libiya', 'Libye', 'Afrique du Nord', 'Soupe',
 'Soupe épaisse aux tomates, agneau, orzo (pâtes), herbes et épices locales, soupe nationale libyenne',
 92, 5.8, 12.8, 2.2, 1.8, 'FAO North Africa FCT / USDA adaptation / Études régionales'),
('Couscous Libyen au Mouton', 'Libye', 'Afrique du Nord', 'Plat principal',
 'Couscous de semoule moyenne avec mouton, légumes (courgette, carotte, pomme de terre) et bouillon épicé',
 175, 9.2, 24.5, 5.0, 2.5, 'FAO North Africa FCT / CIQUAL adaptation / USDA'),
('Imbakbaka', 'Libye', 'Afrique du Nord', 'Plat principal',
 'Pâtes courtes ou orzo cuits dans sauce tomate épicée avec agneau, piment et épices libyennes',
 178, 8.5, 26.5, 4.2, 2.0, 'FAO North Africa FCT / USDA / Analyse nutritionnelle régionale'),
('Magrood', 'Libye', 'Afrique du Nord', 'Dessert / Snack',
 'Gâteaux frits de semoule farcis aux dattes ou figues, trempés dans miel ou sirop',
 368, 4.8, 58.5, 13.5, 3.2, 'FAO / USDA FoodData Central / Tables composition Maghreb'),
('Usban', 'Libye', 'Afrique du Nord', 'Plat principal',
 'Saucisse farcie de riz, viande hachée, herbes et épices, cuite à la vapeur puis mijotée en sauce tomate',
 215, 10.5, 16.5, 11.5, 1.2, 'FAO North Africa FCT / USDA adaptation / Analyse régionale');

-- Sources Libye : FAO North Africa FCT · USDA FoodData Central adaptation · WHO/FAO Libya · CIQUAL Maghreb


-- ============================================================
-- MAROC — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
('Pastilla au Poulet', 'Maroc', 'Afrique du Nord', 'Entrée / Plat',
 'Feuilleté de feuilles de briouate au poulet effiloché, amandes grillées, œufs et cannelle, sucré-salé',
 268, 11.5, 20.5, 15.5, 1.2, 'CIQUAL / Tables composition Maroc ONSSA / FAO North Africa'),
('Tanjia Marrakchia', 'Maroc', 'Afrique du Nord', 'Plat principal',
 'Viande d''agneau ou bœuf confite très lentement dans jarre en terre avec citrons confits, ras el hanout et smen',
 245, 21.5, 2.5, 17.0, 0.2, 'CIQUAL / USDA / Tables composition Maroc ONSSA'),
('Harira Marocaine', 'Maroc', 'Afrique du Nord', 'Soupe',
 'Soupe nationale marocaine : tomates, lentilles, pois chiches, vermicelles, coriandre et gingembre',
 92, 5.2, 15.5, 1.5, 4.2, 'CIQUAL / FAO North Africa FCT / Tables composition Maroc'),
('Msemen', 'Maroc', 'Afrique du Nord', 'Petit-déjeuner / Snack',
 'Crêpe feuilletée de semoule et farine de blé, laminée au beurre et huile, cuite à la poêle',
 312, 7.5, 42.5, 12.5, 1.5, 'CIQUAL / USDA FoodData Central / Tables Maroc ONSSA'),
('Rfissa', 'Maroc', 'Afrique du Nord', 'Plat principal',
 'Galettes de msemen émiettées nappées de poulet mijoté aux lentilles, fenugrec et ras el hanout',
 198, 12.5, 22.5, 7.0, 3.5, 'CIQUAL / FAO North Africa / Tables composition Maroc'),
('Briouate Viande', 'Maroc', 'Afrique du Nord', 'Entrée / Snack',
 'Triangles de feuilles de briouate frits fourrés à la viande hachée épicée aux herbes et épices marocaines',
 285, 10.5, 22.5, 17.0, 0.8, 'CIQUAL / USDA FoodData Central adaptation / Tables Maroc'),
('Couscous aux Sept Légumes', 'Maroc', 'Afrique du Nord', 'Plat principal',
 'Couscous de semoule fine cuit à la vapeur avec agneau et 7 légumes traditionnels (courgette, navet, carotte, etc.)',
 172, 9.5, 24.0, 4.5, 3.2, 'CIQUAL / FAO North Africa FCT / ONSSA Maroc'),
('Zaalouk', 'Maroc', 'Afrique du Nord', 'Entrée / Accompagnement',
 'Salade cuite d''aubergines et tomates à l''ail, cumin, paprika et huile d''olive, servie froide',
 78, 2.0, 9.5, 4.0, 3.5, 'CIQUAL / USDA FoodData Central / Tables composition Maroc');

-- Sources Maroc : CIQUAL 2020 · ONSSA Maroc · FAO North Africa FCT · USDA 2023 · INNA Maroc


-- ============================================================
-- SOUDAN — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
('Ful Sudani', 'Soudan', 'Afrique du Nord', 'Petit-déjeuner / Plat',
 'Fèves mijotées avec huile de sésame (tahini), oignons, tomates et épices soudanaises, petit-déjeuner national',
 138, 8.5, 18.5, 3.8, 7.2, 'FAO East/North Africa FCT / USDA / Sudan FCDB 2012'),
('Kisra', 'Soudan', 'Afrique du Nord', 'Accompagnement',
 'Pain plat fermenté de farine de sorgho cuit sur plaque chaude, base alimentaire soudanaise',
 148, 5.2, 30.5, 1.2, 3.5, 'FAO East Africa FCT / USDA / Sudan FCDB 2012'),
('Mullah Dakwa', 'Soudan', 'Afrique du Nord', 'Plat principal',
 'Ragoût de viande d''agneau ou bœuf avec légumineuses (lentilles, niébé) et épices locales, servi avec kisra',
 162, 11.5, 14.5, 6.5, 3.8, 'FAO East/North Africa FCT / Sudan FCDB / USDA adaptation'),
('Asida Sudaniya', 'Soudan', 'Afrique du Nord', 'Plat principal',
 'Boule épaisse de semoule de sorgho ou mil cuite à l''eau, servie avec sauce viande ou ragoût de gombo',
 145, 3.8, 30.5, 1.5, 3.2, 'FAO East Africa FCT / Sudan FCDB 2012 / USDA'),
('Shaiyah', 'Soudan', 'Afrique du Nord', 'Plat principal',
 'Brochettes de viande de mouton marinée aux épices et grillée, plat de rue et célébration au Soudan',
 218, 22.5, 1.5, 13.5, 0.0, 'USDA FoodData Central / FAO / Sudan FCDB adaptation'),
('Tamiya Sudaniya', 'Soudan', 'Afrique du Nord', 'Snack / Petit-déjeuner',
 'Falafel soudanais de fèves ou pois chiches épicés aux herbes, frits, servi dans pain ou avec salade',
 228, 9.5, 22.5, 12.0, 5.0, 'USDA FoodData Central / FAO / Sudan FCDB 2012'),
('Gorasa bel Dama', 'Soudan', 'Afrique du Nord', 'Plat principal',
 'Galette de blé épaisse (gorasa) imbibée de ragoût de viande et tomates épicées, plat familial du Soudan',
 178, 9.2, 24.5, 5.0, 2.2, 'FAO East/North Africa FCT / Sudan FCDB / USDA adaptation');

-- Sources Soudan : Sudan FCDB 2012 · FAO East Africa FCT · USDA 2023 · WHO/EMRO Sudan · Univ. Khartoum Nutrition


-- ============================================================
-- TUNISIE — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES
('Ojja Merguez', 'Tunisie', 'Afrique du Nord', 'Plat principal',
 'Œufs brouillés en sauce tomate épicée avec merguez, poivrons et harissa, plat du dimanche tunisien',
 165, 9.5, 7.5, 11.0, 1.8, 'CIQUAL / Tables composition Tunisie INNTA / FAO Maghreb'),
('Couscous au Poisson Sfaxien', 'Tunisie', 'Afrique du Nord', 'Plat principal',
 'Couscous de semoule avec poisson (mérou ou rouget), légumes et bouillon harissa, spécialité de Sfax',
 162, 10.5, 22.5, 3.5, 2.5, 'CIQUAL / INNTA Tunisie / FAO North Africa FCT'),
('Marqa Tunisienne', 'Tunisie', 'Afrique du Nord', 'Plat principal',
 'Ragoût mijoté d''agneau aux légumes de saison, pois chiches, épices et harissa, servi avec pain',
 155, 10.2, 14.5, 6.5, 3.0, 'CIQUAL / INNTA Tunisie / FAO Maghreb'),
('Fricassé Tunisien', 'Tunisie', 'Afrique du Nord', 'Snack / Entrée',
 'Petit pain frit garni de thon, câpres, olives, harissa, pomme de terre et œuf dur, street food tunisien',
 248, 9.5, 24.5, 13.0, 1.5, 'CIQUAL / INNTA Tunisie / USDA adaptation'),
('Bambalouni', 'Tunisie', 'Afrique du Nord', 'Snack / Dessert',
 'Beignet annulaire frit de pâte levée, saupoudré de sucre, street food côtier tunisien',
 358, 6.5, 55.5, 13.0, 1.2, 'CIQUAL / USDA FoodData Central / INNTA Tunisie'),
('Kafteji', 'Tunisie', 'Afrique du Nord', 'Plat principal',
 'Mélange de légumes frits (poivron, courgette, pomme de terre, piment) et œufs brouillés, plat populaire',
 172, 6.5, 16.5, 9.5, 3.2, 'CIQUAL / INNTA Tunisie / USDA adaptation'),
('Assida Zgougou', 'Tunisie', 'Afrique du Nord', 'Dessert',
 'Crème dessert traditionnelle aux graines de pin maritime (zgougou) avec rose water, crème fraîche et pistaches',
 218, 3.5, 28.5, 10.5, 1.5, 'CIQUAL / INNTA Tunisie / USDA FoodData Central');

-- Sources Tunisie : CIQUAL 2020 · INNTA Tunisie · FAO North Africa FCT · USDA 2023 · ONAGRI Tunisie


-- ============================================================
-- MEAL COMPONENTS — ALGÉRIE (TOUS LES PLATS)
-- ============================================================

-- Chorba Frik
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Blé vert concassé (frik)', 20 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 25 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 8 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Céleri', 4 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 3 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Chorba Frik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Chorba Frik';

-- Chakhchoukha
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Galette rougag (semoule de blé dur)', 30 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 28 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 12 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 4 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Chakhchoukha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 1 FROM public.meals_master WHERE name = 'Chakhchoukha';

-- Rechta
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâtes rechta (farine blé dur)', 32 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 30 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Navet blanc', 12 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 8 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Smen (beurre clarifié)', 5 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Rechta';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 1 FROM public.meals_master WHERE name = 'Rechta';

-- Berkoukes
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Berkoukes (billes semoule blé dur)', 28 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 22 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 10 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette', 8 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Navet blanc', 6 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 4 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Berkoukes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Berkoukes';

-- Couscous Bidawi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule fine de blé dur', 30 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 28 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette', 8 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 8 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Navet blanc', 6 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 6 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (pour enrober semoule)', 2 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran', 1 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Couscous Bidawi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Couscous Bidawi';

-- Zitouna / Rfiss Tmar
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule moyenne de blé dur', 38 FROM public.meals_master WHERE name = 'Zitouna / Rfiss Tmar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Dattes dénoyautées', 28 FROM public.meals_master WHERE name = 'Zitouna / Rfiss Tmar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre clarifié (smen)', 15 FROM public.meals_master WHERE name = 'Zitouna / Rfiss Tmar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Miel', 10 FROM public.meals_master WHERE name = 'Zitouna / Rfiss Tmar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''argan', 5 FROM public.meals_master WHERE name = 'Zitouna / Rfiss Tmar';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amandes grillées', 4 FROM public.meals_master WHERE name = 'Zitouna / Rfiss Tmar';

-- Garantita
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de pois chiches', 45 FROM public.meals_master WHERE name = 'Garantita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 30 FROM public.meals_master WHERE name = 'Garantita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 12 FROM public.meals_master WHERE name = 'Garantita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 8 FROM public.meals_master WHERE name = 'Garantita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Garantita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 2 FROM public.meals_master WHERE name = 'Garantita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Garantita';


-- ============================================================
-- MEAL COMPONENTS — ÉGYPTE (TOUS LES PLATS)
-- ============================================================

-- Mahshi Kousa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette (crue)', 40 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 15 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché maigre (cru)', 15 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Mahshi Kousa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Mahshi Kousa';

-- Hawawshi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé dur (pain)', 28 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché maigre (cru)', 35 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron vert', 8 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 4 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment vert frais', 3 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 2 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 1 FROM public.meals_master WHERE name = 'Hawawshi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Hawawshi';

-- Om Ali
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte feuilletée (cuite)', 22 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 30 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche épaisse', 10 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 10 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de coco râpée', 6 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de cajou', 6 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Raisins secs', 6 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pistaches', 4 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amandes effilées', 4 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau de rose', 1 FROM public.meals_master WHERE name = 'Om Ali';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Om Ali';

-- Fattah
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 25 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain baladi (grillé)', 15 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 28 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre blanc', 3 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Fattah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Fattah';

-- Foul Nabet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves fraîches ou germées', 60 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 8 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 5 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 2 FROM public.meals_master WHERE name = 'Foul Nabet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Foul Nabet';

-- Koshari Égypte
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 22 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles brunes (crues)', 15 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Macaroni (cru)', 15 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 6 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre blanc', 3 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 1 FROM public.meals_master WHERE name = 'Koshari Égypte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Koshari Égypte';

-- Bamya bil Lahma
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais (cru)', 30 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 28 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 2 FROM public.meals_master WHERE name = 'Bamya bil Lahma';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Bamya bil Lahma';


-- ============================================================
-- MEAL COMPONENTS — LIBYE (TOUS LES PLATS)
-- ============================================================

-- Bazeen
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine d''orge', 35 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 30 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 8 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 3 FROM public.meals_master WHERE name = 'Bazeen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Bazeen';

-- Asida Libiya
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule de blé dur', 45 FROM public.meals_master WHERE name = 'Asida Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 35 FROM public.meals_master WHERE name = 'Asida Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre clarifié (smen)', 8 FROM public.meals_master WHERE name = 'Asida Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Miel', 8 FROM public.meals_master WHERE name = 'Asida Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Asida Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Asida Libiya';

-- Sharba Libiya
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 22 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 22 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Orzo (pâtes crues)', 15 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 8 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 6 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Menthe fraîche', 3 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 3 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Sharba Libiya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Sharba Libiya';

-- Couscous Libyen au Mouton
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule moyenne de blé dur', 30 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton (épaule, cru)', 28 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette', 8 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 6 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre', 6 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Navet blanc', 5 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 5 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 3 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'Couscous Libyen au Mouton';

-- Imbakbaka
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâtes courtes / orzo (crues)', 28 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 25 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 6 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 5 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 3 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Imbakbaka';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Imbakbaka';

-- Magrood
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule fine de blé dur', 38 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Dattes dénoyautées (farce)', 22 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 14 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Miel', 10 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre clarifié (smen)', 8 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau de fleur d''oranger', 3 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Graines de sésame', 1 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure chimique', 1 FROM public.meals_master WHERE name = 'Magrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Magrood';

-- Usban
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Boyaux de mouton (boyau naturel)', 10 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc (cru)', 22 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché maigre (cru)', 20 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 5 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 4 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 5 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 2 FROM public.meals_master WHERE name = 'Usban';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Usban';


-- ============================================================
-- MEAL COMPONENTS — MAROC (TOUS LES PLATS)
-- ============================================================

-- Pastilla au Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de briouate (pâte phyllo)', 18 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse sans peau, cru)', 30 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amandes grillées concassées', 12 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 10 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (pour laminer)', 8 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre glace', 4 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 2 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran', 1 FROM public.meals_master WHERE name = 'Pastilla au Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre moulu', 1 FROM public.meals_master WHERE name = 'Pastilla au Poulet';

-- Tanjia Marrakchia
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau (épaule avec os, cru)', 65 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citrons confits', 8 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Smen (beurre clarifié)', 8 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''argan', 5 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 2 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran', 1 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre moulu', 1 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma', 1 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Tanjia Marrakchia';

-- Harira Marocaine
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 22 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles vertes (crues)', 12 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 12 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru, optionnel)', 8 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Céleri', 6 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vermicelle (cru)', 5 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 4 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 4 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine blanche (liant)', 3 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 2 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 2 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma', 1 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Harira Marocaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Harira Marocaine';

-- Msemen
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 40 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule fine de blé dur', 15 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède', 28 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (pour laminer)', 8 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 2 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre', 1 FROM public.meals_master WHERE name = 'Msemen';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Msemen';

-- Rfissa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Msemen émietté', 22 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet entier (cru)', 32 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles vertes (crues)', 12 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 6 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fenugrec (graines)', 3 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 3 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre clarifié (smen)', 2 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 2 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran', 1 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre moulu', 1 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma', 1 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Rfissa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Rfissa';

-- Briouate Viande
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de briouate (pâte phyllo)', 25 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché maigre (cru)', 30 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 5 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 3 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jaune d''œuf (dorure)', 2 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Briouate Viande';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Briouate Viande';

-- Couscous aux Sept Légumes
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule fine de blé dur', 28 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 22 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette', 7 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Navet blanc', 5 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 5 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Potiron (courge)', 5 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chou blanc', 4 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 4 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 5 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Raisins secs', 2 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (pour enrober semoule)', 2 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ras el hanout', 1 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran', 1 FROM public.meals_master WHERE name = 'Couscous aux Sept Légumes';

-- Zaalouk
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine (crue)', 45 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 28 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 10 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 4 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 1 FROM public.meals_master WHERE name = 'Zaalouk';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 2 FROM public.meals_master WHERE name = 'Zaalouk';


-- ============================================================
-- MEAL COMPONENTS — SOUDAN (TOUS LES PLATS)
-- ============================================================

-- Ful Sudani
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves cuites', 60 FROM public.meals_master WHERE name = 'Ful Sudani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tahini (pâte sésame)', 10 FROM public.meals_master WHERE name = 'Ful Sudani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Ful Sudani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Ful Sudani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 5 FROM public.meals_master WHERE name = 'Ful Sudani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 4 FROM public.meals_master WHERE name = 'Ful Sudani';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Ful Sudani';

-- Kisra
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 55 FROM public.meals_master WHERE name = 'Kisra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 40 FROM public.meals_master WHERE name = 'Kisra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levain naturel (fermentation)', 4 FROM public.meals_master WHERE name = 'Kisra';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Kisra';

-- Mullah Dakwa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 30 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles vertes (crues)', 18 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 6 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 3 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 2 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Mullah Dakwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 1 FROM public.meals_master WHERE name = 'Mullah Dakwa';

-- Asida Sudaniya
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 42 FROM public.meals_master WHERE name = 'Asida Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 50 FROM public.meals_master WHERE name = 'Asida Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre clarifié (smen)', 5 FROM public.meals_master WHERE name = 'Asida Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 1 FROM public.meals_master WHERE name = 'Asida Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Asida Sudaniya';

-- Shaiyah
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mouton (épaule, cru)', 70 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 4 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 2 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 1 FROM public.meals_master WHERE name = 'Shaiyah';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 1 FROM public.meals_master WHERE name = 'Shaiyah';

-- Tamiya Sudaniya
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves séchées (crues, trempées)', 45 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 6 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 5 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 3 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 2 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 2 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Graines de sésame', 1 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude', 1 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Tamiya Sudaniya';

-- Gorasa bel Dama
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 25 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 28 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 5 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 2 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 1 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède (pâte)', 3 FROM public.meals_master WHERE name = 'Gorasa bel Dama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Gorasa bel Dama';


-- ============================================================
-- MEAL COMPONENTS — TUNISIE (TOUS LES PLATS)
-- ============================================================

-- Ojja Merguez
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 30 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 25 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Merguez (crue)', 20 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 10 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 4 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'Ojja Merguez';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Ojja Merguez';

-- Couscous au Poisson Sfaxien
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Semoule fine de blé dur', 28 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mérou ou rouget (cru)', 28 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre', 8 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette', 5 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 4 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 3 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (pour enrober semoule)', 1 FROM public.meals_master WHERE name = 'Couscous au Poisson Sfaxien';

-- Marqa Tunisienne
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau maigre (cru)', 30 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 15 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre', 12 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 5 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 5 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 4 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 2 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 1 FROM public.meals_master WHERE name = 'Marqa Tunisienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Marqa Tunisienne';

-- Fricassé Tunisien
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pain (frite)', 25 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 12 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thon en conserve (égoutté)', 18 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre cuite', 15 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf dur', 8 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Olives noires', 6 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 5 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Câpres', 4 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 3 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive (assaisonnement)', 3 FROM public.meals_master WHERE name = 'Fricassé Tunisien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Fricassé Tunisien';

-- Bambalouni
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 38 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède', 18 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 22 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc (garniture)', 12 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 4 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre (pâte)', 3 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (pâte)', 2 FROM public.meals_master WHERE name = 'Bambalouni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Bambalouni';

-- Kafteji
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 25 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 15 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette (crue)', 15 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 12 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 12 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron vert', 10 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment vert frais', 5 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Harissa', 2 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 1 FROM public.meals_master WHERE name = 'Kafteji';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Kafteji';

-- Assida Zgougou
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Graines de pin maritime (zgougou)', 22 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 28 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche épaisse', 15 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 15 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amidon de maïs (Maïzena)', 8 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pistaches concassées', 5 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pignons de pin', 3 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau de rose', 2 FROM public.meals_master WHERE name = 'Assida Zgougou';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau de fleur d''oranger', 2 FROM public.meals_master WHERE name = 'Assida Zgougou';

-- ============================================================
-- AfriCalo — PHASE 3 EXTENSION — AFRIQUE AUSTRALE
-- PARTIE 1/2 : meals_master INSERT + composants Afrique du Sud, Botswana, Eswatini, Lesotho, Mozambique
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- ============================================================

-- ============================================================
-- AFRIQUE DU SUD — MEALS ADDITIONNELS
-- NOTE : Bobotie, Pap & Chakalaka, Umngqusho, Braai Lamb Chops, Biltong, Boerewors déjà présents
-- Ajout de plats complémentaires non encore couverts
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Potjiekos', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Ragoût cuit lentement dans marmite en fonte (potjie) avec agneau, légumes racines et épices',
 182, 14.2, 12.5, 8.5, 2.8, 'South Africa NFCS 2013 / USDA FoodData Central adaptation'),

('Bredie de Tomate', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Ragoût d''agneau Cape Malay aux tomates fraîches et épices, cuit longuement à l''étouffée',
 195, 16.5, 8.5, 11.2, 2.0, 'South Africa NFCS 2013 / Cape Malay culinary documentation'),

('Melkkos', 'Afrique du Sud', 'Afrique Australe', 'Petit-déjeuner / Dessert',
 'Bouillie de farine dans lait bouillant avec beurre et cannelle, plat réconfort afrikaner',
 165, 5.5, 24.5, 5.5, 0.5, 'South Africa NFCS 2013 / USDA adaptation'),

('Koesisters', 'Afrique du Sud', 'Afrique Australe', 'Dessert / Snack',
 'Beignets tressés frits trempés dans sirop épicé à la cannelle et gingembre, tradition Cap Malaise',
 368, 4.5, 58.5, 13.5, 0.8, 'USDA FoodData Central / South Africa NFCS 2013'),

('Pap en Vleis', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Pap (polenta maïs cuite ferme) avec viande de bœuf en sauce tomate oignons, plat ouvrier quotidien',
 155, 9.8, 20.5, 4.5, 2.5, 'South Africa NFCS 2013 / FAO Southern Africa FCT'),

('Umleqwa', 'Afrique du Sud', 'Afrique Australe', 'Plat principal',
 'Poulet de village (umleqwa) mijoté lentement avec légumes et épices, cuisson traditionnelle Nguni',
 172, 18.5, 4.5, 9.0, 0.8, 'South Africa NFCS 2013 / USDA FoodData Central'),

('Milk Tart / Melktert', 'Afrique du Sud', 'Afrique Australe', 'Dessert',
 'Tarte au lait aromatisée à la cannelle, appareil crémeux sur fond sablé, dessert national afrikaner',
 242, 5.5, 30.5, 11.5, 0.5, 'South Africa NFCS 2013 / USDA adaptation');

-- Sources Afrique du Sud : South Africa National Food Consumption Survey (NFCS) 2013 ·
-- USDA FoodData Central 2023 · FAO Southern Africa Food Composition Tables ·
-- MRC South Africa Nutritional Studies · Cape Malay Culinary Documentation


-- ============================================================
-- BOTSWANA — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Seswaa', 'Botswana', 'Afrique Australe', 'Plat principal',
 'Plat national du Botswana : bœuf ou chèvre bouilli longuement puis pilé grossièrement avec sel, servi avec bogobe',
 185, 22.5, 0.0, 10.5, 0.0, 'Botswana Institute for Food Research / FAO Southern Africa FCT'),

('Bogobe jwa Lerotse', 'Botswana', 'Afrique Australe', 'Plat principal',
 'Bouillie de sorgho cuite avec courge (lerotse), plat traditionnel de subsistance du Botswana',
 118, 3.2, 24.5, 1.2, 3.5, 'Botswana Institute for Food Research / FAO East/Southern Africa FCT'),

('Bogobe jwa Mosokwane', 'Botswana', 'Afrique Australe', 'Accompagnement',
 'Bouillie épaisse de sorgho fermenté (ting) cuite ferme, accompagnement des ragoûts de viande',
 105, 3.0, 22.0, 0.8, 3.2, 'Botswana Institute for Food Research / FAO Southern Africa FCT'),

('Morogo wa Thepe', 'Botswana', 'Afrique Australe', 'Plat / Accompagnement',
 'Feuilles sauvages (morogo) blanchies sautées à l''oignon et sel, légume-feuille traditionnel du Botswana',
 52, 3.8, 6.5, 1.2, 3.8, 'FAO Southern Africa FCT / University of Botswana Nutrition Dept'),

('Dikgobe', 'Botswana', 'Afrique Australe', 'Plat principal',
 'Mélange de maïs concassé et haricots borlotti cuits ensemble en pot, plat de subsistance commun',
 148, 7.2, 27.5, 1.5, 6.5, 'Botswana Institute for Food Research / FAO Southern Africa FCT'),

('Mophane Worms / Phane', 'Botswana', 'Afrique Australe', 'Plat / Snack protéiné',
 'Chenilles de papillon empereur (Gonimbrasia belina) séchées ou sautées, source protéique traditionnelle',
 352, 48.5, 15.5, 10.5, 3.5, 'FAO Edible Insects report 2013 / University of Pretoria entomology FCT');

-- Sources Botswana : Botswana Institute for Technology Research and Innovation (BITRI) ·
-- FAO Southern Africa Food Composition Tables · University of Botswana Nutrition Dept ·
-- FAO Edible Insects Food and Feed Security Report 2013


-- ============================================================
-- ESWATINI (ex-Swaziland) — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Sitfubi / Umcweba', 'Eswatini', 'Afrique Australe', 'Plat / Snack',
 'Viande de bœuf séchée traditionnelle du Swaziland, épicée et fumée, équivalent local du biltong',
 258, 40.5, 2.0, 9.5, 0.0, 'FAO Southern Africa FCT / Eswatini Ministry of Agriculture'),

('Sishwala', 'Eswatini', 'Afrique Australe', 'Accompagnement',
 'Bouillie épaisse de maïs pilé (sishwala), base glucidique de l''alimentation swazi quotidienne',
 108, 2.5, 23.5, 0.8, 2.2, 'FAO Southern Africa FCT / USDA adaptation / Eswatini MoH'),

('Emasi Emabele', 'Eswatini', 'Afrique Australe', 'Plat principal',
 'Bouillie de sorgho fermenté cuit avec lait caillé (emasi), plat culturellement central en Eswatini',
 128, 5.2, 20.5, 3.5, 2.8, 'FAO Southern Africa FCT / Eswatini Ministry of Agriculture / USDA'),

('Incwancwa', 'Eswatini', 'Afrique Australe', 'Plat / Accompagnement',
 'Bouillie acide fermentée de maïs ou sorgho, texture liquide, consommée matin ou soir',
 88, 2.2, 18.5, 0.6, 1.8, 'FAO Southern Africa FCT / Eswatini MoH nutritional survey'),

('Umhayizo', 'Eswatini', 'Afrique Australe', 'Plat principal',
 'Ragoût de haricots et légumes cuits avec viande séchée ou fraîche, plat familial swazi',
 155, 9.5, 18.5, 5.0, 6.2, 'FAO Southern Africa FCT / USDA / Eswatini MoH');

-- Sources Eswatini : Eswatini Ministry of Agriculture and Food Security ·
-- FAO Southern Africa Food Composition Tables · USDA FoodData Central 2023 ·
-- Eswatini Ministry of Health Nutritional Survey · University of Eswatini Nutrition studies


-- ============================================================
-- LESOTHO — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Joala / Leting', 'Lesotho', 'Afrique Australe', 'Boisson / Plat fermenté',
 'Bière de sorgho fermentée traditionnelle du Lesotho, consommée épaisse comme aliment',
 72, 1.8, 13.5, 0.5, 0.8, 'FAO Southern Africa FCT / Lesotho Bureau of Statistics food survey'),

('Liphaphatha', 'Lesotho', 'Afrique Australe', 'Accompagnement / Snack',
 'Galettes de maïs ou blé cuites à la poêle sèche ou sur pierre chaude, pain du quotidien au Lesotho',
 278, 7.5, 52.5, 4.5, 2.5, 'FAO Southern Africa FCT / USDA adaptation / Lesotho MoH'),

('Moroho', 'Lesotho', 'Afrique Australe', 'Plat / Accompagnement',
 'Feuilles vertes sauvages ou cultivées (épinards, amarante) cuites avec oignon et sel',
 48, 3.5, 5.5, 1.0, 3.5, 'FAO Southern Africa FCT / Lesotho Bureau of Statistics'),

('Bohobe joa Sorgho', 'Lesotho', 'Afrique Australe', 'Accompagnement',
 'Bouillie épaisse de farine de sorgho cuite à l''eau, base alimentaire principale du Lesotho montagneux',
 102, 3.0, 21.5, 0.8, 3.0, 'FAO Southern Africa FCT / Lesotho MoH nutritional survey'),

('Motoho', 'Lesotho', 'Afrique Australe', 'Petit-déjeuner',
 'Bouillie claire fermentée de sorgho, consommée comme boisson nutritive au petit-déjeuner',
 65, 1.5, 13.5, 0.5, 1.2, 'FAO Southern Africa FCT / Lesotho Bureau of Statistics food survey'),

('Nama ea Khomo', 'Lesotho', 'Afrique Australe', 'Plat principal',
 'Viande de bœuf bouillie longuement puis légèrement dorée, accompagnée de papa de maïs ou sorgho',
 185, 22.0, 0.5, 10.5, 0.0, 'FAO Southern Africa FCT / USDA FoodData Central / Lesotho MoH');

-- Sources Lesotho : Lesotho Bureau of Statistics Food Consumption Survey ·
-- FAO Southern Africa Food Composition Tables · USDA FoodData Central 2023 ·
-- Lesotho Ministry of Health National Nutrition Survey · Roma University Lesotho Nutrition Dept


-- ============================================================
-- MOZAMBIQUE — MEALS ADDITIONNELS
-- NOTE : Matapa et Caril de Peixe Moçambicano déjà présents
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Piri-Piri Chicken Mozambique', 'Mozambique', 'Afrique Australe', 'Plat principal',
 'Poulet grillé mariné au piri-piri (piment oiseau frais), ail et jus de citron, spécialité nationale',
 188, 22.5, 2.5, 9.5, 0.5, 'FAO Southern Africa FCT / USDA FoodData Central / Mozambique MISAU'),

('Xima', 'Mozambique', 'Afrique Australe', 'Accompagnement',
 'Polenta de farine de maïs épaisse (xima), base glucidique nationale, identique structurellement au sadza mais farine plus fine',
 108, 2.5, 23.5, 0.8, 1.8, 'FAO Southern Africa FCT / Mozambique MISAU Nutrition Dept'),

('Caril de Amendoim', 'Mozambique', 'Afrique Australe', 'Plat principal',
 'Curry d''arachide avec légumes ou poulet, sauce riche à base de beurre d''arachide et tomates',
 225, 10.5, 14.5, 14.5, 3.5, 'FAO Southern Africa FCT / USDA / Mozambique MISAU'),

('Mucapata', 'Mozambique', 'Afrique Australe', 'Plat principal',
 'Crevettes géantes de Mozambique sautées à l''ail, beurre et piri-piri, plat côtier emblématique',
 158, 18.5, 2.5, 8.5, 0.2, 'FAO Southern Africa FCT / USDA FoodData Central / Mozambique MISAU'),

('Bolo Polana', 'Mozambique', 'Afrique Australe', 'Dessert',
 'Gâteau aux noix de cajou et pommes de terre, dessert traditionnel de Maputo, influence portugaise',
 318, 6.5, 38.5, 16.5, 2.0, 'Mozambique MISAU / USDA adaptation / Portuguese-African culinary records');

-- Sources Mozambique : Mozambique MISAU (Ministério da Saúde) Nutrition Dept ·
-- FAO Southern Africa Food Composition Tables · USDA FoodData Central 2023 ·
-- Instituto Nacional de Saúde Moçambique (INS) nutritional studies ·
-- Portuguese-African culinary documentation


-- ============================================================
-- MEAL COMPONENTS — AFRIQUE DU SUD (PLATS ADDITIONNELS)
-- ============================================================

-- Potjiekos
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau (épaule, cru)', 35 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre', 15 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 10 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chou blanc', 6 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bière brune (braai)', 8 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices braai (mélange)', 2 FROM public.meals_master WHERE name = 'Potjiekos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thym frais', 1 FROM public.meals_master WHERE name = 'Potjiekos';

-- Bredie de Tomate
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau (épaule, cru)', 40 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 30 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre', 8 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais (chile)', 2 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome moulue', 1 FROM public.meals_master WHERE name = 'Bredie de Tomate';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 1 FROM public.meals_master WHERE name = 'Bredie de Tomate';

-- Melkkos
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 55 FROM public.meals_master WHERE name = 'Melkkos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 25 FROM public.meals_master WHERE name = 'Melkkos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 10 FROM public.meals_master WHERE name = 'Melkkos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 6 FROM public.meals_master WHERE name = 'Melkkos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Melkkos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Melkkos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 1 FROM public.meals_master WHERE name = 'Melkkos';

-- Koesisters
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 35 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 20 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc (sirop)', 22 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 8 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 5 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 3 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue', 2 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre moulu', 1 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de coco râpée', 2 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Koesisters';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cardamome moulue', 1 FROM public.meals_master WHERE name = 'Koesisters';

-- Pap en Vleis
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (mielie meal)', 32 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché maigre (cru)', 28 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 3 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Pap en Vleis';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Pap en Vleis';

-- Umleqwa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet de village entier (cru)', 65 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais', 2 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Umleqwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Umleqwa';

-- Milk Tart / Melktert
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 40 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche (fond)', 18 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 15 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 12 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 8 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amidon de maïs (Maïzena)', 5 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cannelle moulue (garniture)', 1 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Extrait de vanille', 1 FROM public.meals_master WHERE name = 'Milk Tart / Melktert';


-- ============================================================
-- MEAL COMPONENTS — BOTSWANA
-- ============================================================

-- Seswaa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf (paleron, cru)', 80 FROM public.meals_master WHERE name = 'Seswaa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 15 FROM public.meals_master WHERE name = 'Seswaa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Seswaa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 3 FROM public.meals_master WHERE name = 'Seswaa';

-- Bogobe jwa Lerotse
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 42 FROM public.meals_master WHERE name = 'Bogobe jwa Lerotse';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courge / lerotse (crue)', 30 FROM public.meals_master WHERE name = 'Bogobe jwa Lerotse';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 25 FROM public.meals_master WHERE name = 'Bogobe jwa Lerotse';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Bogobe jwa Lerotse';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait fermenté (madila)', 2 FROM public.meals_master WHERE name = 'Bogobe jwa Lerotse';

-- Bogobe jwa Mosokwane
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho fermenté (ting)', 48 FROM public.meals_master WHERE name = 'Bogobe jwa Mosokwane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 50 FROM public.meals_master WHERE name = 'Bogobe jwa Mosokwane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Bogobe jwa Mosokwane';

-- Morogo wa Thepe
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles sauvages morogo (fraîches)', 75 FROM public.meals_master WHERE name = 'Morogo wa Thepe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Morogo wa Thepe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Morogo wa Thepe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Morogo wa Thepe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Morogo wa Thepe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude (cuisson)', 1 FROM public.meals_master WHERE name = 'Morogo wa Thepe';

-- Dikgobe
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs concassé (samp)', 45 FROM public.meals_master WHERE name = 'Dikgobe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots borlotti (secs, trempés)', 35 FROM public.meals_master WHERE name = 'Dikgobe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 15 FROM public.meals_master WHERE name = 'Dikgobe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Dikgobe';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 3 FROM public.meals_master WHERE name = 'Dikgobe';

-- Mophane Worms / Phane
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chenilles mophane séchées (Gonimbrasia belina)', 70 FROM public.meals_master WHERE name = 'Mophane Worms / Phane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Mophane Worms / Phane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Mophane Worms / Phane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Mophane Worms / Phane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Mophane Worms / Phane';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Mophane Worms / Phane';


-- ============================================================
-- MEAL COMPONENTS — ESWATINI
-- ============================================================

-- Sitfubi / Umcweba
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (tranches, cru)', 85 FROM public.meals_master WHERE name = 'Sitfubi / Umcweba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 5 FROM public.meals_master WHERE name = 'Sitfubi / Umcweba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 3 FROM public.meals_master WHERE name = 'Sitfubi / Umcweba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre de malt', 5 FROM public.meals_master WHERE name = 'Sitfubi / Umcweba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 2 FROM public.meals_master WHERE name = 'Sitfubi / Umcweba';

-- Sishwala
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs blanche', 45 FROM public.meals_master WHERE name = 'Sishwala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 53 FROM public.meals_master WHERE name = 'Sishwala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Sishwala';

-- Emasi Emabele
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 40 FROM public.meals_master WHERE name = 'Emasi Emabele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait caillé (emasi)', 35 FROM public.meals_master WHERE name = 'Emasi Emabele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 22 FROM public.meals_master WHERE name = 'Emasi Emabele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Emasi Emabele';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre (optionnel)', 2 FROM public.meals_master WHERE name = 'Emasi Emabele';

-- Incwancwa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs (fermentée)', 30 FROM public.meals_master WHERE name = 'Incwancwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 65 FROM public.meals_master WHERE name = 'Incwancwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levain naturel (fermentation)', 3 FROM public.meals_master WHERE name = 'Incwancwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Incwancwa';

-- Umhayizo
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots secs (trempés, cuits)', 38 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf séché (umcweba, cru)', 20 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Umhayizo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Umhayizo';


-- ============================================================
-- MEAL COMPONENTS — LESOTHO
-- ============================================================

-- Joala / Leting
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho (fermentée)', 18 FROM public.meals_master WHERE name = 'Joala / Leting';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 78 FROM public.meals_master WHERE name = 'Joala / Leting';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levain naturel (fermentation)', 4 FROM public.meals_master WHERE name = 'Joala / Leting';

-- Liphaphatha
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs blanche', 50 FROM public.meals_master WHERE name = 'Liphaphatha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé (optionnel)', 10 FROM public.meals_master WHERE name = 'Liphaphatha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède', 32 FROM public.meals_master WHERE name = 'Liphaphatha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Liphaphatha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 2 FROM public.meals_master WHERE name = 'Liphaphatha';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Liphaphatha';

-- Moroho
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles vertes (épinards / amarante)', 72 FROM public.meals_master WHERE name = 'Moroho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Moroho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Moroho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Moroho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude', 1 FROM public.meals_master WHERE name = 'Moroho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Moroho';

-- Bohobe joa Sorgho
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho', 45 FROM public.meals_master WHERE name = 'Bohobe joa Sorgho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 53 FROM public.meals_master WHERE name = 'Bohobe joa Sorgho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Bohobe joa Sorgho';

-- Motoho
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho (fermentée)', 15 FROM public.meals_master WHERE name = 'Motoho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 82 FROM public.meals_master WHERE name = 'Motoho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levain naturel', 3 FROM public.meals_master WHERE name = 'Motoho';

-- Nama ea Khomo
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf (paleron ou poitrine, cru)', 78 FROM public.meals_master WHERE name = 'Nama ea Khomo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Nama ea Khomo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 8 FROM public.meals_master WHERE name = 'Nama ea Khomo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Nama ea Khomo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Nama ea Khomo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Nama ea Khomo';


-- ============================================================
-- MEAL COMPONENTS — MOZAMBIQUE (PLATS ADDITIONNELS)
-- ============================================================

-- Piri-Piri Chicken Mozambique
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse et pilon, cru)', 60 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment oiseau frais (piri-piri)', 8 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 6 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 10 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 8 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 3 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre blanc', 1 FROM public.meals_master WHERE name = 'Piri-Piri Chicken Mozambique';

-- Xima
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs fine (farinha de milho)', 45 FROM public.meals_master WHERE name = 'Xima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 53 FROM public.meals_master WHERE name = 'Xima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Xima';

-- Caril de Amendoim
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide', 20 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse, cru)', 25 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco', 15 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais', 3 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curry en poudre', 2 FROM public.meals_master WHERE name = 'Caril de Amendoim';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Caril de Amendoim';

-- Mucapata
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes géantes (langoustines, crues)', 65 FROM public.meals_master WHERE name = 'Mucapata';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 12 FROM public.meals_master WHERE name = 'Mucapata';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 8 FROM public.meals_master WHERE name = 'Mucapata';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment oiseau frais (piri-piri)', 5 FROM public.meals_master WHERE name = 'Mucapata';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 5 FROM public.meals_master WHERE name = 'Mucapata';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 3 FROM public.meals_master WHERE name = 'Mucapata';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Mucapata';

-- Bolo Polana
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de cajou grillées (moulues)', 28 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre cuite (purée)', 22 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 18 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 12 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 10 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 6 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure chimique', 1 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Extrait de vanille', 1 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Bolo Polana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Noix de cajou entières (garniture)', 1 FROM public.meals_master WHERE name = 'Bolo Polana';

-- ============================================================
-- AfriCalo — PHASE 3 EXTENSION — AFRIQUE AUSTRALE
-- PARTIE 2/2 : Namibie, Zambie, Zimbabwe, Soudan du Sud
-- meals_master INSERT + meal_components_master
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : FAO · USDA · Bases nationales · Publications académiques
-- ============================================================


-- ============================================================
-- NAMIBIE — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Oshifima', 'Namibie', 'Afrique Australe', 'Accompagnement',
 'Polenta épaisse de farine de mil perlé (pearl millet), base alimentaire des Ovambo, cousin du sadza mais farine différente',
 110, 3.2, 23.5, 0.9, 2.8, 'FAO Southern Africa FCT / Namibia MoHSS Nutrition Report 2013'),

('Oshiwambo Chicken Stew', 'Namibie', 'Afrique Australe', 'Plat principal',
 'Ragoût de poulet aux oignons, tomates et épices, cuisson traditionnelle Ovambo, servi avec oshifima',
 168, 18.5, 6.5, 8.0, 1.2, 'Namibia MoHSS Nutrition Report 2013 / USDA FoodData Central adaptation'),

('Kapana', 'Namibie', 'Afrique Australe', 'Plat / Snack',
 'Viande de bœuf grillée sur braises au marché de rue (kapana market), assaisonnée de piment et tomate',
 215, 24.0, 2.5, 12.0, 0.2, 'FAO Southern Africa FCT / Namibia Street Food Survey 2015'),

('Omashika / Mopane Worm Namibia', 'Namibie', 'Afrique Australe', 'Plat / Snack protéiné',
 'Chenilles mopane séchées ou sautées, source protéique traditionnelle du nord namibien, composition différente du phane botswanais après traitement',
 328, 44.5, 12.0, 9.5, 4.2, 'FAO Edible Insects 2013 / Namibia Traditional Food Study Univ. of Namibia'),

('Namibian Potbrood', 'Namibie', 'Afrique Australe', 'Accompagnement / Snack',
 'Pain cuit dans marmite en fonte sur braises (potbrood), tradition des communautés rurales namibiennes',
 262, 8.5, 50.5, 3.5, 1.8, 'FAO Southern Africa FCT / USDA / Namibia MoHSS'),

('Oshikundu', 'Namibie', 'Afrique Australe', 'Boisson / Aliment fermenté',
 'Boisson fermentée de mil perlé, légèrement alcoolisée, consommée épaisse comme aliment nutritif',
 68, 1.5, 13.0, 0.5, 1.0, 'FAO Southern Africa FCT / Namibia MoHSS Nutrition Report 2013');

-- Sources Namibie : Namibia Ministry of Health and Social Services (MoHSS) Nutrition Report 2013 ·
-- FAO Southern Africa Food Composition Tables · University of Namibia Food Studies ·
-- USDA FoodData Central 2023 · FAO Edible Insects Report 2013


-- ============================================================
-- ZAMBIE — MEALS
-- NOTE : Nshima & Ndiwo déjà présent dans la base
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Nshima ya Chimanga', 'Zambie', 'Afrique Australe', 'Accompagnement',
 'Nshima de maïs blanc finement moulu, texture plus ferme que la nshima ordinaire, consommée avec relish',
 108, 2.5, 23.5, 0.8, 1.8, 'Zambia Food Composition Table 2019 / FAO Southern Africa FCT'),

('Ifisashi', 'Zambie', 'Afrique Australe', 'Plat principal',
 'Feuilles vertes (épinards sauvages ou feuilles de manioc) cuites avec arachides moulues, plat national zambien',
 178, 7.8, 10.5, 12.5, 4.5, 'Zambia Food Composition Table 2019 / FAO Southern Africa FCT'),

('Chibwabwa', 'Zambie', 'Afrique Australe', 'Plat / Accompagnement',
 'Feuilles de courge (pumpkin leaves) cuites avec oignon, sel et huile ou arachides, légume-feuille populaire',
 68, 4.2, 7.5, 2.5, 3.8, 'Zambia Food Composition Table 2019 / FAO Southern Africa FCT'),

('Chikanda', 'Zambie', 'Afrique Australe', 'Snack / Plat',
 'Cake d''orchidée sauvage (tubercules d''orchidée africaine) mixé avec arachides et piment, surnommé African polony',
 198, 8.5, 22.5, 9.0, 3.5, 'Zambia Food Composition Table 2019 / University of Zambia Nutrition Dept'),

('Vitumbuwa', 'Zambie', 'Afrique Australe', 'Snack / Petit-déjeuner',
 'Beignets de farine de maïs frits, snack de rue populaire en Zambie, consommés au petit-déjeuner',
 285, 5.5, 42.5, 11.0, 1.5, 'USDA FoodData Central / FAO Southern Africa FCT / Zambia MoH'),

('Kapenta with Nshima', 'Zambie', 'Afrique Australe', 'Plat principal',
 'Sardines séchées du lac Tanganyika ou Kariba (kapenta) cuites en sauce tomate, servies avec nshima',
 155, 18.5, 8.5, 5.5, 1.2, 'Zambia Food Composition Table 2019 / FAO Southern Africa FCT');

-- Sources Zambie : Zambia Food Composition Table 2019 · FAO Southern Africa FCT ·
-- University of Zambia Nutrition Department · Zambia Ministry of Health ·
-- USDA FoodData Central 2023


-- ============================================================
-- ZIMBABWE — MEALS
-- NOTE : Sadza Nhemba déjà présent dans la base
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Sadza ne Nyama', 'Zimbabwe', 'Afrique Australe', 'Plat principal',
 'Sadza (polenta de maïs blanc) avec ragoût de bœuf ou chèvre en sauce tomate — composition viande différente du Sadza Nhemba aux haricots',
 148, 9.5, 20.5, 4.2, 1.8, 'Zimbabwe National Nutrition Survey 2018 / FAO Southern Africa FCT'),

('Muriwo une Dovi', 'Zimbabwe', 'Afrique Australe', 'Plat / Accompagnement',
 'Feuilles vertes (chou frisé, brassica) cuites avec beurre d''arachide (dovi), relish traditionnel du Zimbabwe',
 138, 6.5, 9.5, 9.0, 4.2, 'Zimbabwe NNS 2018 / FAO Southern Africa FCT / USDA adaptation'),

('Matemba', 'Zimbabwe', 'Afrique Australe', 'Plat / Accompagnement',
 'Petits poissons séchés (kapenta ou matemba) frits ou cuits en sauce avec oignons et tomates',
 168, 22.5, 5.5, 7.0, 0.5, 'Zimbabwe NNS 2018 / FAO Southern Africa FCT'),

('Bota', 'Zimbabwe', 'Afrique Australe', 'Petit-déjeuner',
 'Bouillie de farine de maïs ou mil au lait, parfois avec beurre d''arachide, petit-déjeuner traditionnel zimbabwéen',
 98, 2.8, 18.5, 2.0, 1.5, 'Zimbabwe NNS 2018 / FAO Southern Africa FCT'),

('Nhopi', 'Zimbabwe', 'Afrique Australe', 'Plat / Accompagnement',
 'Purée de courge musquée pilée avec arachides moulues, plat d''accompagnement traditionnel Shona',
 145, 4.5, 18.5, 7.0, 3.5, 'Zimbabwe NNS 2018 / FAO Southern Africa FCT / University of Zimbabwe'),

('Madora', 'Zimbabwe', 'Afrique Australe', 'Plat / Snack protéiné',
 'Chenilles mopane (Gonimbrasia belina) séchées frites avec oignons et épices, madora est la dénomination locale zimbabwéenne — même espèce que phane / omashika mais préparation distincte (friture sèche)',
 345, 46.0, 13.5, 10.5, 4.5, 'FAO Edible Insects 2013 / Zimbabwe NNS 2018 / University of Zimbabwe Food Science');

-- Sources Zimbabwe : Zimbabwe National Nutrition Survey 2018 · FAO Southern Africa FCT ·
-- University of Zimbabwe Food Science Department · USDA FoodData Central 2023 ·
-- FAO Edible Insects Report 2013


-- ============================================================
-- SOUDAN DU SUD — MEALS
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Aseeda', 'Soudan du Sud', 'Afrique Australe', 'Accompagnement',
 'Boule épaisse de farine de sorgho ou maïs cuite à l''eau, base alimentaire du Soudan du Sud — distincte de l''asida soudanaise par la farine utilisée (sorgho rouge local)',
 142, 3.5, 30.5, 1.0, 3.0, 'FAO East/Southern Africa FCT / WFP South Sudan Food Security Assessment 2022'),

('Kajaik', 'Soudan du Sud', 'Afrique Australe', 'Plat principal',
 'Poisson séché ou fumé du Nil cuit en sauce tomates et oignons, poisson dominant Nile perch ou tilapia',
 138, 16.5, 6.5, 5.5, 0.8, 'WFP South Sudan FSA 2022 / FAO East Africa FCT'),

('Tamia South Sudan', 'Soudan du Sud', 'Afrique Australe', 'Snack / Petit-déjeuner',
 'Falafel local de fèves ou pois chiches épicé aux herbes, similaire au tamiya soudanais mais intégration de piment local plus prononcée',
 222, 9.2, 22.0, 11.5, 5.0, 'WFP South Sudan FSA 2022 / USDA adaptation / FAO'),

('Combo', 'Soudan du Sud', 'Afrique Australe', 'Plat principal',
 'Ragoût de viande de chèvre ou bœuf avec feuilles vertes (okra, oseille) et épices locales, plat familial Dinka',
 158, 13.5, 8.5, 8.5, 2.8, 'WFP South Sudan FSA 2022 / FAO East Africa FCT'),

('Kisra South Sudan', 'Soudan du Sud', 'Afrique Australe', 'Accompagnement',
 'Pain plat fermenté de sorgho cuit sur plaque chaude, variante locale de la kisra soudanaise — farine de sorgho blanc locale avec fermentation plus courte (12h vs 24h)',
 145, 5.0, 30.0, 1.0, 3.2, 'WFP South Sudan FSA 2022 / FAO East Africa FCT'),

('Mulla', 'Soudan du Sud', 'Afrique Australe', 'Plat principal',
 'Sauce de gombo séché moulu cuite avec viande et épices, relish épais servi avec aseeda, plat national Dinka et Nuer',
 105, 5.5, 12.5, 4.0, 4.5, 'WFP South Sudan FSA 2022 / FAO East Africa FCT / USDA adaptation');

-- Sources Soudan du Sud : WFP South Sudan Food Security Assessment 2022 ·
-- FAO East/Southern Africa Food Composition Tables · USDA FoodData Central 2023 ·
-- UNICEF South Sudan Nutrition Surveys 2021 · WHO/EMRO South Sudan


-- ============================================================
-- MEAL COMPONENTS — NAMIBIE
-- ============================================================

-- Oshifima
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil perlé (pearl millet)', 42 FROM public.meals_master WHERE name = 'Oshifima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 56 FROM public.meals_master WHERE name = 'Oshifima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Oshifima';

-- Oshiwambo Chicken Stew
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet entier (cru)', 55 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Oshiwambo Chicken Stew';

-- Kapana
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf (bavette ou poitrine, cru)', 78 FROM public.meals_master WHERE name = 'Kapana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche (sauce)', 8 FROM public.meals_master WHERE name = 'Kapana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Kapana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment frais', 4 FROM public.meals_master WHERE name = 'Kapana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 3 FROM public.meals_master WHERE name = 'Kapana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'Kapana';

-- Omashika / Mopane Worm Namibia
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chenilles mopane séchées (Gonimbrasia belina)', 68 FROM public.meals_master WHERE name = 'Omashika / Mopane Worm Namibia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Omashika / Mopane Worm Namibia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Omashika / Mopane Worm Namibia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Omashika / Mopane Worm Namibia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Omashika / Mopane Worm Namibia';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Omashika / Mopane Worm Namibia';

-- Namibian Potbrood
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche', 52 FROM public.meals_master WHERE name = 'Namibian Potbrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède', 32 FROM public.meals_master WHERE name = 'Namibian Potbrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 5 FROM public.meals_master WHERE name = 'Namibian Potbrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Namibian Potbrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre', 4 FROM public.meals_master WHERE name = 'Namibian Potbrood';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Namibian Potbrood';

-- Oshikundu
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de mil perlé (fermentée)', 14 FROM public.meals_master WHERE name = 'Oshikundu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 82 FROM public.meals_master WHERE name = 'Oshikundu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levain naturel (fermentation)', 3 FROM public.meals_master WHERE name = 'Oshikundu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre (optionnel)', 1 FROM public.meals_master WHERE name = 'Oshikundu';


-- ============================================================
-- MEAL COMPONENTS — ZAMBIE
-- ============================================================

-- Nshima ya Chimanga
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs blanche fine', 44 FROM public.meals_master WHERE name = 'Nshima ya Chimanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 54 FROM public.meals_master WHERE name = 'Nshima ya Chimanga';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Nshima ya Chimanga';

-- Ifisashi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles vertes (épinards sauvages / feuilles manioc)', 42 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides moulues (pâte d''arachide)', 28 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 6 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché (optionnel)', 1 FROM public.meals_master WHERE name = 'Ifisashi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude (cuisson)', 1 FROM public.meals_master WHERE name = 'Ifisashi';

-- Chibwabwa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de courge (fraîches)', 68 FROM public.meals_master WHERE name = 'Chibwabwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Chibwabwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Chibwabwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Chibwabwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Chibwabwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude (cuisson)', 1 FROM public.meals_master WHERE name = 'Chibwabwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Chibwabwa';

-- Chikanda
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tubercules d''orchidée sauvage séchés (chikanda)', 30 FROM public.meals_master WHERE name = 'Chikanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides moulues (pâte)', 35 FROM public.meals_master WHERE name = 'Chikanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 8 FROM public.meals_master WHERE name = 'Chikanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude', 5 FROM public.meals_master WHERE name = 'Chikanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 3 FROM public.meals_master WHERE name = 'Chikanda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 19 FROM public.meals_master WHERE name = 'Chikanda';

-- Vitumbuwa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs blanche', 42 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre', 8 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 8 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 10 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 5 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé (appoint)', 8 FROM public.meals_master WHERE name = 'Vitumbuwa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Vitumbuwa';

-- Kapenta with Nshima
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Kapenta séché (sardines lac Tanganyika)', 35 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nshima (farine maïs cuite)', 30 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché (optionnel)', 2 FROM public.meals_master WHERE name = 'Kapenta with Nshima';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Kapenta with Nshima';


-- ============================================================
-- MEAL COMPONENTS — ZIMBABWE
-- ============================================================

-- Sadza ne Nyama
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs blanche (sadza)', 35 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf maigre (cru)', 28 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 3 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 2 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Sadza ne Nyama';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Sadza ne Nyama';

-- Muriwo une Dovi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles vertes (chou frisé / brassica)', 52 FROM public.meals_master WHERE name = 'Muriwo une Dovi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide (dovi)', 22 FROM public.meals_master WHERE name = 'Muriwo une Dovi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Muriwo une Dovi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Muriwo une Dovi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 5 FROM public.meals_master WHERE name = 'Muriwo une Dovi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Muriwo une Dovi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude (cuisson)', 1 FROM public.meals_master WHERE name = 'Muriwo une Dovi';

-- Matemba
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Petits poissons séchés (kapenta / matemba)', 55 FROM public.meals_master WHERE name = 'Matemba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 18 FROM public.meals_master WHERE name = 'Matemba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Matemba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Matemba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Matemba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 2 FROM public.meals_master WHERE name = 'Matemba';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Matemba';

-- Bota
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs blanche', 18 FROM public.meals_master WHERE name = 'Bota';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 65 FROM public.meals_master WHERE name = 'Bota';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier (optionnel)', 10 FROM public.meals_master WHERE name = 'Bota';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre', 5 FROM public.meals_master WHERE name = 'Bota';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Bota';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre d''arachide (optionnel)', 1 FROM public.meals_master WHERE name = 'Bota';

-- Nhopi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courge musquée (cuite, pilée)', 58 FROM public.meals_master WHERE name = 'Nhopi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Arachides moulues (pâte)', 25 FROM public.meals_master WHERE name = 'Nhopi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 12 FROM public.meals_master WHERE name = 'Nhopi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 3 FROM public.meals_master WHERE name = 'Nhopi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre (optionnel, version sucrée)', 2 FROM public.meals_master WHERE name = 'Nhopi';

-- Madora
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chenilles mopane séchées (Gonimbrasia belina)', 65 FROM public.meals_master WHERE name = 'Madora';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Madora';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Madora';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture sèche)', 8 FROM public.meals_master WHERE name = 'Madora';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 3 FROM public.meals_master WHERE name = 'Madora';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Madora';


-- ============================================================
-- MEAL COMPONENTS — SOUDAN DU SUD
-- ============================================================

-- Aseeda
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho rouge local', 44 FROM public.meals_master WHERE name = 'Aseeda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 54 FROM public.meals_master WHERE name = 'Aseeda';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Aseeda';

-- Kajaik
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson séché / fumé du Nil (Nile perch ou tilapia)', 45 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 20 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 15 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concentré de tomate', 2 FROM public.meals_master WHERE name = 'Kajaik';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Kajaik';

-- Tamia South Sudan
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves séchées (trempées)', 42 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 20 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 6 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment vert local (frais)', 6 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 5 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 3 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude', 1 FROM public.meals_master WHERE name = 'Tamia South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Tamia South Sudan';

-- Combo
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Viande de chèvre (cru)', 38 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo frais', 18 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles d''oseille (fraîches)', 12 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Combo';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 1 FROM public.meals_master WHERE name = 'Combo';

-- Kisra South Sudan
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de sorgho blanc local', 52 FROM public.meals_master WHERE name = 'Kisra South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 44 FROM public.meals_master WHERE name = 'Kisra South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levain naturel (fermentation 12h)', 3 FROM public.meals_master WHERE name = 'Kisra South Sudan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Kisra South Sudan';

-- Mulla
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gombo séché moulu', 28 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Viande de bœuf ou chèvre (cru)', 30 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment séché', 3 FROM public.meals_master WHERE name = 'Mulla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Mulla';

-- ============================================================
-- AfriCalo — EXTENSION INTERNATIONALE — PARTIE 1
-- EUROPE & AMÉRIQUE DU NORD : Pizzas, Steaks, Fast Food, Plats Européens
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : USDA FoodData Central · CIQUAL 2020 · FAO · Bases académiques
-- ============================================================


-- ============================================================
-- PIZZAS — VERSION STANDARD INTERNATIONALE
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Pizza Margherita', 'Italie', 'Europe', 'Plat principal',
 'Pizza standard à base de sauce tomate, mozzarella et basilic, cuite au four, version internationale',
 238, 10.5, 30.5, 8.5, 1.8, 'USDA FoodData Central #21299 / CIQUAL 2020 / Nutrition Facts databases'),

('Pizza Pepperoni', 'États-Unis / Italie', 'Europe / Amérique du Nord', 'Plat principal',
 'Pizza sauce tomate, mozzarella et pepperoni (saucisson épicé), version la plus consommée mondialement',
 272, 12.5, 28.5, 12.0, 1.5, 'USDA FoodData Central #21297 / CIQUAL 2020'),

('Pizza 4 Fromages', 'Italie', 'Europe', 'Plat principal',
 'Pizza aux quatre fromages (mozzarella, parmesan, gorgonzola, emmental), sans sauce tomate',
 285, 14.5, 27.5, 13.0, 1.2, 'USDA FoodData Central adaptation / CIQUAL 2020'),

('Pizza Fruits de Mer', 'Italie', 'Europe', 'Plat principal',
 'Pizza sauce tomate, mozzarella, crevettes, calamars et moules, version standard',
 225, 13.5, 28.5, 7.5, 1.5, 'USDA FoodData Central adaptation / CIQUAL 2020'),

('Pizza Hawaïenne', 'Canada', 'Amérique du Nord', 'Plat principal',
 'Pizza sauce tomate, mozzarella, jambon et ananas, version internationale populaire',
 248, 11.5, 30.5, 9.0, 1.5, 'USDA FoodData Central #21301 / Nutrition databases'),

('Pizza Végétarienne', 'International', 'Europe / Amérique du Nord', 'Plat principal',
 'Pizza sauce tomate, mozzarella, poivrons, champignons, oignons, olives et courgettes',
 218, 9.5, 30.0, 7.0, 2.8, 'USDA FoodData Central adaptation / CIQUAL 2020'),

('Pizza Napolitaine', 'Italie', 'Europe', 'Plat principal',
 'Pizza sauce tomate, mozzarella di bufala, basilic et anchois, pâte fine tradition napolitaine',
 242, 11.5, 29.0, 9.5, 1.8, 'USDA FoodData Central adaptation / CIQUAL 2020 / STG Neapolitan Pizza standard'),

('Pizza Calzone', 'Italie', 'Europe', 'Plat principal',
 'Pizza pliée fourrée de ricotta, mozzarella, jambon et sauce tomate, cuite au four',
 258, 12.5, 30.5, 10.0, 1.5, 'USDA FoodData Central adaptation / CIQUAL 2020'),

('Pizza Meat Lovers', 'États-Unis', 'Amérique du Nord', 'Plat principal',
 'Pizza sauce tomate, mozzarella, pepperoni, saucisse italienne, bacon et jambon',
 295, 14.5, 26.5, 14.5, 1.2, 'USDA FoodData Central adaptation / US nutrition databases'),

('Pizza BBQ Chicken', 'États-Unis', 'Amérique du Nord', 'Plat principal',
 'Pizza sauce BBQ, poulet grillé, mozzarella, oignons rouges et coriandre',
 255, 13.5, 30.5, 9.5, 1.5, 'USDA FoodData Central adaptation / US nutrition databases');

-- Sources Pizzas : USDA FoodData Central 2023 · CIQUAL 2020 (ANSES) ·
-- Nutrition Facts international pizza databases · STG Neapolitan Pizza standard (EU)


-- ============================================================
-- STEAKS ET VIANDES OCCIDENTALES
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Steak Grillé Bœuf', 'International', 'Europe / Amérique du Nord', 'Plat principal',
 'Steak de bœuf grillé nature (faux-filet ou rumsteak), cuit à point, sans sauce',
 215, 26.5, 0.0, 12.0, 0.0, 'USDA FoodData Central #13377 / CIQUAL 2020 #32014'),

('Ribeye Steak', 'International', 'Amérique du Nord', 'Plat principal',
 'Entrecôte grillée, coupe riche en marbrures grasses, cuite à point',
 268, 24.5, 0.0, 19.0, 0.0, 'USDA FoodData Central #13346 / Beef industry FCT'),

('T-Bone Steak', 'International', 'Amérique du Nord', 'Plat principal',
 'Steak T-bone grillé, combinaison faux-filet et filet sur os central, cuit à point',
 258, 25.5, 0.0, 17.5, 0.0, 'USDA FoodData Central #13484 / Beef FCT'),

('Steak Haché', 'France / International', 'Europe', 'Plat principal',
 'Steak haché de bœuf cuit à la poêle, 15% matière grasse standard, version domestique',
 235, 20.5, 0.5, 16.5, 0.0, 'CIQUAL 2020 #32086 / USDA FoodData Central #21081'),

('Escalope Panée', 'Europe', 'Europe', 'Plat principal',
 'Escalope de veau ou poulet enrobée de chapelure et frite, version standard internationale',
 278, 22.5, 16.5, 14.5, 0.8, 'CIQUAL 2020 / USDA FoodData Central adaptation'),

('Schnitzel Viennois', 'Autriche', 'Europe', 'Plat principal',
 'Escalope de veau aplatie, panée (farine, œuf, chapelure), frite dans beurre clarifié',
 295, 22.0, 17.5, 16.0, 0.8, 'USDA FoodData Central adaptation / CIQUAL 2020 / Austrian FCT'),

('Cordon Bleu', 'France / Suisse', 'Europe', 'Plat principal',
 'Escalope de poulet ou veau farcie de jambon et fromage fondu, panée et frite',
 312, 21.5, 15.5, 18.5, 0.5, 'CIQUAL 2020 / USDA FoodData Central adaptation'),

('Roast Beef', 'Royaume-Uni', 'Europe', 'Plat principal',
 'Rôti de bœuf cuit au four (rumsteak ou côte de bœuf), version standard cuit à point',
 195, 26.5, 0.0, 10.0, 0.0, 'USDA FoodData Central #13357 / CIQUAL 2020 #32010'),

('BBQ Ribs', 'États-Unis', 'Amérique du Nord', 'Plat principal',
 'Travers de porc marinés en sauce BBQ, cuits lentement puis caramélisés au four ou grill',
 318, 20.5, 8.5, 22.5, 0.2, 'USDA FoodData Central #10093 adaptation / US nutrition databases');

-- Sources Steaks : USDA FoodData Central 2023 · CIQUAL 2020 (ANSES) ·
-- Beef FCT (Beef Checkoff) · Austrian FCT · UK Food Composition Database (McCance & Widdowson)


-- ============================================================
-- FAST FOOD MAJEUR — VERSION STANDARD INTERNATIONALE
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Cheeseburger', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Burger steak haché bœuf, fromage fondu, laitue, tomate, oignon, cornichon, sauce ketchup/moutarde',
 268, 13.5, 25.5, 12.5, 1.5, 'USDA FoodData Central #21107 / CIQUAL 2020'),

('Double Cheeseburger', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Burger deux steaks hachés, double fromage fondu, pain brioche, légumes et sauces standards',
 295, 16.5, 23.5, 15.5, 1.2, 'USDA FoodData Central #21108 adaptation / US Fast Food databases'),

('Hamburger Simple', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Burger steak haché bœuf, pain brioche, laitue, tomate, oignon et ketchup, sans fromage',
 245, 12.5, 26.5, 10.5, 1.5, 'USDA FoodData Central #21106 / CIQUAL 2020'),

('Hot Dog', 'États-Unis / Allemagne', 'Amérique du Nord', 'Fast Food',
 'Saucisse de Frankfurt ou porc dans pain brioche avec moutarde et ketchup',
 248, 10.5, 22.5, 14.0, 0.8, 'USDA FoodData Central #21112 / CIQUAL 2020'),

('Fried Chicken', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Morceaux de poulet marinés, enrobés de farine épicée et frits, version style southern',
 318, 22.5, 15.5, 19.5, 0.5, 'USDA FoodData Central #05288 / CIQUAL 2020 adaptation'),

('Nuggets de Poulet', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Petits morceaux de poulet haché enrobés de panure croustillante, frits, version standard',
 298, 14.5, 20.5, 17.5, 0.5, 'USDA FoodData Central #21119 / CIQUAL 2020'),

('Fish Burger', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Filet de poisson blanc pané et frit dans pain brioche avec sauce tartare et salade',
 258, 12.5, 28.5, 11.0, 1.2, 'USDA FoodData Central adaptation / CIQUAL 2020'),

('Onion Rings', 'États-Unis', 'Amérique du Nord', 'Fast Food',
 'Rondelles d''oignon enrobées de pâte à beignet ou panure, frites, accompagnement classique',
 348, 4.5, 40.5, 19.0, 1.8, 'USDA FoodData Central #21135 / CIQUAL 2020');

-- Sources Fast Food : USDA FoodData Central 2023 · CIQUAL 2020 (ANSES) ·
-- McDonald''s / Burger King / KFC published nutritional data ·
-- US FDA Nutrition Facts labeling database


-- ============================================================
-- PLATS EUROPÉENS ICONIQUES
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Lasagne', 'Italie', 'Europe', 'Plat principal',
 'Couches de pâtes fraîches alternées de bolognaise (bœuf haché / tomate) et béchamel gratin au four',
 168, 10.5, 16.5, 7.5, 1.2, 'CIQUAL 2020 #26010 / USDA FoodData Central #21151'),

('Spaghetti Bolognese', 'Italie', 'Europe', 'Plat principal',
 'Spaghetti al dente avec sauce bolognaise (bœuf haché, tomate, oignon, carotte, céleri)',
 155, 9.5, 20.5, 4.5, 1.8, 'CIQUAL 2020 / USDA FoodData Central #21149 / INRAN Italy FCT'),

('Carbonara', 'Italie', 'Europe', 'Plat principal',
 'Spaghetti sauce œufs, guanciale (ou lardons), parmesan, poivre noir, version traditionnelle',
 312, 14.5, 32.5, 14.0, 1.5, 'CIQUAL 2020 adaptation / USDA / INRAN Italy FCT'),

('Risotto', 'Italie', 'Europe', 'Plat principal',
 'Riz arborio cuit en ajoutant bouillon progressivement avec beurre et parmesan, version nature',
 145, 4.5, 24.5, 4.0, 0.5, 'CIQUAL 2020 adaptation / USDA FoodData Central / INRAN Italy FCT'),

('Paella Valenciana', 'Espagne', 'Europe', 'Plat principal',
 'Riz sauté à l''huile d''olive avec poulet, lapin, haricots verts, safran et paprika, version originale',
 178, 10.5, 22.5, 6.0, 1.5, 'USDA FoodData Central adaptation / Spanish FCT (BEDCA) / CIQUAL'),

('Fish and Chips', 'Royaume-Uni', 'Europe', 'Plat principal',
 'Filet de cabillaud en pâte à bière frit, servi avec frites épaisses britanniques et vinaigre de malt',
 268, 13.5, 28.5, 12.0, 1.8, 'UK FSA McCance Widdowson 8th edition / USDA FoodData Central'),

('Quiche Lorraine', 'France', 'Europe', 'Plat principal',
 'Tarte à fond brisé garnie d''appareil crème/œuf avec lardons, version classique sans fromage',
 285, 9.5, 20.5, 18.5, 0.8, 'CIQUAL 2020 #26150 / USDA FoodData Central adaptation'),

('Gyros', 'Grèce', 'Europe', 'Plat principal',
 'Viande de porc ou poulet marinée grillée à la broche, servie en pita avec tzatziki, tomate, oignon',
 225, 15.5, 22.5, 9.0, 1.5, 'Greek Food Composition Database / USDA FoodData Central adaptation / CIQUAL'),

('Croissant Beurre', 'France', 'Europe', 'Petit-déjeuner / Snack',
 'Viennoiserie feuilletée au beurre en forme de croissant, version standard boulangerie',
 406, 8.5, 45.5, 21.0, 2.0, 'CIQUAL 2020 #9020 / USDA FoodData Central #18018');

-- Sources Plats Européens : CIQUAL 2020 (ANSES France) · USDA FoodData Central 2023 ·
-- INRAN Italy FCT · UK FSA McCance & Widdowson 8th Edition · Spanish FCT (BEDCA) ·
-- Greek Food Composition Database · FAO European Office


-- ============================================================
-- MEAL COMPONENTS — PIZZAS
-- ============================================================

-- Pizza Margherita
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 42 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 18 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 28 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 6 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Basilic frais', 2 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 2 FROM public.meals_master WHERE name = 'Pizza Margherita';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan (optionnel)', 1 FROM public.meals_master WHERE name = 'Pizza Margherita';

-- Pizza Pepperoni
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 38 FROM public.meals_master WHERE name = 'Pizza Pepperoni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 16 FROM public.meals_master WHERE name = 'Pizza Pepperoni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 28 FROM public.meals_master WHERE name = 'Pizza Pepperoni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pepperoni (saucisson épicé)', 14 FROM public.meals_master WHERE name = 'Pizza Pepperoni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Pizza Pepperoni';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 1 FROM public.meals_master WHERE name = 'Pizza Pepperoni';

-- Pizza 4 Fromages
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 38 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 20 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan râpé', 12 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gorgonzola', 10 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Emmental râpé', 12 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche', 5 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 2 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 1 FROM public.meals_master WHERE name = 'Pizza 4 Fromages';

-- Pizza Fruits de Mer
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 38 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 15 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 22 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes décortiquées', 10 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Calamars (anneaux)', 8 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Moules (décoquillées)', 4 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 2 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Pizza Fruits de Mer';

-- Pizza Hawaïenne
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 38 FROM public.meals_master WHERE name = 'Pizza Hawaïenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 16 FROM public.meals_master WHERE name = 'Pizza Hawaïenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 26 FROM public.meals_master WHERE name = 'Pizza Hawaïenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jambon cuit', 12 FROM public.meals_master WHERE name = 'Pizza Hawaïenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ananas en morceaux', 7 FROM public.meals_master WHERE name = 'Pizza Hawaïenne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 1 FROM public.meals_master WHERE name = 'Pizza Hawaïenne';

-- Pizza Végétarienne
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 38 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 15 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 22 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 6 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Champignons de Paris', 6 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Olives noires', 3 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette', 3 FROM public.meals_master WHERE name = 'Pizza Végétarienne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 2 FROM public.meals_master WHERE name = 'Pizza Végétarienne';

-- Pizza Napolitaine
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza fine (farine 00)', 40 FROM public.meals_master WHERE name = 'Pizza Napolitaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate San Marzano', 18 FROM public.meals_master WHERE name = 'Pizza Napolitaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella di bufala', 26 FROM public.meals_master WHERE name = 'Pizza Napolitaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Anchois à l''huile', 6 FROM public.meals_master WHERE name = 'Pizza Napolitaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive extra vierge', 6 FROM public.meals_master WHERE name = 'Pizza Napolitaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Basilic frais', 2 FROM public.meals_master WHERE name = 'Pizza Napolitaine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Câpres', 2 FROM public.meals_master WHERE name = 'Pizza Napolitaine';

-- Pizza Calzone
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 42 FROM public.meals_master WHERE name = 'Pizza Calzone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ricotta', 18 FROM public.meals_master WHERE name = 'Pizza Calzone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 16 FROM public.meals_master WHERE name = 'Pizza Calzone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jambon cuit', 12 FROM public.meals_master WHERE name = 'Pizza Calzone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 8 FROM public.meals_master WHERE name = 'Pizza Calzone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 2 FROM public.meals_master WHERE name = 'Pizza Calzone';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan râpé', 2 FROM public.meals_master WHERE name = 'Pizza Calzone';

-- Pizza Meat Lovers
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 32 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 12 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 22 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pepperoni', 10 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Saucisse italienne', 8 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bacon', 8 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jambon cuit', 6 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 2 FROM public.meals_master WHERE name = 'Pizza Meat Lovers';

-- Pizza BBQ Chicken
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte à pizza (farine blanche)', 35 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce BBQ', 15 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet grillé (émincé)', 22 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 20 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 2 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 1 FROM public.meals_master WHERE name = 'Pizza BBQ Chicken';


-- ============================================================
-- MEAL COMPONENTS — STEAKS ET VIANDES
-- ============================================================

-- Steak Grillé Bœuf
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Faux-filet ou rumsteak (cru)', 92 FROM public.meals_master WHERE name = 'Steak Grillé Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (cuisson)', 4 FROM public.meals_master WHERE name = 'Steak Grillé Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Steak Grillé Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'Steak Grillé Bœuf';

-- Ribeye Steak
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Entrecôte bœuf (crue, avec gras)', 92 FROM public.meals_master WHERE name = 'Ribeye Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 3 FROM public.meals_master WHERE name = 'Ribeye Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'Ribeye Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (finition)', 3 FROM public.meals_master WHERE name = 'Ribeye Steak';

-- T-Bone Steak
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'T-bone bœuf (cru, avec os)', 88 FROM public.meals_master WHERE name = 'T-Bone Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 3 FROM public.meals_master WHERE name = 'T-Bone Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'T-Bone Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'T-Bone Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'T-Bone Steak';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thym frais', 1 FROM public.meals_master WHERE name = 'T-Bone Steak';

-- Steak Haché
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché 15% MG (cru)', 90 FROM public.meals_master WHERE name = 'Steak Haché';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (cuisson)', 5 FROM public.meals_master WHERE name = 'Steak Haché';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 3 FROM public.meals_master WHERE name = 'Steak Haché';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'Steak Haché';

-- Escalope Panée
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Escalope de veau ou poulet (crue)', 55 FROM public.meals_master WHERE name = 'Escalope Panée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chapelure', 15 FROM public.meals_master WHERE name = 'Escalope Panée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 15 FROM public.meals_master WHERE name = 'Escalope Panée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé', 8 FROM public.meals_master WHERE name = 'Escalope Panée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 5 FROM public.meals_master WHERE name = 'Escalope Panée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Escalope Panée';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Escalope Panée';

-- Schnitzel Viennois
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Escalope de veau fine (crue)', 52 FROM public.meals_master WHERE name = 'Schnitzel Viennois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre clarifié (friture)', 18 FROM public.meals_master WHERE name = 'Schnitzel Viennois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chapelure fine', 15 FROM public.meals_master WHERE name = 'Schnitzel Viennois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé', 8 FROM public.meals_master WHERE name = 'Schnitzel Viennois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 5 FROM public.meals_master WHERE name = 'Schnitzel Viennois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Schnitzel Viennois';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus, service)', 1 FROM public.meals_master WHERE name = 'Schnitzel Viennois';

-- Cordon Bleu
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Escalope de poulet (crue)', 42 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chapelure', 14 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 14 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Emmental (farce)', 12 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jambon cuit (farce)', 10 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé', 5 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 2 FROM public.meals_master WHERE name = 'Cordon Bleu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Cordon Bleu';

-- Roast Beef
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Côte de bœuf ou rumsteak (cru)', 88 FROM public.meals_master WHERE name = 'Roast Beef';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 4 FROM public.meals_master WHERE name = 'Roast Beef';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Roast Beef';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Romarin frais', 2 FROM public.meals_master WHERE name = 'Roast Beef';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Roast Beef';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Roast Beef';

-- BBQ Ribs
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Travers de porc (spareribs, cru)', 65 FROM public.meals_master WHERE name = 'BBQ Ribs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce BBQ', 20 FROM public.meals_master WHERE name = 'BBQ Ribs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cassonade (marinade)', 5 FROM public.meals_master WHERE name = 'BBQ Ribs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika fumé', 3 FROM public.meals_master WHERE name = 'BBQ Ribs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail en poudre', 3 FROM public.meals_master WHERE name = 'BBQ Ribs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'BBQ Ribs';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 2 FROM public.meals_master WHERE name = 'BBQ Ribs';


-- ============================================================
-- MEAL COMPONENTS — FAST FOOD
-- ============================================================

-- Cheeseburger
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain brioche (bun)', 28 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Steak haché bœuf (cuit)', 30 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fromage fondu (cheddar)', 10 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laitue iceberg', 6 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cornichon', 3 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ketchup', 5 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Moutarde jaune', 3 FROM public.meals_master WHERE name = 'Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mayonnaise', 2 FROM public.meals_master WHERE name = 'Cheeseburger';

-- Double Cheeseburger
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain brioche (bun)', 22 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Double steak haché bœuf (cuit)', 40 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Double fromage fondu (cheddar)', 14 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laitue iceberg', 5 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 4 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ketchup', 5 FROM public.meals_master WHERE name = 'Double Cheeseburger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce burger (mayo + moutarde)', 4 FROM public.meals_master WHERE name = 'Double Cheeseburger';

-- Hamburger Simple
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain brioche (bun)', 30 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Steak haché bœuf (cuit)', 32 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laitue iceberg', 8 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cornichon', 4 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ketchup', 6 FROM public.meals_master WHERE name = 'Hamburger Simple';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Moutarde jaune', 4 FROM public.meals_master WHERE name = 'Hamburger Simple';

-- Hot Dog
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain à hot dog', 32 FROM public.meals_master WHERE name = 'Hot Dog';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Saucisse Frankfurt / porc', 45 FROM public.meals_master WHERE name = 'Hot Dog';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Moutarde jaune', 8 FROM public.meals_master WHERE name = 'Hot Dog';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ketchup', 8 FROM public.meals_master WHERE name = 'Hot Dog';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon en julienne', 4 FROM public.meals_master WHERE name = 'Hot Dog';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cornichon relish (optionnel)', 3 FROM public.meals_master WHERE name = 'Hot Dog';

-- Fried Chicken
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse ou pilon, cru)', 58 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé épicée (enrobage)', 12 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Babeurre (marinade)', 6 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika', 2 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail en poudre', 2 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Fried Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Fried Chicken';

-- Nuggets de Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet haché (mélange blanc/cuisse)', 50 FROM public.meals_master WHERE name = 'Nuggets de Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Panure / chapelure', 16 FROM public.meals_master WHERE name = 'Nuggets de Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Nuggets de Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé', 8 FROM public.meals_master WHERE name = 'Nuggets de Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amidon de maïs', 4 FROM public.meals_master WHERE name = 'Nuggets de Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Nuggets de Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices (mélange)', 2 FROM public.meals_master WHERE name = 'Nuggets de Poulet';

-- Fish Burger
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain brioche (bun)', 28 FROM public.meals_master WHERE name = 'Fish Burger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Filet cabillaud pané frit', 35 FROM public.meals_master WHERE name = 'Fish Burger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tartare', 15 FROM public.meals_master WHERE name = 'Fish Burger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laitue iceberg', 10 FROM public.meals_master WHERE name = 'Fish Burger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Fish Burger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cornichon', 2 FROM public.meals_master WHERE name = 'Fish Burger';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 2 FROM public.meals_master WHERE name = 'Fish Burger';

-- Onion Rings
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon (rondelles)', 42 FROM public.meals_master WHERE name = 'Onion Rings';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 22 FROM public.meals_master WHERE name = 'Onion Rings';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé (pâte)', 18 FROM public.meals_master WHERE name = 'Onion Rings';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bière ou eau gazeuse (pâte)', 10 FROM public.meals_master WHERE name = 'Onion Rings';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chapelure (panko)', 5 FROM public.meals_master WHERE name = 'Onion Rings';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Onion Rings';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 1 FROM public.meals_master WHERE name = 'Onion Rings';


-- ============================================================
-- MEAL COMPONENTS — PLATS EUROPÉENS
-- ============================================================

-- Lasagne
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâtes lasagne (crues)', 20 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché (cru)', 25 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tomate', 18 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Béchamel (lait, farine, beurre)', 18 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mozzarella', 10 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan râpé', 5 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 2 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Lasagne';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 1 FROM public.meals_master WHERE name = 'Lasagne';

-- Spaghetti Bolognese
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Spaghetti (crus)', 30 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché (cru)', 25 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate concassée', 22 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carotte', 5 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Céleri', 3 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan râpé (service)', 1 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vin rouge (cuisson)', 1 FROM public.meals_master WHERE name = 'Spaghetti Bolognese';

-- Carbonara
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Spaghetti (crus)', 40 FROM public.meals_master WHERE name = 'Carbonara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Guanciale ou lardons fumés', 20 FROM public.meals_master WHERE name = 'Carbonara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier + jaune', 18 FROM public.meals_master WHERE name = 'Carbonara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan ou pecorino râpé', 18 FROM public.meals_master WHERE name = 'Carbonara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir concassé', 3 FROM public.meals_master WHERE name = 'Carbonara';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Carbonara';

-- Risotto
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz arborio (cru)', 35 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon poulet ou légumes', 38 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Parmesan râpé', 8 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 8 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon blanc', 5 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vin blanc sec', 4 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 1 FROM public.meals_master WHERE name = 'Risotto';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Risotto';

-- Paella Valenciana
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz rond (Bomba ou similar)', 30 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse, cru)', 22 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lapin (cru)', 12 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots verts', 8 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 8 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon de volaille', 5 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran', 1 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 1 FROM public.meals_master WHERE name = 'Paella Valenciana';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Paella Valenciana';

-- Fish and Chips
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Filet de cabillaud (cru)', 30 FROM public.meals_master WHERE name = 'Fish and Chips';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (chips épaisses crues)', 28 FROM public.meals_master WHERE name = 'Fish and Chips';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Fish and Chips';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé (pâte à bière)', 12 FROM public.meals_master WHERE name = 'Fish and Chips';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bière blonde (pâte)', 8 FROM public.meals_master WHERE name = 'Fish and Chips';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Fish and Chips';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre de malt (service)', 2 FROM public.meals_master WHERE name = 'Fish and Chips';

-- Quiche Lorraine
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte brisée (farine, beurre)', 28 FROM public.meals_master WHERE name = 'Quiche Lorraine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche épaisse', 25 FROM public.meals_master WHERE name = 'Quiche Lorraine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lardons fumés', 22 FROM public.meals_master WHERE name = 'Quiche Lorraine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 18 FROM public.meals_master WHERE name = 'Quiche Lorraine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 5 FROM public.meals_master WHERE name = 'Quiche Lorraine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Quiche Lorraine';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Quiche Lorraine';

-- Gyros
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain pita', 25 FROM public.meals_master WHERE name = 'Gyros';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc ou poulet mariné grillé (gyros)', 35 FROM public.meals_master WHERE name = 'Gyros';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tzatziki (yaourt, concombre, ail)', 18 FROM public.meals_master WHERE name = 'Gyros';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Gyros';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Gyros';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 2 FROM public.meals_master WHERE name = 'Gyros';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 2 FROM public.meals_master WHERE name = 'Gyros';

-- Croissant Beurre
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche (T45)', 42 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (feuilletage)', 28 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 12 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 3 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jaune d''œuf (dorure)', 2 FROM public.meals_master WHERE name = 'Croissant Beurre';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède', 3 FROM public.meals_master WHERE name = 'Croissant Beurre';

-- ============================================================
-- AfriCalo — EXTENSION INTERNATIONALE — PARTIE 2
-- AMÉRIQUE LATINE & MOYEN-ORIENT
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : USDA FoodData Central · CIQUAL 2020 · FAO · Bases académiques
-- ============================================================


-- ============================================================
-- AMÉRIQUE LATINE
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Tacos Bœuf', 'Mexique', 'Amérique Latine', 'Plat principal',
 'Tortilla de maïs garnie de bœuf haché épicé, cheddar fondu, salade, tomate, crème et salsa',
 218, 11.5, 20.5, 10.0, 2.5, 'USDA FoodData Central #21334 / Mexican FCT INSP'),

('Tacos al Pastor', 'Mexique', 'Amérique Latine', 'Plat principal',
 'Tortilla de maïs avec porc mariné à l''achiote et ananas, oignon, coriandre et salsa verde',
 228, 13.5, 19.5, 10.5, 2.2, 'USDA FoodData Central adaptation / Mexican FCT INSP / CIQUAL adaptation'),

('Burrito', 'Mexique / États-Unis', 'Amérique Latine', 'Plat principal',
 'Grande tortilla de farine de blé enroulée autour de riz, haricots noirs, bœuf haché, fromage et crème',
 198, 9.5, 24.5, 7.5, 3.5, 'USDA FoodData Central #21328 / INSP Mexico'),

('Quesadilla', 'Mexique', 'Amérique Latine', 'Plat principal',
 'Tortilla de farine grillée à la poêle fourrée de fromage fondu, poulet et poivrons',
 278, 13.5, 25.5, 13.5, 1.8, 'USDA FoodData Central #21342 / INSP Mexico'),

('Nachos', 'Mexique / États-Unis', 'Amérique Latine', 'Snack / Entrée',
 'Chips de tortilla de maïs couvertes de cheddar fondu, jalapeños, guacamole et crème fraîche',
 348, 9.5, 35.5, 19.5, 3.5, 'USDA FoodData Central #21340 adaptation / INSP Mexico'),

('Empanadas', 'Argentine / Amérique Latine', 'Amérique Latine', 'Plat / Snack',
 'Chaussons de pâte feuilletée ou brisée fourrés bœuf haché épicé, oignon, olives et œuf dur, cuits au four',
 285, 11.5, 28.5, 14.0, 1.5, 'USDA FoodData Central adaptation / Argentine FCT ANMAT / CIQUAL adaptation'),

('Feijoada', 'Brésil', 'Amérique Latine', 'Plat principal',
 'Ragoût de haricots noirs avec saucisses, porc salé, côtes de porc fumées, servi avec riz et orange',
 168, 10.5, 14.5, 7.5, 4.5, 'USDA FoodData Central adaptation / TACO Brazil FCT / FAO Latin America'),

('Ceviche', 'Pérou', 'Amérique Latine', 'Entrée / Plat',
 'Poisson blanc frais mariné au citron vert avec oignon rouge, coriandre, piment aji amarillo',
 82, 13.5, 5.5, 1.2, 1.2, 'USDA FoodData Central adaptation / Peru FCT MINSA / FAO Latin America'),

('Arepas', 'Colombie / Venezuela', 'Amérique Latine', 'Accompagnement / Plat',
 'Galette de farine de maïs précuite grillée ou frite, version nature standard',
 218, 4.5, 38.5, 5.0, 2.5, 'USDA FoodData Central adaptation / Colombia FCT ICBF / Venezuela FCT'),

('Churrasco', 'Brésil / Argentine', 'Amérique Latine', 'Plat principal',
 'Pièce de bœuf (picanha ou bavette) grillée à la braise, assaisonnée de sel grossier uniquement',
 242, 26.5, 0.0, 15.5, 0.0, 'USDA FoodData Central #13377 adaptation / TACO Brazil FCT / FAO'),

('Fajitas Poulet', 'Mexique / États-Unis', 'Amérique Latine', 'Plat principal',
 'Lanières de poulet marinées grillées avec poivrons multicolores et oignon, servies en tortilla',
 168, 15.5, 12.5, 6.0, 2.0, 'USDA FoodData Central #21336 / INSP Mexico / CIQUAL adaptation'),

('Guacamole', 'Mexique', 'Amérique Latine', 'Accompagnement / Sauce',
 'Purée d''avocat mûr avec citron vert, coriandre, oignon, tomate et sel, version standard',
 155, 2.0, 8.5, 13.5, 5.5, 'USDA FoodData Central #09038 / INSP Mexico / CIQUAL 2020');

-- Sources Amérique Latine : USDA FoodData Central 2023 · INSP Mexico FCT ·
-- TACO Brazil FCT (Tabela Brasileira de Composição de Alimentos) ·
-- ICBF Colombia FCT · Peru MINSA FCT · ANMAT Argentina ·
-- FAO Latin America Food Composition Tables


-- ============================================================
-- MOYEN-ORIENT
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Shawarma Poulet', 'Liban / Syrie', 'Moyen-Orient', 'Plat principal',
 'Poulet mariné aux épices (cumin, curcuma, cannelle) rôti à la broche, servi en pain pita avec légumes et tahini',
 215, 17.5, 18.5, 8.0, 1.5, 'USDA FoodData Central adaptation / Lebanese FCT / Saudi FCDB'),

('Shawarma Bœuf', 'Liban / Syrie', 'Moyen-Orient', 'Plat principal',
 'Bœuf ou agneau mariné aux épices moyen-orientales rôti à la broche, servi en pain pita avec garniture',
 238, 16.5, 18.0, 10.5, 1.2, 'USDA FoodData Central adaptation / Lebanese FCT / Saudi FCDB'),

('Falafel', 'Égypte / Liban', 'Moyen-Orient', 'Snack / Plat végétarien',
 'Boulettes de pois chiches ou fèves épicées aux herbes, frites, servies en pita avec tahini et légumes',
 335, 13.5, 32.0, 17.5, 5.5, 'USDA FoodData Central #16058 / Lebanese FCT / Israeli FCT'),

('Hummus', 'Liban / Israël', 'Moyen-Orient', 'Accompagnement / Entrée',
 'Purée de pois chiches cuits avec tahini, jus de citron, ail et huile d''olive, version standard',
 168, 7.5, 14.5, 9.5, 4.5, 'USDA FoodData Central #16158 / Lebanese FCT / CIQUAL 2020'),

('Kebab Agneau', 'Turquie / Moyen-Orient', 'Moyen-Orient', 'Plat principal',
 'Viande d''agneau hachée épicée façonnée en brochette et grillée, version kofta standard',
 255, 18.5, 5.5, 18.0, 0.5, 'USDA FoodData Central adaptation / Turkish FCT / Lebanese FCT'),

('Doner Kebab', 'Turquie', 'Moyen-Orient', 'Plat principal',
 'Agneau ou poulet pressé et rôti à la broche vertical, servi en pain pita ou lavash avec salade et sauce',
 222, 15.5, 20.5, 9.0, 1.8, 'USDA FoodData Central adaptation / Turkish FCT / German BLS adaptation'),

('Tabbouleh', 'Liban / Syrie', 'Moyen-Orient', 'Entrée / Salade',
 'Salade de persil, menthe, boulgour, tomates, oignon vert et huile d''olive, version libanaise authentique',
 102, 2.8, 12.5, 5.0, 3.5, 'USDA FoodData Central #11935 adaptation / Lebanese FCT / CIQUAL 2020'),

('Fattoush', 'Liban', 'Moyen-Orient', 'Entrée / Salade',
 'Salade mélangée tomate, concombre, radis, laitue, pain pita frit croustillant, vinaigrette sumac et citron',
 88, 2.5, 12.5, 3.5, 2.5, 'USDA FoodData Central adaptation / Lebanese FCT'),

('Moutabal', 'Liban / Syrie', 'Moyen-Orient', 'Entrée / Accompagnement',
 'Purée d''aubergines grillées avec tahini, ail, citron et huile d''olive, distinct du baba ghanoush par la proportion de tahini',
 125, 3.5, 8.5, 9.0, 3.5, 'USDA FoodData Central adaptation / Lebanese FCT / CIQUAL adaptation'),

('Mandi', 'Yémen / Arabie Saoudite', 'Moyen-Orient', 'Plat principal',
 'Agneau ou poulet cuit lentement au four à la braise ou tandoor, servi sur riz parfumé aux épices mandi',
 195, 14.5, 22.5, 6.5, 0.8, 'Saudi FCDB / Yemeni FCT / USDA FoodData Central adaptation'),

('Kabsa', 'Arabie Saoudite', 'Moyen-Orient', 'Plat principal',
 'Riz à grains longs cuit dans bouillon d''agneau ou poulet avec épices kabsa (cardamome, cannelle, clou de girofle, citron sec)',
 188, 12.5, 24.5, 5.0, 0.8, 'Saudi FCDB / Gulf FCT / USDA FoodData Central adaptation');

-- Sources Moyen-Orient : USDA FoodData Central 2023 · Lebanese Food Composition Table ·
-- Saudi Arabia FCDB (Food Composition Database) · Turkish FCT (Köksal et al.) ·
-- Israeli FCT · Yemeni FCT · Gulf Region FCT · CIQUAL 2020 ·
-- German BLS (Bundeslebensmittelschlüssel) adaptation


-- ============================================================
-- MEAL COMPONENTS — AMÉRIQUE LATINE
-- ============================================================

-- Tacos Bœuf
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tortilla de maïs', 25 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché (cru)', 30 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fromage cheddar râpé', 10 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 10 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laitue iceberg', 8 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche', 6 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Salsa (sauce tomate épicée)', 5 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 3 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices taco (cumin, paprika, piment)', 2 FROM public.meals_master WHERE name = 'Tacos Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron vert (jus)', 1 FROM public.meals_master WHERE name = 'Tacos Bœuf';

-- Tacos al Pastor
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tortilla de maïs', 22 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc mariné achiote (cru)', 38 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ananas frais', 8 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon blanc', 8 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 5 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Salsa verde', 8 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment chipotle (marinade)', 5 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron vert (jus)', 4 FROM public.meals_master WHERE name = 'Tacos al Pastor';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Tacos al Pastor';

-- Burrito
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tortilla de farine de blé (grande)', 28 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit', 20 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots noirs cuits', 18 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché épicé (cru)', 15 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fromage cheddar râpé', 8 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche', 5 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Salsa tomate', 4 FROM public.meals_master WHERE name = 'Burrito';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 2 FROM public.meals_master WHERE name = 'Burrito';

-- Quesadilla
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tortilla de farine de blé', 32 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fromage cheddar ou mozzarella', 28 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet grillé émincé', 22 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron (rouge et vert)', 8 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (cuisson)', 3 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Quesadilla';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Quesadilla';

-- Nachos
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chips tortilla de maïs', 42 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fromage cheddar fondu', 22 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Guacamole (avocat)', 12 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche', 8 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jalapeño (tranches)', 6 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche (salsa)', 6 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 2 FROM public.meals_master WHERE name = 'Nachos';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 2 FROM public.meals_master WHERE name = 'Nachos';

-- Empanadas
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte brisée (farine, beurre, eau)', 40 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché (cru)', 30 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf dur (farce)', 6 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Olives vertes', 5 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux', 3 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Jaune d''œuf (dorure)', 2 FROM public.meals_master WHERE name = 'Empanadas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Empanadas';

-- Feijoada
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Haricots noirs (secs, trempés)', 28 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Côtes de porc fumées', 18 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Saucisse calabresa (fumée)', 15 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit (service)', 15 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc salé (paleta)', 10 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laurier', 1 FROM public.meals_master WHERE name = 'Feijoada';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Orange (zeste, service)', 1 FROM public.meals_master WHERE name = 'Feijoada';

-- Ceviche
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poisson blanc frais (corvina ou tilapia, cru)', 55 FROM public.meals_master WHERE name = 'Ceviche';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron vert (jus)', 18 FROM public.meals_master WHERE name = 'Ceviche';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 12 FROM public.meals_master WHERE name = 'Ceviche';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment aji amarillo (frais)', 6 FROM public.meals_master WHERE name = 'Ceviche';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 5 FROM public.meals_master WHERE name = 'Ceviche';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Ceviche';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Ceviche';

-- Arepas
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de maïs précuite (masarepa)', 58 FROM public.meals_master WHERE name = 'Arepas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau tiède', 28 FROM public.meals_master WHERE name = 'Arepas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (cuisson)', 8 FROM public.meals_master WHERE name = 'Arepas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Arepas';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre (finition optionnel)', 4 FROM public.meals_master WHERE name = 'Arepas';

-- Churrasco
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Picanha bœuf (crue)', 92 FROM public.meals_master WHERE name = 'Churrasco';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel grossier', 5 FROM public.meals_master WHERE name = 'Churrasco';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail (optionnel)', 2 FROM public.meals_master WHERE name = 'Churrasco';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivre noir', 1 FROM public.meals_master WHERE name = 'Churrasco';

-- Fajitas Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tortilla de farine de blé', 25 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc, cru)', 35 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge', 12 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron vert', 10 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron vert (jus)', 3 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices fajitas (cumin, paprika, ail)', 2 FROM public.meals_master WHERE name = 'Fajitas Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Fajitas Poulet';

-- Guacamole
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Avocat mûr', 75 FROM public.meals_master WHERE name = 'Guacamole';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron vert (jus)', 8 FROM public.meals_master WHERE name = 'Guacamole';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Guacamole';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 4 FROM public.meals_master WHERE name = 'Guacamole';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 3 FROM public.meals_master WHERE name = 'Guacamole';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment jalapeño', 1 FROM public.meals_master WHERE name = 'Guacamole';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Guacamole';


-- ============================================================
-- MEAL COMPONENTS — MOYEN-ORIENT
-- ============================================================

-- Shawarma Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain pita', 22 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet mariné rôti broche (cuit)', 38 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tahini', 10 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concombre', 6 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 4 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices shawarma (cumin, curcuma, cannelle)', 3 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 2 FROM public.meals_master WHERE name = 'Shawarma Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Shawarma Poulet';

-- Shawarma Bœuf
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain pita', 20 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf ou agneau mariné rôti (cuit)', 40 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tahini', 10 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 6 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cornichons (moyen-orientaux)', 6 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 4 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices shawarma bœuf (baharat, cannelle)', 3 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Shawarma Bœuf';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 1 FROM public.meals_master WHERE name = 'Shawarma Bœuf';

-- Falafel
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches secs (trempés, non cuits)', 40 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 20 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain pita (service)', 12 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 8 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre fraîche', 5 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon blanc', 6 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 2 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bicarbonate de soude', 1 FROM public.meals_master WHERE name = 'Falafel';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Falafel';

-- Hummus
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pois chiches cuits', 52 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tahini (pâte de sésame)', 18 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 10 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 10 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 5 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Paprika doux (garniture)', 1 FROM public.meals_master WHERE name = 'Hummus';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau froide (texture)', 1 FROM public.meals_master WHERE name = 'Hummus';

-- Kebab Agneau
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau haché (cru)', 62 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon (râpé)', 12 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais', 8 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 3 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 3 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge séché', 3 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 3 FROM public.meals_master WHERE name = 'Kebab Agneau';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Kebab Agneau';

-- Doner Kebab
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain pita ou lavash', 24 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau pressé rôti broche (cuit)', 36 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce blanche (yaourt, mayo, ail)', 12 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chou blanc émincé', 10 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce piquante (harissa / chili)', 3 FROM public.meals_master WHERE name = 'Doner Kebab';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Doner Kebab';

-- Tabbouleh
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil plat frais (haché fin)', 38 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche (dés)', 25 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Boulgour fin (cru)', 12 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 8 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Menthe fraîche', 5 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 8 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 3 FROM public.meals_master WHERE name = 'Tabbouleh';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Tabbouleh';

-- Fattoush
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Laitue romaine (hachée)', 20 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche (dés)', 18 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concombre', 15 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pain pita frit (croutons)', 15 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Radis', 8 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 6 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 8 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 4 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sumac moulu', 3 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Menthe fraîche', 2 FROM public.meals_master WHERE name = 'Fattoush';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Fattoush';

-- Moutabal
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergine grillée (chair)', 52 FROM public.meals_master WHERE name = 'Moutabal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tahini (pâte de sésame)', 22 FROM public.meals_master WHERE name = 'Moutabal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile d''olive', 10 FROM public.meals_master WHERE name = 'Moutabal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 8 FROM public.meals_master WHERE name = 'Moutabal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Moutabal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Moutabal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Persil frais (garniture)', 2 FROM public.meals_master WHERE name = 'Moutabal';

-- Mandi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz à grains longs (basmati, cru)', 35 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Agneau ou poulet (cru)', 38 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 6 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices mandi (cardamome, clou girofle, cannelle, poivre)', 4 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 4 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon cube (générique)', 1 FROM public.meals_master WHERE name = 'Mandi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Mandi';

-- Kabsa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz basmati (cru)', 32 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet ou agneau (cru)', 35 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 8 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices kabsa (cardamome, cannelle, citron sec, clou girofle)', 4 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Raisins secs (garniture)', 2 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amandes (garniture)', 2 FROM public.meals_master WHERE name = 'Kabsa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Kabsa';

-- ============================================================
-- SOURCES SCIENTIFIQUES — PARTIE 2
-- ============================================================

-- USDA FoodData Central 2023 (fdc.nal.usda.gov)
-- CIQUAL 2020 (ANSES France — ciqual.anses.fr)
-- FAO Latin America Food Composition Tables (LATINFOODS)
-- INSP Mexico — Instituto Nacional de Salud Publica, FCT Mexico
-- TACO Brazil — Tabela Brasileira de Composição de Alimentos, UNICAMP 2011
-- ICBF Colombia — Instituto Colombiano de Bienestar Familiar FCT
-- Peru MINSA — Ministerio de Salud Perú, Tablas Peruanas de Composición
-- ANMAT Argentina — FCT Argentina
-- Lebanese FCT — Lebanese University / AUB Food Composition Table
-- Saudi FCDB — Saudi Food and Drug Authority Food Composition Database
-- Turkish FCT — Köksal E. et al. Turkish Composition of Foods 2000
-- Israeli FCT — Israel Center for Disease Control FCT
-- Yemeni FCT / Gulf FCT — Gulf Cooperation Council regional adaptations
-- German BLS — Bundeslebensmittelschlüssel adaptation (Doner)

-- ============================================================
-- AfriCalo — EXTENSION INTERNATIONALE — PARTIE 3
-- ASIE : Asie de l'Est · Asie du Sud · Asie du Sud-Est
-- Valeurs pour 100g de plat CUIT / tel que consommé
-- Sources : USDA FoodData Central · CIQUAL 2020 · FAO · Bases académiques asiatiques
-- ============================================================


-- ============================================================
-- ASIE DE L'EST
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Sushi Mixte', 'Japon', 'Asie de l''Est', 'Plat principal',
 'Assortiment standard de nigiri (saumon, thon, crevette) et maki, riz vinaigré avec wasabi et gingembre',
 145, 8.5, 22.5, 2.5, 0.8, 'USDA FoodData Central #35208 / Japan Standard Tables FCT 2020 / CIQUAL 2020'),

('California Roll', 'États-Unis / Japon', 'Asie de l''Est', 'Plat principal',
 'Rouleau de riz vinaigré enrobé de sésame, surimi, avocat et concombre',
 155, 5.5, 24.5, 4.5, 1.5, 'USDA FoodData Central #21358 / Japan Standard Tables FCT 2020'),

('Sashimi', 'Japon', 'Asie de l''Est', 'Entrée / Plat',
 'Tranches de poisson cru (saumon, thon) sans riz, servi avec sauce soja, wasabi et gingembre',
 118, 18.5, 0.5, 4.5, 0.0, 'USDA FoodData Central #15084 / Japan Standard Tables FCT 2020 / CIQUAL 2020'),

('Ramen Tonkotsu', 'Japon', 'Asie de l''Est', 'Plat principal',
 'Soupe de nouilles de blé dans bouillon de porc longuement mijoté, garnie de chashu, œuf mollet et nori',
 95, 6.5, 10.5, 3.2, 0.5, 'USDA FoodData Central adaptation / Japan Standard Tables FCT 2020 / CIQUAL adaptation'),

('Udon', 'Japon', 'Asie de l''Est', 'Plat principal',
 'Soupe de grosses nouilles de blé dans bouillon dashi léger avec tempura ou légumes',
 88, 3.5, 16.5, 1.2, 0.8, 'USDA FoodData Central adaptation / Japan Standard Tables FCT 2020'),

('Tempura', 'Japon', 'Asie de l''Est', 'Plat / Entrée',
 'Crevettes et légumes enrobés de pâte légère à tempura, frits à basse température, servis avec sauce dashi-soja',
 228, 9.5, 22.5, 12.0, 1.2, 'USDA FoodData Central adaptation / Japan Standard Tables FCT 2020 / CIQUAL'),

('Fried Rice Asiatique', 'Chine / Asie de l''Est', 'Asie de l''Est', 'Plat principal',
 'Riz cuit sauté au wok avec œuf, légumes, sauce soja et huile de sésame, version riz cantonais standard',
 175, 6.5, 28.5, 4.5, 1.2, 'USDA FoodData Central #35159 / China FCT 2019 / CIQUAL 2020'),

('Sweet and Sour Chicken', 'Chine', 'Asie de l''Est', 'Plat principal',
 'Morceaux de poulet frit nappés de sauce aigre-douce (vinaigre, sucre, ketchup) avec poivrons et ananas',
 185, 11.5, 24.5, 5.5, 1.2, 'USDA FoodData Central #35164 / China FCT 2019 / CIQUAL adaptation'),

('Teriyaki Chicken', 'Japon', 'Asie de l''Est', 'Plat principal',
 'Poulet grillé ou rôti laqué de sauce teriyaki (sauce soja, mirin, sucre), servi avec riz blanc',
 168, 14.5, 14.5, 5.5, 0.5, 'USDA FoodData Central adaptation / Japan Standard Tables FCT 2020 / CIQUAL'),

('Dim Sum Vapeur', 'Chine (Cantonais)', 'Asie de l''Est', 'Entrée / Snack',
 'Assortiment de bouchées vapeur (har gow crevette, siu mai porc, cheung fun), version panier standard',
 148, 8.5, 18.5, 4.5, 1.2, 'USDA FoodData Central adaptation / China FCT 2019 / Hong Kong FCT'),

('Bibimbap', 'Corée du Sud', 'Asie de l''Est', 'Plat principal',
 'Bol de riz chaud avec légumes sautés assortis, bœuf haché, œuf et sauce gochujang',
 145, 7.5, 22.5, 3.5, 2.5, 'USDA FoodData Central adaptation / Korea FCT 2019 / CIQUAL adaptation'),

('Kimchi Fried Rice', 'Corée du Sud', 'Asie de l''Est', 'Plat principal',
 'Riz sauté au wok avec kimchi fermenté, porc ou spam, œuf au plat et huile de sésame',
 195, 7.5, 28.5, 6.5, 2.0, 'USDA FoodData Central adaptation / Korea FCT 2019');


-- ============================================================
-- ASIE DU SUD
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Chicken Tikka Masala', 'Inde / Royaume-Uni', 'Asie du Sud', 'Plat principal',
 'Morceaux de poulet marinés grillés en sauce tomate crémeuse aux épices (garam masala, curcuma, crème)',
 168, 14.5, 8.5, 8.5, 1.5, 'USDA FoodData Central #35166 / India FCT IFCT 2017 / CIQUAL 2020'),

('Butter Chicken', 'Inde', 'Asie du Sud', 'Plat principal',
 'Poulet tandoori en sauce tomate beurrée et crémeuse aux épices douces (makhani sauce)',
 158, 13.5, 8.0, 8.5, 1.2, 'USDA FoodData Central adaptation / India FCT IFCT 2017 / CIQUAL adaptation'),

('Biryani Poulet', 'Inde / Pakistan', 'Asie du Sud', 'Plat principal',
 'Riz basmati parfumé au safran et épices biryani (cardamome, cannelle, anis) avec poulet mariné, version hyderabadi',
 195, 12.5, 26.5, 5.0, 0.8, 'USDA FoodData Central adaptation / India FCT IFCT 2017 / Pakistan FCT'),

('Curry Végétarien', 'Inde', 'Asie du Sud', 'Plat principal',
 'Légumes mélangés (pomme de terre, pois, tomate) en sauce curry au lait de coco, version standard internationale',
 105, 3.5, 14.5, 4.5, 3.5, 'USDA FoodData Central adaptation / India FCT IFCT 2017 / CIQUAL 2020'),

('Naan', 'Inde / Pakistan', 'Asie du Sud', 'Accompagnement',
 'Pain plat à la levure cuit au tandoor ou à la poêle, badigeonné de beurre fondu, version nature',
 298, 8.5, 50.5, 7.5, 1.8, 'USDA FoodData Central #18264 / India FCT IFCT 2017 / CIQUAL 2020'),

('Samosa', 'Inde', 'Asie du Sud', 'Snack / Entrée',
 'Chausson de pâte frit triangulaire fourré de pommes de terre épicées et petits pois',
 268, 5.5, 32.5, 13.0, 3.5, 'USDA FoodData Central adaptation / India FCT IFCT 2017 / CIQUAL adaptation'),

('Daal', 'Inde / Pakistan', 'Asie du Sud', 'Plat principal',
 'Lentilles rouges (masoor) ou jaunes mijotées avec épices (curcuma, cumin, coriandre) et tomates',
 115, 7.5, 18.5, 2.0, 5.5, 'USDA FoodData Central #16069 / India FCT IFCT 2017 / CIQUAL 2020'),

('Tandoori Chicken', 'Inde', 'Asie du Sud', 'Plat principal',
 'Poulet mariné au yaourt et épices tandoori (curcuma, paprika, garam masala), grillé au four très chaud',
 162, 22.5, 3.5, 7.0, 0.5, 'USDA FoodData Central adaptation / India FCT IFCT 2017 / CIQUAL 2020');


-- ============================================================
-- ASIE DU SUD-EST
-- ============================================================

INSERT INTO public.meals_master
(name, country_origin, region, category, description, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source)
VALUES

('Pad Thai', 'Thaïlande', 'Asie du Sud-Est', 'Plat principal',
 'Nouilles de riz sautées au wok avec crevettes ou poulet, œuf, germes de soja, sauce poisson et cacahuètes',
 178, 8.5, 24.5, 5.5, 1.8, 'USDA FoodData Central #35182 / Thailand FCT INMU 2014 / CIQUAL 2020'),

('Pho', 'Viêt Nam', 'Asie du Sud-Est', 'Plat principal',
 'Soupe de nouilles de riz plates dans bouillon de bœuf longuement mijoté aux épices (anis étoilé, cannelle), garnie de tranches de bœuf',
 68, 5.5, 8.5, 1.5, 0.5, 'USDA FoodData Central adaptation / Vietnam FCT NIHE 2007 / CIQUAL adaptation'),

('Nasi Goreng', 'Indonésie / Malaisie', 'Asie du Sud-Est', 'Plat principal',
 'Riz sauté au wok avec pâte de crevette (terasi), légumes, œuf, sauce soja sucrée (kecap manis) et poulet',
 185, 7.5, 28.5, 5.0, 1.5, 'USDA FoodData Central adaptation / Indonesia FCT 2017 / Malaysia FCT'),

('Satay Poulet', 'Indonésie / Malaisie', 'Asie du Sud-Est', 'Plat / Snack',
 'Brochettes de poulet mariné aux épices (curcuma, citronnelle) grillées, servies avec sauce cacahuète',
 195, 17.5, 8.5, 10.5, 1.5, 'USDA FoodData Central adaptation / Indonesia FCT 2017 / Malaysia FCT / CIQUAL'),

('Spring Rolls Frits', 'Viêt Nam / Chine', 'Asie du Sud-Est', 'Snack / Entrée',
 'Rouleaux de feuille de riz ou blé fourrés de vermicelles, porc haché, champignons et légumes, frits',
 218, 7.5, 22.5, 11.5, 1.5, 'USDA FoodData Central #21354 / Vietnam FCT NIHE 2007 / China FCT 2019'),

('Laksa', 'Singapour / Malaisie', 'Asie du Sud-Est', 'Plat principal',
 'Soupe de nouilles de riz dans bouillon épicé au lait de coco et pâte laksa, avec crevettes, tofu et fèves germées',
 128, 6.5, 12.5, 7.0, 1.8, 'USDA FoodData Central adaptation / Singapore FCT / Malaysia FCT'),

('Tom Yum Goong', 'Thaïlande', 'Asie du Sud-Est', 'Soupe / Plat',
 'Soupe épicée et acidulée aux crevettes, citronnelle, galanga, kaffir lime et piments, bouillon léger',
 58, 5.5, 4.5, 2.0, 0.8, 'USDA FoodData Central adaptation / Thailand FCT INMU 2014 / CIQUAL adaptation'),

('Green Curry Thai', 'Thaïlande', 'Asie du Sud-Est', 'Plat principal',
 'Curry vert thaï au lait de coco avec poulet, aubergines thaïes, basilic thaï et pâte de curry vert',
 138, 10.5, 6.5, 9.0, 1.5, 'USDA FoodData Central adaptation / Thailand FCT INMU 2014 / CIQUAL 2020');


-- ============================================================
-- MEAL COMPONENTS — ASIE DE L'EST
-- ============================================================

-- Sushi Mixte
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz à sushi vinaigré (cuit)', 52 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Saumon frais (cru)', 18 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thon rouge (cru)', 10 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevette cuite', 6 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nori (algue séchée)', 4 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre de riz', 4 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja (service)', 3 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Wasabi', 1 FROM public.meals_master WHERE name = 'Sushi Mixte';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre mariné', 2 FROM public.meals_master WHERE name = 'Sushi Mixte';

-- California Roll
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz à sushi vinaigré (cuit)', 50 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Surimi (bâtonnets de crabe)', 15 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Avocat', 15 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Concombre', 8 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nori (algue)', 3 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sésame blanc (extérieur)', 4 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mayonnaise japonaise', 3 FROM public.meals_master WHERE name = 'California Roll';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre de riz', 2 FROM public.meals_master WHERE name = 'California Roll';

-- Sashimi
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Saumon frais (cru, filet)', 50 FROM public.meals_master WHERE name = 'Sashimi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Thon rouge (cru)', 30 FROM public.meals_master WHERE name = 'Sashimi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja (service)', 8 FROM public.meals_master WHERE name = 'Sashimi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre mariné', 6 FROM public.meals_master WHERE name = 'Sashimi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Wasabi', 2 FROM public.meals_master WHERE name = 'Sashimi';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Daïkon râpé (garniture)', 4 FROM public.meals_master WHERE name = 'Sashimi';

-- Ramen Tonkotsu
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon tonkotsu (os porc, eau)', 45 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nouilles ramen de blé (cuites)', 28 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chashu (porc rôti)', 12 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf mollet mariné', 6 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nori (algue)', 2 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert (ciboulette)', 3 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 2 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Maïs doux (garniture)', 2 FROM public.meals_master WHERE name = 'Ramen Tonkotsu';

-- Udon
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nouilles udon (cuites)', 40 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon dashi (katsuobushi + kombu)', 42 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 5 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mirin', 3 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 4 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tempura (optionnel, garniture)', 4 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Udon';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre râpé (optionnel)', 1 FROM public.meals_master WHERE name = 'Udon';

-- Tempura
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues, décortiquées)', 28 FROM public.meals_master WHERE name = 'Tempura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Légumes assortis (patate douce, courgette, poivron)', 18 FROM public.meals_master WHERE name = 'Tempura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 22 FROM public.meals_master WHERE name = 'Tempura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé (pâte légère)', 16 FROM public.meals_master WHERE name = 'Tempura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau glacée (pâte)', 10 FROM public.meals_master WHERE name = 'Tempura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce tentsuyu (dashi, soja, mirin)', 5 FROM public.meals_master WHERE name = 'Tempura';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Tempura';

-- Fried Rice Asiatique
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit (refroidi)', 52 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 12 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 8 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 6 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 6 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Petits pois', 6 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carottes dés', 5 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 3 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Fried Rice Asiatique';

-- Sweet and Sour Chicken
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc, cru)', 30 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé (enrobage)', 10 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 10 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ketchup (sauce aigre-douce)', 12 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vinaigre blanc', 5 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 8 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poivron rouge et vert', 10 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ananas morceaux', 8 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 4 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Amidon de maïs (liant sauce)', 3 FROM public.meals_master WHERE name = 'Sweet and Sour Chicken';

-- Teriyaki Chicken
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse ou blanc, cru)', 40 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit (service)', 32 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 10 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Mirin', 8 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre blanc', 5 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sésame (garniture)', 1 FROM public.meals_master WHERE name = 'Teriyaki Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 1 FROM public.meals_master WHERE name = 'Teriyaki Chicken';

-- Dim Sum Vapeur
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte de blé (enveloppe)', 30 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (farce har gow)', 22 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc haché (farce siu mai)', 20 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Champignons shiitake', 8 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 6 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 5 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 4 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fécule de tapioca (pâte)', 1 FROM public.meals_master WHERE name = 'Dim Sum Vapeur';

-- Bibimbap
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit', 38 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf haché (cru)', 15 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épinards blanchis', 10 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carottes julienne sautées', 8 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Courgette sautée', 8 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce gochujang (piment fermenté)', 8 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf au plat', 6 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 3 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 2 FROM public.meals_master WHERE name = 'Bibimbap';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sésame grillé (garniture)', 2 FROM public.meals_master WHERE name = 'Bibimbap';

-- Kimchi Fried Rice
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit (refroidi)', 42 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Kimchi fermenté (chou)', 22 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Spam ou porc haché', 12 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf au plat', 8 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de sésame', 5 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 4 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 4 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gochujang (optionnel)', 2 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sésame grillé', 1 FROM public.meals_master WHERE name = 'Kimchi Fried Rice';


-- ============================================================
-- MEAL COMPONENTS — ASIE DU SUD
-- ============================================================

-- Chicken Tikka Masala
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc, cru)', 35 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate concassée', 22 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche', 15 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Yaourt entier (marinade)', 8 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Garam masala', 2 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 1 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Chicken Tikka Masala';

-- Butter Chicken
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc ou cuisse, cru)', 35 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate concassée', 20 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre', 12 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crème fraîche', 12 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Yaourt (marinade)', 6 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Garam masala', 2 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma', 1 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Butter Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Butter Chicken';

-- Biryani Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz basmati (cru)', 32 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (cuisse, cru)', 32 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Yaourt entier (marinade)', 10 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon frit croustillant', 8 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices biryani (cardamome, cannelle, anis, clou)', 4 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Safran (eau de safran)', 1 FROM public.meals_master WHERE name = 'Biryani Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Biryani Poulet';

-- Curry Végétarien
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre (crue)', 28 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Petits pois', 12 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 15 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco', 18 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 10 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curry en poudre', 4 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Curry Végétarien';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Curry Végétarien';

-- Naan
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Farine de blé blanche (maida)', 55 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Yaourt entier', 15 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait entier', 10 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Beurre fondu (dorure)', 8 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Levure de boulanger', 4 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre', 3 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 3 FROM public.meals_master WHERE name = 'Naan';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Naan';

-- Samosa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte de blé (enveloppe)', 30 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pomme de terre cuite épicée', 35 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Petits pois', 8 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 2 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Coriandre moulue', 2 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Garam masala', 2 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 2 FROM public.meals_master WHERE name = 'Samosa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Samosa';

-- Daal
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lentilles rouges ou jaunes (crues)', 38 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Eau', 32 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tomate fraîche', 12 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 8 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (tarka)', 4 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 2 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cumin moulu', 1 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Daal';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 1 FROM public.meals_master WHERE name = 'Daal';

-- Tandoori Chicken
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet entier (cuisse et pilon, cru)', 65 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Yaourt entier (marinade)', 15 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Épices tandoori (paprika, curcuma, garam masala)', 6 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron (jus)', 5 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 4 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Gingembre frais', 3 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 1 FROM public.meals_master WHERE name = 'Tandoori Chicken';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Tandoori Chicken';


-- ============================================================
-- MEAL COMPONENTS — ASIE DU SUD-EST
-- ============================================================

-- Pad Thai
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nouilles de riz plates (cuites)', 35 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes ou poulet (cru)', 20 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf entier (cru)', 10 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Germes de soja', 10 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce poisson (nam pla)', 6 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Cacahuètes grillées (garniture)', 6 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 5 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tamarin (pâte)', 4 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre de palme', 2 FROM public.meals_master WHERE name = 'Pad Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 2 FROM public.meals_master WHERE name = 'Pad Thai';

-- Pho
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon de bœuf (os, épices, eau)', 50 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nouilles de riz plates (cuites)', 22 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bœuf tranches fines (cru)', 12 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Germes de soja (frais)', 6 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Basilic thaï frais', 3 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert', 3 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Anis étoilé (bouillon)', 1 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce hoisin (service)', 2 FROM public.meals_master WHERE name = 'Pho';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce Sriracha (service)', 1 FROM public.meals_master WHERE name = 'Pho';

-- Nasi Goreng
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Riz blanc cuit (refroidi)', 45 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet ou crevettes (cru)', 18 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Kecap manis (sauce soja sucrée)', 8 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Œuf frit (garniture)', 8 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte de crevette (terasi)', 3 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 6 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon rouge', 5 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 3 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piment rouge frais', 2 FROM public.meals_master WHERE name = 'Nasi Goreng';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Oignon vert (garniture)', 2 FROM public.meals_master WHERE name = 'Nasi Goreng';

-- Satay Poulet
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc ou cuisse, cru)', 42 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce cacahuète (satay sauce)', 28 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citronnelle (marinade)', 8 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Curcuma moulu', 4 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco (marinade)', 6 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 5 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre de palme', 3 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Satay Poulet';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Satay Poulet';

-- Spring Rolls Frits
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuille de riz ou blé (enveloppe)', 18 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Porc haché (farce)', 20 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol (friture)', 18 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Vermicelles de riz (farce)', 12 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Champignons noirs séchés', 8 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Carottes julienne', 8 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Chou blanc émincé', 8 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce poisson', 3 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce soja', 2 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 1 FROM public.meals_master WHERE name = 'Spring Rolls Frits';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Ail', 2 FROM public.meals_master WHERE name = 'Spring Rolls Frits';

-- Laksa
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco', 25 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon de crevettes ou poulet', 22 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Nouilles de riz (cuites)', 18 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte laksa (citronnelle, galanga, piment)', 10 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 10 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Tofu ferme', 6 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Fèves germées', 5 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Laksa';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sel', 2 FROM public.meals_master WHERE name = 'Laksa';

-- Tom Yum Goong
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Bouillon de crevettes léger', 48 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Crevettes (crues)', 22 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citronnelle', 6 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Galanga frais', 5 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de kaffir lime', 3 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Champignons de paille', 6 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce poisson (nam pla)', 4 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citron vert (jus)', 3 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Piments thaïs frais', 2 FROM public.meals_master WHERE name = 'Tom Yum Goong';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte de piment (nam prik pao)', 1 FROM public.meals_master WHERE name = 'Tom Yum Goong';

-- Green Curry Thai
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Lait de coco', 35 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Poulet (blanc ou cuisse, cru)', 30 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Pâte de curry vert', 10 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Aubergines thaïes', 10 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Basilic thaï frais', 5 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sauce poisson (nam pla)', 4 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Sucre de palme', 2 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Huile de tournesol', 2 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Feuilles de kaffir lime', 1 FROM public.meals_master WHERE name = 'Green Curry Thai';
INSERT INTO public.meal_components_master (meal_id, component_type, component_name, percentage_estimate)
SELECT id, 'ingredient', 'Citronnelle (pâte)', 1 FROM public.meals_master WHERE name = 'Green Curry Thai';


-- ============================================================
-- SOURCES SCIENTIFIQUES — PARTIE 3 ASIE
-- ============================================================

-- USDA FoodData Central 2023 (fdc.nal.usda.gov)
-- CIQUAL 2020 (ANSES France — ciqual.anses.fr)
-- Japan Standard Tables of Food Composition 2020 (MEXT)
-- China Food Composition Table 2019 (Yang Yuexin et al., Peking University Medical Press)
-- Korea FCT 2019 (National Institute of Agricultural Sciences, RDA)
-- Hong Kong FCT (Centre for Food Safety, HKSAR)
-- India FCT — IFCT 2017 (Indian Food Composition Tables, NIN Hyderabad)
-- Pakistan FCT (Pakistan Council of Scientific and Industrial Research)
-- Thailand FCT — INMU 2014 (Institute of Nutrition Mahidol University)
-- Vietnam FCT — NIHE 2007 (National Institute of Hygiene and Epidemiology)
-- Indonesia FCT 2017 (Kementerian Kesehatan Republik Indonesia)
-- Malaysia FCT (Malaysia Food Composition Database, IMR)
-- Singapore FCT (Health Promotion Board Singapore)
-- FAO Asia Pacific Food Composition Network (INFOODS)
