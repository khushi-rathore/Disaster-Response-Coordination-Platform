// Mock image verification service
export class MockImageVerificationService {
  async verifyImage(
    imageUrl: string,
    context?: string,
  ): Promise<{
    isAuthentic: boolean
    confidence: number
    analysis: string
    flags: string[]
    recommendation: string
    processingTime: number
  }> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate realistic mock verification results
    const scenarios = [
      {
        isAuthentic: true,
        confidence: 92,
        analysis:
          "Image appears to be authentic disaster footage. Lighting and shadows are consistent with outdoor emergency conditions. No obvious signs of digital manipulation detected. Environmental context matches reported disaster scenario.",
        flags: [],
        recommendation: "approve",
      },
      {
        isAuthentic: true,
        confidence: 78,
        analysis:
          "Likely authentic image with some compression artifacts. Image quality suggests mobile device capture under emergency conditions. Minor inconsistencies in metadata but within normal range for disaster documentation.",
        flags: ["low_resolution", "compression_artifacts"],
        recommendation: "approve",
      },
      {
        isAuthentic: false,
        confidence: 85,
        analysis:
          "Potential signs of digital manipulation detected. Inconsistent lighting patterns and possible composite elements. Image may be from a different location or time period than claimed.",
        flags: ["lighting_inconsistency", "possible_composite"],
        recommendation: "reject",
      },
      {
        isAuthentic: true,
        confidence: 65,
        analysis:
          "Moderate confidence in authenticity. Image shows signs of heavy processing or filtering which makes verification challenging. Context appears consistent with disaster scenario but requires manual review.",
        flags: ["heavy_processing", "filtered"],
        recommendation: "investigate",
      },
    ]

    // Select scenario based on image URL characteristics (for consistent results)
    const urlHash = imageUrl.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    const scenario = scenarios[Math.abs(urlHash) % scenarios.length]

    return {
      ...scenario,
      processingTime: 1500 + Math.random() * 1000,
    }
  }

  async batchVerifyImages(imageUrls: string[]): Promise<any[]> {
    const results = await Promise.all(imageUrls.map((url) => this.verifyImage(url)))

    return results.map((result, index) => ({
      imageUrl: imageUrls[index],
      ...result,
    }))
  }

  // Mock AI-powered content analysis
  async analyzeImageContent(imageUrl: string): Promise<{
    detectedObjects: string[]
    sceneType: string
    weatherConditions: string
    damageAssessment: string
    peopleCount: number
    urgencyLevel: "low" | "medium" | "high" | "critical"
  }> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockAnalysis = [
      {
        detectedObjects: ["flood_water", "buildings", "vehicles", "people"],
        sceneType: "urban_flooding",
        weatherConditions: "heavy_rain",
        damageAssessment: "moderate_infrastructure_damage",
        peopleCount: Math.floor(Math.random() * 20) + 5,
        urgencyLevel: "high" as const,
      },
      {
        detectedObjects: ["debris", "damaged_buildings", "rescue_vehicles"],
        sceneType: "earthquake_aftermath",
        weatherConditions: "clear",
        damageAssessment: "severe_structural_damage",
        peopleCount: Math.floor(Math.random() * 15) + 2,
        urgencyLevel: "critical" as const,
      },
      {
        detectedObjects: ["smoke", "fire", "emergency_vehicles"],
        sceneType: "fire_incident",
        weatherConditions: "windy",
        damageAssessment: "active_fire_damage",
        peopleCount: Math.floor(Math.random() * 10) + 1,
        urgencyLevel: "critical" as const,
      },
    ]

    return mockAnalysis[Math.floor(Math.random() * mockAnalysis.length)]
  }
}

export const mockImageVerification = new MockImageVerificationService()
