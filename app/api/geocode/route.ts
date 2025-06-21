import { type NextRequest, NextResponse } from "next/server"
import { enhancedGemini } from "@/lib/gemini-enhanced"
import { enhancedGeocoding } from "@/lib/geocoding-enhanced"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, location_name, country = "IN" } = body

    if (!text && !location_name) {
      return NextResponse.json({ error: "Either text or location_name is required" }, { status: 400 })
    }

    let locationToGeocode = location_name
    let extractionResult = null

    // If no location_name provided, extract from text using Gemini
    if (!locationToGeocode && text) {
      console.log("Extracting location from text using Gemini API")
      extractionResult = await enhancedGemini.extractLocationFromText(text)

      if (extractionResult.location && extractionResult.confidence > 50) {
        locationToGeocode = extractionResult.location
      }
    }

    if (!locationToGeocode) {
      return NextResponse.json(
        {
          error: "Could not extract location from text",
          extraction: extractionResult,
        },
        { status: 400 },
      )
    }

    // Geocode the location
    console.log(`Geocoding location: ${locationToGeocode}`)
    let geocodeResult = await enhancedGeocoding.geocode(locationToGeocode, country)

    // Try fallback for Indian cities if primary geocoding fails
    if (!geocodeResult && country === "IN") {
      geocodeResult = enhancedGeocoding.getFallbackCoordinates(locationToGeocode.split(",")[0].trim())
    }

    if (!geocodeResult) {
      return NextResponse.json(
        {
          error: "Could not geocode location",
          location_name: locationToGeocode,
          extraction: extractionResult,
        },
        { status: 400 },
      )
    }

    console.log(`Successfully geocoded "${locationToGeocode}" to ${geocodeResult.lat}, ${geocodeResult.lng}`)

    return NextResponse.json({
      location_name: locationToGeocode,
      coordinates: {
        lat: geocodeResult.lat,
        lng: geocodeResult.lng,
      },
      formatted_address: geocodeResult.formattedAddress,
      components: geocodeResult.components,
      confidence: geocodeResult.confidence,
      extracted_from_text: !location_name,
      extraction_details: extractionResult,
    })
  } catch (error) {
    console.error("Geocoding API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
