-- Insert recent Indian disasters with accurate coordinates
INSERT INTO disasters (title, description, location_name, location, tags, severity, created_by, verified, source, metadata) VALUES
(
    'Ahmedabad Plane Crash Emergency',
    'Aircraft crash incident at Sardar Vallabhbhai Patel International Airport. Emergency response teams deployed. Multiple casualties reported.',
    'Ahmedabad, Gujarat',
    ST_SetSRID(ST_Point(72.6369, 23.0225), 4326),
    ARRAY['aviation', 'emergency', 'casualties', 'ahmedabad'],
    'critical',
    'ndma_official',
    true,
    'official',
    '{"airport": "SVPI", "aircraft_type": "commercial", "emergency_code": "red"}'::jsonb
),
(
    'Assam Floods 2024',
    'Severe flooding across multiple districts in Assam due to heavy monsoon rains. Brahmaputra river overflowing. Mass evacuations underway.',
    'Guwahati, Assam',
    ST_SetSRID(ST_Point(91.7362, 26.1445), 4326),
    ARRAY['flood', 'monsoon', 'evacuation', 'assam', 'brahmaputra'],
    'high',
    'assam_disaster_mgmt',
    true,
    'official',
    '{"affected_districts": ["Kamrup", "Nagaon", "Morigaon"], "water_level": "danger_mark"}'::jsonb
),
(
    'Manipur Earthquake Alert',
    'Magnitude 6.2 earthquake strikes Manipur. Tremors felt across Northeast India. Buildings damaged in Imphal. Aftershocks expected.',
    'Imphal, Manipur',
    ST_SetSRID(ST_Point(93.9063, 24.8170), 4326),
    ARRAY['earthquake', 'seismic', 'manipur', 'northeast', 'aftershocks'],
    'high',
    'geological_survey',
    true,
    'seismic_monitoring',
    '{"magnitude": 6.2, "depth": "10km", "epicenter": "25km SW of Imphal"}'::jsonb
),
(
    'Delhi Floods July 2024',
    'Unprecedented flooding in Delhi due to Yamuna river overflow. Water levels reach 208.5m, highest in 45 years. Red alert issued.',
    'New Delhi, Delhi',
    ST_SetSRID(ST_Point(77.1025, 28.7041), 4326),
    ARRAY['flood', 'yamuna', 'delhi', 'monsoon', 'evacuation'],
    'critical',
    'delhi_govt',
    true,
    'official',
    '{"water_level": "208.5m", "danger_mark": "205.33m", "affected_areas": ["Old Delhi", "Civil Lines"]}'::jsonb
),
(
    'Cyclone Remal Impact',
    'Cyclone Remal makes landfall in West Bengal and Bangladesh border. Wind speeds up to 110 kmph. Coastal areas evacuated.',
    'Kolkata, West Bengal',
    ST_SetSRID(ST_Point(88.3639, 22.5726), 4326),
    ARRAY['cyclone', 'remal', 'westbengal', 'coastal', 'evacuation'],
    'high',
    'imd_official',
    true,
    'meteorological',
    '{"wind_speed": "110kmph", "landfall_time": "2024-05-26T23:30:00Z", "category": "severe"}'::jsonb
),
(
    'Kerala Landslide Emergency',
    'Multiple landslides in Wayanad district due to heavy rainfall. Villages cut off. Search and rescue operations ongoing.',
    'Wayanad, Kerala',
    ST_SetSRID(ST_Point(76.1319, 11.6854), 4326),
    ARRAY['landslide', 'kerala', 'wayanad', 'rescue', 'monsoon'],
    'critical',
    'kerala_disaster_mgmt',
    true,
    'official',
    '{"affected_villages": ["Chooralmala", "Mundakkai"], "missing_persons": 45}'::jsonb
);

-- Insert realistic resources for these disasters
INSERT INTO resources (disaster_id, name, description, location_name, location, type, capacity, contact_info, verified) 
SELECT 
    d.id,
    'NDRF Rescue Base Camp',
    'National Disaster Response Force emergency operations center with rescue equipment and medical facilities',
    'Ahmedabad Airport, Gujarat',
    ST_SetSRID(ST_Point(72.6300, 23.0200), 4326),
    'rescue_center',
    200,
    '{"phone": "+91-79-2286-0000", "emergency": "108", "contact_person": "NDRF Commander"}'::jsonb,
    true
FROM disasters d WHERE d.title = 'Ahmedabad Plane Crash Emergency';

INSERT INTO resources (disaster_id, name, description, location_name, location, type, capacity, contact_info, verified)
SELECT 
    d.id,
    'Guwahati Relief Camp',
    'State government relief camp with food, water, and temporary shelter for flood victims',
    'Sarusajai Stadium, Guwahati',
    ST_SetSRID(ST_Point(91.7500, 26.1500), 4326),
    'relief_camp',
    1000,
    '{"phone": "+91-361-2237-000", "camp_officer": "District Collector"}'::jsonb,
    true
