interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress: string
  components: {
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
  confidence: number
}

export class EnhancedGeocodingService {
  // Comprehensive Indian cities database for mock geocoding
  private readonly indianCities: { [key: string]: { lat: number; lng: number; state: string; district?: string } } = {
    // Major metros
    mumbai: { lat: 19.076, lng: 72.8777, state: "Maharashtra" },
    delhi: { lat: 28.7041, lng: 77.1025, state: "Delhi" },
    bangalore: { lat: 12.9716, lng: 77.5946, state: "Karnataka" },
    hyderabad: { lat: 17.385, lng: 78.4867, state: "Telangana" },
    ahmedabad: { lat: 23.0225, lng: 72.5714, state: "Gujarat" },
    chennai: { lat: 13.0827, lng: 80.2707, state: "Tamil Nadu" },
    kolkata: { lat: 22.5726, lng: 88.3639, state: "West Bengal" },
    pune: { lat: 18.5204, lng: 73.8567, state: "Maharashtra" },

    // State capitals
    jaipur: { lat: 26.9124, lng: 75.7873, state: "Rajasthan" },
    lucknow: { lat: 26.8467, lng: 80.9462, state: "Uttar Pradesh" },
    bhopal: { lat: 23.2599, lng: 77.4126, state: "Madhya Pradesh" },
    gandhinagar: { lat: 23.2156, lng: 72.6369, state: "Gujarat" },
    chandigarh: { lat: 30.7333, lng: 76.7794, state: "Chandigarh" },
    thiruvananthapuram: { lat: 8.5241, lng: 76.9366, state: "Kerala" },
    bhubaneswar: { lat: 20.2961, lng: 85.8245, state: "Odisha" },
    guwahati: { lat: 26.1445, lng: 91.7362, state: "Assam" },
    imphal: { lat: 24.817, lng: 93.9063, state: "Manipur" },
    shillong: { lat: 25.5788, lng: 91.8933, state: "Meghalaya" },
    aizawl: { lat: 23.7307, lng: 92.7173, state: "Mizoram" },
    kohima: { lat: 25.6751, lng: 94.1086, state: "Nagaland" },
    itanagar: { lat: 27.0844, lng: 93.6053, state: "Arunachal Pradesh" },
    agartala: { lat: 23.8315, lng: 91.2868, state: "Tripura" },
    gangtok: { lat: 27.3389, lng: 88.6065, state: "Sikkim" },
    shimla: { lat: 31.1048, lng: 77.1734, state: "Himachal Pradesh" },
    srinagar: { lat: 34.0837, lng: 74.7973, state: "Jammu and Kashmir" },
    jammu: { lat: 32.7266, lng: 74.857, state: "Jammu and Kashmir" },
    leh: { lat: 34.1526, lng: 77.5771, state: "Ladakh" },
    dehradun: { lat: 30.3165, lng: 78.0322, state: "Uttarakhand" },
    ranchi: { lat: 23.3441, lng: 85.3096, state: "Jharkhand" },
    raipur: { lat: 21.2514, lng: 81.6296, state: "Chhattisgarh" },
    panaji: { lat: 15.4909, lng: 73.8278, state: "Goa" },

    // Major cities
    kanpur: { lat: 26.4499, lng: 80.3319, state: "Uttar Pradesh" },
    nagpur: { lat: 21.1458, lng: 79.0882, state: "Maharashtra" },
    indore: { lat: 22.7196, lng: 75.8577, state: "Madhya Pradesh" },
    thane: { lat: 19.2183, lng: 72.9781, state: "Maharashtra" },
    visakhapatnam: { lat: 17.6868, lng: 83.2185, state: "Andhra Pradesh" },
    patna: { lat: 25.5941, lng: 85.1376, state: "Bihar" },
    vadodara: { lat: 22.3072, lng: 73.1812, state: "Gujarat" },
    ghaziabad: { lat: 28.6692, lng: 77.4538, state: "Uttar Pradesh" },
    ludhiana: { lat: 30.901, lng: 75.8573, state: "Punjab" },
    agra: { lat: 27.1767, lng: 78.0081, state: "Uttar Pradesh" },
    nashik: { lat: 19.9975, lng: 73.7898, state: "Maharashtra" },
    faridabad: { lat: 28.4089, lng: 77.3178, state: "Haryana" },
    meerut: { lat: 28.9845, lng: 77.7064, state: "Uttar Pradesh" },
    rajkot: { lat: 22.3039, lng: 70.8022, state: "Gujarat" },
    varanasi: { lat: 25.3176, lng: 82.9739, state: "Uttar Pradesh" },
    aurangabad: { lat: 19.8762, lng: 75.3433, state: "Maharashtra" },
    dhanbad: { lat: 23.7957, lng: 86.4304, state: "Jharkhand" },
    amritsar: { lat: 31.634, lng: 74.8723, state: "Punjab" },
    allahabad: { lat: 25.4358, lng: 81.8463, state: "Uttar Pradesh" },
    howrah: { lat: 22.5958, lng: 88.2636, state: "West Bengal" },
    coimbatore: { lat: 11.0168, lng: 76.9558, state: "Tamil Nadu" },
    jabalpur: { lat: 23.1815, lng: 79.9864, state: "Madhya Pradesh" },
    gwalior: { lat: 26.2183, lng: 78.1828, state: "Madhya Pradesh" },
    vijayawada: { lat: 16.5062, lng: 80.648, state: "Andhra Pradesh" },
    jodhpur: { lat: 26.2389, lng: 73.0243, state: "Rajasthan" },
    madurai: { lat: 9.9252, lng: 78.1198, state: "Tamil Nadu" },
    kota: { lat: 25.2138, lng: 75.8648, state: "Rajasthan" },
    solapur: { lat: 17.6599, lng: 75.9064, state: "Maharashtra" },
    hubli: { lat: 15.3647, lng: 75.124, state: "Karnataka" },
    bareilly: { lat: 28.367, lng: 79.4304, state: "Uttar Pradesh" },
    moradabad: { lat: 28.8386, lng: 78.7733, state: "Uttar Pradesh" },
    mysore: { lat: 12.2958, lng: 76.6394, state: "Karnataka" },
    gurgaon: { lat: 28.4595, lng: 77.0266, state: "Haryana" },
    aligarh: { lat: 27.8974, lng: 78.088, state: "Uttar Pradesh" },
    jalandhar: { lat: 31.326, lng: 75.5762, state: "Punjab" },
    tiruchirappalli: { lat: 10.7905, lng: 78.7047, state: "Tamil Nadu" },
    salem: { lat: 11.6643, lng: 78.146, state: "Tamil Nadu" },
    warangal: { lat: 17.9689, lng: 79.5941, state: "Telangana" },
    guntur: { lat: 16.3067, lng: 80.4365, state: "Andhra Pradesh" },
    amravati: { lat: 20.9374, lng: 77.7796, state: "Maharashtra" },
    bikaner: { lat: 28.0229, lng: 73.3119, state: "Rajasthan" },
    noida: { lat: 28.5355, lng: 77.391, state: "Uttar Pradesh" },
    jamshedpur: { lat: 22.8046, lng: 86.2029, state: "Jharkhand" },
    cuttack: { lat: 20.4625, lng: 85.8828, state: "Odisha" },
    firozabad: { lat: 27.1592, lng: 78.3957, state: "Uttar Pradesh" },
    kochi: { lat: 9.9312, lng: 76.2673, state: "Kerala" },
    bhavnagar: { lat: 21.7645, lng: 72.1519, state: "Gujarat" },
    durgapur: { lat: 23.5204, lng: 87.3119, state: "West Bengal" },
    asansol: { lat: 23.6739, lng: 86.9524, state: "West Bengal" },
    nanded: { lat: 19.1383, lng: 77.321, state: "Maharashtra" },
    kolhapur: { lat: 16.705, lng: 74.2433, state: "Maharashtra" },
    ajmer: { lat: 26.4499, lng: 74.6399, state: "Rajasthan" },
    akola: { lat: 20.7002, lng: 77.0082, state: "Maharashtra" },
    gulbarga: { lat: 17.3297, lng: 76.8343, state: "Karnataka" },
    jamnagar: { lat: 22.4707, lng: 70.0577, state: "Gujarat" },
    ujjain: { lat: 23.1765, lng: 75.7885, state: "Madhya Pradesh" },
    siliguri: { lat: 26.7271, lng: 88.3953, state: "West Bengal" },
    jhansi: { lat: 25.4484, lng: 78.5685, state: "Uttar Pradesh" },
    mangalore: { lat: 12.9141, lng: 74.856, state: "Karnataka" },
    erode: { lat: 11.341, lng: 77.7172, state: "Tamil Nadu" },
    belgaum: { lat: 15.8497, lng: 74.4977, state: "Karnataka" },
    tirunelveli: { lat: 8.7139, lng: 77.7567, state: "Tamil Nadu" },
    gaya: { lat: 24.7914, lng: 85.0002, state: "Bihar" },
    jalgaon: { lat: 21.0077, lng: 75.5626, state: "Maharashtra" },
    udaipur: { lat: 24.5854, lng: 73.7125, state: "Rajasthan" },

    // Disaster-prone areas
    kedarnath: { lat: 30.7346, lng: 79.0669, state: "Uttarakhand" },
    badrinath: { lat: 30.7433, lng: 79.4938, state: "Uttarakhand" },
    rishikesh: { lat: 30.0869, lng: 78.2676, state: "Uttarakhand" },
    haridwar: { lat: 29.9457, lng: 78.1642, state: "Uttarakhand" },
    mussoorie: { lat: 30.4598, lng: 78.0664, state: "Uttarakhand" },
    nainital: { lat: 29.3803, lng: 79.4636, state: "Uttarakhand" },
    almora: { lat: 29.5971, lng: 79.6593, state: "Uttarakhand" },
    pithoragarh: { lat: 29.5828, lng: 80.2194, state: "Uttarakhand" },
    chamoli: { lat: 30.4086, lng: 79.3206, state: "Uttarakhand" },
    uttarkashi: { lat: 30.7268, lng: 78.4354, state: "Uttarakhand" },

    // Kerala districts (flood-prone)
    wayanad: { lat: 11.6854, lng: 76.1319, state: "Kerala" },
    idukki: { lat: 9.8547, lng: 76.9366, state: "Kerala" },
    munnar: { lat: 10.0889, lng: 77.0595, state: "Kerala" },
    thekkady: { lat: 9.5939, lng: 77.1603, state: "Kerala" },
    alappuzha: { lat: 9.4981, lng: 76.3388, state: "Kerala" },
    kottayam: { lat: 9.5916, lng: 76.5222, state: "Kerala" },
    kozhikode: { lat: 11.2588, lng: 75.7804, state: "Kerala" },
    thrissur: { lat: 10.5276, lng: 76.2144, state: "Kerala" },
    palakkad: { lat: 10.7867, lng: 76.6548, state: "Kerala" },
    malappuram: { lat: 11.041, lng: 76.0788, state: "Kerala" },

    // Assam (flood-prone)
    dibrugarh: { lat: 27.4728, lng: 94.912, state: "Assam" },
    jorhat: { lat: 26.7509, lng: 94.2037, state: "Assam" },
    silchar: { lat: 24.8333, lng: 92.7789, state: "Assam" },
    tezpur: { lat: 26.6335, lng: 92.7983, state: "Assam" },
    nagaon: { lat: 26.3467, lng: 92.6836, state: "Assam" },
    karimganj: { lat: 24.8697, lng: 92.3542, state: "Assam" },

    // Odisha (cyclone-prone)
    puri: { lat: 19.8135, lng: 85.8312, state: "Odisha" },
    konark: { lat: 19.8876, lng: 86.0977, state: "Odisha" },
    balasore: { lat: 21.4942, lng: 86.9336, state: "Odisha" },
    berhampur: { lat: 19.3149, lng: 84.7941, state: "Odisha" },
    sambalpur: { lat: 21.4669, lng: 83.9812, state: "Odisha" },
    rourkela: { lat: 22.2604, lng: 84.8536, state: "Odisha" },

    // Gujarat (earthquake/cyclone-prone)
    bhuj: { lat: 23.242, lng: 69.6669, state: "Gujarat" },
    kutch: { lat: 23.7337, lng: 69.8597, state: "Gujarat" },
    porbandar: { lat: 21.6417, lng: 69.6293, state: "Gujarat" },
    dwarka: { lat: 22.2394, lng: 68.9678, state: "Gujarat" },
    somnath: { lat: 20.888, lng: 70.4017, state: "Gujarat" },
    anand: { lat: 22.5645, lng: 72.9289, state: "Gujarat" },
    mehsana: { lat: 23.588, lng: 72.3693, state: "Gujarat" },

    // Tamil Nadu (cyclone-prone)
    cuddalore: { lat: 11.748, lng: 79.7714, state: "Tamil Nadu" },
    nagapattinam: { lat: 10.7667, lng: 79.842, state: "Tamil Nadu" },
    thanjavur: { lat: 10.787, lng: 79.1378, state: "Tamil Nadu" },
    puducherry: { lat: 11.9416, lng: 79.8083, state: "Puducherry" },
    vellore: { lat: 12.9165, lng: 79.1325, state: "Tamil Nadu" },
    kanchipuram: { lat: 12.8185, lng: 79.7037, state: "Tamil Nadu" },

    // Andhra Pradesh (cyclone-prone)
    kakinada: { lat: 16.9891, lng: 82.2475, state: "Andhra Pradesh" },
    rajahmundry: { lat: 17.0005, lng: 81.804, state: "Andhra Pradesh" },
    nellore: { lat: 14.4426, lng: 79.9865, state: "Andhra Pradesh" },
    tirupati: { lat: 13.6288, lng: 79.4192, state: "Andhra Pradesh" },
    chittoor: { lat: 13.2172, lng: 79.1003, state: "Andhra Pradesh" },

    // West Bengal (cyclone/flood-prone)
    siliguri: { lat: 26.7271, lng: 88.3953, state: "West Bengal" },
    darjeeling: { lat: 27.036, lng: 88.2627, state: "West Bengal" },
    kalimpong: { lat: 27.0584, lng: 88.4675, state: "West Bengal" },
    malda: { lat: 25.0961, lng: 88.1435, state: "West Bengal" },
    murshidabad: { lat: 24.1751, lng: 88.2426, state: "West Bengal" },
    nadia: { lat: 23.4731, lng: 88.5615, state: "West Bengal" },

    // Maharashtra (drought/flood-prone)
    latur: { lat: 18.4088, lng: 76.5604, state: "Maharashtra" },
    osmanabad: { lat: 18.176, lng: 76.0395, state: "Maharashtra" },
    beed: { lat: 18.9894, lng: 75.7585, state: "Maharashtra" },
    marathwada: { lat: 19.1383, lng: 76.7094, state: "Maharashtra" },
    vidarbha: { lat: 20.9374, lng: 78.1122, state: "Maharashtra" },

    // Rajasthan (drought-prone)
    jaisalmer: { lat: 26.9157, lng: 70.9083, state: "Rajasthan" },
    barmer: { lat: 25.7521, lng: 71.3962, state: "Rajasthan" },
    churu: { lat: 28.2969, lng: 74.9647, state: "Rajasthan" },
    sikar: { lat: 27.6094, lng: 75.1399, state: "Rajasthan" },
    alwar: { lat: 27.553, lng: 76.6346, state: "Rajasthan" },
    bharatpur: { lat: 27.2152, lng: 77.503, state: "Rajasthan" },
  }

