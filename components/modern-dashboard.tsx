"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, MapPin, Clock, MessageSquare, Activity, TrendingUp, Shield, RefreshCw } from "lucide-react"
import { mockDisasters } from "@/lib/mock-data"
import TweetFeed from "./tweet-feed"
import DisasterMap from "./disaster-map"

export default function ModernDashboard() {
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-red-600 bg-red-50"
      case "monitoring":
        return "text-yellow-600 bg-yellow-50"
      case "resolved":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  const totalStats = {
    disasters: mockDisasters.length,
    critical: mockDisasters.filter((d) => d.severity === "critical").length,
    active: mockDisasters.filter((d) => d.status === "active").length,
    reports: mockDisasters.reduce((sum, d) => sum + d.reports_count, 0),
    resources: mockDisasters.reduce((sum, d) => sum + d.resources_count, 0),
    socialPosts: mockDisasters.reduce((sum, d) => sum + d.social_posts_count, 0),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🇮🇳 Disaster Response Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Real-time monitoring and coordination platform</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} size="lg">
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            {
              label: "Active Disasters",
              value: totalStats.disasters,
              icon: AlertTriangle,
              color: "text-red-600",
              bgColor: "bg-red-50",
            },
            {
              label: "Critical Level",
              value: totalStats.critical,
              icon: AlertTriangle,
              color: "text-red-700",
              bgColor: "bg-red-100",
            },
            {
              label: "Total Reports",
              value: totalStats.reports,
              icon: MessageSquare,
              color: "text-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              label: "Resources",
              value: totalStats.resources,
              icon: Shield,
              color: "text-green-600",
              bgColor: "bg-green-50",
            },
            {
              label: "Social Posts",
              value: totalStats.socialPosts,
              icon: Activity,
              color: "text-purple-600",
              bgColor: "bg-purple-50",
            },
            {
              label: "Response Rate",
              value: "94%",
              icon: TrendingUp,
              color: "text-emerald-600",
              bgColor: "bg-emerald-50",
            },
          ].map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Disasters List */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Disasters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {mockDisasters.map((disaster) => (
                    <div
                      key={disaster.id}
                      className={`p-4 border-b cursor-pointer transition-colors hover:bg-slate-50 ${
                        selectedDisaster === disaster.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => setSelectedDisaster(disaster.id)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-gray-900">{disaster.title}</h4>
                          <Badge className={getSeverityColor(disaster.severity)}>{disaster.severity}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2">{disaster.description}</p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {disaster.location}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(disaster.created_at).toLocaleDateString("en-IN")}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(disaster.status)} variant="secondary">
                            {disaster.status}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {disaster.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">{disaster.reports_count}</div>
                            <div className="text-muted-foreground">Reports</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">{disaster.resources_count}</div>
                            <div className="text-muted-foreground">Resources</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">{disaster.social_posts_count}</div>
                            <div className="text-muted-foreground">Posts</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Social Feed
                </TabsTrigger>
                <TabsTrigger value="map" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  Live Map
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {selectedDisaster ? (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-t-lg">
                      <CardTitle>{mockDisasters.find((d) => d.id === selectedDisaster)?.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {(() => {
                          const disaster = mockDisasters.find((d) => d.id === selectedDisaster)
                          if (!disaster) return null

                          return (
                            <>
                              <div>
                                <h3 className="font-semibold mb-2">Description</h3>
                                <p className="text-gray-600">{disaster.description}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Location</h3>
                                  <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {disaster.location}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Status</h3>
                                  <Badge className={getStatusColor(disaster.status)}>{disaster.status}</Badge>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                  {disaster.tags.map((tag) => (
                                    <Badge key={tag} variant="outline">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-blue-600">{disaster.reports_count}</div>
                                  <div className="text-sm text-muted-foreground">Citizen Reports</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-green-600">{disaster.resources_count}</div>
                                  <div className="text-sm text-muted-foreground">Emergency Resources</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-3xl font-bold text-purple-600">
                                    {disaster.social_posts_count}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Social Media Posts</div>
                                </div>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No Disaster Selected</h3>
                      <p className="text-muted-foreground">
                        Select a disaster from the list to view detailed information, reports, and response
                        coordination.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="social">
                <TweetFeed selectedDisaster={selectedDisaster} />
              </TabsContent>

              <TabsContent value="map">
                <DisasterMap selectedDisaster={selectedDisaster} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
