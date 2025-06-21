import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

const supabase = createServerClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const radius = Number.parseFloat(searchParams.get("radius") || "50") // km
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    // Get disaster location if coordinates not provided
    let disasterLat: number | null = null
    let disasterLng: number | null = null

    if (lat && lng) {
      disasterLat = Number.parseFloat(lat)
      disasterLng = Number.parseFloat(lng)
    } else {
      const { data: disaster } = await supabase.from("disasters").select("location").eq("id", params.id).single()

      if (disaster?.location) {
        // Extract coordinates from PostGIS POINT
        const locationMatch = disaster.location.match(/POINT$$([^)]+)$$/)
        if (locationMatch) {
          const [lng, lat] = locationMatch[1].split(" ").map(Number)
          disasterLat = lat
          disasterLng = lng
        }
      }
    }

    let query = supabase.from("resources").select("*").eq("disaster_id", params.id)

    // Filter by type if provided
    if (type) {
      query = query.eq("type", type)
    }

    const { data: resources, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
    }

    // If we have coordinates, also fetch nearby resources using PostGIS
    let nearbyResources: any[] = []
    if (disasterLat && disasterLng) {
      try {
        const { data: nearby, error: nearbyError } = await supabase.rpc("get_nearby_resources", {
          disaster_lat: disasterLat,
          disaster_lng: disasterLng,
          radius_km: radius,
        })

        if (!nearbyError && nearby) {
          nearbyResources = nearby
        }
      } catch (rpcError) {
        console.error("PostGIS query error:", rpcError)
      }
    }

    // Combine disaster-specific resources with nearby resources
    const allResources = [
      ...(resources || []),
      ...nearbyResources.filter((nearby) => !resources?.some((r) => r.id === nearby.id)),
    ]

    console.log(`Fetched ${allResources.length} resources for disaster: ${params.id}`)

    return NextResponse.json({
      resources: allResources,
      disaster_specific: resources?.length || 0,
      nearby: nearbyResources.length,
      search_radius_km: radius,
      coordinates: disasterLat && disasterLng ? { lat: disasterLat, lng: disasterLng } : null,
    })
  } catch (error) {
    console.error("Resources API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, description, location_name, type, capacity, contact_info, lat, lng } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields: name, type" }, { status: 400 })
    }

    const insertData: any = {
      disaster_id: params.id,
      name,
      description,
      type,
      capacity,
      contact_info: contact_info || {},
      availability: "available",
      verified: false,
    }

    if (location_name) {
      insertData.location_name = location_name
    }

    if (lat && lng) {
      insertData.location = `POINT(${lng} ${lat})`
    }

    const { data, error } = await supabase.from("resources").insert(insertData).select().single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create resource" }, { status: 500 })
    }

    console.log(`Created resource: ${data.name} for disaster: ${params.id}`)

    return NextResponse.json({ resource: data }, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
