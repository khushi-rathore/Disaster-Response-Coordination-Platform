-- Enable PostGIS extension for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS cache CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS social_media_posts CASCADE;
DROP TABLE IF EXISTS official_updates CASCADE;
DROP TABLE IF EXISTS disasters CASCADE;

-- Create disasters table with enhanced geospatial support
CREATE TABLE disasters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    tags TEXT[] DEFAULT '{}',
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    audit_trail JSONB DEFAULT '[]'::jsonb,
    verified BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'manual',
    external_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create reports table for citizen reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    image_verification JSONB,
    location GEOGRAPHY(POINT, 4326),
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'flagged')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create resources table with enhanced geospatial support
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    type TEXT NOT NULL,
    capacity INTEGER,
    availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'limited', 'full', 'closed')),
    contact_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT false
);

-- Create social media posts table
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    user_handle TEXT,
    content TEXT NOT NULL,
    hashtags TEXT[] DEFAULT '{}',
    location_name TEXT,
    location GEOGRAPHY(POINT, 4326),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
    engagement_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT false
);

-- Create official updates table
CREATE TABLE official_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    published_at TIMESTAMP WITH TIME ZONE,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT true
);

-- Create cache table for external API responses
CREATE TABLE cache (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comprehensive indexes for performance
CREATE INDEX disasters_location_idx ON disasters USING GIST (location);
CREATE INDEX disasters_tags_idx ON disasters USING GIN (tags);
CREATE INDEX disasters_created_by_idx ON disasters (created_by);
CREATE INDEX disasters_status_idx ON disasters (status);
CREATE INDEX disasters_severity_idx ON disasters (severity);

CREATE INDEX reports_disaster_idx ON reports (disaster_id);
CREATE INDEX reports_location_idx ON reports USING GIST (location);
CREATE INDEX reports_verification_idx ON reports (verification_status);
CREATE INDEX reports_priority_idx ON reports (priority);

CREATE INDEX resources_disaster_idx ON resources (disaster_id);
CREATE INDEX resources_location_idx ON resources USING GIST (location);
CREATE INDEX resources_type_idx ON resources (type);
CREATE INDEX resources_availability_idx ON resources (availability);

CREATE INDEX social_posts_disaster_idx ON social_media_posts (disaster_id);
CREATE INDEX social_posts_platform_idx ON social_media_posts (platform);
CREATE INDEX social_posts_priority_idx ON social_media_posts (priority);
CREATE INDEX social_posts_location_idx ON social_media_posts USING GIST (location);

CREATE INDEX official_updates_disaster_idx ON official_updates (disaster_id);
CREATE INDEX official_updates_source_idx ON official_updates (source);
CREATE INDEX official_updates_category_idx ON official_updates (category);

CREATE INDEX cache_expires_idx ON cache (expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_disasters_updated_at 
    BEFORE UPDATE ON disasters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at 
    BEFORE UPDATE ON resources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function for geospatial distance queries
CREATE OR REPLACE FUNCTION get_nearby_resources(
    disaster_lat FLOAT,
    disaster_lng FLOAT,
    radius_km FLOAT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    location_name TEXT,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.name,
        r.type,
        r.location_name,
        ST_Distance(
            r.location::geometry,
            ST_SetSRID(ST_Point(disaster_lng, disaster_lat), 4326)::geometry
        ) / 1000 AS distance_km
    FROM resources r
    WHERE r.location IS NOT NULL
    AND ST_DWithin(
        r.location::geometry,
        ST_SetSRID(ST_Point(disaster_lng, disaster_lat), 4326)::geometry,
        radius_km * 1000
    )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
