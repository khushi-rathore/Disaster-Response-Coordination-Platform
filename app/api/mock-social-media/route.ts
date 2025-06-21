import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keywords = searchParams.get("keywords")?.split(",") || []

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockPosts = [
      {
        id: "1",
        user: "emergency_citizen",
        content: "#emergency Trapped in building on 5th street, water rising fast! Need immediate help! #flood #NYC",
        timestamp: new Date().toISOString(),
        location: "Manhattan, NYC",
        priority: "urgent",
        keywords: ["emergency", "trapped", "flood", "help"],
        engagement: { likes: 45, retweets: 23, replies: 12 },
      },
      {
        id: "2",
        user: "volunteer_network",
        content:
          "Setting up emergency shelter at Brooklyn Community Center. Can house 100 people. #disasterrelief #shelter",
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        location: "Brooklyn, NYC",
        priority: "high",
        keywords: ["shelter", "relief", "volunteer"],
        engagement: { likes: 78, retweets: 34, replies: 8 },
      },
      {
        id: "3",
        user: "local_restaurant",
        content: "Free hot meals available for flood victims at Tony's Pizza. Open 24/7 during emergency. #foodrelief",
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        location: "Queens, NYC",
        priority: "medium",
        keywords: ["food", "relief", "free"],
        engagement: { likes: 156, retweets: 67, replies: 23 },
      },
      {
        id: "4",
        user: "medical_volunteer",
        content:
          "Mobile medical unit deployed to affected areas. First aid and emergency care available. #medicalaid #emergency",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        location: "Manhattan, NYC",
        priority: "high",
        keywords: ["medical", "emergency", "aid"],
        engagement: { likes: 89, retweets: 45, replies: 15 },
      },
      {
        id: "5",
        user: "transport_update",
        content:
          "Subway lines 4,5,6 suspended due to flooding. Emergency buses running on alternate routes. #transportation",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        location: "NYC",
        priority: "medium",
        keywords: ["transportation", "subway", "emergency"],
        engagement: { likes: 234, retweets: 123, replies: 45 },
      },
    ]

    // Filter by keywords if provided
    let filteredPosts = mockPosts
    if (keywords.length > 0) {
      filteredPosts = mockPosts.filter((post) =>
        keywords.some(
          (keyword) =>
            post.keywords.some((postKeyword) => postKeyword.toLowerCase().includes(keyword.toLowerCase())) ||
            post.content.toLowerCase().includes(keyword.toLowerCase()),
        ),
      )
    }

    return NextResponse.json({
      posts: filteredPosts,
      metadata: {
        total: filteredPosts.length,
        keywords: keywords,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Mock social media API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
