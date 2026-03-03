-- Migration pour les fonctionnalités mobile LIXUM
-- 1. Ajouter colonne lixum_id aux profils existants
-- 2. Créer la table sport_catalog (30+ sports)

-- ============================================================
-- 1. LIXUM ID pour les utilisateurs
-- ============================================================
ALTER TABLE users_profile ADD COLUMN IF NOT EXISTS lixum_id TEXT UNIQUE;

-- Générer des IDs pour les comptes existants qui n'en ont pas
DO $$
DECLARE
  r RECORD;
  new_id TEXT;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
BEGIN
  FOR r IN SELECT user_id FROM users_profile WHERE lixum_id IS NULL LOOP
    new_id := 'LXM-';
    FOR i IN 1..6 LOOP
      new_id := new_id || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    UPDATE users_profile SET lixum_id = new_id WHERE user_id = r.user_id;
  END LOOP;
END $$;

-- ============================================================
-- 2. TABLE CATALOGUE DE SPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS sport_catalog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  image_url TEXT NOT NULL,
  calories_per_5min INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'intense')),
  benefits TEXT[] DEFAULT '{}',
  muscle_groups TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  description_fr TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. DONNÉES : 30+ ACTIVITÉS SPORTIVES
-- ============================================================
INSERT INTO sport_catalog (name, name_fr, image_url, calories_per_5min, difficulty, benefits, muscle_groups, description, description_fr) VALUES

-- FACILES
('Walking', 'Marche', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600', 20, 'easy',
 ARRAY['Improves cardiovascular health', 'Reduces stress', 'Strengthens bones', 'Boosts mood'],
 ARRAY['Legs', 'Glutes', 'Core'],
 'Walking is the most accessible exercise. It improves heart health and mental well-being.',
 'La marche est l''exercice le plus accessible. Elle améliore la santé cardiaque et le bien-être mental.'),

('Yoga', 'Yoga', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', 15, 'easy',
 ARRAY['Increases flexibility', 'Reduces anxiety', 'Improves balance', 'Strengthens muscles'],
 ARRAY['Full body', 'Core', 'Back'],
 'Yoga combines physical postures, breathing techniques, and meditation.',
 'Le yoga combine des postures physiques, des techniques de respiration et de la méditation.'),

('Stretching', 'Étirements', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600', 12, 'easy',
 ARRAY['Improves flexibility', 'Reduces injury risk', 'Relieves muscle tension', 'Improves posture'],
 ARRAY['Full body'],
 'Regular stretching maintains flexibility and prevents injuries.',
 'Les étirements réguliers maintiennent la flexibilité et préviennent les blessures.'),

('Pilates', 'Pilates', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600', 18, 'easy',
 ARRAY['Core strengthening', 'Improves posture', 'Increases flexibility', 'Mind-body connection'],
 ARRAY['Core', 'Back', 'Glutes'],
 'Pilates focuses on core strength, flexibility, and overall body awareness.',
 'Le Pilates se concentre sur le renforcement du tronc, la flexibilité et la conscience corporelle.'),

('Tai Chi', 'Tai Chi', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', 14, 'easy',
 ARRAY['Reduces stress', 'Improves balance', 'Gentle on joints', 'Enhances mental clarity'],
 ARRAY['Legs', 'Core', 'Arms'],
 'An ancient Chinese practice combining slow, flowing movements with deep breathing.',
 'Une pratique chinoise ancienne combinant des mouvements lents et fluides avec une respiration profonde.'),

('Aqua aerobics', 'Aquagym', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', 22, 'easy',
 ARRAY['Low impact on joints', 'Full body workout', 'Improves cardiovascular fitness', 'Fun and social'],
 ARRAY['Full body'],
 'Water-based exercise that is gentle on joints while providing resistance training.',
 'Exercice aquatique doux pour les articulations tout en offrant un entraînement en résistance.'),

-- MOYENS
('Running', 'Course à pied', 'https://images.unsplash.com/photo-1461896836934-bd45ba8b1990?w=600', 50, 'medium',
 ARRAY['Burns lots of calories', 'Strengthens heart', 'Improves endurance', 'Boosts metabolism'],
 ARRAY['Legs', 'Glutes', 'Core', 'Calves'],
 'Running is one of the most effective cardio exercises for burning calories.',
 'La course à pied est l''un des exercices cardio les plus efficaces pour brûler des calories.'),

('Cycling', 'Vélo', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', 40, 'medium',
 ARRAY['Low impact cardio', 'Strengthens legs', 'Improves stamina', 'Eco-friendly transport'],
 ARRAY['Quadriceps', 'Hamstrings', 'Calves', 'Glutes'],
 'Cycling builds lower body strength while being easy on the joints.',
 'Le vélo renforce le bas du corps tout en étant doux pour les articulations.'),

