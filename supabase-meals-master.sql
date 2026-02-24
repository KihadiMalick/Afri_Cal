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