  async geocode(locationName: string, countryBias = "IN"): Promise<GeocodeResult | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 500))

    console.log(`🗺️ Mock geocoding: "${locationName}"`)

    // Clean and normalize the location name
    const cleanLocation = this.cleanLocationName(locationName)

    // Try exact match first
    let result = this.findExactMatch(cleanLocation)

    // Try fuzzy matching if exact match fails
    if (!result) {
      result = this.findFuzzyMatch(cleanLocation)
    }

    // Try partial matching for compound locations
    if (!result) {
      result = this.findPartialMatch(cleanLocation)
    }

    if (result) {
      console.log(`✅ Geocoded "${locationName}" to ${result.lat}, ${result.lng}`)
      return result
    }

    console.log(`❌ Could not geocode "${locationName}"`)
    return null
  }

  private cleanLocationName(locationName: string): string {
    return locationName
      .toLowerCase()
      .trim()
      .replace(/[,\-\s]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  private findExactMatch(cleanLocation: string): GeocodeResult | null {
    // Try direct city name match
    const cityData = this.indianCities[cleanLocation.replace(/\s+/g, "")]
    if (cityData) {
      return this.createResult(cleanLocation, cityData)
    }

    // Try with common variations
    const variations = [
      cleanLocation.replace(/\s+/g, ""),
      cleanLocation.replace("new ", ""),
      cleanLocation.replace("old ", ""),
      cleanLocation.replace("greater ", ""),
    ]

    for (const variation of variations) {
      const data = this.indianCities[variation]
      if (data) {
        return this.createResult(cleanLocation, data)
      }
    }

    return null
  }

  private findFuzzyMatch(cleanLocation: string): GeocodeResult | null {
    const words = cleanLocation.split(" ")

    // Try matching individual words
    for (const word of words) {
      if (word.length >= 3) {
        const cityData = this.indianCities[word]
        if (cityData) {
          return this.createResult(word, cityData)
        }
      }
    }

    // Try substring matching
    for (const [cityKey, cityData] of Object.entries(this.indianCities)) {
      if (cityKey.includes(cleanLocation.replace(/\s+/g, "")) || cleanLocation.replace(/\s+/g, "").includes(cityKey)) {
        return this.createResult(cityKey, cityData)
      }
    }

    return null
  }

  private findPartialMatch(cleanLocation: string): GeocodeResult | null {
    // Extract potential city and state
    const parts = cleanLocation.split(" ")

    // Look for state names
    const stateKeywords = {
      maharashtra: "Maharashtra",
      gujarat: "Gujarat",
      karnataka: "Karnataka",
      "tamil nadu": "Tamil Nadu",
      kerala: "Kerala",
      "west bengal": "West Bengal",
      "uttar pradesh": "Uttar Pradesh",
      rajasthan: "Rajasthan",
      "madhya pradesh": "Madhya Pradesh",
      bihar: "Bihar",
      odisha: "Odisha",
      assam: "Assam",
      punjab: "Punjab",
      haryana: "Haryana",
      delhi: "Delhi",
      goa: "Goa",
    }

    let detectedState = null
    for (const [key, state] of Object.entries(stateKeywords)) {
      if (cleanLocation.includes(key)) {
        detectedState = state
        break
      }
    }

    // If we found a state, look for cities in that state
    if (detectedState) {
      for (const [cityKey, cityData] of Object.entries(this.indianCities)) {
        if (cityData.state === detectedState) {
          // Check if any part of the location matches this city
          for (const part of parts) {
            if (part.length >= 3 && (cityKey.includes(part) || part.includes(cityKey.substring(0, 4)))) {
              return this.createResult(cityKey, cityData)
            }
          }
        }
      }
    }

    return null
  }

  private createResult(cityName: string, cityData: any): GeocodeResult {
    const confidence = 85 + Math.random() * 10 // 85-95% confidence

    return {
      lat: cityData.lat + (Math.random() - 0.5) * 0.01, // Add small random offset
      lng: cityData.lng + (Math.random() - 0.5) * 0.01,
      formattedAddress: `${this.capitalizeWords(cityName)}, ${cityData.state}, India`,
      components: {
        city: this.capitalizeWords(cityName),
        state: cityData.state,
        country: "India",
        postcode: this.generateMockPostcode(cityData.state),
      },
      confidence: Math.round(confidence),
    }
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (l) => l.toUpperCase())
  }

  private generateMockPostcode(state: string): string {
    // Generate realistic Indian postal codes based on state
    const stateCodes: { [key: string]: string } = {
      Maharashtra: "4",
      Gujarat: "3",
      Karnataka: "5",
      "Tamil Nadu": "6",
      Kerala: "6",
      "West Bengal": "7",
      "Uttar Pradesh": "2",
      Rajasthan: "3",
      "Madhya Pradesh": "4",
      Bihar: "8",
      Odisha: "7",
      Assam: "7",
      Punjab: "1",
      Haryana: "1",
      Delhi: "1",
    }

    const stateCode = stateCodes[state] || "1"
    const randomDigits = Math.floor(Math.random() * 90000) + 10000
    return `${stateCode}${randomDigits.toString().substring(0, 5)}`
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    console.log(`🗺️ Mock reverse geocoding: ${lat}, ${lng}`)

    // Find the closest city
    let closestCity = null
    let minDistance = Number.POSITIVE_INFINITY

    for (const [cityKey, cityData] of Object.entries(this.indianCities)) {
      const distance = this.calculateDistance(lat, lng, cityData.lat, cityData.lng)
      if (distance < minDistance) {
        minDistance = distance
        closestCity = { name: cityKey, ...cityData }
      }
    }

    if (closestCity && minDistance < 100) {
      // Within 100km
      console.log(`✅ Reverse geocoded to ${closestCity.name}`)
      return this.createResult(closestCity.name, closestCity)
    }

    console.log(`❌ No nearby cities found for coordinates`)
    return null
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  async getIndianCityCoordinates(cityName: string, stateName?: string): Promise<GeocodeResult | null> {
    const searchQuery = stateName ? `${cityName}, ${stateName}, India` : `${cityName}, India`
    return await this.geocode(searchQuery, "IN")
  }

  getFallbackCoordinates(cityName: string): GeocodeResult | null {
    const normalizedCity = cityName.toLowerCase().trim().replace(/\s+/g, "")
    const cityData = this.indianCities[normalizedCity]

    if (cityData) {
      console.log(`✅ Fallback coordinates found for ${cityName}`)
      return this.createResult(cityName, cityData)
    }

    console.log(`❌ No fallback coordinates for ${cityName}`)
    return null
  }

  // Get all available cities for a state
  getCitiesInState(stateName: string): string[] {
    return Object.entries(this.indianCities)
      .filter(([_, data]) => data.state === stateName)
      .map(([city, _]) => this.capitalizeWords(city))
  }

  // Get all available states
  getAllStates(): string[] {
    const states = new Set(Object.values(this.indianCities).map((data) => data.state))
    return Array.from(states).sort()
  }

  // Search cities by partial name
  searchCities(
    query: string,
    limit = 10,
  ): Array<{ name: string; state: string; coordinates: { lat: number; lng: number } }> {
    const normalizedQuery = query.toLowerCase()
    const results = []

    for (const [cityKey, cityData] of Object.entries(this.indianCities)) {
      if (cityKey.includes(normalizedQuery) || cityData.state.toLowerCase().includes(normalizedQuery)) {
        results.push({
          name: this.capitalizeWords(cityKey),
          state: cityData.state,
          coordinates: { lat: cityData.lat, lng: cityData.lng },
        })
      }
    }

    return results.slice(0, limit)
  }
}

export const enhancedGeocoding = new EnhancedGeocodingService()
