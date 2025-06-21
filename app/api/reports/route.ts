import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const disasterId = searchParams.get("disaster_id")

    let query = supabase.from("disaster_reports").select("*").order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (disasterId) {
      query = query.eq("disaster_id", disasterId)
    }

    const { data: reports, error } = await query

    if (error) throw error

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { disaster_id, title, description, image_url, location_name, priority, user_id } = body

    if (!disaster_id || !title || !description) {
      return NextResponse.json({ error: "Disaster ID, title, and description are required" }, { status: 400 })
    }

    const { data: report, error } = await supabase
      .from("disaster_reports")
      .insert({
        disaster_id,
        user_id,
        title,
        description,
        image_url,
        location_name,
        priority: priority || "medium",
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
