export class SocialMediaService {
  // Mock Twitter API implementation
  async fetchDisasterReports(disasterId: string, keywords: string[] = []): Promise<any[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockPosts = [
      {
        id: "1",
        user: "citizen1",
        content: "#floodrelief Need food and water in Lower East Side NYC. Families trapped on upper floors.",
        timestamp: new Date().toISOString(),
        location: "Lower East Side, NYC",
        priority: "high",
        keywords: ["flood", "relief", "food", "water"],
      },
      {
        id: "2",
        user: "volunteer_helper",
        content: "Offering shelter for 10 people in Brooklyn. DM me if you need help. #disasterrelief",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        location: "Brooklyn, NYC",
        priority: "medium",
        keywords: ["shelter", "help", "relief"],
      },
      {
        id: "3",
        user: "emergency_update",
        content: "URGENT: Water levels rising in Manhattan. Avoid subway stations. #emergency #flood",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        location: "Manhattan, NYC",
        priority: "urgent",
        keywords: ["urgent", "flood", "emergency"],
      },
      {
        id: "4",
        user: "local_news",
        content: "Red Cross setting up emergency shelter at Madison Square Garden. #disasterresponse",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        location: "Manhattan, NYC",
        priority: "medium",
        keywords: ["shelter", "red cross", "emergency"],
      },
    ]

    // Filter by keywords if provided
    if (keywords.length > 0) {
      return mockPosts.filter((post) =>
        keywords.some((keyword) =>
          post.keywords.some((postKeyword) => postKeyword.toLowerCase().includes(keyword.toLowerCase())),
        ),
      )
    }

    return mockPosts
  }

  async analyzePriority(content: string): Promise<"low" | "medium" | "high" | "urgent"> {
    const urgentKeywords = ["urgent", "sos", "emergency", "help", "trapped", "danger"]
    const highKeywords = ["need", "food", "water", "shelter", "medical", "rescue"]
    const mediumKeywords = ["offering", "available", "volunteer", "support"]

    const lowerContent = content.toLowerCase()

    if (urgentKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "urgent"
    }
    if (highKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "high"
    }
    if (mediumKeywords.some((keyword) => lowerContent.includes(keyword))) {
      return "medium"
    }

    return "low"
  }
}

export const socialMedia = new SocialMediaService()
