"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, AlertTriangle, Building2, Shield, Search, Layers, Satellite, Navigation, Zap } from "lucide-react"

interface EnhancedDisasterMapProps {
  selectedDisaster?: string | null
}

export default function EnhancedDisasterMap({ selectedDisaster }: EnhancedDisasterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState<"street" | "satellite" | "terrain">("street")
  const [searchLocation, setSearchLocation] = useState("")
  const [mapData, setMapData] = useState({
    disasters: [],
    resources: [],
    weatherAlerts: [],
  })

  useEffect(() => {
    loadMapData()
  }, [])

  useEffect(() => {
    if (!mapRef.current || !mapData.disasters.length) return

    setIsLoading(true)

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then(async (L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Create map with smooth animations
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
        markerZoomAnimation: true,
      }).setView([20.5937, 78.9629], 5)

      mapInstanceRef.current = map

      // Add custom zoom control
      L.control
        .zoom({
          position: "topright",
        })
        .addTo(map)

      // Add different tile layers based on style
      let tileLayer
      switch (mapStyle) {
        case "satellite":
          tileLayer = L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution: "© Esri",
            },
          )
          break
        case "terrain":
          tileLayer = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenTopoMap",
          })
          break
        default:
          tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          })
      }

      tileLayer.addTo(map)

      // Add loading indicator
      const loadingControl = L.control({ position: "topleft" })
      loadingControl.onAdd = () => {
        const div = L.DomUtil.create("div", "leaflet-control-loading")
        div.innerHTML = `
          <div style="background: rgba(0,0,0,0.8); color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 16px; height: 16px; border: 2px solid #3b82f6; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              Loading map data...
            </div>
          </div>
        `
        return div
      }
      loadingControl.addTo(map)

      // Add disaster markers with enhanced styling
      const disasterMarkers = L.layerGroup()
      mapData.disasters.forEach((disaster: any, index) => {
        if (disaster.coordinates) {
          const severityConfig = {
            critical: { color: "#dc2626", size: 15, pulse: true },
            high: { color: "#ea580c", size: 12, pulse: false },
            medium: { color: "#ca8a04", size: 10, pulse: false },
            low: { color: "#16a34a", size: 8, pulse: false },
          }

          const config = severityConfig[disaster.severity as keyof typeof severityConfig] || severityConfig.medium

          const marker = L.circleMarker([disaster.coordinates.lat, disaster.coordinates.lng], {
            radius: config.size,
            fillColor: config.color,
            color: "#ffffff",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
            className: config.pulse ? "pulse-marker" : "",
          })

          // Enhanced popup with better styling
          marker.bindPopup(
            `
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 280px;">
              <div style="background: linear-gradient(135deg, ${config.color}, ${config.color}dd); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; display: flex; items: center; gap: 8px;">
                  🚨 ${disaster.title}
                </h3>
              </div>
              
              <div style="padding: 0 4px;">
                <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 13px; line-height: 1.4;">
                  ${disaster.description.substring(0, 120)}...
                </p>
                
                <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
                  <span style="background: ${config.color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                    ${disaster.severity.toUpperCase()}
                  </span>
                  <span style="background: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 500;">
                    ${disaster.disaster_type}
                  </span>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #6b7280; font-size: 11px;">📍 ${disaster.location_name}</span>
                    <span style="color: #6b7280; font-size: 11px;">👥 ${(disaster.affected_people || 0).toLocaleString()}</span>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center;">
                    <div>
                      <div style="font-weight: 600; color: #3b82f6; font-size: 14px;">${disaster.reports_count || 0}</div>
                      <div style="color: #6b7280; font-size: 10px;">Reports</div>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: #10b981; font-size: 14px;">${disaster.resources_count || 0}</div>
                      <div style="color: #6b7280; font-size: 10px;">Resources</div>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: #8b5cf6; font-size: 14px;">${disaster.social_posts_count || 0}</div>
                      <div style="color: #6b7280; font-size: 10px;">Posts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `,
            {
              maxWidth: 300,
              className: "custom-popup",
            },
          )

          disasterMarkers.addLayer(marker)
        }
      })

      // Add resource markers
      const resourceMarkers = L.layerGroup()
      mapData.resources.forEach((resource: any) => {
        if (resource.coordinates) {
          const resourceConfig = {
            shelter: { icon: "🏠", color: "#10b981" },
            hospital: { icon: "🏥", color: "#ef4444" },
            relief_center: { icon: "🏢", color: "#3b82f6" },
            rescue_center: { icon: "🚑", color: "#f59e0b" },
            food_distribution: { icon: "🍽️", color: "#8b5cf6" },
            medical_camp: { icon: "⛑️", color: "#06b6d4" },
          }

          const config = resourceConfig[resource.type as keyof typeof resourceConfig] || resourceConfig.relief_center

          const marker = L.marker([resource.coordinates.lat, resource.coordinates.lng], {
            icon: L.divIcon({
              html: `
                <div style="
                  background: ${config.color}; 
                  color: white; 
                  width: 32px; 
                  height: 32px; 
                  border-radius: 50%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  font-size: 14px; 
                  border: 3px solid white; 
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  transition: transform 0.2s ease;
                " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  ${config.icon}
                </div>
              `,
              className: "custom-resource-marker",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            }),
          })

          marker.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px;">
              <div style="background: linear-gradient(135deg, ${config.color}, ${config.color}dd); color: white; padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
                  ${config.icon} ${resource.name}
                </h3>
              </div>
              
              <div style="padding: 0 4px;">
                <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 13px;">
                  ${resource.description || "Emergency resource center providing assistance to affected communities."}
                </p>
                
                <div style="display: flex; gap: 6px; margin-bottom: 12px;">
                  <span style="background: ${config.color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                    ${resource.type.replace("_", " ").toUpperCase()}
                  </span>
                  <span style="background: #10b981; color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px;">
                    ${resource.status.toUpperCase()}
                  </span>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; space-y: 8px;">
                  <p style="margin: 0; color: #6b7280; font-size: 11px; display: flex; align-items: center; gap: 4px;">
                    📍 ${resource.location_name}
                  </p>
                  ${
                    resource.capacity
                      ? `
                    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 11px;">
                      👥 ${resource.current_occupancy || 0}/${resource.capacity} capacity
                    </p>
                  `
                      : ""
                  }
                  ${
                    resource.contact_phone
                      ? `
                    <p style="margin: 8px 0 0 0; color: #3b82f6; font-size: 11px; font-weight: 500;">
                      📞 ${resource.contact_phone}
                    </p>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          `)

          resourceMarkers.addLayer(marker)
        }
      })

      // Add layer control
      const overlayMaps = {
        "🚨 Disasters": disasterMarkers,
        "🏥 Resources": resourceMarkers,
      }

      L.control.layers(null, overlayMaps, { position: "topright" }).addTo(map)

      // Add both layers by default
      disasterMarkers.addTo(map)
      resourceMarkers.addTo(map)

      // Remove loading control after a delay
      setTimeout(() => {
        map.removeControl(loadingControl)
        setIsLoading(false)
      }, 1500)

      // Add custom CSS for animations
      const style = document.createElement("style")
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .pulse-marker {
          animation: pulse 2s infinite;
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .custom-resource-marker:hover {
          z-index: 1000;
        }
      `
      document.head.appendChild(style)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [mapData, mapStyle])

  const loadMapData = async () => {
    // Simulate loading realistic disaster data
    const mockDisasters = [
      {
        id: "1",
        title: "Severe Flooding in Kerala",
        description:
          "Heavy monsoon rains have caused severe flooding across multiple districts in Kerala, affecting thousands of residents.",
        severity: "critical",
        disaster_type: "flood",
        location_name: "Kerala, India",
        coordinates: { lat: 10.8505, lng: 76.2711 },
        affected_people: 15000,
        reports_count: 234,
        resources_count: 12,
        social_posts_count: 1456,
      },
      {
        id: "2",
        title: "Cyclone Warning - Odisha Coast",
        description:
          "Cyclonic storm approaching Odisha coast with wind speeds up to 120 km/h. Evacuation procedures initiated.",
        severity: "high",
        disaster_type: "cyclone",
        location_name: "Odisha, India",
        coordinates: { lat: 20.9517, lng: 85.0985 },
        affected_people: 8500,
        reports_count: 156,
        resources_count: 8,
        social_posts_count: 892,
      },
      {
        id: "3",
        title: "Earthquake Alert - Himachal Pradesh",
        description: "Moderate earthquake of magnitude 5.2 recorded in Himachal Pradesh. No major damage reported yet.",
        severity: "medium",
        disaster_type: "earthquake",
        location_name: "Himachal Pradesh, India",
        coordinates: { lat: 31.1048, lng: 77.1734 },
        affected_people: 2300,
        reports_count: 89,
        resources_count: 5,
        social_posts_count: 445,
      },
    ]

    const mockResources = [
      {
        id: "1",
        name: "Kerala Emergency Relief Center",
        type: "relief_center",
        location_name: "Kochi, Kerala",
        coordinates: { lat: 9.9312, lng: 76.2673 },
        status: "active",
        capacity: 500,
        current_occupancy: 234,
        contact_phone: "+91-484-2345678",
      },
      {
        id: "2",
        name: "Odisha Cyclone Shelter",
        type: "shelter",
        location_name: "Bhubaneswar, Odisha",
        coordinates: { lat: 20.2961, lng: 85.8245 },
        status: "active",
        capacity: 800,
        current_occupancy: 156,
        contact_phone: "+91-674-2345678",
      },
      {
        id: "3",
        name: "Himachal Medical Camp",
        type: "medical_camp",
        location_name: "Shimla, Himachal Pradesh",
        coordinates: { lat: 31.1048, lng: 77.1734 },
        status: "active",
        capacity: 200,
        current_occupancy: 45,
        contact_phone: "+91-177-2345678",
      },
    ]

    setMapData({
      disasters: mockDisasters,
      resources: mockResources,
      weatherAlerts: [],
    })
  }

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return

    try {
      // Mock geocoding for the search
      const response = await fetch(`/api/geocode?location=${encodeURIComponent(searchLocation)}`)
      const data = await response.json()

      if (data.success && mapInstanceRef.current) {
        mapInstanceRef.current.setView([data.coordinates.lat, data.coordinates.lng], 10)
      }
    } catch (error) {
      console.error("Error searching location:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Map Controls */}
      <Card className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Live Disaster Response Map</h3>
                <p className="text-blue-200 text-sm">Real-time visualization powered by AI analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search any location in India..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLocationSearch()}
                className="pl-10 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <Button onClick={handleLocationSearch} className="bg-blue-600 hover:bg-blue-700">
              <Navigation className="h-4 w-4 mr-2" />
              Search
            </Button>
            <div className="flex gap-2">
              <Button
                variant={mapStyle === "street" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapStyle("street")}
              >
                Street
              </Button>
              <Button
                variant={mapStyle === "satellite" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapStyle("satellite")}
              >
                <Satellite className="h-4 w-4 mr-1" />
                Satellite
              </Button>
              <Button
                variant={mapStyle === "terrain" ? "default" : "outline"}
                size="sm"
                onClick={() => setMapStyle("terrain")}
              >
                <Layers className="h-4 w-4 mr-1" />
                Terrain
              </Button>
            </div>
          </div>

          {/* Enhanced Map Container */}
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-[600px] bg-slate-800 rounded-xl border border-slate-700 shadow-2xl"
              style={{ minHeight: "600px" }}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-white font-medium">Loading enhanced map data...</p>
                  <p className="text-slate-400 text-sm">Analyzing disaster patterns with AI</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Map Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-2xl font-bold">{mapData.disasters.length}</span>
              </div>
              <p className="text-xs text-slate-400">Active Disasters</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <Shield className="h-5 w-5" />
                <span className="text-2xl font-bold">{mapData.resources.length}</span>
              </div>
              <p className="text-xs text-slate-400">Emergency Resources</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-orange-400 mb-2">
                <Building2 className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {mapData.disasters.filter((d: any) => d.severity === "critical" || d.severity === "high").length}
                </span>
              </div>
              <p className="text-xs text-slate-400">High Priority</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700">
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-2xl font-bold">
                  {mapData.disasters
                    .reduce((sum: number, d: any) => sum + (d.affected_people || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-400">People Affected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
