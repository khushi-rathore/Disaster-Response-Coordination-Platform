import { aiContentGenerator } from "./ai-content-generator"

export class EnhancedMockOfficialUpdatesService {
  private sources = {
    government: [
      "National Disaster Management Authority (NDMA)",
      "India Meteorological Department (IMD)",
      "Ministry of Home Affairs",
      "State Disaster Management Authority",
      "District Collector Office",
      "Emergency Operations Center",
      "Chief Minister's Office",
      "Disaster Response Force",
    ],
    ngo: [
      "Indian Red Cross Society",
      "Oxfam India",
      "Save the Children India",
      "United Nations Office for Disaster Risk Reduction",
      "World Health Organization India",
      "UNICEF India",
      "Doctors Without Borders",
      "Habitat for Humanity India",
    ],
    international: [
      "UN Disaster Assessment Team",
      "International Federation of Red Cross",
      "World Food Programme",
      "Asian Development Bank",
      "European Union Humanitarian Aid",
      "USAID Disaster Response",
      "Japan International Cooperation Agency",
      "Australian Aid Program",
    ],
  }

  async generateRealTimeUpdates(location: string, disasterType?: string): Promise<any[]> {
    const updates = []
    const updateCount = 5 + Math.floor(Math.random() * 8) // 5-12 updates

    // Get location analysis first
    const locationAnalysis = await aiContentGenerator.generateLocationAnalysis(location)

    for (let i = 0; i < updateCount; i++) {
      const sourceType = this.getRandomSourceType()
      const source = this.getRandomSource(sourceType)
      const category = this.getRandomCategory(sourceType)
      const severity = this.getSeverityBasedOnRisk(locationAnalysis.riskLevel)

      const context = {
        location,
        disasterType: disasterType || this.getRandomDisasterType(),
        severity,
        timeframe: this.getRandomTimeframe(),
      }

      try {
        const aiUpdate = await aiContentGenerator.generateOfficialUpdate(context, source, category)

        updates.push({
          id: `ai-update-${Date.now()}-${i}`,
          source,
          source_type: sourceType,
          title: aiUpdate.title,
          content: aiUpdate.content,
          timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
          category,
          priority: aiUpdate.priority,
          reliability_score: this.getReliabilityScore(sourceType),
          verification_status: sourceType === "government" ? "verified" : "pending",
          url: this.generateSourceUrl(source),
          location,
          tags: aiUpdate.tags,
          ai_generated: true,
          location_analysis: i === 0 ? locationAnalysis : undefined, // Include analysis in first update
        })
      } catch (error) {
        console.error("Error generating AI update:", error)
        // Fallback to basic update
        updates.push(this.generateBasicUpdate(context, source, sourceType, category))
      }

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  private getRandomSourceType(): "government" | "ngo" | "international" {
    const types = ["government", "government", "government", "ngo", "international"] // Weight towards government
    return types[Math.floor(Math.random() * types.length)] as "government" | "ngo" | "international"
  }

  private getRandomSource(sourceType: "government" | "ngo" | "international"): string {
    const sources = this.sources[sourceType]
    return sources[Math.floor(Math.random() * sources.length)]
  }

  private getRandomCategory(sourceType: string): string {
    const categories = {
      government: [
        "emergency_declaration",
        "evacuation_order",
        "resource_allocation",
        "safety_advisory",
        "weather_alert",
      ],
      ngo: ["relief_operations", "medical_assistance", "volunteer_recruitment", "donation_drive", "aid_distribution"],
      international: [
        "humanitarian_aid",
        "technical_assistance",
        "funding_announcement",
        "coordination_meeting",
        "assessment_report",
      ],
    }

    const categoryList = categories[sourceType as keyof typeof categories] || categories.government
    return categoryList[Math.floor(Math.random() * categoryList.length)]
  }

  private getSeverityBasedOnRisk(riskLevel: string): "low" | "medium" | "high" | "critical" {
    switch (riskLevel) {
      case "critical":
        return Math.random() > 0.3 ? "critical" : "high"
      case "high":
        return Math.random() > 0.5 ? "high" : "medium"
      case "medium":
        return Math.random() > 0.7 ? "medium" : "low"
      default:
        return "low"
    }
  }

  private getRandomDisasterType(): string {
    const types = ["flood", "cyclone", "earthquake", "landslide", "drought", "heatwave", "wildfire", "tsunami"]
    return types[Math.floor(Math.random() * types.length)]
  }

  private getRandomTimeframe(): string {
    const timeframes = [
      "in the past 2 hours",
      "developing situation",
      "ongoing emergency",
      "latest update",
      "breaking news",
      "urgent situation",
      "continuing monitoring",
    ]
    return timeframes[Math.floor(Math.random() * timeframes.length)]
  }

  private getReliabilityScore(sourceType: string): number {
    switch (sourceType) {
      case "government":
        return 0.92 + Math.random() * 0.08 // 92-100%
      case "ngo":
        return 0.85 + Math.random() * 0.1 // 85-95%
      case "international":
        return 0.88 + Math.random() * 0.1 // 88-98%
      default:
        return 0.8 + Math.random() * 0.15 // 80-95%
    }
  }

  private generateSourceUrl(source: string): string {
    const urlMap: { [key: string]: string } = {
      "National Disaster Management Authority (NDMA)": "https://ndma.gov.in/alerts",
      "India Meteorological Department (IMD)": "https://mausam.imd.gov.in/warnings",
      "Indian Red Cross Society": "https://indianredcross.org/emergency",
      "Ministry of Home Affairs": "https://mha.gov.in/disaster-updates",
    }

    return urlMap[source] || `https://emergency-updates.gov.in/${source.toLowerCase().replace(/\s+/g, "-")}`
  }

  private generateBasicUpdate(context: any, source: string, sourceType: string, category: string) {
    return {
      id: `basic-update-${Date.now()}-${Math.random()}`,
      source,
      source_type: sourceType,
      title: `${source} - ${category.replace("_", " ").toUpperCase()} for ${context.location}`,
      content: `Official update from ${source} regarding the ${context.disasterType} situation in ${context.location}. Emergency response protocols are active and monitoring continues.`,
      timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString(),
      category,
      priority: context.severity,
      reliability_score: this.getReliabilityScore(sourceType),
      verification_status: sourceType === "government" ? "verified" : "pending",
      url: this.generateSourceUrl(source),
      location: context.location,
      tags: [context.disasterType, context.location, "emergency"],
      ai_generated: false,
    }
  }
}

export const enhancedMockOfficialUpdates = new EnhancedMockOfficialUpdatesService()
