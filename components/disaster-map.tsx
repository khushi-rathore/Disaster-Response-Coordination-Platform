"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertTriangle, Building2, Shield } from "lucide-react"

interface DisasterMapProps {
  data: {
    disasters: any[]
    resources: any[]
  }
}

export function DisasterMap({ data }: DisasterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Create map centered on India
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5)
      mapInstanceRef.current = map

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      // Add disaster markers
      data.disasters.forEach((disaster) => {
        if (disaster.coordinates) {
          const severityColors = {
            low: "#10B981", // green
            medium: "#F59E0B", // yellow
            high: "#EF4444", // red
            critical: "#7C2D12", // dark red
          }

          const color = severityColors[disaster.severity as keyof typeof severityColors] || "#6B7280"

          const marker = L.circleMarker([disaster.coordinates.lat, disaster.coordinates.lng], {
            radius: disaster.severity === "critical" ? 12 : disaster.severity === "high" ? 10 : 8,
            fillColor: color,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map)

          marker.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                🚨 ${disaster.title}
              </h3>
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 12px;">
                ${disaster.description.substring(0, 100)}...
              </p>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">
                  ${disaster.severity.toUpperCase()}
                </span>
                <span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                  ${disaster.disaster_type}
                </span>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                📍 ${disaster.location_name}
              </p>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">
                👥 ${disaster.affected_people || 0} people affected
              </p>
            </div>
          `)
        }
      })

      // Add resource markers
      data.resources.forEach((resource) => {
        if (resource.coordinates) {
          const resourceIcons = {
            shelter: "🏠",
            hospital: "🏥",
            relief_center: "🏢",
            rescue_center: "🚑",
            food_distribution: "🍽️",
            medical_camp: "⛑️",
          }

          const icon = resourceIcons[resource.type as keyof typeof resourceIcons] || "📍"

          const marker = L.marker([resource.coordinates.lat, resource.coordinates.lng], {
            icon: L.divIcon({
              html: `<div style="background: #10B981; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${icon}</div>`,
              className: "custom-marker",
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          }).addTo(map)

          marker.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">
                ${icon} ${resource.name}
              </h3>
              <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 12px;">
                ${resource.description || "Resource center available for assistance"}
              </p>
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <span style="background: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">
                  ${resource.type.replace("_", " ").toUpperCase()}
                </span>
                <span style="background: #e5e7eb; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                  ${resource.status.toUpperCase()}
                </span>
              </div>
              <p style="margin: 0; color: #6b7280; font-size: 11px;">
                📍 ${resource.location_name}
              </p>
              ${
                resource.capacity
                  ? `
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">
                  👥 ${resource.current_occupancy || 0}/${resource.capacity} capacity
                </p>
              `
                  : ""
              }
              ${
                resource.contact_phone
                  ? `
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">
                  📞 ${resource.contact_phone}
                </p>
              `
                  : ""
              }
            </div>
          `)
        }
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }
    }
  }, [data])

  return (
    <div className="space-y-4">
      {/* Map Legend */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-400">
            <MapPin className="h-5 w-5" />
            Live Disaster Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-slate-300">Critical</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-slate-300">High</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-slate-300">Medium</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-300">Resources</span>
            </div>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-96 bg-slate-800 rounded-lg border border-slate-700"
            style={{ minHeight: "400px" }}
          />

          {/* Map Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-rose-400 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">{data.disasters.length}</span>
              </div>
              <p className="text-xs text-slate-400">Active Disasters</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">{data.resources.length}</span>
              </div>
              <p className="text-xs text-slate-400">Resources</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-orange-400 mb-1">
                <Building2 className="h-4 w-4" />
                <span className="font-semibold">
                  {data.disasters.filter((d) => d.severity === "critical" || d.severity === "high").length}
                </span>
              </div>
              <p className="text-xs text-slate-400">High Priority</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-sky-400 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="font-semibold">
                  {data.disasters.reduce((sum, d) => sum + (d.affected_people || 0), 0).toLocaleString()}
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
