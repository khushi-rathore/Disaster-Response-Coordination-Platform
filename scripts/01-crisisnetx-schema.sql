-- CrisisNetX Database Schema - Clean Version
-- Drop all existing tables first
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS gemini_cache CASCADE;
DROP TABLE IF EXISTS deployments CASCADE;
DROP TABLE IF EXISTS response_teams CASCADE;
DROP TABLE IF EXISTS social_posts CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS disaster_reports CASCADE;
DROP TABLE IF EXISTS disasters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable PostGIS for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'citizen' CHECK (role IN ('citizen', 'responder', 'coordinator', 'admin')),
    phone VARCHAR(20),
    location_name TEXT,
    coordinates GEOGRAPHY(POINT, 4326),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disasters table - main disaster events
CREATE TABLE disasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    location_name TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'closed')),
    disaster_type VARCHAR(50) NOT NULL,
    affected_people INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    verification_source TEXT,
    created_by UUID REFERENCES users(id),
    assigned_coordinator UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disaster reports - citizen reports and updates
CREATE TABLE disaster_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    image_verified BOOLEAN DEFAULT false,
    image_verification_result JSONB,
    location_name TEXT,
    coordinates GEOGRAPHY(POINT, 4326),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'investigating', 'resolved', 'rejected')),
    verification_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources - shelters, hospitals, relief centers
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('shelter', 'hospital', 'relief_center', 'food_distribution', 'medical_camp', 'evacuation_center')),
    description TEXT,
    location_name TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'full', 'closed', 'maintenance')),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    facilities TEXT[],
    disaster_id UUID REFERENCES disasters(id),
    managed_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time updates and alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('evacuation', 'weather', 'resource', 'safety', 'update')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
    target_area GEOGRAPHY(POLYGON, 4326),
    target_radius_km DECIMAL(10,2),
    coordinates GEOGRAPHY(POINT, 4326),
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media monitoring and verification
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id),
    platform VARCHAR(50) NOT NULL,
    post_id VARCHAR(255),
    username VARCHAR(255),
    content TEXT NOT NULL,
    image_urls TEXT[],
    location_name TEXT,
    coordinates GEOGRAPHY(POINT, 4326),
    engagement_metrics JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    verification_score DECIMAL(3,2),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    processed BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    posted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Response teams and coordination
CREATE TABLE response_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('rescue', 'medical', 'fire', 'police', 'volunteer', 'ngo')),
    description TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    base_location TEXT,
    coordinates GEOGRAPHY(POINT, 4326),
    capacity INTEGER,
    current_deployment INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'deployed', 'standby', 'maintenance')),
    specializations TEXT[],
    equipment JSONB DEFAULT '{}',
    leader_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team deployments
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES response_teams(id),
    disaster_id UUID REFERENCES disasters(id),
    location_name TEXT NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    mission_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'standby')),
    personnel_count INTEGER NOT NULL,
    equipment_deployed JSONB DEFAULT '{}',
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gemini API cache for location extraction and image verification
CREATE TABLE gemini_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_type VARCHAR(50) NOT NULL CHECK (cache_type IN ('location_extraction', 'image_verification', 'content_analysis')),
    input_data JSONB NOT NULL,
    result JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs and audit trail
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    user_id UUID REFERENCES users(id),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_disasters_coordinates ON disasters USING GIST (coordinates);
CREATE INDEX idx_disasters_status ON disasters (status);
CREATE INDEX idx_disasters_severity ON disasters (severity);
CREATE INDEX idx_disasters_created_at ON disasters (created_at DESC);

CREATE INDEX idx_reports_disaster_id ON disaster_reports (disaster_id);
CREATE INDEX idx_reports_coordinates ON disaster_reports USING GIST (coordinates);
CREATE INDEX idx_reports_status ON disaster_reports (status);
CREATE INDEX idx_reports_created_at ON disaster_reports (created_at DESC);

CREATE INDEX idx_resources_coordinates ON resources USING GIST (coordinates);
CREATE INDEX idx_resources_type ON resources (type);
CREATE INDEX idx_resources_status ON resources (status);

CREATE INDEX idx_alerts_coordinates ON alerts USING GIST (coordinates);
CREATE INDEX idx_alerts_active ON alerts (active);
CREATE INDEX idx_alerts_severity ON alerts (severity);
CREATE INDEX idx_alerts_created_at ON alerts (created_at DESC);

CREATE INDEX idx_social_posts_disaster_id ON social_posts (disaster_id);
CREATE INDEX idx_social_posts_verified ON social_posts (verified);
CREATE INDEX idx_social_posts_priority ON social_posts (priority);

CREATE INDEX idx_gemini_cache_key ON gemini_cache (cache_key);
CREATE INDEX idx_gemini_cache_expires ON gemini_cache (expires_at);

-- Functions for geographic queries
CREATE OR REPLACE FUNCTION get_nearby_resources(
    center_lat DECIMAL,
    center_lng DECIMAL,
    radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    type VARCHAR(50),
    location_name TEXT,
    distance_km DECIMAL,
    status VARCHAR(20),
    capacity INTEGER,
    current_occupancy INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.type,
        r.location_name,
        ROUND(ST_Distance(r.coordinates, ST_Point(center_lng, center_lat)::geography) / 1000, 2) as distance_km,
        r.status,
        r.capacity,
        r.current_occupancy
    FROM resources r
    WHERE ST_DWithin(r.coordinates, ST_Point(center_lng, center_lat)::geography, radius_km * 1000)
    AND r.status = 'active'
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function to get disasters within area
CREATE OR REPLACE FUNCTION get_disasters_in_area(
    center_lat DECIMAL,
    center_lng DECIMAL,
    radius_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    severity VARCHAR(20),
    status VARCHAR(20),
    location_name TEXT,
    distance_km DECIMAL,
    affected_people INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.severity,
        d.status,
        d.location_name,
        ROUND(ST_Distance(d.coordinates, ST_Point(center_lng, center_lat)::geography) / 1000, 2) as distance_km,
        d.affected_people,
        d.created_at
    FROM disasters d
    WHERE ST_DWithin(d.coordinates, ST_Point(center_lng, center_lat)::geography, radius_km * 1000)
    AND d.status IN ('active', 'monitoring')
    ORDER BY 
        CASE d.severity 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        distance_km;
END;
$$ LANGUAGE plpgsql;
