interface TwitterConfig {
  bearerToken: string
}

interface Tweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  geo?: {
    place_id: string
  }
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
    }
    entity: {
      id: string
      name: string
    }
  }>
}

interface TwitterUser {
  id: string
  username: string
  name: string
  verified: boolean
  location?: string
}

export class TwitterService {
  private config: TwitterConfig
  private baseUrl = "https://api.twitter.com/2"

  constructor() {
    this.config = {
      bearerToken: process.env.TWITTER_BEARER_TOKEN || "",
    }
  }

  private async makeRequest(endpoint: string, params: URLSearchParams = new URLSearchParams()) {
    if (!this.config.bearerToken) {
      console.warn("Twitter Bearer Token not configured, using mock data")
      return null
    }

    try {
      const url = `${this.baseUrl}${endpoint}?${params.toString()}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.bearerToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`Twitter API error: ${response.status} ${response.statusText}`)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Twitter API request failed:", error)
      return null
    }
  }

  async searchTweets(query: string, maxResults = 50): Promise<any[]> {
    const params = new URLSearchParams({
      query: query,
      max_results: maxResults.toString(),
      "tweet.fields": "created_at,public_metrics,context_annotations,geo,author_id",
      "user.fields": "username,name,verified,location",
      expansions: "author_id,geo.place_id",
    })

    const data = await this.makeRequest("/tweets/search/recent", params)

    if (!data) {
      return this.getMockTweets(query)
    }

    return this.formatTweets(data)
  }

  private formatTweets(data: any): any[] {
    const tweets = data.data || []
    const users = data.includes?.users || []
    const places = data.includes?.places || []

    return tweets.map((tweet: Tweet) => {
      const author = users.find((user: TwitterUser) => user.id === tweet.author_id)
      const place = places.find((p: any) => p.id === tweet.geo?.place_id)

      return {
        id: tweet.id,
        user: author?.username || "unknown",
        name: author?.name || "Unknown User",
        content: tweet.text,
        timestamp: tweet.created_at,
        location: author?.location || place?.full_name,
        verified: author?.verified || false,
        engagement: {
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          replies: tweet.public_metrics.reply_count,
          quotes: tweet.public_metrics.quote_count,
        },
        keywords: this.extractKeywords(tweet.text),
        priority: this.analyzePriority(tweet.text),
        sentiment: this.analyzeSentiment(tweet.text),
      }
    })
  }

  private extractKeywords(text: string): string[] {
    const hashtags = text.match(/#\w+/g) || []
    const keywords =
      text
        .toLowerCase()
        .match(/\b(emergency|urgent|help|rescue|flood|fire|earthquake|cyclone|disaster|alert|evacuation)\b/g) || []

    return [...hashtags.map((h) => h.substring(1)), ...keywords]
  }

  private analyzePriority(text: string): "low" | "medium" | "high" | "urgent" {
    const urgentKeywords = ["urgent", "emergency", "sos", "help", "rescue", "trapped", "danger", "critical"]
    const highKeywords = ["alert", "warning", "evacuation", "flood", "fire", "earthquake"]
    const mediumKeywords = ["update", "information", "advisory", "caution"]

    const lowerText = text.toLowerCase()

    if (urgentKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "urgent"
    }
    if (highKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "high"
    }
    if (mediumKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "medium"
    }

    return "low"
  }

  private analyzeSentiment(text: string): "positive" | "neutral" | "negative" | "urgent" {
    const urgentKeywords = ["emergency", "urgent", "sos", "help", "rescue"]
    const negativeKeywords = ["disaster", "damage", "casualties", "death", "injured", "destroyed"]
    const positiveKeywords = ["safe", "rescued", "help", "support", "relief", "recovered"]

    const lowerText = text.toLowerCase()

    if (urgentKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "urgent"
    }
    if (negativeKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "negative"
    }
    if (positiveKeywords.some((keyword) => lowerText.includes(keyword))) {
      return "positive"
    }

    return "neutral"
  }

  private getMockTweets(query: string): any[] {
    // Realistic mock tweets based on Indian disasters
    const mockTweets = [
      {
        id: "1234567890123456789",
        user: "AhmedabadPolice",
        name: "Ahmedabad Police",
        content:
          "URGENT: Aircraft emergency at SVPI Airport. All emergency services deployed. Avoid airport area. Updates to follow. #AhmedabadEmergency #AirportAlert",
        timestamp: new Date().toISOString(),
        location: "Ahmedabad, Gujarat",
        verified: true,
        engagement: { likes: 1250, retweets: 890, replies: 234, quotes: 45 },
        keywords: ["AhmedabadEmergency", "AirportAlert", "emergency", "urgent"],
        priority: "urgent",
        sentiment: "urgent",
      },
      {
        id: "1234567890123456790",
        user: "AssamFloodAlert",
        name: "Assam Disaster Management",
        content:
          "Brahmaputra water level rising rapidly. Evacuation orders for low-lying areas. Move to higher ground immediately. #AssamFloods #BrahmaputraAlert #Evacuation",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        location: "Guwahati, Assam",
        verified: true,
        engagement: { likes: 2100, retweets: 1500, replies: 456, quotes: 78 },
        keywords: ["AssamFloods", "BrahmaputraAlert", "evacuation", "flood"],
        priority: "urgent",
        sentiment: "urgent",
      },
      {
        id: "1234567890123456791",
        user: "DelhiTrafficPolice",
        name: "Delhi Traffic Police",
        content:
          "Yamuna water level at record high 208.5m. Several roads waterlogged. Avoid: Ring Road, ITO, Rajghat area. Use alternate routes. #DelhiFloods #YamunaFlood",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        location: "New Delhi, Delhi",
        verified: true,
        engagement: { likes: 3400, retweets: 2100, replies: 678, quotes: 123 },
        keywords: ["DelhiFloods", "YamunaFlood", "waterlogged", "alert"],
        priority: "high",
        sentiment: "negative",
      },
      {
        id: "1234567890123456792",
        user: "citizen_reporter",
        name: "Rajesh Kumar",
        content:
          "Need immediate help! Family trapped on 3rd floor in Yamuna Vihar. Water level rising fast. Please send rescue team! #DelhiFloods #Help #Emergency",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        location: "Delhi",
        verified: false,
        engagement: { likes: 567, retweets: 234, replies: 89, quotes: 12 },
        keywords: ["help", "trapped", "emergency", "rescue"],
        priority: "urgent",
        sentiment: "urgent",
      },
      {
        id: "1234567890123456793",
        user: "VolunteerIndia",
        name: "Volunteer India Network",
        content:
          "Setting up relief camp at Pragati Maidan. Food, water, and medical aid available for flood victims. Volunteers needed! #DelhiFloods #Relief #Volunteer",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        location: "Delhi",
        verified: false,
        engagement: { likes: 890, retweets: 456, replies: 123, quotes: 34 },
        keywords: ["relief", "volunteer", "help", "flood"],
        priority: "medium",
        sentiment: "positive",
      },
    ]

    // Filter based on query keywords
    const queryLower = query.toLowerCase()
    return mockTweets.filter(
      (tweet) =>
        tweet.content.toLowerCase().includes(queryLower) ||
        tweet.keywords.some((keyword) => keyword.toLowerCase().includes(queryLower)),
    )
  }

  async getDisasterTweets(disasterKeywords: string[], location?: string): Promise<any[]> {
    const query = this.buildSearchQuery(disasterKeywords, location)
    return await this.searchTweets(query, 50)
  }

  private buildSearchQuery(keywords: string[], location?: string): string {
    let query = keywords.map((k) => `"${k}"`).join(" OR ")

    if (location) {
      query += ` (place:"${location}" OR "${location}")`
    }

    // Add common disaster-related terms
    query += " (emergency OR alert OR help OR rescue OR disaster OR flood OR earthquake OR cyclone)"

    // Exclude retweets to get original content
    query += " -is:retweet"

    return query
  }
}

export const twitterService = new TwitterService()
