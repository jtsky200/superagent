-- CADILLAC EV CIS Database Schema
-- PostgreSQL 15+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location data (optional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- ===== ENUMS =====

CREATE TYPE customer_type AS ENUM ('private', 'business');
CREATE TYPE legal_form AS ENUM ('AG', 'GmbH', 'Sàrl', 'SA', 'Einzelfirma', 'Kollektivgesellschaft', 'Kommanditgesellschaft', 'Genossenschaft', 'Verein', 'Stiftung');
CREATE TYPE credit_rating AS ENUM ('AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D');
CREATE TYPE vehicle_variant AS ENUM ('Luxury', 'Premium', 'Sport', 'Standard');
CREATE TYPE option_category AS ENUM ('exterior', 'interior', 'technology', 'performance', 'safety', 'comfort');
CREATE TYPE configuration_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'ordered');
CREATE TYPE swiss_canton AS ENUM ('AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH');
CREATE TYPE tax_calculation_method AS ENUM ('POWER', 'WEIGHT', 'COMBINED', 'FLAT_RATE');
CREATE TYPE analysis_type AS ENUM ('financial', 'behavioral', 'predictive', 'comprehensive');
CREATE TYPE insight_category AS ENUM ('financial_capacity', 'purchase_intent', 'brand_affinity', 'lifestyle', 'business_needs');
CREATE TYPE impact_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE recommendation_type AS ENUM ('vehicle_recommendation', 'financing_option', 'sales_approach', 'timing', 'pricing_strategy');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE risk_level AS ENUM ('very_low', 'low', 'medium', 'high', 'very_high');
CREATE TYPE sales_approach AS ENUM ('consultative', 'relationship', 'solution', 'value', 'technical');
CREATE TYPE sales_phase AS ENUM ('awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'system');

-- ===== CORE TABLES =====

-- Users (for authentication and authorization)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    canton swiss_canton,
    country VARCHAR(50) DEFAULT 'Schweiz',
    customer_type customer_type NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies (for business customers)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    uid_number VARCHAR(20) UNIQUE, -- UID/HR-Nummer
    vat_number VARCHAR(20), -- MwSt-Nummer
    legal_form legal_form,
    founding_date DATE,
    employees_count INTEGER,
    annual_revenue NUMERIC(15,2),
    industry_code VARCHAR(10), -- NOGA-Code
    industry_description TEXT,
    credit_rating credit_rating,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company contacts
CREATE TABLE company_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT false,
    is_decision_maker BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles (CADILLAC EV models)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_year INTEGER NOT NULL,
    model_variant vehicle_variant NOT NULL,
    battery_capacity_kwh NUMERIC(6,2) NOT NULL,
    wltp_range_km INTEGER NOT NULL,
    power_kw INTEGER NOT NULL,
    power_ps INTEGER NOT NULL,
    torque_nm INTEGER NOT NULL,
    weight_kg INTEGER NOT NULL,
    base_price_chf NUMERIC(10,2) NOT NULL,
    energy_consumption_kwh_100km NUMERIC(4,1) NOT NULL,
    charging_power_ac_kw NUMERIC(5,1) NOT NULL,
    charging_power_dc_kw NUMERIC(5,1) NOT NULL,
    acceleration_0_100_sec NUMERIC(3,1),
    top_speed_kmh INTEGER,
    cargo_capacity_liters INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle options
CREATE TABLE vehicle_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_chf NUMERIC(8,2) NOT NULL,
    category option_category NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle configurations
CREATE TABLE vehicle_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    customer_id UUID REFERENCES customers(id),
    exterior_color VARCHAR(100),
    interior_color VARCHAR(100),
    wheel_size INTEGER,
    options JSONB, -- Array of option IDs
    total_price_chf NUMERIC(10,2) NOT NULL,
    configuration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status configuration_status DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Swiss cantons data
CREATE TABLE cantons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    abbreviation swiss_canton UNIQUE NOT NULL,
    vehicle_tax_calculation_method tax_calculation_method NOT NULL,
    vehicle_tax_factor_power NUMERIC(6,3),
    vehicle_tax_factor_weight NUMERIC(6,3),
    vehicle_tax_base_fee NUMERIC(8,2),
    ev_tax_discount NUMERIC(5,2) NOT NULL DEFAULT 0, -- Percentage
    ev_tax_discount_years INTEGER,
    registration_fee NUMERIC(6,2) NOT NULL,
    license_plate_fee NUMERIC(6,2) NOT NULL,
    average_electricity_price_per_kwh NUMERIC(4,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TCO calculations
CREATE TABLE tco_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    vehicle_id UUID REFERENCES vehicles(id),
    canton swiss_canton NOT NULL,
    duration_years INTEGER NOT NULL,
    annual_kilometers INTEGER NOT NULL,
    charging_mix JSONB NOT NULL, -- {homeCharging: %, publicCharging: %, fastCharging: %}
    one_time_costs JSONB NOT NULL,
    annual_costs JSONB NOT NULL,
    energy_costs JSONB NOT NULL,
    depreciation JSONB NOT NULL,
    total_tco NUMERIC(12,2) NOT NULL,
    tco_per_month NUMERIC(10,2) NOT NULL,
    tco_per_kilometer NUMERIC(6,3) NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer analyses (AI-generated)
CREATE TABLE customer_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    analysis_type analysis_type NOT NULL,
    confidence NUMERIC(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    insights JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    risk_assessment JSONB NOT NULL,
    sales_strategy JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- External data cache (for Swiss APIs)
CREATE TABLE external_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_source VARCHAR(100) NOT NULL, -- 'handelsregister', 'zek', 'crif', etc.
    cache_key VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDEXES =====

-- Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_canton ON customers(canton);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Companies
CREATE INDEX idx_companies_customer_id ON companies(customer_id);
CREATE INDEX idx_companies_uid_number ON companies(uid_number);
CREATE INDEX idx_companies_vat_number ON companies(vat_number);
CREATE INDEX idx_companies_name ON companies(company_name);

-- Company contacts
CREATE INDEX idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX idx_company_contacts_email ON company_contacts(email);
CREATE INDEX idx_company_contacts_primary ON company_contacts(is_primary);

-- Vehicles
CREATE INDEX idx_vehicles_model_name ON vehicles(model_name);
CREATE INDEX idx_vehicles_model_year ON vehicles(model_year);
CREATE INDEX idx_vehicles_variant ON vehicles(model_variant);
CREATE INDEX idx_vehicles_active ON vehicles(is_active);

-- Vehicle configurations
CREATE INDEX idx_vehicle_configurations_vehicle_id ON vehicle_configurations(vehicle_id);
CREATE INDEX idx_vehicle_configurations_customer_id ON vehicle_configurations(customer_id);
CREATE INDEX idx_vehicle_configurations_status ON vehicle_configurations(status);

-- TCO calculations
CREATE INDEX idx_tco_calculations_customer_id ON tco_calculations(customer_id);
CREATE INDEX idx_tco_calculations_vehicle_id ON tco_calculations(vehicle_id);
CREATE INDEX idx_tco_calculations_canton ON tco_calculations(canton);
CREATE INDEX idx_tco_calculations_date ON tco_calculations(calculation_date);

-- Customer analyses
CREATE INDEX idx_customer_analyses_customer_id ON customer_analyses(customer_id);
CREATE INDEX idx_customer_analyses_type ON customer_analyses(analysis_type);
CREATE INDEX idx_customer_analyses_created_at ON customer_analyses(created_at);

-- External data cache
CREATE INDEX idx_external_data_cache_source_key ON external_data_cache(data_source, cache_key);
CREATE INDEX idx_external_data_cache_expires_at ON external_data_cache(expires_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ===== TRIGGERS =====

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_contacts_updated_at BEFORE UPDATE ON company_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_options_updated_at BEFORE UPDATE ON vehicle_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_configurations_updated_at BEFORE UPDATE ON vehicle_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cantons_updated_at BEFORE UPDATE ON cantons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tco_calculations_updated_at BEFORE UPDATE ON tco_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_analyses_updated_at BEFORE UPDATE ON customer_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== VIEWS =====

-- Customer overview with company information
CREATE VIEW customer_overview AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.city,
    c.canton,
    c.customer_type,
    c.created_at,
    co.company_name,
    co.uid_number,
    co.legal_form,
    co.employees_count,
    co.annual_revenue,
    co.credit_rating
FROM customers c
LEFT JOIN companies co ON c.id = co.customer_id;

-- Vehicle configurations with vehicle details
CREATE VIEW vehicle_configuration_details AS
SELECT 
    vc.id,
    vc.customer_id,
    vc.exterior_color,
    vc.interior_color,
    vc.wheel_size,
    vc.total_price_chf,
    vc.status,
    vc.configuration_date,
    v.model_name,
    v.model_variant,
    v.model_year,
    v.base_price_chf,
    v.wltp_range_km,
    v.power_kw,
    v.power_ps
FROM vehicle_configurations vc
JOIN vehicles v ON vc.vehicle_id = v.id;

-- TCO summary by canton
CREATE VIEW tco_summary_by_canton AS
SELECT 
    canton,
    COUNT(*) as calculation_count,
    AVG(total_tco) as avg_total_tco,
    AVG(tco_per_month) as avg_tco_per_month,
    AVG(tco_per_kilometer) as avg_tco_per_kilometer,
    MIN(total_tco) as min_total_tco,
    MAX(total_tco) as max_total_tco
FROM tco_calculations
GROUP BY canton;

-- ===== FUNCTIONS =====

-- Function to calculate vehicle tax for a specific canton
CREATE OR REPLACE FUNCTION calculate_vehicle_tax(
    p_power_kw INTEGER,
    p_weight_kg INTEGER,
    p_canton swiss_canton
) RETURNS NUMERIC AS $$
DECLARE
    canton_data RECORD;
    base_tax NUMERIC := 0;
    final_tax NUMERIC := 0;
BEGIN
    -- Get canton data
    SELECT * INTO canton_data FROM cantons WHERE abbreviation = p_canton;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate base tax based on method
    CASE canton_data.vehicle_tax_calculation_method
        WHEN 'POWER' THEN
            base_tax := p_power_kw * COALESCE(canton_data.vehicle_tax_factor_power, 0);
        WHEN 'WEIGHT' THEN
            base_tax := p_weight_kg * COALESCE(canton_data.vehicle_tax_factor_weight, 0);
        WHEN 'COMBINED' THEN
            base_tax := (p_power_kw * COALESCE(canton_data.vehicle_tax_factor_power, 0)) +
                       (p_weight_kg * COALESCE(canton_data.vehicle_tax_factor_weight, 0));
        WHEN 'FLAT_RATE' THEN
            base_tax := COALESCE(canton_data.vehicle_tax_base_fee, 0);
        ELSE
            base_tax := 0;
    END CASE;
    
    -- Apply EV discount
    final_tax := base_tax * (1 - (canton_data.ev_tax_discount / 100));
    
    RETURN GREATEST(0, final_tax);
END;
$$ LANGUAGE plpgsql;

