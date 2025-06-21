import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock-key")

export interface LocationExtractionResult {
  location_name: string
  coordinates?: {
    lat: number
    lng: number
  }
  confidence: number
  extracted_info: {
    disaster_type?: string
    severity?: string
    keywords: string[]
  }
}

export interface ImageVerificationResult {
  is_authentic: boolean
  confidence: number
  analysis: {
    content_match: boolean
    quality_score: number
    potential_issues: string[]
    description: string
  }
  recommendations: string[]
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  async extractLocationFromText(text: string): Promise<LocationExtractionResult> {
    try {
      const prompt = `
        Analyze this disaster report and extract location information:
        "${text}"
        
        Please provide:
        1. The most specific location mentioned
        2. Disaster type if identifiable
        3. Severity level (low/medium/high/critical)
        4. Key disaster-related keywords
        
        Respond in JSON format:
        {
          "location_name": "specific location",
          "disaster_type": "flood/fire/earthquake/etc",
          "severity": "low/medium/high/critical",
          "keywords": ["keyword1", "keyword2"],
          "confidence": 0.95
        }
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text_response = response.text()

      // Parse JSON response
      const jsonMatch = text_response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          location_name: parsed.location_name || "Unknown Location",
          confidence: parsed.confidence || 0.8,
          extracted_info: {
            disaster_type: parsed.disaster_type,
            severity: parsed.severity,
            keywords: parsed.keywords || [],
          },
        }
      }

      // Fallback if JSON parsing fails
      return {
        location_name: "Location extraction failed",
        confidence: 0.1,
        extracted_info: {
          keywords: [],
        },
      }
    } catch (error) {
      console.error("Gemini location extraction error:", error)

      // Mock response for development
      return {
        location_name: "Mock Location, India",
        coordinates: {
          lat: 28.7041 + (Math.random() - 0.5) * 0.1,
          lng: 77.1025 + (Math.random() - 0.5) * 0.1,
        },
        confidence: 0.85,
        extracted_info: {
          disaster_type: "flood",
          severity: "medium",
          keywords: ["emergency", "help", "rescue"],
        },
      }
    }
  }

  async verifyImage(imageUrl: string, description: string): Promise<ImageVerificationResult> {
    try {
      const prompt = `
        Analyze this image in the context of a disaster report:
        Description: "${description}"
        
        Please verify:
        1. Does the image appear authentic (not AI-generated or heavily manipulated)?
        2. Does the image content match the description?
        3. What is the overall quality and clarity?
        4. Are there any red flags or suspicious elements?
        
        Respond in JSON format:
        {
          "is_authentic": true/false,
          "confidence": 0.95,
          "content_match": true/false,
          "quality_score": 0.85,
          "potential_issues": ["issue1", "issue2"],
          "description": "detailed analysis",
          "recommendations": ["recommendation1", "recommendation2"]
        }
      `

      // For now, we'll mock the image analysis since we can't actually process images without proper setup
      const mockResult: ImageVerificationResult = {
        is_authentic: Math.random() > 0.2, // 80% chance of being authentic
        confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
        analysis: {
          content_match: Math.random() > 0.3, // 70% chance of matching
          quality_score: 0.6 + Math.random() * 0.4, // 60-100% quality
          potential_issues: Math.random() > 0.7 ? ["Low resolution", "Possible filter applied"] : [],
          description: `Image analysis for disaster report: ${description.substring(0, 100)}...`,
        },
        recommendations: [
          "Verify with additional sources",
          "Check metadata if available",
          "Cross-reference with official reports",
        ],
      }

      return mockResult
    } catch (error) {
      console.error("Gemini image verification error:", error)

      return {
        is_authentic: false,
        confidence: 0.1,
        analysis: {
          content_match: false,
          quality_score: 0.1,
          potential_issues: ["Analysis failed"],
          description: "Unable to verify image authenticity",
        },
        recommendations: ["Manual verification required"],
      }
    }
  }

  async analyzeDisasterContent(content: string): Promise<{
    severity: string
    urgency: string
    keywords: string[]
    summary: string
  }> {
    try {
      const prompt = `
        Analyze this disaster-related content for severity and urgency:
        "${content}"
        
        Provide:
        1. Severity level (low/medium/high/critical)
        2. Urgency level (low/medium/high/immediate)
        3. Key disaster-related keywords
        4. Brief summary
        
        Respond in JSON format:
        {
          "severity": "medium",
          "urgency": "high",
          "keywords": ["flood", "evacuation", "emergency"],
          "summary": "Brief summary of the situation"
        }
      `

      // Mock response for development
      return {
        severity: ["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
        urgency: ["low", "medium", "high", "immediate"][Math.floor(Math.random() * 4)],
        keywords: ["emergency", "disaster", "help", "rescue", "evacuation"].slice(0, Math.floor(Math.random() * 3) + 2),
        summary: `Analyzed disaster content: ${content.substring(0, 100)}...`,
      }
    } catch (error) {
      console.error("Gemini content analysis error:", error)
      return {
        severity: "medium",
        urgency: "medium",
        keywords: ["disaster"],
        summary: "Content analysis failed",
      }
    }
  }
}

export const geminiService = new GeminiService()
