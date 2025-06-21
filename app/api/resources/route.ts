import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { geocodingService } from "@/lib/geocoding" // Declare the geocodingService variable

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status") || "active"
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radius = searchParams.get("radius") || "10"

    let query = supabase.from("resources").select("*").eq("status", status).order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    if (lat && lng) {
      const { data: nearbyResources, error } = await supabase.rpc("get_nearby_resources", {
        center_lat: Number.parseFloat(lat),
        center_lng: Number.parseFloat(lng),
        radius_km: Number.parseFloat(radius),
      })

      if (error) {
        console.error("Geographic query error:", error)
        // Fallback to regular query
        const { data, error: fallbackError } = await query.limit(50)
        if (fallbackError) throw fallbackError

        return NextResponse.json({ resources: data || [] })
      }

      // Filter by type if specified
      let filteredResources = nearbyResources || []
      if (type) {
        filteredResources = filteredResources.filter((r: any) => r.type === type)
      }

      return NextResponse.json({ resources: filteredResources })
    }

    const { data: resources, error } = await query.limit(100)

    if (error) throw error

    return NextResponse.json({ resources: resources || [] })
  } catch (error) {
    console.error("Error fetching resources:", error)
    return NextResponse.json({ error: "Failed to fetch resources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, description, location_name, capacity, contact_phone, facilities, user_id } = body

    if (!name || !type || !location_name) {
      return NextResponse.json({ error: "Name, type, and location are required" }, { status: 400 })
    }

    // Geocode the location
    const geocodeResult = await geocodingService.geocode(location_name)
    if (!geocodeResult) {
      return NextResponse.json({ error: "Could not geocode location" }, { status: 400 })
    }

    const coordinates = `POINT(${geocodeResult.lng} ${geocodeResult.lat})`

    const { data, error } = await supabase
      .from("resources")
      .insert({
        name,
        type,
        description,
        location_name,
        coordinates,
        capacity: capacity || null,
        current_occupancy: 0,
        status: "active",
        contact_phone,
        facilities: facilities || [],
        managed_by: user_id || null,
      })
      .select()
      .single()

    if (error) throw error

    console.log("✅ Resource created successfully:", data.id)

    return NextResponse.json({ resource: data })
  } catch (error) {
    console.error("Create resource error:", error)
    return NextResponse.json(
      { error: "Failed to create resource", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
