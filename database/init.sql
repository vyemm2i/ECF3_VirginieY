-- ============================================
-- MediBook - Script d'initialisation de la base de données
-- ============================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users (utilisateurs)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'practitioner', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- TABLE: specialties (spécialités médicales)
-- ============================================
CREATE TABLE specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: practitioners (praticiens)
-- ============================================
CREATE TABLE practitioners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty_id UUID NOT NULL REFERENCES specialties(id),
    license_number VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    consultation_duration INTEGER DEFAULT 30, -- en minutes
    consultation_price DECIMAL(10, 2) DEFAULT 25.00,
    accepts_new_patients BOOLEAN DEFAULT true,
    teleconsultation_available BOOLEAN DEFAULT false,
    office_address TEXT,
    office_city VARCHAR(100),
    office_postal_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Index pour les recherches de praticiens
CREATE INDEX idx_practitioners_specialty ON practitioners(specialty_id);
CREATE INDEX idx_practitioners_city ON practitioners(office_city);
CREATE INDEX idx_practitioners_accepts_new ON practitioners(accepts_new_patients);

-- ============================================
-- TABLE: availability_slots (créneaux de disponibilité)
-- ============================================
CREATE TABLE availability_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = dimanche
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (start_time < end_time)
);

CREATE INDEX idx_availability_practitioner ON availability_slots(practitioner_id);
CREATE INDEX idx_availability_day ON availability_slots(day_of_week);

-- ============================================
-- TABLE: appointments (rendez-vous)
-- ============================================
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    type VARCHAR(20) DEFAULT 'in_person' CHECK (type IN ('in_person', 'teleconsultation')),
    reason TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les recherches de rendez-vous
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_practitioner ON appointments(practitioner_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Contrainte d'unicité pour éviter les doublons de rendez-vous
CREATE UNIQUE INDEX idx_unique_appointment ON appointments(practitioner_id, appointment_date, start_time) 
WHERE status NOT IN ('cancelled');

-- ============================================
-- TABLE: reviews (avis)
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(appointment_id)
);

CREATE INDEX idx_reviews_practitioner ON reviews(practitioner_id);

-- ============================================
-- TABLE: notifications (notifications)
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- TABLE: email_logs (historique des emails)
-- ============================================
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email_to VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FONCTION: Mise à jour automatique du updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practitioners_updated_at BEFORE UPDATE ON practitioners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FONCTION: Mise à jour de la moyenne des avis
-- ============================================
CREATE OR REPLACE FUNCTION update_practitioner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE practitioners
    SET average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE practitioner_id = NEW.practitioner_id
    ),
    total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE practitioner_id = NEW.practitioner_id
    )
    WHERE id = NEW.practitioner_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rating_after_review
AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_practitioner_rating();
