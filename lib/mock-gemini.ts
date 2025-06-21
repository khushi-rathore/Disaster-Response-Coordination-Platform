// Mock Gemini API service for development
export const geminiService = {
  async extractLocationFromText(text: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Extract location from common Indian cities/states
    const locations = [
      "Mumbai, Maharashtra",
      "Delhi, Delhi",
      "Bangalore, Karnataka",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Hyderabad, Telangana",
      "Pune, Maharashtra",
      "Ahmedabad, Gujarat",
      "Guwahati, Assam",
      "Kochi, Kerala",
      "Wayanad, Kerala",
      "Kamrup, Assam",
    ]

    // Find matching location in text
    const foundLocation = locations.find(
      (loc) =>
        text.toLowerCase().includes(loc.toLowerCase()) || text.toLowerCase().includes(loc.split(",")[0].toLowerCase()),
    )

    return {
      location_name: foundLocation || "Unknown Location",
      extracted_info: {
        disaster_type: this.extractDisasterType(text),
        confidence: 85,
      },
    }
  },

  async verifyImage(imageUrl: string, description: string) {
    // Mock image verification
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      is_authentic: Math.random() > 0.3, // 70% authentic
      confidence: Math.floor(Math.random() * 30) + 70,
      analysis: "Mock image verification completed",
    }
  },

  async analyzeDisasterContent(content: string) {
    // Mock content analysis
    await new Promise((resolve) => setTimeout(resolve, 200))

    const severityKeywords = {
      critical: ["emergency", "urgent", "critical", "death", "casualties", "trapped"],
      high: ["severe", "major", "evacuation", "rescue", "flooding"],
      medium: ["moderate", "warning", "alert", "watch"],
      low: ["minor", "advisory", "information"],
    }

    const contentLower = content.toLowerCase()
    let severity = "medium"

    for (const [level, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some((keyword) => contentLower.includes(keyword))) {
        severity = level
        break
      }
    }

    return {
      severity,
      urgency: severity === "critical" ? "immediate" : severity === "high" ? "high" : "normal",
      confidence: 80,
    }
  },

  extractDisasterType(text: string): string {
    const types = {
      flood: ["flood", "flooding", "water", "river", "overflow", "inundation"],
      fire: ["fire", "burning", "smoke", "flames", "wildfire"],
      earthquake: ["earthquake", "tremor", "seismic", "quake"],
      cyclone: ["cyclone", "hurricane", "storm", "winds"],
      landslide: ["landslide", "mudslide", "slope", "debris"],
      heatwave: ["heat", "temperature", "hot", "heatwave"],
      drought: ["drought", "water shortage", "dry", "arid"],
    }

    const textLower = text.toLowerCase()
    for (const [type, keywords] of Object.entries(types)) {
      if (keywords.some((keyword) => textLower.includes(keyword))) {
        return type
      }
    }

    return "other"
  },
}
