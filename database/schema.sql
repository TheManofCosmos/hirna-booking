-- ==============================================================================
-- TNVS TEAM 10: BOOKING, PAYMENTS & CUSTOMER EXPERIENCE
-- Supabase / PostgreSQL Database Schema (DDL)
-- Research Title: Design and Development of a Predictive AI-Driven Booking,
-- Dynamic Fare Collection, and Intelligent Transport Analytics System
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS & CUSTOMER PROFILES (CRM MODULE 3)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    role VARCHAR(30) DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin', 'operator')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    loyalty_tier VARCHAR(30) DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    loyalty_points INT DEFAULT 100,
    total_trips INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 5.00,
    preferred_payment VARCHAR(50) DEFAULT 'GCash',
    is_vip BOOLEAN DEFAULT FALSE,
    emergency_contact VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. DRIVERS & FLEET (INTEGRATION WITH TEAM 7 & 9)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    vehicle_model VARCHAR(100) NOT NULL,
    vehicle_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_class VARCHAR(30) DEFAULT 'Sedan (4-Seater)' CHECK (vehicle_class IN ('Sedan (4-Seater)', 'MPV (6-Seater)', 'Executive (4-Seater)', 'Motorcycle')),
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'offline', 'suspended')),
    current_lat DECIMAL(10,7) DEFAULT 14.5547,
    current_lng DECIMAL(10,7) DEFAULT 121.0244,
    rating_score DECIMAL(3,2) DEFAULT 4.90,
    safety_compliance_score INT DEFAULT 98, -- Output from AI Anomaly Engine
    total_completed_trips INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. BOOKINGS SYSTEM (MODULE 1)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    pickup_address TEXT NOT NULL,
    pickup_lat DECIMAL(10,7) NOT NULL,
    pickup_lng DECIMAL(10,7) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_lat DECIMAL(10,7) NOT NULL,
    dropoff_lng DECIMAL(10,7) NOT NULL,
    vehicle_class VARCHAR(30) NOT NULL,
    distance_km DECIMAL(6,2) NOT NULL,
    estimated_duration_min INT NOT NULL,
    base_fare DECIMAL(8,2) NOT NULL,
    distance_fare DECIMAL(8,2) NOT NULL,
    time_fare DECIMAL(8,2) NOT NULL,
    ai_surge_multiplier DECIMAL(4,2) DEFAULT 1.00,
    ai_surge_reason VARCHAR(255),
    total_fare DECIMAL(8,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'dispatched', 'in_transit', 'completed', 'cancelled')),
    dispatch_timestamp TIMESTAMP WITH TIME ZONE,
    start_timestamp TIMESTAMP WITH TIME ZONE,
    completion_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. PAYMENTS & FARE COLLECTION (MODULE 2 - INTEGRATION WITH TEAM 5)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_ref VARCHAR(50) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(8,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('GCash', 'Maya', 'Credit/Debit Card', 'Cash', 'Corporate Account')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    team5_gl_synced BOOLEAN DEFAULT FALSE, -- General Ledger sync with Team 5
    team5_sync_timestamp TIMESTAMP WITH TIME ZONE,
    payment_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. GPS TELEMETRY & TRIP PLAYBACK (MODULE 4)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gps_telemetry_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed_kmh DECIMAL(5,2) NOT NULL,
    heading INT DEFAULT 0,
    is_anomaly BOOLEAN DEFAULT FALSE, -- Flagged by AI Safety Engine (Speeding/Harsh Brake)
    anomaly_type VARCHAR(100),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. CRM FEEDBACK & SUPPORT TICKETS (MODULE 3)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    ai_sentiment VARCHAR(30) CHECK (ai_sentiment IN ('Positive', 'Neutral', 'Negative', 'Critical')),
    ai_sentiment_score DECIMAL(4,2), -- -1.00 to +1.00
    ai_category VARCHAR(50),         -- Safety, Driver Attitude, Fare Dispute, Cleanliness
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_code VARCHAR(30) UNIQUE NOT NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    description TEXT NOT NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------------------------------------------
-- 7. SOP COMPLIANCE & AUDIT LOGS (MODULE 6 - INTEGRATION WITH TEAM 8)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_name VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    user_identifier VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    details JSONB,
    status VARCHAR(30) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sop_compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    inspection_type VARCHAR(100) NOT NULL,
    status VARCHAR(30) DEFAULT 'Compliant' CHECK (status IN ('Compliant', 'Warning', 'Non-Compliant')),
    checklist_results JSONB,
    inspector_name VARCHAR(100) DEFAULT 'Automated AI Telemetry & SOP System',
    document_hash VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. BPA INTER-TEAM INTEGRATION SYNC RECORDS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bpa_integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_team VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    response_code INT DEFAULT 200,
    status VARCHAR(30) DEFAULT 'SYNCED',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_booking ON gps_telemetry_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payment_transactions(booking_id);
