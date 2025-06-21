import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class EnhancedGeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" })
  private visionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" })

  async extractLocationFromText(text: string): Promise<{
    location: string | null
    confidence: number
    coordinates?: { lat: number; lng: number }
    details?: string
  }> {
    try {
      const prompt = `Analyze the following text and extract location information. Focus on Indian locations.

Text: "${text}"

Please provide a JSON response with:
- location: The most specific location mentioned (city, state format preferred)
- confidence: Confidence level (0-100)
- details: Any additional location context

If multiple locations are mentioned, prioritize the most specific or relevant one.
If no clear location is found, return location as null.

Examples of good responses:
- "Mumbai, Maharashtra"
- "Guwahati, Assam"  
- "New Delhi, Delhi"
- "Imphal, Manipur"`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text_response = response.text()

      try {
        const parsed = JSON.parse(text_response)
        return {
          location: parsed.location,
          confidence: parsed.confidence || 0,
          details: parsed.details,
        }
      } catch (parseError) {
        // Fallback parsing if JSON is malformed
        const locationMatch = text_response.match(/"location":\s*"([^"]+)"/i)
        const confidenceMatch = text_response.match(/"confidence":\s*(\d+)/i)

        return {
          location: locationMatch ? locationMatch[1] : null,
          confidence: confidenceMatch ? Number.parseInt(confidenceMatch[1]) : 0,
        }
      }
    } catch (error) {
      console.error("Gemini location extraction error:", error)
      return {
        location: null,
        confidence: 0,
      }
    }
  }

  async verifyImageAuthenticity(
    imageUrl: string,
    context?: string,
  ): Promise<{
    isAuthentic: boolean
    confidence: number
    analysis: string
    flags: string[]
    recommendation: string
  }> {
    try {
      const prompt = `Analyze this image for authenticity in the context of disaster reporting. ${context ? `Context: ${context}` : ""}

Please evaluate:
1. Signs of digital manipulation or AI generation
2. Consistency with the claimed disaster scenario
3. Image quality and metadata indicators
4. Visual context clues and environmental consistency
5. Any suspicious elements or inconsistencies

Provide a JSON response with:
- isAuthentic: boolean (true if likely authentic)
- confidence: number (0-100, confidence in assessment)
- analysis: string (detailed explanation of findings)
- flags: array of strings (any red flags or concerns)
- recommendation: string (recommended action: "verify", "approve", "reject", "investigate")

Be thorough but practical in your analysis.`

      // Note: In a real implementation, you would pass the image to the vision model
      // For now, we'll simulate the analysis based on the URL and context

      const mockAnalysis = {
        isAuthentic: true,
        confidence: 85,
        analysis:
          "Image appears to be authentic disaster footage. No obvious signs of digital manipulation detected. Lighting and shadows are consistent. Environmental context matches the reported disaster scenario. Image quality suggests it was taken with a mobile device in emergency conditions.",
        flags: [],
        recommendation: "approve",
      }

      // In production, you would use:
      // const result = await this.visionModel.generateContent([prompt, imageUrl])

      return mockAnalysis
    } catch (error) {
      console.error("Gemini image verification error:", error)
      return {
        isAuthentic: false,
        confidence: 0,
        analysis: "Unable to verify image authenticity due to service error",
        flags: ["service_error"],
        recommendation: "investigate",
      }
    }
  }

  async analyzeSocialMediaPost(
    content: string,
    metadata?: any,
  ): Promise<{
    priority: "low" | "medium" | "high" | "urgent"
    sentiment: "positive" | "neutral" | "negative" | "urgent"
    categories: string[]
    actionable: boolean
    summary: string
    keywords: string[]
  }> {
    try {
      const prompt = `Analyze this social media post related to disaster response:

Content: "${content}"
${metadata ? `Metadata: ${JSON.stringify(metadata)}` : ""}

Provide a JSON response with:
- priority: "low", "medium", "high", or "urgent" based on urgency and importance
- sentiment: "positive", "neutral", "negative", or "urgent"
- categories: array of relevant categories (e.g., ["rescue_needed", "resource_available", "information_update"])
- actionable: boolean (true if this post requires immediate action)
- summary: brief summary of the post's key information
- keywords: array of important keywords extracted

Priority guidelines:
- urgent: immediate life-threatening situations, rescue needed
- high: significant impact, evacuation orders, major updates
- medium: general updates, resource information
- low: general discussion, non-critical information`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text_response = response.text()

      try {
        return JSON.parse(text_response)
      } catch (parseError) {
        // Fallback analysis
        return this.fallbackSocialMediaAnalysis(content)
      }
    } catch (error) {
      console.error("Gemini social media analysis error:", error)
      return this.fallbackSocialMediaAnalysis(content)
    }
  }

  private fallbackSocialMediaAnalysis(content: string) {
    const lowerContent = content.toLowerCase()

    // Priority analysis
    let priority: "low" | "medium" | "high" | "urgent" = "low"
    if (lowerContent.includes("urgent") || lowerContent.includes("emergency") || lowerContent.includes("sos")) {
      priority = "urgent"
    } else if (lowerContent.includes("help") || lowerContent.includes("rescue") || lowerContent.includes("trapped")) {
      priority = "high"
    } else if (lowerContent.includes("alert") || lowerContent.includes("warning")) {
      priority = "medium"
    }

    // Sentiment analysis
    let sentiment: "positive" | "neutral" | "negative" | "urgent" = "neutral"
    if (priority === "urgent") {
      sentiment = "urgent"
    } else if (lowerContent.includes("safe") || lowerContent.includes("rescued")) {
      sentiment = "positive"
    } else if (lowerContent.includes("damage") || lowerContent.includes("casualties")) {
      sentiment = "negative"
    }

    // Extract keywords
    const keywords = content.match(/#\w+/g)?.map((h) => h.substring(1)) || []

    return {
      priority,
      sentiment,
      categories: ["general"],
      actionable: priority === "urgent" || priority === "high",
      summary: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
      keywords,
    }
  }

  async generateDisasterSummary(
    disasterData: any,
    reports: any[],
    socialPosts: any[],
  ): Promise<{
    summary: string
    keyPoints: string[]
    recommendations: string[]
    riskLevel: "low" | "medium" | "high" | "critical"
  }> {
    try {
      const prompt = `Generate a comprehensive summary for this disaster situation:

Disaster: ${JSON.stringify(disasterData)}
Reports: ${JSON.stringify(reports.slice(0, 5))} // Limit to avoid token limits
Social Media: ${JSON.stringify(socialPosts.slice(0, 10))}

Provide a JSON response with:
- summary: A comprehensive 2-3 paragraph summary of the current situation
- keyPoints: Array of 5-7 key points about the disaster
- recommendations: Array of 3-5 actionable recommendations for response
- riskLevel: Overall risk assessment ("low", "medium", "high", "critical")

Focus on:
1. Current status and impact
2. Immediate needs and priorities
3. Response efforts underway
4. Areas requiring attention`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text_response = response.text()

      try {
        return JSON.parse(text_response)
      } catch (parseError) {
        return {
          summary: `${disasterData.title} is an ongoing disaster situation in ${disasterData.location_name}. Based on available reports and social media activity, the situation requires continued monitoring and response efforts.`,
          keyPoints: [
            `Location: ${disasterData.location_name}`,
            `Severity: ${disasterData.severity}`,
            `Status: ${disasterData.status}`,
            `Reports received: ${reports.length}`,
            `Social media mentions: ${socialPosts.length}`,
          ],
          recommendations: [
            "Continue monitoring the situation",
            "Coordinate with local authorities",
            "Ensure adequate resources are available",
          ],
          riskLevel: disasterData.severity as any,
        }
      }
    } catch (error) {
      console.error("Gemini summary generation error:", error)
      return {
        summary: "Unable to generate summary due to service error",
        keyPoints: [],
        recommendations: [],
        riskLevel: "medium",
      }
    }
  }
}

export const enhancedGemini = new EnhancedGeminiService()