FROM disasters d WHERE d.title = 'Assam Floods 2024';

INSERT INTO resources (disaster_id, name, description, location_name, location, type, capacity, contact_info, verified)
SELECT 
    d.id,
    'AIIMS Trauma Center',
    'All India Institute of Medical Sciences emergency trauma center for earthquake casualties',
    'AIIMS Delhi, New Delhi',
    ST_SetSRID(ST_Point(77.2090, 28.5672), 4326),
    'medical',
    500,
    '{"phone": "+91-11-2658-8500", "emergency": "102", "trauma_unit": "24x7"}'::jsonb,
    true
FROM disasters d WHERE d.title = 'Delhi Floods July 2024';

-- Insert social media posts (realistic Twitter-style content)
INSERT INTO social_media_posts (disaster_id, platform, external_id, user_handle, content, hashtags, location_name, priority, sentiment, engagement_metrics)
SELECT 
    d.id,
    'twitter',
    '1234567890123456789',
    'AhmedabadPolice',
    'URGENT: Aircraft emergency at SVPI Airport. All emergency services deployed. Avoid airport area. Updates to follow. #AhmedabadEmergency #AirportAlert',
    ARRAY['AhmedabadEmergency', 'AirportAlert', 'SVPI', 'Emergency'],
    'Ahmedabad, Gujarat',
    'urgent',
    'urgent',
    '{"likes": 1250, "retweets": 890, "replies": 234}'::jsonb
FROM disasters d WHERE d.title = 'Ahmedabad Plane Crash Emergency';

INSERT INTO social_media_posts (disaster_id, platform, external_id, user_handle, content, hashtags, location_name, priority, sentiment, engagement_metrics)
SELECT 
    d.id,
    'twitter',
    '1234567890123456790',
    'AssamFloodAlert',
    'Brahmaputra water level rising rapidly. Evacuation orders for low-lying areas. Move to higher ground immediately. #AssamFloods #BrahmaputraAlert #Evacuation',
    ARRAY['AssamFloods', 'BrahmaputraAlert', 'Evacuation', 'Monsoon2024'],
    'Guwahati, Assam',
    'urgent',
    'urgent',
    '{"likes": 2100, "retweets": 1500, "replies": 456}'::jsonb
FROM disasters d WHERE d.title = 'Assam Floods 2024';

INSERT INTO social_media_posts (disaster_id, platform, external_id, user_handle, content, hashtags, location_name, priority, sentiment, engagement_metrics)
SELECT 
    d.id,
    'twitter',
    '1234567890123456791',
    'DelhiTrafficPolice',
    'Yamuna water level at record high 208.5m. Several roads waterlogged. Avoid: Ring Road, ITO, Rajghat area. Use alternate routes. #DelhiFloods #YamunaFlood',
    ARRAY['DelhiFloods', 'YamunaFlood', 'TrafficAlert', 'Waterlogging'],
    'New Delhi, Delhi',
    'high',
    'negative',
    '{"likes": 3400, "retweets": 2100, "replies": 678}'::jsonb
FROM disasters d WHERE d.title = 'Delhi Floods July 2024';

-- Insert official updates
INSERT INTO official_updates (disaster_id, title, content, source, source_url, category, priority, published_at)
SELECT 
    d.id,
    'NDMA Issues Emergency Response Guidelines',
    'National Disaster Management Authority has issued comprehensive emergency response guidelines for aviation incidents. All state disaster management authorities have been alerted.',
    'NDMA',
    'https://ndma.gov.in/emergency-alerts',
    'guidelines',
    'high',
    NOW() - INTERVAL '2 hours'
FROM disasters d WHERE d.title = 'Ahmedabad Plane Crash Emergency';

INSERT INTO official_updates (disaster_id, title, content, source, source_url, category, priority, published_at)
SELECT 
    d.id,
    'IMD Issues Red Alert for Assam',
    'India Meteorological Department has issued red alert for Assam with prediction of extremely heavy rainfall. Citizens advised to stay indoors and avoid river areas.',
    'IMD',
    'https://mausam.imd.gov.in/warnings',
    'weather_alert',
    'urgent',
    NOW() - INTERVAL '4 hours'
FROM disasters d WHERE d.title = 'Assam Floods 2024';

INSERT INTO official_updates (disaster_id, title, content, source, source_url, category, priority, published_at)
SELECT 
    d.id,
    'Delhi Government Declares Flood Emergency',
    'Delhi Government has declared flood emergency as Yamuna crosses danger mark. All schools and colleges closed. Emergency helpline 1077 activated.',
    'Delhi Government',
    'https://delhi.gov.in/emergency-updates',
    'emergency_declaration',
    'critical',
    NOW() - INTERVAL '6 hours'
FROM disasters d WHERE d.title = 'Delhi Floods July 2024';
