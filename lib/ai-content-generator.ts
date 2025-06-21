import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { google } from "@ai-sdk/google"

interface DisasterContext {
  location: string
  disasterType: string
  severity: "low" | "medium" | "high" | "critical"
  timeframe: string
}

export class AIContentGenerator {
  async generateOfficialUpdate(
    context: DisasterContext,
    source: string,
    category: string,
  ): Promise<{
    title: string
    content: string
    priority: string
    tags: string[]
  }> {
    try {
      // Try Grok first with correct model name
      const { text } = await generateText({
        model: xai("grok-2-1212"), // Updated to correct Grok model
        prompt: `Generate an official disaster management update for ${source} regarding a ${context.severity} level ${context.disasterType} in ${context.location}. 

Category: ${category}
Context: This is ${context.timeframe}

Requirements:
- Write in official government/emergency services tone
- Include specific actionable information
- Mention resources, evacuation procedures, or safety measures
- Keep it factual and urgent when appropriate
- Include relevant contact information or next steps

Format as JSON:
{
  "title": "Official announcement title",
  "content": "Detailed official statement (2-3 paragraphs)",
  "priority": "critical|high|medium|low",
  "tags": ["tag1", "tag2", "tag3"]
}`,
        temperature: 0.7,
      })

      return JSON.parse(text)
    } catch (grokError) {
      console.log("Grok unavailable, trying Gemini fallback:", grokError)

      try {
        // Fallback to Gemini for official updates
        const { text } = await generateText({
          model: google("gemini-1.5-flash"),
          prompt: `Generate an official disaster management update for ${source} regarding a ${context.severity} level ${context.disasterType} in ${context.location}. 

Category: ${category}
Context: This is ${context.timeframe}

Requirements:
- Write in official government/emergency services tone
- Include specific actionable information
- Mention resources, evacuation procedures, or safety measures
- Keep it factual and urgent when appropriate
- Include relevant contact information or next steps

Format as JSON:
{
  "title": "Official announcement title",
  "content": "Detailed official statement (2-3 paragraphs)",
  "priority": "critical|high|medium|low",
  "tags": ["tag1", "tag2", "tag3"]
}`,
          temperature: 0.7,
        })

        return JSON.parse(text)
      } catch (geminiError) {
        console.log("Both AI services unavailable, using enhanced fallback")
        return this.getEnhancedFallbackUpdate(context, source, category)
      }
    }
  }

  async generateSocialMediaPost(context: DisasterContext): Promise<{
    content: string
    platform: string
    engagement: { likes: number; shares: number; comments: number }
    hashtags: string[]
    verified: boolean
  }> {
    try {
      // Use Gemini for social media style content
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `Generate a realistic social media post about a ${context.severity} level ${context.disasterType} in ${context.location}.

Context: ${context.timeframe}

Requirements:
- Write like a concerned citizen, news outlet, or emergency responder
- Include relevant hashtags
- Make it feel authentic and urgent
- Include location-specific details
- Vary between platforms (Twitter, Facebook, Instagram)

Format as JSON:
{
  "content": "Social media post content (realistic length)",
  "platform": "twitter|facebook|instagram",
  "engagement": {"likes": number, "shares": number, "comments": number},
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "verified": boolean
}`,
        temperature: 0.8,
      })

