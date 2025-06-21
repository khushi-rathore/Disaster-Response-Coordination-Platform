import { type NextRequest, NextResponse } from "next/server"
import { mockSocialMedia } from "@/lib/mock-social-media"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const keywords = searchParams.get("keywords")?.split(",") || []
    const refresh = searchParams.get("refresh") === "true"

    console.log(`🔍 Fetching social media posts for disaster: ${params.id}`)

    // Fetch social media posts
    const posts = await mockSocialMedia.fetchDisasterReports(params.id, keywords)

    // Get trending topics
    const trendingTopics = await mockSocialMedia.getTrendingTopics("24h")

    console.log(`✅ Fetched ${posts.length} social media posts for disaster: ${params.id}`)

    return NextResponse.json({
      success: true,
      posts,
      trending_topics: trendingTopics,
      disaster_id: params.id,
      cached: false,
      totalCount: posts.length,
      keywords,
      filters: {
        platforms: ["twitter", "facebook", "instagram"],
        priorities: ["urgent", "high", "medium", "low"],
        sentiments: ["urgent", "negative", "neutral", "positive"],
      },
    })
  } catch (error) {
    console.error("❌ Social media API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch social media data",
        posts: [],
        trending_topics: [],
        totalCount: 0,
      },
      { status: 500 },
    )
  }
}
