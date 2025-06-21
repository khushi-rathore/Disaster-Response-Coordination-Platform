"use client"

import { useState, useEffect } from "react"
import { DisasterReportForm } from "./disaster-report-form"
import { DisasterMap } from "./disaster-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, MapPin, Users, Clock, TrendingUp, Shield, Zap, RefreshCw } from 'lucide-react'
import { SocialMediaFeed } from "./social-media-feed"
import { OfficialUpdatesFeed } from "./official-updates-feed"

interface DashboardData {
  disasters: any[]
  resources: any[]
  reports: any[]
  alerts: any[]
  stats: {
    total_disasters: number
    active_disasters: number
    total_reports: number
    verified_reports: number
    available_resources: number
    people_affected: number
  }
}

export function CrisisNetXDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"dashboard" | "report" | "map" | "social" | "updates">("dashboard")

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch disasters
      const disastersRes = await fetch("/api/disasters")
      const disastersData = await disastersRes.json()

      // Fetch reports
      const reportsRes = await fetch("/api/reports")
      const reportsData = await reportsRes.json()

      // Mock resources and alerts for now
      const mockResources = [
        {
          id: "1",
          name: "NDRF Rescue Base",
          type: "rescue_center",
          coordinates: { lat: 28.7041, lng: 77.1025 },
          location_name: "New Delhi, India",
          status: "active",
        },
        {
          id: "2",
          name: "Emergency Shelter",
          type: "shelter",
          coordinates: { lat: 19.076, lng: 72.8777 },
          location_name: "Mumbai, India",
          status: "active",
        },
      ]

      const mockAlerts = [
        {
          id: "1",
          title: "Heavy Rainfall Alert",
          message: "IMD issues red alert for Mumbai region",
          severity: "warning",
          created_at: new Date().toISOString(),
        },
      ]

      // Calculate stats
      const stats = {
        total_disasters: disastersData.disasters?.length || 0,
        active_disasters: disastersData.disasters?.filter((d: any) => d.status === "active").length || 0,
        total_reports: reportsData.reports?.length || 0,
        verified_reports: reportsData.reports?.filter((r: any) => r.status === "verified").length || 0,
        available_resources: mockResources.length,
        people_affected:
          disastersData.disasters?.reduce((sum: number, d: any) => sum + (d.affected_people || 0), 0) || 0,
      }

      setData({
        disasters: disastersData.disasters || [],
        resources: mockResources,
        reports: reportsData.reports || [],
        alerts: mockAlerts,
        stats,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-green-500",
      medium: "bg-yellow-500",
      high: "bg-orange-500",
      critical: "bg-red-500",
    }
    return colors[severity as keyof typeof colors] || "bg-gray-500"
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-sky-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading CrisisNetX...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-['Poppins']">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-400 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sky-400">CrisisNetX</h1>
              <p className="text-sm text-slate-400">Real-Time Disaster Coordination</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
              className="text-sm"
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "map" ? "default" : "ghost"}
              onClick={() => setActiveTab("map")}
              className="text-sm"
            >
              Live Map
            </Button>
            <Button
              variant={activeTab === "social" ? "default" : "ghost"}
              onClick={() => setActiveTab("social")}
              className="text-sm"
            >
              Social Media
            </Button>
            <Button
              variant={activeTab === "updates" ? "default" : "ghost"}
              onClick={() => setActiveTab("updates")}
              className="text-sm"
            >
              Official Updates
            </Button>
            <Button
              variant={activeTab === "report" ? "default" : "ghost"}
              onClick={() => setActiveTab("report")}
              className="text-sm bg-rose-600 hover:bg-rose-700"
            >
              Report Disaster
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-rose-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{data?.stats.active_disasters}</p>
                      <p className="text-sm text-slate-400">Active Disasters</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-orange-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{data?.stats.people_affected.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">People Affected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-sky-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{data?.stats.available_resources}</p>
                      <p className="text-sm text-slate-400">Resources Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">{data?.stats.verified_reports}</p>
                      <p className="text-sm text-slate-400">Verified Reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Disasters and Recent Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="h-5 w-5" />
                    Active Disasters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.disasters.slice(0, 5).map((disaster) => (
                      <div key={disaster.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-2 ${getSeverityColor(disaster.severity)}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{disaster.title}</h4>
                          <p className="text-sm text-slate-400 truncate">{disaster.location_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {disaster.disaster_type}
                            </Badge>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(disaster.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!data?.disasters.length && <p className="text-slate-400 text-center py-4">No active disasters</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-400">
                    <MapPin className="h-5 w-5" />
                    Recent Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data?.reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                        <div
                          className={`w-2 h-2 rounded-full mt-3 ${
                            report.status === "verified"
                              ? "bg-green-500"
                              : report.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{report.title}</h4>
                          <p className="text-sm text-slate-400 truncate">{report.location_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                report.priority === "urgent"
                                  ? "border-red-500 text-red-400"
                                  : report.priority === "high"
                                    ? "border-orange-500 text-orange-400"
                                    : "border-slate-600 text-slate-300"
                              }`}
                            >
                              {report.priority}
                            </Badge>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(report.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!data?.reports.length && <p className="text-slate-400 text-center py-4">No recent reports</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Alerts */}
            {data?.alerts.length > 0 && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="h-5 w-5" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{alert.title}</h4>
                          <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(alert.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <DisasterMap
            data={{
              disasters:
                data?.disasters
                  .map((d) => ({
                    ...d,
                    coordinates: d.coordinates
                      ? {
                          lat: Number.parseFloat(d.coordinates.split("(")[1]?.split(" ")[1] || "0"),
                          lng: Number.parseFloat(d.coordinates.split("(")[1]?.split(" ")[0] || "0"),
                        }
                      : null,
                  }))
                  .filter((d) => d.coordinates) || [],
              resources: data?.resources || [],
            }}
          />
        )}

        {activeTab === "social" && (
          <SocialMediaFeed disasterId="1" />
        )}

        {activeTab === "updates" && (
          <OfficialUpdatesFeed disasterId="1" />
        )}

        {activeTab === "report" && (
          <div className="max-w-2xl mx-auto">
            <DisasterReportForm
              onSubmit={(result) => {
                console.log("Report submitted:", result)
                // Refresh data after successful submission
                fetchData()
                // Switch to dashboard to see the new report
                setActiveTab("dashboard")
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
