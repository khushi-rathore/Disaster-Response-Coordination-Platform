-- Insert sample disasters with geospatial data
INSERT INTO disasters (title, location_name, location, description, tags, owner_id, audit_trail) VALUES
(
    'NYC Flood Emergency',
    'Manhattan, NYC',
    ST_SetSRID(ST_Point(-73.9857, 40.7484), 4326),
    'Heavy flooding in Manhattan due to storm surge. Multiple streets underwater.',
    ARRAY['flood', 'urgent', 'storm'],
    'netrunnerX',
    '[{"action": "create", "user_id": "netrunnerX", "timestamp": "2025-01-20T10:00:00Z"}]'::jsonb
),
(
    'California Wildfire Alert',
    'Los Angeles, CA',
    ST_SetSRID(ST_Point(-118.2437, 34.0522), 4326),
    'Wildfire spreading rapidly in the hills near Los Angeles. Evacuations in progress.',
    ARRAY['wildfire', 'evacuation', 'urgent'],
    'reliefAdmin',
    '[{"action": "create", "user_id": "reliefAdmin", "timestamp": "2025-01-20T11:00:00Z"}]'::jsonb
),
(
    'Texas Hurricane Warning',
    'Houston, TX',
    ST_SetSRID(ST_Point(-95.3698, 29.7604), 4326),
    'Category 3 hurricane approaching Houston. Residents advised to prepare for impact.',
    ARRAY['hurricane', 'warning', 'preparation'],
    'netrunnerX',
    '[{"action": "create", "user_id": "netrunnerX", "timestamp": "2025-01-20T12:00:00Z"}]'::jsonb
);

-- Insert sample reports
INSERT INTO reports (disaster_id, user_id, content, image_url, verification_status) 
SELECT 
    d.id,
    'citizen1',
    'Need food and water in Lower East Side. Families stranded on 3rd floor.',
    'https://example.com/flood-image1.jpg',
    'pending'
FROM disasters d WHERE d.title = 'NYC Flood Emergency';

INSERT INTO reports (disaster_id, user_id, content, verification_status)
SELECT 
    d.id,
    'citizen2',
    'Shelter available at community center. Can accommodate 50 people.',
    'verified'
FROM disasters d WHERE d.title = 'NYC Flood Emergency';

-- Insert sample resources
INSERT INTO resources (disaster_id, name, location_name, location, type)
SELECT 
    d.id,
    'Red Cross Emergency Shelter',
    'Lower East Side, NYC',
    ST_SetSRID(ST_Point(-73.9442, 40.7128), 4326),
    'shelter'
FROM disasters d WHERE d.title = 'NYC Flood Emergency';

INSERT INTO resources (disaster_id, name, location_name, location, type)
SELECT 
    d.id,
    'Emergency Food Distribution',
    'Times Square, NYC',
    ST_SetSRID(ST_Point(-73.9857, 40.7580), 4326),
    'food'
FROM disasters d WHERE d.title = 'NYC Flood Emergency';

INSERT INTO resources (disaster_id, name, location_name, location, type)
SELECT 
    d.id,
    'Evacuation Center',
    'Santa Monica, CA',
    ST_SetSRID(ST_Point(-118.4912, 34.0195), 4326),
    'evacuation'
FROM disasters d WHERE d.title = 'California Wildfire Alert';
