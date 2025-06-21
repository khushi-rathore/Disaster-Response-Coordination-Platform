export interface MockTweet {
  id: string
  user: string
  text: string
  location: string
  time: string
  verified: boolean
  priority: "low" | "medium" | "high" | "urgent"
  engagement: {
    likes: number
    retweets: number
    replies: number
  }
  hashtags: string[]
}

export interface MockLocation {
  lat: number
  lng: number
  label: string
  type: "disaster" | "resource" | "shelter" | "hospital"
  status: "active" | "inactive" | "full"
  priority?: "low" | "medium" | "high" | "urgent"
  details?: string
}

// Enhanced mock tweets with more realistic Indian disaster content
export const mockTweets: MockTweet[] = [
  {
    id: "1",
    user: "AhmedabadPolice",
    text: "URGENT: Aircraft emergency at SVPI Airport. All emergency services deployed. Avoid airport area. Updates to follow. #AhmedabadEmergency #AirportAlert",
    location: "Ahmedabad, Gujarat",
    time: new Date().toISOString(),
    verified: true,
    priority: "urgent",
    engagement: { likes: 1250, retweets: 890, replies: 234 },
    hashtags: ["AhmedabadEmergency", "AirportAlert", "Emergency"],
  },
  {
    id: "2",
    user: "AssamFloodAlert",
    text: "Brahmaputra water level rising rapidly. Evacuation orders for low-lying areas. Move to higher ground immediately. #AssamFloods #BrahmaputraAlert",
    location: "Guwahati, Assam",
    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    verified: true,
    priority: "urgent",
    engagement: { likes: 2100, retweets: 1500, replies: 456 },
    hashtags: ["AssamFloods", "BrahmaputraAlert", "Evacuation"],
  },
  {
    id: "3",
    user: "DelhiTrafficPolice",
    text: "Yamuna water level at record high 208.5m. Several roads waterlogged. Avoid: Ring Road, ITO, Rajghat area. Use alternate routes. #DelhiFloods",
    location: "New Delhi, Delhi",
    time: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    verified: true,
    priority: "high",
    engagement: { likes: 3400, retweets: 2100, replies: 678 },
    hashtags: ["DelhiFloods", "TrafficAlert", "Waterlogging"],
  },
  {
    id: "4",
    user: "citizen_reporter",
    text: "Need immediate help! Family trapped on 3rd floor in Yamuna Vihar. Water level rising fast. Please send rescue team! #DelhiFloods #Help",
    location: "Delhi",
    time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    verified: false,
    priority: "urgent",
    engagement: { likes: 567, retweets: 234, replies: 89 },
    hashtags: ["DelhiFloods", "Help", "Emergency"],
  },
  {
    id: "5",
    user: "VolunteerIndia",
    text: "Setting up relief camp at Pragati Maidan. Food, water, and medical aid available for flood victims. Volunteers needed! #DelhiFloods #Relief",
    location: "Delhi",
    time: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    verified: false,
    priority: "medium",
    engagement: { likes: 890, retweets: 456, replies: 123 },
    hashtags: ["DelhiFloods", "Relief", "Volunteer"],
  },
  {
    id: "6",
    user: "KeralaRescue",
    text: "Landslide in Wayanad district. Multiple villages affected. NDRF teams deployed. Helicopter rescue operations underway. #KeralaLandslide",
    location: "Wayanad, Kerala",
    time: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    verified: true,
    priority: "urgent",
    engagement: { likes: 1800, retweets: 1200, replies: 345 },
    hashtags: ["KeralaLandslide", "NDRF", "Rescue"],
  },
  {
    id: "7",
    user: "MumbaiRains",
    text: "Heavy rainfall warning for Mumbai. Local train services may be affected. Citizens advised to avoid unnecessary travel. #MumbaiRains",
    location: "Mumbai, Maharashtra",
    time: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    verified: false,
    priority: "medium",
    engagement: { likes: 756, retweets: 423, replies: 167 },
    hashtags: ["MumbaiRains", "Transport", "Warning"],
  },
  {
    id: "8",
    user: "ChennaiFloodAlert",
    text: "Cyclone Michaung approaching Chennai coast. Evacuation centers opened. Stay indoors and follow official updates. #CycloneMichaung",
    location: "Chennai, Tamil Nadu",
    time: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    verified: true,
    priority: "high",
    engagement: { likes: 2300, retweets: 1800, replies: 567 },
    hashtags: ["CycloneMichaung", "Chennai", "Evacuation"],
  },
  {
    id: "9",
    user: "NDRFIndia",
    text: "NDRF teams have rescued 127 people from flood-affected areas in last 6 hours. Operations continue round the clock. #NDRF #FloodRescue",
    location: "Multiple Locations",
    time: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
    verified: true,
    priority: "high",
    engagement: { likes: 4500, retweets: 2800, replies: 890 },
    hashtags: ["NDRF", "FloodRescue", "Emergency"],
  },
  {
    id: "10",
    user: "WeatherIndia",
    text: "IMD issues red alert for coastal Karnataka. Heavy to very heavy rainfall expected. Fishermen advised not to venture into sea. #WeatherAlert",
    location: "Karnataka",
    time: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    verified: true,
    priority: "high",
    engagement: { likes: 1200, retweets: 800, replies: 234 },
    hashtags: ["WeatherAlert", "Karnataka", "IMD"],
  },
]

