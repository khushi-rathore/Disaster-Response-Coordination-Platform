import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    // Get disaster with related data
    const { data: disaster, error } = await supabase
      .from("disasters")
      .select(`
        *,
        disaster_reports(*),
        resources(*),
        alerts(*),
        response_teams(*)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Disaster not found", details: error.message }, { status: 404 })
    }

    return NextResponse.json({ disaster })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { title, description, tags, severity, status, user_id } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (tags !== undefined) updateData.tags = tags
    if (severity !== undefined) updateData.severity = severity
    if (status !== undefined) updateData.status = status

    const { data, error } = await supabase.from("disasters").update(updateData).eq("id", params.id).select().single()

    if (error) throw error

    console.log(`Updated disaster: ${data.title} by ${user_id}`)

    return NextResponse.json({ disaster: data })
  } catch (error) {
    console.error("Update disaster error:", error)
    return NextResponse.json(
      { error: "Failed to update disaster", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
