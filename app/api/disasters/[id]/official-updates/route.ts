import { type NextRequest, NextResponse } from "next/server"
import { enhancedMockOfficialUpdates } from "@/lib/enhanced-mock-official-updates"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const location = url.searchParams.get("location") || "India"
    const disasterType = url.searchParams.get("type")

    // Generate AI-powered official updates
    const updates = await enhancedMockOfficialUpdates.generateRealTimeUpdates(location, disasterType || undefined)

    return NextResponse.json({
      success: true,
      updates,
      total: updates.length,
      ai_powered: true,
      location_analyzed: location,
    })
  } catch (error) {
    console.error("Error fetching official updates:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch official updates",
        updates: [],
      },
      { status: 500 },
    )
  }
}