// Enhanced mock locations with more detailed information
export const mockLocations: MockLocation[] = [
  {
    lat: 23.0225,
    lng: 72.5714,
    label: "Ahmedabad Airport Emergency",
    type: "disaster",
    status: "active",
    priority: "urgent",
    details: "Aircraft emergency - 12 casualties reported, emergency services deployed",
  },
  {
    lat: 26.1445,
    lng: 91.7362,
    label: "Guwahati Flood Zone",
    type: "disaster",
    status: "active",
    priority: "high",
    details: "Brahmaputra overflow - 50,000 people affected, evacuation ongoing",
  },
  {
    lat: 28.7041,
    lng: 77.1025,
    label: "Delhi Flood Emergency",
    type: "disaster",
    status: "active",
    priority: "urgent",
    details: "Yamuna at danger level - Mass evacuation in progress",
  },
  {
    lat: 11.6854,
    lng: 76.1319,
    label: "Wayanad Landslide Area",
    type: "disaster",
    status: "active",
    priority: "urgent",
    details: "Multiple landslides - Villages cut off, helicopter rescue underway",
  },
  {
    lat: 19.076,
    lng: 72.8777,
    label: "Mumbai Weather Alert",
    type: "disaster",
    status: "active",
    priority: "medium",
    details: "Heavy rainfall warning - Transport services affected",
  },
  {
    lat: 13.0827,
    lng: 80.2707,
    label: "Chennai Cyclone Zone",
    type: "disaster",
    status: "active",
    priority: "high",
    details: "Cyclone approaching - Coastal evacuation centers opened",
  },
  // Resources and shelters
  {
    lat: 23.02,
    lng: 72.63,
    label: "NDRF Rescue Base",
    type: "resource",
    status: "active",
    details: "200 personnel deployed - 24/7 rescue operations",
  },
  {
    lat: 26.15,
    lng: 91.75,
    label: "Guwahati Relief Camp",
    type: "shelter",
    status: "active",
    details: "1000 capacity - Food, water & medical aid available",
  },
  {
    lat: 28.5672,
    lng: 77.209,
    label: "AIIMS Trauma Center",
    type: "hospital",
    status: "active",
    details: "500 bed capacity - Emergency trauma care ready",
  },
  {
    lat: 11.7,
    lng: 76.15,
    label: "Kerala Emergency Shelter",
    type: "shelter",
    status: "active",
    details: "300 evacuees housed - Supplies available",
  },
  {
    lat: 19.08,
    lng: 72.9,
    label: "Mumbai Relief Center",
    type: "resource",
    status: "active",
    details: "Food distribution center - 5000 meals per day",
  },
  {
    lat: 13.1,
    lng: 80.3,
    label: "Chennai Evacuation Center",
    type: "shelter",
    status: "full",
    details: "800/800 capacity - Overflow arrangements being made",
  },
]

