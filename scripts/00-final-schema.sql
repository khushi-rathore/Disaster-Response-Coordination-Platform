-- Drop all existing tables to start fresh
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

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'citizen',
    phone VARCHAR(20),
    location_name TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disasters table
CREATE TABLE disasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    location_name TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'active',
    disaster_type VARCHAR(50) NOT NULL DEFAULT 'other',
    affected_people INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disaster reports table
CREATE TABLE disaster_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    location_name TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    capacity INTEGER,
    current_occupancy INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    contact_phone VARCHAR(20),
    disaster_id UUID REFERENCES disasters(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(50) NOT NULL DEFAULT 'update',
    severity VARCHAR(20) DEFAULT 'medium',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO users (id, email, username, full_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@crisisnetx.com', 'admin', 'System Administrator', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440001', 'coordinator@ndrf.gov.in', 'ndrf_coord', 'NDRF Coordinator', 'coordinator'),
    ('550e8400-e29b-41d4-a716-446655440002', 'citizen@example.com', 'citizen1', 'Concerned Citizen', 'citizen');

INSERT INTO disasters (id, title, description, location_name, severity, status, disaster_type, affected_people, created_by) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', 'Assam Floods 2024', 'Severe flooding in multiple districts of Assam due to heavy monsoon rains. Brahmaputra river overflowing.', 'Guwahati, Assam', 'high', 'active', 'flood', 50000, '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440001', 'Delhi Heat Wave Emergency', 'Extreme heat conditions in Delhi NCR region with temperatures reaching 47°C. Multiple heat stroke cases reported.', 'New Delhi, Delhi', 'critical', 'active', 'heatwave', 25000, '550e8400-e29b-41d4-a716-446655440001'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Kerala Landslide Alert', 'Heavy rainfall triggers landslides in Wayanad district. Evacuation orders issued for vulnerable areas.', 'Wayanad, Kerala', 'high', 'monitoring', 'landslide', 12000, '550e8400-e29b-41d4-a716-446655440001');

INSERT INTO disaster_reports (disaster_id, user_id, title, description, location_name, priority, status) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Water level rising in Brahmaputra', 'Witnessed rapid rise in water level near Guwahati. Many houses getting flooded.', 'Guwahati, Assam', 'high', 'verified'),
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Evacuation needed in Kamrup', 'Families stranded on rooftops. Immediate rescue required.', 'Kamrup, Assam', 'urgent', 'pending'),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hospital overcrowded', 'AIIMS emergency ward full with heat stroke patients. Need more cooling arrangements.', 'New Delhi, Delhi', 'high', 'verified');

INSERT INTO resources (name, type, location_name, capacity, current_occupancy, status, contact_phone, disaster_id) VALUES
    ('NDRF Rescue Base Guwahati', 'rescue_center', 'Guwahati, Assam', 100, 45, 'active', '+91-9876543210', '660e8400-e29b-41d4-a716-446655440000'),
    ('Emergency Shelter Kamrup', 'shelter', 'Kamrup, Assam', 500, 320, 'active', '+91-9876543211', '660e8400-e29b-41d4-a716-446655440000'),
    ('Cooling Center Delhi', 'relief_center', 'New Delhi, Delhi', 200, 150, 'active', '+91-9876543212', '660e8400-e29b-41d4-a716-446655440001'),
    ('Medical Camp Wayanad', 'medical_camp', 'Wayanad, Kerala', 50, 25, 'active', '+91-9876543213', '660e8400-e29b-41d4-a716-446655440002');

INSERT INTO alerts (disaster_id, title, message, alert_type, severity) VALUES
    ('660e8400-e29b-41d4-a716-446655440000', 'Flood Alert: Immediate Evacuation', 'Residents of low-lying areas near Brahmaputra river must evacuate immediately. Water levels continue to rise.', 'evacuation', 'critical'),
    ('660e8400-e29b-41d4-a716-446655440001', 'Heat Wave Warning', 'Extreme heat conditions expected to continue. Avoid outdoor activities between 10 AM - 4 PM.', 'weather', 'warning'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Landslide Risk High', 'Heavy rainfall continues in Wayanad. Residents in hilly areas advised to move to safer locations.', 'safety', 'warning');

-- Create indexes
CREATE INDEX idx_disasters_status ON disasters (status);
CREATE INDEX idx_disasters_severity ON disasters (severity);
CREATE INDEX idx_disasters_created_at ON disasters (created_at DESC);
CREATE INDEX idx_reports_disaster_id ON disaster_reports (disaster_id);
CREATE INDEX idx_resources_disaster_id ON resources (disaster_id);
CREATE INDEX idx_alerts_disaster_id ON alerts (disaster_id);