('Swimming', 'Natation', 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600', 45, 'medium',
 ARRAY['Full body workout', 'Zero impact', 'Improves lung capacity', 'Builds endurance'],
 ARRAY['Full body', 'Shoulders', 'Back', 'Core'],
 'Swimming works every major muscle group with zero impact on joints.',
 'La natation fait travailler chaque groupe musculaire majeur sans impact sur les articulations.'),

('Dancing', 'Danse', 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600', 35, 'medium',
 ARRAY['Improves coordination', 'Burns calories', 'Boosts mood', 'Social activity'],
 ARRAY['Legs', 'Core', 'Arms'],
 'Dancing combines cardio with rhythm and coordination for a fun workout.',
 'La danse combine cardio avec rythme et coordination pour un entraînement amusant.'),

('Tennis', 'Tennis', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600', 42, 'medium',
 ARRAY['Improves reflexes', 'Full body workout', 'Builds agility', 'Social sport'],
 ARRAY['Arms', 'Legs', 'Shoulders', 'Core'],
 'Tennis is a dynamic sport that improves agility, speed, and hand-eye coordination.',
 'Le tennis est un sport dynamique qui améliore l''agilité, la vitesse et la coordination oeil-main.'),

('Basketball', 'Basketball', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600', 45, 'medium',
 ARRAY['Improves coordination', 'Builds teamwork', 'Cardio intensive', 'Strengthens legs'],
 ARRAY['Legs', 'Arms', 'Core', 'Shoulders'],
 'Basketball combines sprinting, jumping, and coordination in a team setting.',
 'Le basketball combine sprint, saut et coordination dans un contexte d''équipe.'),

('Football', 'Football', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600', 48, 'medium',
 ARRAY['Builds endurance', 'Improves teamwork', 'Strengthens legs', 'Burns many calories'],
 ARRAY['Legs', 'Core', 'Calves', 'Glutes'],
 'Football (soccer) is the world''s most popular sport, combining cardio with technical skill.',
 'Le football est le sport le plus populaire au monde, combinant cardio et compétences techniques.'),

('Hiking', 'Randonnée', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600', 30, 'medium',
 ARRAY['Connects with nature', 'Strengthens legs', 'Improves mental health', 'Burns calories steadily'],
 ARRAY['Legs', 'Glutes', 'Core', 'Calves'],
 'Hiking combines exercise with nature exploration for physical and mental benefits.',
 'La randonnée combine exercice et exploration de la nature pour des bienfaits physiques et mentaux.'),

('Rowing', 'Aviron', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600', 42, 'medium',
 ARRAY['Full body workout', 'Low impact', 'Builds back strength', 'Improves posture'],
 ARRAY['Back', 'Arms', 'Legs', 'Core'],
 'Rowing engages 86% of your muscles in a single movement.',
 'L''aviron engage 86% de vos muscles en un seul mouvement.'),

('Rock Climbing', 'Escalade', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600', 38, 'medium',
 ARRAY['Builds grip strength', 'Full body workout', 'Problem solving', 'Builds confidence'],
 ARRAY['Arms', 'Back', 'Core', 'Forearms'],
 'Rock climbing challenges both body and mind while building incredible upper body strength.',
 'L''escalade met au défi le corps et l''esprit tout en développant une force incroyable du haut du corps.'),

('Badminton', 'Badminton', 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600', 35, 'medium',
 ARRAY['Improves reflexes', 'Burns calories', 'Low equipment cost', 'Fun activity'],
 ARRAY['Arms', 'Legs', 'Shoulders'],
 'Badminton is a fast-paced racquet sport that improves agility and reflexes.',
 'Le badminton est un sport de raquette rapide qui améliore l''agilité et les réflexes.'),

('Volleyball', 'Volleyball', 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600', 30, 'medium',
 ARRAY['Builds teamwork', 'Improves reflexes', 'Upper body strength', 'Fun beach activity'],
 ARRAY['Arms', 'Shoulders', 'Legs', 'Core'],
 'Volleyball combines jumping, diving, and hitting for a dynamic workout.',
 'Le volleyball combine sauts, plongeons et frappes pour un entraînement dynamique.'),

('Skating', 'Patinage', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600', 32, 'medium',
 ARRAY['Improves balance', 'Low impact cardio', 'Strengthens legs', 'Fun activity'],
 ARRAY['Legs', 'Glutes', 'Core'],
 'Skating is a fun low-impact activity that builds balance and leg strength.',
 'Le patinage est une activité fun à faible impact qui développe l''équilibre et la force des jambes.'),

