-- ====================================================================
-- RespondaCare — Supabase (PostgreSQL) Database Schema & SQL RPC
-- Translated exactly from your SQL Server v1.1.3 Schema
-- De La Salle–College of Saint Benilde | ISPROJ2 | CS Capstone Project
-- Compliant with RA 10173 (Philippine Data Privacy Act)
-- ====================================================================

-- 1. Create Schema Namespaces
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS health;
CREATE SCHEMA IF NOT EXISTS emergency;

-- ====================================================================
-- 2. LOOKUP TABLES (Ported to PostgreSQL)
-- ====================================================================

-- core.barangays
CREATE TABLE IF NOT EXISTS core.barangays (
    barangay_id SERIAL PRIMARY KEY,
    barangay_name VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) DEFAULT 'Pasay City'
);

-- security.roles
CREATE TABLE IF NOT EXISTS security.roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) NOT NULL UNIQUE
);

-- emergency.incident_types
CREATE TABLE IF NOT EXISTS emergency.incident_types (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

-- ====================================================================
-- 3. THE USERS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS security.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INT NOT NULL REFERENCES security.roles(role_id),
    password_hash TEXT NOT NULL,
    mfa_secret VARCHAR(64) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    modified_at TIMESTAMP WITH TIME ZONE NULL
);

