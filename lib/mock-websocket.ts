// Enhanced Mock WebSocket implementation for demo purposes
export class MockWebSocketManager {
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private connected = false
  private connectionListeners: Set<(connected: boolean) => void> = new Set()

  // Simulate connecting to WebSocket
  connect(): Promise<void> {
    return new Promise((resolve) => {
      console.log("📡 Mock WebSocket: Connecting...")
      setTimeout(
        () => {
          this.connected = true
          console.log("✅ Mock WebSocket: Connected")
          this.notifyConnectionListeners(true)
          resolve()
        },
        1000 + Math.random() * 2000,
      )
    })
  }

  // Simulate disconnecting
  disconnect() {
    this.connected = false
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
    console.log("❌ Mock WebSocket: Disconnected")
    this.notifyConnectionListeners(false)
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected
  }

  // Listen for connection status changes
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback)
    return () => this.connectionListeners.delete(callback)
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach((callback) => callback(connected))
  }

  // Simulate joining a disaster room
  joinDisaster(disasterId: string, callback: (data: any) => void) {
    if (!this.listeners.has(disasterId)) {
      this.listeners.set(disasterId, new Set())
    }
    this.listeners.get(disasterId)!.add(callback)

    // Start simulating updates for this disaster
    this.startMockUpdates(disasterId)

    console.log(`📡 Mock WebSocket: Joined disaster room ${disasterId}`)
  }

  // Simulate leaving a disaster room
  leaveDisaster(disasterId: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(disasterId)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        this.stopMockUpdates(disasterId)
        this.listeners.delete(disasterId)
      }
    }
    console.log(`📡 Mock WebSocket: Left disaster room ${disasterId}`)
  }

  // Emit updates to all listeners of a disaster
  emitDisasterUpdate(disasterId: string, data: any) {
    const listeners = this.listeners.get(disasterId)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
      console.log(`📡 Mock WebSocket: Emitted disaster_updated for ${disasterId}`)
    }
  }

  emitSocialMediaUpdate(disasterId: string, data: any) {
    const listeners = this.listeners.get(disasterId)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
      console.log(`📡 Mock WebSocket: Emitted social_media_updated for ${disasterId}`)
    }
  }

  emitResourcesUpdate(disasterId: string, data: any) {
    const listeners = this.listeners.get(disasterId)
    if (listeners) {
      listeners.forEach((callback) => callback(data))
      console.log(`📡 Mock WebSocket: Emitted resources_updated for ${disasterId}`)
    }
  }

  // Start simulating periodic updates with more frequent and varied data
  private startMockUpdates(disasterId: string) {
    if (this.intervals.has(disasterId)) return

    const interval = setInterval(
      () => {
        if (!this.connected) return

        const updateType = Math.random()

        if (updateType < 0.4) {
          // Social media update
          this.emitSocialMediaUpdate(disasterId, {
            type: "social_media_updated",
            data: this.generateMockSocialPost(disasterId),
          })
        } else if (updateType < 0.7) {
          // Resource update
          this.emitResourcesUpdate(disasterId, {
            type: "resources_updated",
            data: this.generateMockResource(disasterId),
          })
        } else {
          // Disaster status update
          this.emitDisasterUpdate(disasterId, {
            type: "disaster_updated",
            data: {
              id: disasterId,
              lastUpdate: new Date().toISOString(),
              severity: this.getRandomSeverity(),
              affectedPeople: Math.floor(Math.random() * 10000) + 1000,
            },
          })
        }
      },
      8000 + Math.random() * 12000,
    ) // Random interval between 8-20 seconds

    this.intervals.set(disasterId, interval)
  }

  private stopMockUpdates(disasterId: string) {
    const interval = this.intervals.get(disasterId)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(disasterId)
    }
  }

  private generateMockSocialPost(disasterId: string) {
    const mockPosts = [
      {
        id: `post-${Date.now()}`,
        user: "emergency_citizen",
        content: "Update: Water levels receding in our area. Thank you to all rescue teams! #DisasterRelief #Mumbai",
        priority: "medium",
        timestamp: new Date().toISOString(),
        location: "Mumbai, Maharashtra",
        engagement: {
          likes: Math.floor(Math.random() * 500) + 100,
          retweets: Math.floor(Math.random() * 200) + 50,
          replies: Math.floor(Math.random() * 100) + 20,
        },
        verified: false,
        hashtags: ["DisasterRelief", "Mumbai", "FloodUpdate"],
      },
      {
        id: `post-${Date.now() + 1}`,
        user: "NDRFIndia",
        content: "NDRF teams have rescued 45 people from flood-affected areas. Operations continue 24/7. #NDRF #Rescue",
        priority: "high",
        timestamp: new Date().toISOString(),
        location: "Delhi",
        engagement: {
          likes: Math.floor(Math.random() * 1000) + 500,
          retweets: Math.floor(Math.random() * 400) + 200,
          replies: Math.floor(Math.random() * 150) + 50,
        },
        verified: true,
        hashtags: ["NDRF", "Rescue", "Emergency"],
      },
      {
        id: `post-${Date.now() + 2}`,
        user: "local_volunteer",
        content:
          "Setting up new relief center at community hall. Food and water available. Volunteers needed! #Help #Relief",
        priority: "high",
        timestamp: new Date().toISOString(),
        location: "Chennai, Tamil Nadu",
        engagement: {
          likes: Math.floor(Math.random() * 300) + 150,
          retweets: Math.floor(Math.random() * 150) + 80,
          replies: Math.floor(Math.random() * 80) + 30,
        },
        verified: false,
        hashtags: ["Help", "Relief", "Volunteer"],
      },
      {
        id: `post-${Date.now() + 3}`,
        user: "WeatherIndia",
        content:
          "Weather conditions improving. No more heavy rainfall expected in next 24 hours. Stay safe! #WeatherUpdate",
        priority: "low",
        timestamp: new Date().toISOString(),
        location: "Kolkata, West Bengal",
        engagement: {
          likes: Math.floor(Math.random() * 800) + 300,
          retweets: Math.floor(Math.random() * 300) + 150,
          replies: Math.floor(Math.random() * 120) + 40,
        },
        verified: true,
        hashtags: ["WeatherUpdate", "Safety", "Monsoon"],
      },
      {
        id: `post-${Date.now() + 4}`,
        user: "citizen_reporter",
        content:
          "URGENT: Need medical assistance at Sector 15. Elderly person needs immediate help! #Emergency #Medical",
        priority: "urgent",
        timestamp: new Date().toISOString(),
        location: "Gurgaon, Haryana",
        engagement: {
          likes: Math.floor(Math.random() * 200) + 80,
          retweets: Math.floor(Math.random() * 150) + 100,
          replies: Math.floor(Math.random() * 60) + 25,
        },
        verified: false,
        hashtags: ["Emergency", "Medical", "Help"],
      },
    ]

    return mockPosts[Math.floor(Math.random() * mockPosts.length)]
  }

  private generateMockResource(disasterId: string) {
    const mockResources = [
      {
        id: `resource-${Date.now()}`,
        name: "Mobile Medical Unit #" + Math.floor(Math.random() * 100),
        type: "medical",
        location_name: "Central District",
        availability: "available",
        capacity: Math.floor(Math.random() * 100) + 50,
        contact_info: { phone: "+91-" + Math.floor(Math.random() * 9000000000) + 1000000000 },
      },
      {
        id: `resource-${Date.now() + 1}`,
        name: "Emergency Food Distribution Point",
        type: "food",
        location_name: "Relief Camp #" + Math.floor(Math.random() * 20),
        availability: Math.random() > 0.3 ? "available" : "limited",
        capacity: Math.floor(Math.random() * 500) + 200,
        contact_info: {
          coordinator: "Relief Coordinator",
          phone: "+91-" + Math.floor(Math.random() * 9000000000) + 1000000000,
        },
      },
      {
        id: `resource-${Date.now() + 2}`,
        name: "Temporary Shelter Facility",
        type: "shelter",
        location_name: "Community Center",
        availability: Math.random() > 0.2 ? "available" : "full",
        capacity: Math.floor(Math.random() * 300) + 100,
        contact_info: { manager: "Shelter Manager", emergency: "108" },
      },
      {
        id: `resource-${Date.now() + 3}`,
        name: "Water Distribution Point",
        type: "water",
        location_name: "Main Square",
        availability: "available",
        capacity: Math.floor(Math.random() * 1000) + 500,
        contact_info: { supplier: "Municipal Corporation" },
      },
    ]

    return mockResources[Math.floor(Math.random() * mockResources.length)]
  }

  private getRandomSeverity(): string {
    const severities = ["low", "medium", "high", "critical"]
    return severities[Math.floor(Math.random() * severities.length)]
  }

  // Generate bulk updates for data-intensive display
  generateBulkUpdates(disasterId: string, count = 10) {
    const updates = []
    for (let i = 0; i < count; i++) {
      const updateType = Math.random()
      if (updateType < 0.5) {
        updates.push({
          type: "social_media_updated",
          data: this.generateMockSocialPost(disasterId),
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time in last hour
        })
      } else {
        updates.push({
          type: "resources_updated",
          data: this.generateMockResource(disasterId),
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        })
      }
    }
    return updates
  }

  // Cleanup all intervals
  cleanup() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
    this.listeners.clear()
    this.connectionListeners.clear()
    this.connected = false
  }
}

export const mockWebSocket = new MockWebSocketManager()

// Auto-connect when module loads
mockWebSocket.connect()
