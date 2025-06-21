interface SocialMediaPost {
  id: string
  platform: "twitter" | "facebook" | "instagram"
  author: string
  verified: boolean
  content: string
  timestamp: string
  location?: string
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  priority: "urgent" | "high" | "medium" | "low"
  sentiment: "positive" | "negative" | "neutral"
  tags: string[]
}

class MockSocialMediaService {
  private generateMockPost(disasterId: string, index: number): SocialMediaPost {
    const platforms = ["twitter", "facebook", "instagram"] as const
    const priorities = ["urgent", "high", "medium", "low"] as const
    const sentiments = ["positive", "negative", "neutral"] as const

    const authors = [
      "EmergencyAlert",
      "LocalReporter",
      "WeatherUpdate",
      "CommunityHelper",
      "NewsChannel7",
      "DisasterResponse",
      "SafetyFirst",
      "LocalGov",
      "RedCrossIndia",
      "NDMAIndia",
      "WeatherIndia",
      "EmergencyIndia",
    ]

    const contents = [
      "🚨 URGENT: Flash flood warning issued for low-lying areas. Residents advised to move to higher ground immediately. #FloodAlert #Safety",
      "📍 Rescue operations underway in affected areas. Emergency shelters set up at community centers. Contact 108 for assistance. #DisasterResponse",
      "⚠️ Heavy rainfall expected to continue for next 6 hours. Avoid unnecessary travel. Stay indoors and stay safe. #WeatherAlert",
      "🏥 Medical teams deployed to affected regions. First aid stations operational 24/7. Emergency supplies being distributed. #MedicalAid",
      "📢 Evacuation orders for riverside communities. Buses available at designated pickup points. Follow official instructions. #Evacuation",
      "🌊 Water levels rising rapidly in main river. All boats and ferries suspended. Bridge closures in effect. #FloodUpdate",
      "🚁 Helicopter rescue operations active. If stranded, signal with bright cloth or mirror. Help is on the way. #RescueOps",
      "📱 Emergency helpline numbers: 108, 1070, 1077. Keep phones charged and stay connected with family. #EmergencyContact",
      "🏠 Temporary shelters available with food and water. Bring essential documents and medicines. #Shelter #Relief",
      "⛈️ Storm intensity decreasing but remain vigilant. Cleanup operations to begin once weather clears. #StormUpdate",
    ]

    const locations = [
      "Mumbai, Maharashtra",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Hyderabad, Telangana",
      "Pune, Maharashtra",
      "Ahmedabad, Gujarat",
      "Kochi, Kerala",
      "Bhubaneswar, Odisha",
      "Guwahati, Assam",
    ]

    const tags = [
      ["FloodAlert", "Safety", "Emergency"],
      ["DisasterResponse", "Rescue", "Help"],
      ["WeatherAlert", "Rain", "Storm"],
      ["MedicalAid", "Health", "FirstAid"],
      ["Evacuation", "Safety", "Emergency"],
      ["FloodUpdate", "Water", "Alert"],
      ["RescueOps", "Helicopter", "Emergency"],
      ["EmergencyContact", "Helpline", "Support"],
      ["Shelter", "Relief", "Aid"],
      ["StormUpdate", "Weather", "Safety"],
    ]

    const platform = platforms[index % platforms.length]
    const priority = priorities[index % priorities.length]
    const sentiment = sentiments[index % sentiments.length]
    const author = authors[index % authors.length]
    const content = contents[index % contents.length]
    const location = locations[index % locations.length]
    const postTags = tags[index % tags.length]

    return {
      id: `${disasterId}-${platform}-${index}`,
      platform,
      author,
      verified: Math.random() > 0.3, // 70% verified accounts
      content,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within last hour
      location,
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 10,
        comments: Math.floor(Math.random() * 100) + 5,
        shares: Math.floor(Math.random() * 200) + 2,
      },
      priority,
      sentiment,
      tags: postTags,
    }
  }

  async fetchDisasterReports(disasterId: string, keywords: string[] = []): Promise<SocialMediaPost[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate 15-20 mock posts
    const postCount = Math.floor(Math.random() * 6) + 15
    const posts = Array.from({ length: postCount }, (_, index) => this.generateMockPost(disasterId, index))

    return posts
  }

  async getTrendingTopics(timeframe = "24h"): Promise<string[]> {
    const topics = [
      "FloodAlert",
      "EmergencyResponse",
      "SafetyFirst",
      "DisasterRelief",
      "WeatherUpdate",
      "RescueOps",
      "CommunitySupport",
      "StayStrong",
      "HelpNeeded",
      "EmergencyServices",
      "FloodWarning",
      "StaySafe",
    ]

    // Return 5-8 random trending topics
    const shuffled = topics.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.floor(Math.random() * 4) + 5)
  }
}

export const mockSocialMedia = new MockSocialMediaService()