// Enhanced mock disasters with more comprehensive data
export const mockDisasters = [
  {
    id: "disaster-1",
    title: "Ahmedabad Airport Emergency",
    description:
      "Aircraft emergency at Sardar Vallabhbhai Patel International Airport. Emergency response teams deployed. Multiple casualties reported.",
    location: "Ahmedabad, Gujarat",
    severity: "critical",
    status: "active",
    tags: ["aviation", "emergency", "casualties", "airport"],
    created_at: new Date().toISOString(),
    reports_count: 12,
    resources_count: 8,
    social_posts_count: 45,
    affected_people: 150,
    response_teams: 6,
  },
  {
    id: "disaster-2",
    title: "Assam Floods 2024",
    description:
      "Severe flooding across multiple districts in Assam due to heavy monsoon rains. Brahmaputra river overflowing affecting thousands.",
    location: "Guwahati, Assam",
    severity: "high",
    status: "active",
    tags: ["flood", "monsoon", "evacuation", "brahmaputra"],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reports_count: 28,
    resources_count: 15,
    social_posts_count: 89,
    affected_people: 50000,
    response_teams: 12,
  },
  {
    id: "disaster-3",
    title: "Delhi Floods July 2024",
    description:
      "Unprecedented flooding in Delhi due to Yamuna river overflow. Water levels reach 208.5m, highest in 45 years. Mass evacuation underway.",
    location: "New Delhi, Delhi",
    severity: "critical",
    status: "monitoring",
    tags: ["flood", "yamuna", "evacuation", "record"],
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reports_count: 67,
    resources_count: 23,
    social_posts_count: 156,
    affected_people: 200000,
    response_teams: 18,
  },
  {
    id: "disaster-4",
    title: "Kerala Landslide Emergency",
    description:
      "Multiple landslides in Wayanad district due to heavy rainfall. Villages cut off, helicopter rescue operations in progress.",
    location: "Wayanad, Kerala",
    severity: "critical",
    status: "active",
    tags: ["landslide", "rescue", "monsoon", "helicopter"],
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reports_count: 45,
    resources_count: 19,
    social_posts_count: 123,
    affected_people: 15000,
    response_teams: 8,
  },
  {
    id: "disaster-5",
    title: "Mumbai Monsoon Alert",
    description:
      "Heavy rainfall warning for Mumbai. Local train services affected. Citizens advised to avoid unnecessary travel.",
    location: "Mumbai, Maharashtra",
    severity: "medium",
    status: "monitoring",
    tags: ["monsoon", "transport", "warning", "rainfall"],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reports_count: 23,
    resources_count: 12,
    social_posts_count: 67,
    affected_people: 5000,
    response_teams: 4,
  },
  {
    id: "disaster-6",
    title: "Chennai Cyclone Michaung",
    description: "Cyclone Michaung approaching Chennai coast. Evacuation centers opened. Coastal areas on high alert.",
    location: "Chennai, Tamil Nadu",
    severity: "high",
    status: "active",
    tags: ["cyclone", "coastal", "evacuation", "alert"],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    reports_count: 34,
    resources_count: 16,
    social_posts_count: 98,
    affected_people: 75000,
    response_teams: 10,
  },
]

// Generate additional mock data for data-intensive display
export const generateMockAnalytics = () => {
  return {
    hourlyReports: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      reports: Math.floor(Math.random() * 50) + 10,
      verified: Math.floor(Math.random() * 30) + 5,
    })),
    stateWiseData: [
      { state: "Maharashtra", disasters: 12, affected: 45000 },
      { state: "Gujarat", disasters: 8, affected: 23000 },
      { state: "Kerala", disasters: 15, affected: 67000 },
      { state: "Assam", disasters: 6, affected: 89000 },
      { state: "Delhi", disasters: 4, affected: 234000 },
      { state: "Tamil Nadu", disasters: 9, affected: 56000 },
    ],
    responseMetrics: {
      averageResponseTime: "12 minutes",
      successfulRescues: 1247,
      resourcesDeployed: 89,
      volunteersActive: 456,
    },
  }
}
