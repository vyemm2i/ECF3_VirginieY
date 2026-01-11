-- ============================================
-- MediBook - Données de test (Seed)
-- ============================================

-- ============================================
-- SPÉCIALITÉS MÉDICALES
-- ============================================
INSERT INTO specialties (id, name, description, icon) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Médecin généraliste', 'Médecine générale et soins primaires', 'stethoscope'),
    ('22222222-2222-2222-2222-222222222222', 'Dermatologue', 'Spécialiste de la peau et des maladies cutanées', 'hand'),
    ('33333333-3333-3333-3333-333333333333', 'Cardiologue', 'Spécialiste du cœur et du système cardiovasculaire', 'heart'),
    ('44444444-4444-4444-4444-444444444444', 'Ophtalmologue', 'Spécialiste des yeux et de la vision', 'eye'),
    ('55555555-5555-5555-5555-555555555555', 'Dentiste', 'Soins dentaires et bucco-dentaires', 'tooth'),
    ('66666666-6666-6666-6666-666666666666', 'Kinésithérapeute', 'Rééducation et thérapie physique', 'activity'),
    ('77777777-7777-7777-7777-777777777777', 'Psychologue', 'Santé mentale et accompagnement psychologique', 'brain'),
    ('88888888-8888-8888-8888-888888888888', 'Pédiatre', 'Médecine des enfants et adolescents', 'baby'),
    ('99999999-9999-9999-9999-999999999999', 'Gynécologue', 'Santé de la femme et suivi gynécologique', 'heart-pulse'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ORL', 'Spécialiste oreilles, nez et gorge', 'ear');

-- ============================================
-- UTILISATEURS
-- ============================================

-- Patients
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, date_of_birth, gender, address, city, postal_code, is_active, is_verified) VALUES
('01111111-1111-1111-1111-111111111111', 'jean.dupont@email.com', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'patient', 'Jean', 'Dupont', '0612345678', '1985-03-15', 'male', '12 rue de la Paix', 'Paris', '75001', true, true),
('02222222-2222-2222-2222-222222222222', 'marie.martin@email.com', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'patient', 'Marie', 'Martin', '0623456789', '1990-07-22', 'female', '45 avenue Victor Hugo', 'Lyon', '69001', true, true),
('03333333-3333-3333-3333-333333333333', 'pierre.durand@email.com', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'patient', 'Pierre', 'Durand', '0634567890', '1978-11-08', 'male', '8 boulevard Gambetta', 'Marseille', '13001', true, true),
('04444444-4444-4444-4444-444444444444', 'sophie.bernard@email.com', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'patient', 'Sophie', 'Bernard', '0645678901', '1995-02-28', 'female', '23 rue du Commerce', 'Bordeaux', '33000', true, true),
('05555555-5555-5555-5555-555555555555', 'lucas.petit@email.com', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'patient', 'Lucas', 'Petit', '0656789012', '2000-09-10', 'male', '67 rue Nationale', 'Lille', '59000', true, false);