-- ====================================================================
-- 4. THE RESIDENTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS core.residents (
    resident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES security.users(user_id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    barangay_id INT NOT NULL REFERENCES core.barangays(barangay_id),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NULL,
    contact_number VARCHAR(20) NULL,
    household_type VARCHAR(20) CHECK (household_type IN ('Family', 'Shared', 'Alone')),
    mobility_status VARCHAR(30) DEFAULT 'Mobile',
    next_of_kin_name VARCHAR(120) NULL,
    next_of_kin_relationship VARCHAR(50) NULL,
    next_of_kin_contact_number VARCHAR(20) NULL,
    consent_given BOOLEAN DEFAULT FALSE CHECK (consent_given = TRUE), -- Strict DPA enforcement
    enrolled_by UUID REFERENCES security.users(user_id) ON DELETE SET NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 5. THE HEALTH PROFILES (SAMPLE History — Encrypted Client Payloads)
-- ====================================================================
CREATE TABLE IF NOT EXISTS health.profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID UNIQUE NOT NULL REFERENCES core.residents(resident_id) ON DELETE CASCADE,
    blood_type VARCHAR(5) NULL,
    signs_symptoms TEXT NOT NULL DEFAULT 'None recorded', -- Storing Base64 GCM Encrypted payload
    allergies TEXT NOT NULL DEFAULT 'None recorded',       -- Storing Base64 GCM Encrypted payload
    medications TEXT NOT NULL DEFAULT 'None recorded',     -- Storing Base64 GCM Encrypted payload
    past_medical_hx TEXT NOT NULL DEFAULT 'None recorded',  -- Storing Base64 GCM Encrypted payload
    last_intake TEXT NULL,
    events_leading TEXT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES security.users(user_id) ON DELETE SET NULL
);

-- ====================================================================
-- 6. EMERGENCY INCIDENTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS emergency.incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES core.residents(resident_id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES security.users(user_id),
    type_id INT NOT NULL REFERENCES emergency.incident_types(type_id),
    severity_score SMALLINT CHECK (severity_score BETWEEN 1 AND 5),
    status VARCHAR(20) DEFAULT 'Pending',
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    nature_of_call VARCHAR(50) NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- ====================================================================
-- 7. PATIENT CARE REPORTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS emergency.patient_care_reports (
    pcr_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL UNIQUE REFERENCES emergency.incidents(incident_id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES core.residents(resident_id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES security.users(user_id) ON DELETE SET NULL,
    
    c_spine_status VARCHAR(50) NULL,
    airway_status VARCHAR(50) NULL,
    breathing_status VARCHAR(50) NULL,
    circulation_pulse VARCHAR(50) NULL,
    skin_condition VARCHAR(50) NULL,
    capillary_refill VARCHAR(20) NULL,
    
    level_of_consciousness VARCHAR(50) NULL, 
    chief_complaint TEXT NULL,
    mechanism_of_injury VARCHAR(100) NULL,
    burn_percentage DECIMAL(5,2) NULL,
    
    interventions_performed TEXT NULL,
    narrative_notes TEXT NULL,
    response_outcome VARCHAR(30) NOT NULL CHECK (response_outcome IN ('Successful','Partially Successful','Failed')),
    patient_disposition VARCHAR(40) NOT NULL CHECK (patient_disposition IN ('Treated On-Scene','Transported to Hospital', 'Deceased','Refused Transport')),
    
    hospital_name VARCHAR(120) NULL,
    receiving_provider VARCHAR(120) NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 8. VITAL SIGNS
-- ====================================================================
CREATE TABLE IF NOT EXISTS emergency.vital_signs (
    vital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pcr_id UUID NOT NULL REFERENCES emergency.patient_care_reports(pcr_id) ON DELETE CASCADE,
    observation_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    pulse_rate INT NULL,
    respiratory_rate INT NULL,
    blood_pressure VARCHAR(20) NULL,
    spo2 INT NULL,
    temperature DECIMAL(4,1) NULL,
    blood_glucose VARCHAR(20) NULL,
    gcs_total INT NULL,
    pain_score INT CHECK (pain_score BETWEEN 0 AND 10)
);

-- ====================================================================
-- 9. AUDIT LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS security.audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES security.users(user_id) ON DELETE CASCADE,
    action_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 10. INDEXES (Optimized for PostgreSQL queries)
-- ====================================================================
CREATE INDEX IF NOT EXISTS ix_users_role ON security.users(role_id);
CREATE INDEX IF NOT EXISTS ix_residents_barangay ON core.residents(barangay_id);
CREATE INDEX IF NOT EXISTS ix_incidents_status ON emergency.incidents(status);
CREATE INDEX IF NOT EXISTS ix_vital_signs_pcr ON emergency.vital_signs(pcr_id);
CREATE INDEX IF NOT EXISTS ix_pcr_incident ON emergency.patient_care_reports(incident_id);

-- ====================================================================
-- 11. TRANSACTIONAL PL/PGSQL RPC
-- ====================================================================

-- Stored procedure to merge sequential client writes into a single atomic transaction block.
CREATE OR REPLACE FUNCTION security.enroll_resident(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_password_hash TEXT,
  p_resident_id UUID,
  p_address TEXT,
  p_barangay_id INT,
  p_date_of_birth DATE,
  p_gender TEXT,
  p_contact_number TEXT,
  p_household_type TEXT,
  p_mobility_status TEXT,
  p_next_of_kin_name TEXT,
  p_next_of_kin_relationship TEXT,
  p_next_of_kin_contact_number TEXT,
  p_profile_id UUID,
  p_blood_type TEXT,
  p_signs_symptoms TEXT,
  p_allergies TEXT,
  p_medications TEXT,
  p_past_medical_hx TEXT,
  p_last_intake TEXT,
  p_events_leading TEXT,
  p_enrolled_by UUID
) RETURNS VOID AS $$
BEGIN
  -- Insert into security.users
  INSERT INTO security.users (user_id, full_name, email, role_id, password_hash, is_active)
  VALUES (p_user_id, p_full_name, p_email, 3, p_password_hash, TRUE);

  -- Insert into core.residents
  INSERT INTO core.residents (
    resident_id, user_id, address, barangay_id, date_of_birth, gender, contact_number,
    household_type, mobility_status, next_of_kin_name, next_of_kin_relationship,
    next_of_kin_contact_number, consent_given, enrolled_by
  ) VALUES (
    p_resident_id, p_user_id, p_address, p_barangay_id, p_date_of_birth, p_gender, p_contact_number,
    p_household_type, p_mobility_status, p_next_of_kin_name, p_next_of_kin_relationship,
    p_next_of_kin_contact_number, TRUE, p_enrolled_by
  );

  -- Insert into health.profiles
  INSERT INTO health.profiles (
    profile_id, resident_id, blood_type, signs_symptoms, allergies, medications,
    past_medical_hx, last_intake, events_leading, updated_by
  ) VALUES (
    p_profile_id, p_resident_id, p_blood_type, p_signs_symptoms, p_allergies, p_medications,
    p_past_medical_hx, p_last_intake, p_events_leading, p_enrolled_by
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 12. SEED DATA
-- ====================================================================

-- Roles: Admin = 1, BHW = 2, Resident = 3, FirstResponder = 4
INSERT INTO security.roles (role_id, role_name) VALUES 
(1, 'Admin'), 
(2, 'BHW'), 
(3, 'Resident'), 
(4, 'FirstResponder')
ON CONFLICT (role_id) DO NOTHING;

-- Barangays
INSERT INTO core.barangays (barangay_id, barangay_name) VALUES 
(1, 'Barangay 45')
ON CONFLICT (barangay_id) DO NOTHING;

-- Incident types
INSERT INTO emergency.incident_types (type_id, type_name) VALUES 
(1, 'Medical'), 
(2, 'Fire'), 
(3, 'Trauma'), 
(4, 'OB/GYNE'), 
(5, 'Respiratory')
ON CONFLICT (type_id) DO NOTHING;

-- Seed Accounts
INSERT INTO security.users (user_id, full_name, email, role_id, password_hash, is_active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Admin Operator', 'admin@respondacare.ph', 1, 'password123_hash', TRUE),
('22222222-2222-2222-2222-222222222222', 'John Doe ERU', 'responder@respondacare.ph', 4, 'password123_hash', TRUE),
('33333333-3333-3333-3333-333333333333', 'Juan Dela Cruz', 'resident@respondacare.ph', 3, 'password123_hash', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO core.residents (resident_id, user_id, address, barangay_id, date_of_birth, gender, contact_number, household_type, mobility_status, consent_given)
VALUES ('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '123 Rizal Ave, Pasay City', 1, '1981-05-15', 'Male', '0917-123-4567', 'Family', 'Mobile', TRUE)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO health.profiles (profile_id, resident_id, blood_type, signs_symptoms, allergies, medications, past_medical_hx, last_intake, events_leading)
VALUES ('55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 'O+', 'Sudden cold sweat, confusion', 'Sulfa drugs, Shellfish, Latex', 'Metformin 500mg, Atorvastatin 20mg', 'Type 2 Diabetes mellitus, Hypertension', 'Rice and Chicken at 12:30 PM', 'Heat exhaustion & hypoglycemia')
ON CONFLICT (resident_id) DO NOTHING;
