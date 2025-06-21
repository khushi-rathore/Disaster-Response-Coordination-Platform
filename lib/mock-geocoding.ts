// Mock geocoding service
export const geocodingService = {
  async geocode(address: string) {
    // Mock geocoding with common Indian locations
    const locations: Record<string, { lat: number; lng: number }> = {
      guwahati: { lat: 26.1445, lng: 91.7362 },
      assam: { lat: 26.2006, lng: 92.9376 },
      delhi: { lat: 28.7041, lng: 77.1025 },
      "new delhi": { lat: 28.6139, lng: 77.209 },
      mumbai: { lat: 19.076, lng: 72.8777 },
      chennai: { lat: 13.0827, lng: 80.2707 },
      bangalore: { lat: 12.9716, lng: 77.5946 },
      kolkata: { lat: 22.5726, lng: 88.3639 },
      hyderabad: { lat: 17.385, lng: 78.4867 },
      pune: { lat: 18.5204, lng: 73.8567 },
      ahmedabad: { lat: 23.0225, lng: 72.5714 },
      kochi: { lat: 9.9312, lng: 76.2673 },
      wayanad: { lat: 11.6854, lng: 76.132 },
      kamrup: { lat: 26.1445, lng: 91.7362 },
      kerala: { lat: 10.8505, lng: 76.2711 },
    }

    // Find matching location
    const addressLower = address.toLowerCase()
    for (const [key, coords] of Object.entries(locations)) {
      if (addressLower.includes(key)) {
        return coords
      }
    }

    // Default to Delhi if no match
    return { lat: 28.7041, lng: 77.1025 }
  },
}