-- INTENSES
('HIIT', 'HIIT', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600', 60, 'intense',
 ARRAY['Maximum calorie burn', 'Afterburn effect', 'No equipment needed', 'Time efficient'],
 ARRAY['Full body'],
 'High-Intensity Interval Training alternates intense bursts with recovery periods.',
 'L''entraînement par intervalles de haute intensité alterne des poussées intenses avec des périodes de récupération.'),

('Boxing', 'Boxe', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600', 55, 'intense',
 ARRAY['Relieves stress', 'Builds power', 'Improves reflexes', 'Full body workout'],
 ARRAY['Arms', 'Shoulders', 'Core', 'Legs'],
 'Boxing combines cardio with strength training for an intense full-body workout.',
 'La boxe combine cardio et musculation pour un entraînement complet et intense.'),

('Weight Training', 'Musculation', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', 35, 'intense',
 ARRAY['Builds muscle', 'Boosts metabolism', 'Strengthens bones', 'Improves posture'],
 ARRAY['Full body'],
 'Weight training builds muscle mass and increases resting metabolic rate.',
 'La musculation développe la masse musculaire et augmente le métabolisme de repos.'),

('Jump Rope', 'Corde à sauter', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600', 55, 'intense',
 ARRAY['Burns lots of calories', 'Improves coordination', 'Portable equipment', 'Strengthens calves'],
 ARRAY['Calves', 'Legs', 'Shoulders', 'Core'],
 'Jump rope burns more calories per minute than almost any other exercise.',
 'La corde à sauter brûle plus de calories par minute que presque tout autre exercice.'),

('CrossFit', 'CrossFit', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600', 58, 'intense',
 ARRAY['Varied workouts', 'Community driven', 'Builds functional strength', 'Improves all fitness areas'],
 ARRAY['Full body'],
 'CrossFit combines weightlifting, cardio, and gymnastics in intense WODs.',
 'Le CrossFit combine haltérophilie, cardio et gymnastique dans des WODs intenses.'),

('Martial Arts', 'Arts martiaux', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600', 50, 'intense',
 ARRAY['Self-defense skills', 'Discipline', 'Full body workout', 'Mental focus'],
 ARRAY['Full body', 'Core', 'Legs'],
 'Martial arts develop discipline, strength, and self-defense capabilities.',
 'Les arts martiaux développent la discipline, la force et les capacités d''autodéfense.'),

('Sprint Training', 'Sprint', 'https://images.unsplash.com/photo-1461896836934-bd45ba8b1990?w=600', 65, 'intense',
 ARRAY['Maximum calorie burn', 'Builds explosive power', 'Boosts metabolism', 'Time efficient'],
 ARRAY['Legs', 'Glutes', 'Core', 'Hamstrings'],
 'Sprint intervals are the ultimate fat-burning exercise.',
 'Les intervalles de sprint sont l''exercice ultime pour brûler les graisses.'),

('Kickboxing', 'Kickboxing', 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=600', 55, 'intense',
 ARRAY['Full body workout', 'Stress relief', 'Builds confidence', 'Improves flexibility'],
 ARRAY['Legs', 'Arms', 'Core', 'Glutes'],
 'Kickboxing combines punches and kicks for an explosive cardio session.',
 'Le kickboxing combine coups de poing et coups de pied pour une séance cardio explosive.'),

('Battle Ropes', 'Cordes ondulatoires', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600', 52, 'intense',
 ARRAY['Upper body power', 'Core stability', 'Cardiovascular endurance', 'Grip strength'],
 ARRAY['Arms', 'Shoulders', 'Core', 'Back'],
 'Battle ropes provide an intense upper body and cardio workout.',
 'Les cordes ondulatoires offrent un entraînement intense du haut du corps et cardio.'),

('Burpees', 'Burpees', 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600', 60, 'intense',
 ARRAY['No equipment needed', 'Full body exercise', 'Burns maximum calories', 'Builds endurance'],
 ARRAY['Full body'],
 'Burpees are one of the most challenging and effective bodyweight exercises.',
 'Les burpees sont l''un des exercices au poids du corps les plus difficiles et efficaces.'),

('Stair Climbing', 'Montée d''escaliers', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600', 48, 'intense',
 ARRAY['Strengthens legs', 'Burns calories fast', 'Free and accessible', 'Builds cardiovascular fitness'],
 ARRAY['Legs', 'Glutes', 'Calves', 'Core'],
 'Stair climbing is an intense cardio exercise available anywhere with stairs.',
 'La montée d''escaliers est un exercice cardio intense disponible partout où il y a des escaliers.')

ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. ACTIVER RLS (Row Level Security)
-- ============================================================
ALTER TABLE sport_catalog ENABLE ROW LEVEL SECURITY;

-- Lecture publique du catalogue
CREATE POLICY IF NOT EXISTS "sport_catalog_read" ON sport_catalog
  FOR SELECT USING (true);