      return JSON.parse(text)
    } catch (error) {
      console.log("Gemini unavailable for social media, using enhanced fallback")
      return this.getEnhancedFallbackSocialPost(context)
    }
  }

  async generateLocationAnalysis(location: string): Promise<{
    riskLevel: string
    currentConditions: string
    recommendations: string[]
    nearbyResources: string[]
  }> {
    try {
      // Try Gemini first for location analysis
      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `Analyze the disaster risk and current conditions for ${location}, India.

Provide a comprehensive assessment including:
- Current risk level for natural disasters
- Weather and environmental conditions
- Safety recommendations for residents
- Available emergency resources and facilities

Format as JSON:
{
  "riskLevel": "low|medium|high|critical",
  "currentConditions": "Current weather/environmental assessment",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "nearbyResources": ["resource1", "resource2", "resource3"]
}`,
        temperature: 0.6,
      })

      return JSON.parse(text)
    } catch (error) {
      console.log("AI unavailable for location analysis, using enhanced fallback")
      return this.getEnhancedLocationAnalysis(location)
    }
  }

  private getEnhancedFallbackUpdate(context: DisasterContext, source: string, category: string) {
    const templates = {
      emergency_declaration: {
        title: `${source} Declares Emergency for ${context.disasterType.toUpperCase()} in ${context.location}`,
        content: `${source} has officially declared a state of emergency due to the ongoing ${context.disasterType} affecting ${context.location}. Emergency response teams have been deployed and are coordinating relief operations. Residents are advised to follow evacuation orders and stay tuned to official channels for updates. Emergency helpline: 1077. All non-essential travel to the affected area is discouraged.`,
      },
      evacuation_order: {
        title: `Immediate Evacuation Order Issued for ${context.location} - ${context.disasterType.toUpperCase()}`,
        content: `${source} has issued an immediate evacuation order for residents in ${context.location} due to the ${context.severity} level ${context.disasterType}. Evacuation centers have been established at local schools and community centers. Transportation assistance is available for those who need it. Please take essential documents, medications, and emergency supplies. Contact emergency services at 108 for assistance.`,
      },
      relief_operations: {
        title: `${source} Launches Relief Operations in ${context.location}`,
        content: `${source} has initiated comprehensive relief operations in ${context.location} following the ${context.disasterType}. Relief camps are providing food, water, medical aid, and temporary shelter. Volunteers and donations are being coordinated through district authorities. Medical teams are on standby for emergency care. For assistance or to volunteer, contact the local emergency operations center.`,
      },
    }

    const template = templates[category as keyof typeof templates] || templates.emergency_declaration

    return {
      title: template.title,
      content: template.content,
      priority: context.severity === "critical" ? "critical" : context.severity === "high" ? "high" : "medium",
      tags: [context.disasterType, context.location, "emergency", "official", category.replace("_", "")],
    }
  }

  private getEnhancedFallbackSocialPost(context: DisasterContext) {
    const templates = [
      `🚨 URGENT: ${context.severity.toUpperCase()} ${context.disasterType} alert for ${context.location}! Emergency services are responding. Please stay safe and follow official guidelines. #DisasterAlert #${context.location.replace(/\s+/g, "")} #EmergencyResponse`,
      `Breaking: ${context.disasterType} situation in ${context.location} requires immediate attention. Local authorities are coordinating response efforts. Stay informed through official channels. #${context.disasterType.toUpperCase()} #${context.location.replace(/\s+/g, "")} #StaySafe`,
      `⚠️ ${context.location} residents: ${context.disasterType} conditions are ${context.severity}. Emergency shelters are open. Follow evacuation orders if issued. Help is on the way! #DisasterResponse #${context.location.replace(/\s+/g, "")} #Emergency`,
    ]

    const platforms = ["twitter", "facebook", "instagram"]
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)]
    const selectedPlatform = platforms[Math.floor(Math.random() * platforms.length)]

    return {
      content: selectedTemplate,
      platform: selectedPlatform,
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 200) + 20,
      },
      hashtags: [
        "DisasterAlert",
        context.location.replace(/\s+/g, ""),
        "EmergencyResponse",
        context.disasterType.toUpperCase(),
        "StaySafe",
      ],
      verified: Math.random() > 0.6,
    }
  }

  private getEnhancedLocationAnalysis(location: string): {
    riskLevel: string
    currentConditions: string
    recommendations: string[]
    nearbyResources: string[]
  } {
    // Enhanced location-specific analysis based on common Indian disaster patterns
    const locationRisks: { [key: string]: any } = {
      mumbai: {
        riskLevel: "high",
        currentConditions:
          "Monsoon season brings high flood risk. Coastal areas vulnerable to cyclones and storm surges.",
        recommendations: [
          "Monitor IMD weather warnings closely",
          "Avoid low-lying areas during heavy rainfall",
          "Keep emergency supplies for 72 hours",
          "Stay away from waterlogged roads",
        ],
        nearbyResources: [
          "Brihanmumbai Municipal Corporation Emergency Control Room",
          "King Edward Memorial Hospital",
          "Mumbai Fire Brigade Headquarters",
          "Disaster Management Cell - BMC",
        ],
      },
      delhi: {
        riskLevel: "medium",
        currentConditions:
          "Air quality concerns and extreme weather events. Flood risk during monsoon in low-lying areas.",
        recommendations: [
          "Monitor air quality index daily",
          "Stay hydrated during extreme heat",
          "Avoid outdoor activities during poor AQI",
          "Keep masks and air purifiers ready",
        ],
        nearbyResources: [
          "Delhi Disaster Management Authority",
          "All India Institute of Medical Sciences",
          "Delhi Fire Service",
          "Emergency Operations Center - Delhi",
        ],
      },
      chennai: {
        riskLevel: "high",
        currentConditions: "Cyclone season and urban flooding risks. Coastal vulnerability to storm surges.",
        recommendations: [
          "Track cyclone forecasts from IMD",
          "Secure loose objects during storms",
          "Avoid beaches during rough weather",
          "Keep emergency communication devices charged",
        ],
        nearbyResources: [
          "Tamil Nadu State Disaster Management Authority",
          "Government General Hospital",
          "Chennai Corporation Disaster Management",
          "Coast Guard District Headquarters",
        ],
      },
    }

    const locationKey = location.toLowerCase()
    const specificRisk = locationRisks[locationKey]

    if (specificRisk) {
      return specificRisk
    }

    // Generic analysis for other locations
    return {
      riskLevel: "medium",
      currentConditions: `Monitoring weather patterns and potential disaster risks for ${location}. Seasonal variations may affect risk levels.`,
      recommendations: [
        "Stay informed through official weather updates",
        "Maintain emergency supply kit",
        "Know evacuation routes and shelter locations",
        "Register with local emergency services",
      ],
      nearbyResources: [
        `${location} District Emergency Operations Center`,
        `${location} District Hospital`,
        `${location} Fire and Emergency Services`,
        `${location} Police Control Room`,
      ],
    }
  }
}

export const aiContentGenerator = new AIContentGenerator()