-- Praticiens (users)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, date_of_birth, gender, is_active, is_verified) VALUES
('d1111111-1111-1111-1111-111111111111', 'dr.martin@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'practitioner', 'Claire', 'Martin', '0601020304', '1975-06-20', 'female', true, true),
('d2222222-2222-2222-2222-222222222222', 'dr.dubois@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'practitioner', 'François', 'Dubois', '0602030405', '1968-12-05', 'male', true, true),
('d3333333-3333-3333-3333-333333333333', 'dr.leroy@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'practitioner', 'Isabelle', 'Leroy', '0603040506', '1980-04-18', 'female', true, true),
('d4444444-4444-4444-4444-444444444444', 'dr.moreau@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'practitioner', 'Philippe', 'Moreau', '0604050607', '1972-08-30', 'male', true, true),
('d5555555-5555-5555-5555-555555555555', 'dr.simon@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'practitioner', 'Nathalie', 'Simon', '0605060708', '1983-01-12', 'female', true, true),
('d6666666-6666-6666-6666-666666666666', 'dr.laurent@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'practitioner', 'Thomas', 'Laurent', '0606070809', '1979-09-25', 'male', true, true);

-- Admin
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, is_active, is_verified) VALUES
('a1111111-1111-1111-1111-111111111111', 'admin@medibook.fr', '$2b$10$Q1S4Qd0SgITJ1THlgOgkxekioi6ZwEiJV.mMpabqcd.IWi4xGB3KO', 'admin', 'Admin', 'MediBook', '0600000000', true, true);

-- ============================================
-- PRATICIENS (profils)
-- ============================================
INSERT INTO practitioners (id, user_id, specialty_id, license_number, bio, consultation_duration, consultation_price, accepts_new_patients, teleconsultation_available, office_address, office_city, office_postal_code, latitude, longitude, average_rating, total_reviews) VALUES
    ('00111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'MED-2024-001', 'Médecin généraliste avec 20 ans d''expérience. Spécialisée dans la médecine préventive et le suivi des maladies chroniques.', 30, 25.00, true, true, '15 rue de Rivoli', 'Paris', '75004', 48.8566, 2.3522, 4.8, 45),
    ('00222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'CAR-2024-002', 'Cardiologue spécialisé dans la prévention des maladies cardiovasculaires. Expertise en échocardiographie.', 45, 80.00, true, false, '78 avenue des Champs-Élysées', 'Paris', '75008', 48.8698, 2.3075, 4.6, 32),
    ('00333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'DER-2024-003', 'Dermatologue experte en dermatologie esthétique et médicale. Prise en charge de l''acné, eczéma et psoriasis.', 30, 60.00, true, true, '25 place Bellecour', 'Lyon', '69002', 45.7578, 4.8320, 4.9, 67),
    ('00444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'DEN-2024-004', 'Chirurgien-dentiste spécialisé en implantologie et esthétique dentaire. Cabinet équipé des dernières technologies.', 45, 50.00, true, false, '12 cours Mirabeau', 'Marseille', '13001', 43.2965, 5.3698, 4.7, 89),
    ('00555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'PSY-2024-005', 'Psychologue clinicienne. Thérapies cognitivo-comportementales, gestion du stress et anxiété.', 60, 70.00, true, true, '5 rue Sainte-Catherine', 'Bordeaux', '33000', 44.8378, -0.5792, 4.5, 23),
    ('00666666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'MED-2024-006', 'Médecin généraliste, approche holistique de la santé. Consultations en français et anglais.', 30, 25.00, true, true, '34 rue Faidherbe', 'Lille', '59000', 50.6292, 3.0573, 4.4, 28);

-- ============================================
-- CRÉNEAUX DE DISPONIBILITÉ
-- ============================================
-- Dr. Martin (généraliste Paris) - Lundi à Vendredi
INSERT INTO availability_slots (practitioner_id, day_of_week, start_time, end_time) VALUES
    ('00111111-1111-1111-1111-111111111111', 1, '09:00', '12:30'),
    ('00111111-1111-1111-1111-111111111111', 1, '14:00', '18:00'),
    ('00111111-1111-1111-1111-111111111111', 2, '09:00', '12:30'),
    ('00111111-1111-1111-1111-111111111111', 2, '14:00', '18:00'),
    ('00111111-1111-1111-1111-111111111111', 3, '09:00', '12:30'),
    ('00111111-1111-1111-1111-111111111111', 3, '14:00', '18:00'),
    ('00111111-1111-1111-1111-111111111111', 4, '09:00', '12:30'),
    ('00111111-1111-1111-1111-111111111111', 4, '14:00', '18:00'),
    ('00111111-1111-1111-1111-111111111111', 5, '09:00', '12:30');

-- Dr. Dubois (cardiologue Paris)
INSERT INTO availability_slots (practitioner_id, day_of_week, start_time, end_time) VALUES
    ('00222222-2222-2222-2222-222222222222', 1, '08:30', '12:00'),
    ('00222222-2222-2222-2222-222222222222', 2, '14:00', '18:00'),
    ('00222222-2222-2222-2222-222222222222', 4, '08:30', '12:00'),
    ('00222222-2222-2222-2222-222222222222', 5, '14:00', '18:00');

-- Dr. Leroy (dermatologue Lyon)
INSERT INTO availability_slots (practitioner_id, day_of_week, start_time, end_time) VALUES
    ('00333333-3333-3333-3333-333333333333', 1, '09:00', '13:00'),
    ('00333333-3333-3333-3333-333333333333', 2, '09:00', '13:00'),
    ('00333333-3333-3333-3333-333333333333', 3, '14:00', '19:00'),
    ('00333333-3333-3333-3333-333333333333', 4, '09:00', '13:00'),
    ('00333333-3333-3333-3333-333333333333', 5, '09:00', '13:00');

-- Dr. Moreau (dentiste Marseille)
INSERT INTO availability_slots (practitioner_id, day_of_week, start_time, end_time) VALUES
    ('00444444-4444-4444-4444-444444444444', 1, '09:00', '12:00'),
    ('00444444-4444-4444-4444-444444444444', 1, '14:00', '18:00'),
    ('00444444-4444-4444-4444-444444444444', 2, '09:00', '12:00'),
    ('00444444-4444-4444-4444-444444444444', 3, '09:00', '12:00'),
    ('00444444-4444-4444-4444-444444444444', 3, '14:00', '18:00'),
    ('00444444-4444-4444-4444-444444444444', 5, '09:00', '12:00');

-- Dr. Simon (psychologue Bordeaux)
INSERT INTO availability_slots (practitioner_id, day_of_week, start_time, end_time) VALUES
    ('00555555-5555-5555-5555-555555555555', 1, '10:00', '13:00'),
    ('00555555-5555-5555-5555-555555555555', 1, '15:00', '19:00'),
    ('00555555-5555-5555-5555-555555555555', 3, '10:00', '13:00'),
    ('00555555-5555-5555-5555-555555555555', 3, '15:00', '19:00'),
    ('00555555-5555-5555-5555-555555555555', 5, '10:00', '13:00');

-- Dr. Laurent (généraliste Lille)
INSERT INTO availability_slots (practitioner_id, day_of_week, start_time, end_time) VALUES
    ('00666666-6666-6666-6666-666666666666', 1, '08:00', '12:00'),
    ('00666666-6666-6666-6666-666666666666', 2, '08:00', '12:00'),
    ('00666666-6666-6666-6666-666666666666', 2, '14:00', '17:00'),
    ('00666666-6666-6666-6666-666666666666', 4, '08:00', '12:00'),
    ('00666666-6666-6666-6666-666666666666', 4, '14:00', '17:00'),
    ('00666666-6666-6666-6666-666666666666', 5, '08:00', '12:00');

-- ============================================
-- RENDEZ-VOUS (exemples)
-- ============================================
INSERT INTO appointments (id, patient_id, practitioner_id, appointment_date, start_time, end_time, status, type, reason) VALUES
    ('a0011111-1111-1111-1111-111111111111', '01111111-1111-1111-1111-111111111111', '00111111-1111-1111-1111-111111111111', CURRENT_DATE + INTERVAL '3 days', '09:30', '10:00', 'confirmed', 'in_person', 'Consultation de routine'),
    ('a0022222-2222-2222-2222-222222222222', '02222222-2222-2222-2222-222222222222', '00333333-3333-3333-3333-333333333333', CURRENT_DATE + INTERVAL '5 days', '10:00', '10:30', 'confirmed', 'in_person', 'Problème de peau'),
    ('a0033333-3333-3333-3333-333333333333', '01111111-1111-1111-1111-111111111111', '00222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '10 days', '09:00', '09:45', 'completed', 'in_person', 'Bilan cardiaque'),
    ('a0044444-4444-4444-4444-444444444444', '03333333-3333-3333-3333-333333333333', '00555555-5555-5555-5555-555555555555', CURRENT_DATE + INTERVAL '7 days', '16:00', '17:00', 'pending', 'teleconsultation', 'Première consultation'),
    ('a0055555-5555-5555-5555-555555555555', '04444444-4444-4444-4444-444444444444', '00444444-4444-4444-4444-444444444444', CURRENT_DATE - INTERVAL '5 days', '11:00', '11:45', 'completed', 'in_person', 'Détartrage');

-- ============================================
-- AVIS
-- ============================================
INSERT INTO reviews (appointment_id, patient_id, practitioner_id, rating, comment) VALUES
    ('a0033333-3333-3333-3333-333333333333', '01111111-1111-1111-1111-111111111111', '00222222-2222-2222-2222-222222222222', 5, 'Excellent cardiologue, très à l''écoute et professionnel. Je recommande vivement.'),
    ('a0055555-5555-5555-5555-555555555555', '04444444-4444-4444-4444-444444444444', '00444444-4444-4444-4444-444444444444', 4, 'Bon dentiste, cabinet moderne. Un peu d''attente mais soins de qualité.');

-- ============================================
-- NOTIFICATIONS (exemples)
-- ============================================
INSERT INTO notifications (user_id, type, title, message, data) VALUES
    ('01111111-1111-1111-1111-111111111111', 'appointment_confirmed', 'Rendez-vous confirmé', 'Votre rendez-vous avec Dr. Claire Martin a été confirmé.', '{"appointment_id": "a0011111-1111-1111-1111-111111111111"}'),
    ('01111111-1111-1111-1111-111111111111', 'appointment_reminder', 'Rappel de rendez-vous', 'N''oubliez pas votre rendez-vous demain à 09h30.', '{"appointment_id": "a0011111-1111-1111-1111-111111111111"}');
