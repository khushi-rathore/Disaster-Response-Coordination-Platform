export class MockOfficialUpdatesService {
  private updateTemplates = [
    {
      sourceType: "government",
      sources: ["NDMA", "State Disaster Management", "District Collector", "Emergency Services", "PMO India"],
      categories: ["emergency_declaration", "evacuation_order", "relief_operations", "safety_advisory", "resource_allocation"],
      urgencyLevels: ["high", "medium", "urgent"],
    },
    {
      sourceType: "relief_organization",
      sources: ["Indian Red Cross", "UN Disaster Relief", "Oxfam India", "Save the Children", "Volunteer Organizations"],
      categories: ["relief_operations", "donation_drive", "volunteer_recruitment", "aid_distribution", "medical_assistance"],
      urgencyLevels: ["medium", "low", "high"],
    },
    {
      sourceType: "weather_service",
      sources: ["IMD", "Weather Department", "Meteorological Office", "Cyclone Warning Centre"],
      categories: ["weather_alert", "forecast_update", "warning_issued", "cyclone_update", "rainfall_advisory"],
      urgencyLevels: ["high", "urgent", "medium"],
    },
  ]

  async fetchOfficialUpdates(disasterType: string[], location?: string): Promise<any[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    const updates = []
    const updateCount = 4 + Math.floor(Math.random() * 6) // 4-9 updates

    for (let i = 0; i < updateCount; i++) {
      const template = this.updateTemplates[Math.floor(Math.random() * this.updateTemplates.length)]
      const source = template.sources[Math.floor(Math.random() * template.sources.length)]
      const category = template.categories[Math.floor(Math.random() * template.categories.length)]
      const urgency = template.urgencyLevels[Math.floor(Math.random() * template.urgencyLevels.length)]

      updates.push({
        id: `update-${Date.now()}-${i}`,
        title: this.generateUpdateTitle(category, disasterType[0], location),
        content: this.generateUpdateContent(category, disasterType[0], location, source),
        source: source,
        source_url: this.generateSourceUrl(source),
        category: category,
        priority: urgency,
        published_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 24h
        verified: template.sourceType === "government",
        location: location,
        disaster_types: disasterType,
        source_type: template.sourceType,
      })
    }

    return updates.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
  }

  private generateUpdateTitle(category: string, disasterType: string, location?: string): string {
    const locationStr = location ? ` in ${location}` : ""

    const titleTemplates = {
      emergency_declaration: [
        `Emergency Declared for ${disasterType}${locationStr}`,
        `State of Emergency Announced${locationStr}`,
        `Disaster Emergency Response Activated${locationStr}`,
        `National Emergency Protocol Initiated${locationStr}`,
      ],
      evacuation_order: [
        `Evacuation Orders Issued${locationStr}`,
        `Mandatory Evacuation for Affected Areas${locationStr}`,
        `Emergency Evacuation Procedures in Effect${locationStr}`,
        `Immediate Evacuation Required${locationStr}`,
      ],
      relief_operations: [
        `Relief Operations Expanded${locationStr}`,
        `Emergency Aid Distribution Underway${locationStr}`,
        `Rescue and Relief Teams Deployed${locationStr}`,
        `Humanitarian Assistance Mobilized${locationStr}`,
      ],
      safety_advisory: [
        `Safety Advisory Issued for ${disasterType}${locationStr}`,
        `Public Safety Guidelines Updated${locationStr}`,
        `Emergency Safety Measures Announced${locationStr}`,
        `Critical Safety Instructions Released${locationStr}`,
      ],
      weather_alert: [
        `Weather Alert: Continued ${disasterType} Risk${locationStr}`,
        `Meteorological Warning Extended${locationStr}`,
        `Weather Conditions Update${locationStr}`,
        `Severe Weather Advisory${locationStr}`,
      ],
      donation_drive: [
        `Emergency Donation Drive Launched${locationStr}`,
        `Relief Fund Collection Started${locationStr}`,
        `Community Support Campaign Active${locationStr}`,
        `Disaster Relief Fundraising Initiative${locationStr}`,
      ],
      resource_allocation: [
        `Emergency Resources Allocated${locationStr}`,
        `Additional Support Deployed${locationStr}`,
        `Resource Mobilization Update${locationStr}`,
        `Emergency Supplies Distribution${locationStr}`,
      ],
    }

    const templates = titleTemplates[category as keyof typeof titleTemplates] || titleTemplates.relief_operations
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateUpdateContent(category: string, disasterType: string, location?: string, source?: string): string {
    const locationStr = location ? ` in ${location}` : " in the affected region"

    const contentTemplates = {
      emergency_declaration: [
        `${source} has officially declared a state of emergency due to the ongoing ${disasterType}${locationStr}. All emergency protocols have been activated and additional resources are being mobilized to support affected communities. Emergency response teams are coordinating relief efforts across multiple districts.`,
        `Following the severe impact of ${disasterType}${locationStr}, authorities have declared an emergency situation. Emergency services are coordinating response efforts and residents are advised to follow official guidelines. All available resources have been deployed for immediate assistance.`,
      ],
      evacuation_order: [
        `Mandatory evacuation orders have been issued for high-risk areas${locationStr}. Residents in designated zones must evacuate immediately to designated safe locations. Transportation assistance is available for those who need it. Emergency shelters have been established with adequate facilities.`,
        `Due to escalating ${disasterType} conditions${locationStr}, evacuation procedures are now in effect. Emergency shelters have been established and evacuation routes are clearly marked. All residents in vulnerable areas are urged to comply immediately.`,
      ],
      relief_operations: [
        `${source} has expanded relief operations${locationStr}. Emergency supplies including food, water, medical aid, and temporary shelter are being distributed to affected populations. Additional relief teams have been deployed to support ongoing efforts. Mobile medical units are operational across affected areas.`,
        `Comprehensive relief operations are underway${locationStr}. Mobile medical units, emergency food distribution centers, and temporary shelters are operational. Coordination centers have been established for efficient aid distribution. International assistance is being coordinated through official channels.`,
      ],
      weather_alert: [
        `Weather services have issued an updated alert regarding continued ${disasterType} risk${locationStr}. Current meteorological conditions indicate potential for additional severe weather. Monitoring stations report conditions that may lead to further incidents. Public advised to stay informed through official channels.`,
        `Latest weather analysis shows ongoing threat of ${disasterType}${locationStr}. Monitoring stations report conditions that may lead to further incidents. Emergency services remain on high alert. Citizens are advised to avoid unnecessary travel and stay in safe locations.`,
      ],
    }

    const templates = contentTemplates[category as keyof typeof contentTemplates] || contentTemplates.relief_operations
    return templates[Math.floor(Math.random() * templates.length)]
  }

  private generateSourceUrl(source: string): string {
    const urlMappings = {
      NDMA: "https://ndma.gov.in/emergency-updates",
      "Indian Red Cross": "https://indianredcross.org/emergency-response",
      IMD: "https://mausam.imd.gov.in/warnings",
      "State Disaster Management": "https://sdma.gov.in/updates",
      "District Collector": "https://district.gov.in/emergency",
      "Emergency Services": "https://emergency.gov.in/updates",
      "UN Disaster Relief": "https://unocha.org/disaster-response",
      "Oxfam India": "https://oxfamindia.org/emergency-response",
      "Save the Children": "https://savethechildren.in/emergency",
      "Volunteer Organizations": "https://volunteer-network.org/emergency",
      "Weather Department": "https://weather.gov.in/alerts",
      "Meteorological Office": "https://metoffice.gov.in/warnings",
      "PMO India": "https://pmindia.gov.in/emergency-updates",
      "Cyclone Warning Centre": "https://cyclonewarning.gov.in/alerts",
    }

    return urlMappings[source as keyof typeof urlMappings] || "https://emergency-updates.gov.in"
  }

  // Mock trending topics analysis
  async getTrendingTopics(timeframe: "1h" | "6h" | "24h" = "24h"): Promise<
    {
      topic: string
      mentions: number
      sentiment: "positive" | "negative" | "neutral"
      urgency: "low" | "medium" | "high"
    }[]
  > {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const baseTopics = [
      { topic: "flood relief", mentions: 1250, sentiment: "neutral", urgency: "high" },
      { topic: "evacuation centers", mentions: 890, sentiment: "positive", urgency: "medium" },
      { topic: "emergency supplies", mentions: 756, sentiment: "neutral", urgency: "high" },
      { topic: "rescue operations", mentions: 634, sentiment: "positive", urgency: "high" },
      { topic: "weather warning", mentions: 523, sentiment: "negative", urgency: "medium" },
      { topic: "volunteer help", mentions: 445, sentiment: "positive", urgency: "low" },
      { topic: "road closures", mentions: 378, sentiment: "negative", urgency: "medium" },
      { topic: "power outage", mentions: 289, sentiment: "negative", urgency: "medium" },
      { topic: "medical assistance", mentions: 267, sentiment: "positive", urgency: "high" },
      { topic: "donation drive", mentions: 234, sentiment: "positive", urgency: "low" },
    ]

    // Adjust mentions based on timeframe
    const multiplier = timeframe === "1h" ? 0.1 : timeframe === "6h" ? 0.4 : 1
    
    return baseTopics.map(topic => ({
      ...topic,
      mentions: Math.floor(topic.mentions * multiplier * (0.8 + Math.random() * 0.4))
    })).sort((a, b) => b.mentions - a.mentions)
  }

  async getSourceReliability(): Promise<{
    source: string
    reliability_score: number
    total_updates: number
    verified_updates: number
  }[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    return [
      { source: "NDMA", reliability_score: 0.98, total_updates: 156, verified_updates: 153 },
      { source: "IMD", reliability_score: 0.96, total_updates: 234, verified_updates: 225 },
      { source: "State Disaster Management", reliability_score: 0.94, total_updates: 189, verified_updates: 178 },
      { source: "Indian Red Cross", reliability_score: 0.92, total_updates: 145, verified_updates: 133 },
      { source: "Emergency Services", reliability_score: 0.90, total_updates: 267, verified_updates: 240 },
      { source: "District Collector", reliability_score: 0.88, total_updates: 123, verified_updates: 108 },
      { source: "UN Disaster Relief", reliability_score: 0.95, total_updates: 89, verified_updates: 85 },
      { source: "Weather Department", reliability_score: 0.93, total_updates: 198, verified_updates: 184 },
    ].sort((a, b) => b.reliability_score - a.reliability_score)
  }
}

export const mockOfficialUpdates = new MockOfficialUpdatesService()
