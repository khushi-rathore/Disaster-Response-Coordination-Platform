import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { geminiService } from "@/lib/mock-gemini"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"

    // Fetch disasters with counts
    const { data: disasters, error } = await supabase
      .from("disasters")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    // Get counts for each disaster
    const disastersWithCounts = await Promise.all(
      (disasters || []).map(async (disaster) => {
        const [reportsCount, resourcesCount, alertsCount] = await Promise.all([
          supabase.from("disaster_reports").select("id", { count: "exact" }).eq("disaster_id", disaster.id),
          supabase.from("resources").select("id", { count: "exact" }).eq("disaster_id", disaster.id),
          supabase.from("alerts").select("id", { count: "exact" }).eq("disaster_id", disaster.id),
        ])

        return {
          ...disaster,
          disaster_reports: [{ count: reportsCount.count || 0 }],
          resources: [{ count: resourcesCount.count || 0 }],
          alerts: [{ count: alertsCount.count || 0 }],
        }
      }),
    )

    return NextResponse.json({ disasters: disastersWithCounts })
  } catch (error) {
    console.error("Error fetching disasters:", error)
    return NextResponse.json(
      { error: "Failed to fetch disasters", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, tags, location_name, image_url, user_id } = body

    if (!title || !description || !location_name) {
      return NextResponse.json({ error: "Title, description, and location are required" }, { status: 400 })
    }

    // Use mock Gemini service
    const locationResult = await geminiService.extractLocationFromText(`${title} ${description} ${location_name}`)

    // Analyze content
    const contentAnalysis = await geminiService.analyzeDisasterContent(`${title} ${description}`)

    // Verify image if provided
    let imageVerification = null
    if (image_url) {
      imageVerification = await geminiService.verifyImage(image_url, description)
    }

    // Insert disaster
    const { data: disaster, error: disasterError } = await supabase
      .from("disasters")
      .insert({
        title,
        description,
        tags: tags || [],
        location_name: locationResult.location_name || location_name,
        severity: contentAnalysis.severity,
        disaster_type: locationResult.extracted_info.disaster_type,
        created_by: user_id,
        metadata: {
          gemini_analysis: locationResult,
          content_analysis: contentAnalysis,
          image_verification: imageVerification,
        },
      })
      .select()
      .single()

    if (disasterError) {
      console.error("Error creating disaster:", disasterError)
      throw disasterError
    }

    // Create initial report
    if (disaster) {
      await supabase.from("disaster_reports").insert({
        disaster_id: disaster.id,
        user_id,
        title: `Initial Report: ${title}`,
        description,
        image_url,
        location_name: locationResult.location_name || location_name,
        priority: contentAnalysis.urgency === "immediate" ? "urgent" : "high",
        status: "pending",
      })
    }

    return NextResponse.json({
      disaster,
      analysis: {
        location: locationResult,
        content: contentAnalysis,
        image_verification: imageVerification,
      },
    })
  } catch (error) {
    console.error("Error creating disaster:", error)
    return NextResponse.json(
      { error: "Failed to create disaster", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
