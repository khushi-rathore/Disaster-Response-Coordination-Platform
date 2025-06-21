import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" })

  async extractLocation(description: string): Promise<string | null> {
    try {
      const prompt = `Extract the location name from the following disaster description. Return only the location name (city, state/country format if possible), or "NONE" if no location is found:

Description: ${description}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const location = response.text().trim()

      return location === "NONE" ? null : location
    } catch (error) {
      console.error("Gemini location extraction error:", error)
      return null
    }
  }

  async verifyImage(imageUrl: string): Promise<{
    isAuthentic: boolean
    confidence: number
    analysis: string
  }> {
    try {
      const prompt = `Analyze this disaster-related image for authenticity and context. Consider:
1. Signs of digital manipulation or editing
2. Consistency with disaster scenarios
3. Image quality and metadata indicators
4. Visual context clues

Provide a JSON response with:
- isAuthentic (boolean)
- confidence (0-100)
- analysis (brief explanation)

Image URL: ${imageUrl}`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch {
        // Fallback if JSON parsing fails
        return {
          isAuthentic: true,
          confidence: 50,
          analysis: "Unable to perform detailed analysis",
        }
      }
    } catch (error) {
      console.error("Gemini image verification error:", error)
      return {
        isAuthentic: true,
        confidence: 0,
        analysis: "Verification service unavailable",
      }
    }
  }
}

export const gemini = new GeminiService()
