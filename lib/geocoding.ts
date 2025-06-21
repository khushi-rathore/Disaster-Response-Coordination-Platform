export class GeocodingService {
  // Mock Indian cities with coordinates
  private mockLocations: Record<string, GeocodeResult> = {
    delhi: { lat: 28.7041, lng: 77.1025, formatted_address: "New Delhi, Delhi, India", confidence: 0.95 },
    mumbai: { lat: 19.076, lng: 72.8777, formatted_address: "Mumbai, Maharashtra, India", confidence: 0.95 },
    bangalore: { lat: 12.9716, lng: 77.5946, formatted_address: "Bangalore, Karnataka, India", confidence: 0.95 },
    chennai: { lat: 13.0827, lng: 80.2707, formatted_address: "Chennai, Tamil Nadu, India", confidence: 0.95 },
    kolkata: { lat: 22.5726, lng: 88.3639, formatted_address: "Kolkata, West Bengal, India", confidence: 0.95 },
    hyderabad: { lat: 17.385, lng: 78.4867, formatted_address: "Hyderabad, Telangana, India", confidence: 0.95 },
    pune: { lat: 18.5204, lng: 73.8567, formatted_address: "Pune, Maharashtra, India", confidence: 0.95 },
    ahmedabad: { lat: 23.0225, lng: 72.5714, formatted_address: "Ahmedabad, Gujarat, India", confidence: 0.95 },
    guwahati: { lat: 26.1445, lng: 91.7362, formatted_address: "Guwahati, Assam, India", confidence: 0.95 },
    wayanad: { lat: 11.6854, lng: 76.1319, formatted_address: "Wayanad, Kerala, India", confidence: 0.95 },
  }

  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200))

      const normalizedAddress = address.toLowerCase()

      // Check for exact matches first
      for (const [key, location] of Object.entries(this.mockLocations)) {
        if (normalizedAddress.includes(key)) {
          return {
            ...location,
            // Add some random variation to make it more realistic
            lat: location.lat + (Math.random() - 0.5) * 0.01,
            lng: location.lng + (Math.random() - 0.5) * 0.01,
          }
        }
      }

      // If no match found, return a random location in India
      const randomLat = 8 + Math.random() * 29 // India's latitude range
      const randomLng = 68 + Math.random() * 29 // India's longitude range

      return {
        lat: randomLat,
        lng: randomLng,
        formatted_address: `${address}, India`,
        confidence: 0.6,
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      return null
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Find closest mock location
      let closestLocation = ""
      let minDistance = Number.POSITIVE_INFINITY

      for (const [key, location] of Object.entries(this.mockLocations)) {
        const distance = Math.sqrt(Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2))
        if (distance < minDistance) {
          minDistance = distance
          closestLocation = location.formatted_address
        }
      }

      return closestLocation || `${lat.toFixed(4)}, ${lng.toFixed(4)}, India`
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return null
    }
  }
}

export const geocodingService = new GeocodingService()

interface GeocodeResult {
  lat: number
  lng: number
  formatted_address: string
  place_id?: string
  confidence: number
}
