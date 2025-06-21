"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Search, ExternalLink, Clock, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"

interface OfficialUpdate {
  id: string
  source: string
  source_type: "government" | "ngo" | "international" | "emergency_services"
  title: string
  content: string
  timestamp: string
  category: "emergency_declaration" | "evacuation_order" | "relief_operations" | "weather_alert" | "resource_allocation"
  priority: "critical" | "high" | "medium" | "low"
  reliability_score: number
  verification_status: "verified" | "pending" | "unverified"
  url?: string
  location?: string
}

interface OfficialUpdatesFeedProps {
  disasterId: string
}

export function OfficialUpdatesFeed({ disasterId }: OfficialUpdatesFeedProps) {
  const [updates, setUpdates] = useState<OfficialUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  useEffect(() => {
    fetchOfficialUpdates()

    // Refresh every 60 seconds
    const interval = setInterval(fetchOfficialUpdates, 60000)
    return () => clearInterval(interval)
  }, [disasterId])

  const fetchOfficialUpdates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/disasters/${disasterId}/official-updates`)
      const data = await response.json()

      if (data.success) {
        setUpdates(data.updates)
      }
    } catch (error) {
      console.error("Error fetching official updates:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || update.category === categoryFilter
    const matchesSource = sourceFilter === "all" || update.source_type === sourceFilter

    return matchesSearch && matchesCategory && matchesSource
  })

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "government":
        return "🏛️"
      case "ngo":
        return "🤝"
      case "international":
        return "🌍"
      case "emergency_services":
        return "🚨"
      default:
        return "📢"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-500 text-red-400 bg-red-500/10"
      case "high":
        return "border-orange-500 text-orange-400 bg-orange-500/10"
      case "medium":
        return "border-yellow-500 text-yellow-400 bg-yellow-500/10"
      case "low":
        return "border-green-500 text-green-400 bg-green-500/10"
      default:
        return "border-slate-600 text-slate-300 bg-slate-500/10"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "emergency_declaration":
        return "bg-red-500/20 text-red-400 border-red-500"
      case "evacuation_order":
        return "bg-orange-500/20 text-orange-400 border-orange-500"
      case "relief_operations":
        return "bg-blue-500/20 text-blue-400 border-blue-500"
      case "weather_alert":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500"
      case "resource_allocation":
        return "bg-green-500/20 text-green-400 border-green-500"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500"
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "unverified":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return null
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-400">
            <Building2 className="h-5 w-5" />
            Official Updates & Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search updates, sources, content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-600">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="emergency_declaration">Emergency Declaration</SelectItem>
                <SelectItem value="evacuation_order">Evacuation Order</SelectItem>
                <SelectItem value="relief_operations">Relief Operations</SelectItem>
                <SelectItem value="weather_alert">Weather Alert</SelectItem>
                <SelectItem value="resource_allocation">Resource Allocation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48 bg-slate-800 border-slate-600">
                <SelectValue placeholder="Source Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="ngo">NGO</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="emergency_services">Emergency Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Official Updates */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading official updates...</p>
          </div>
        ) : filteredUpdates.length === 0 ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No official updates found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUpdates.map((update) => (
            <Card
              key={update.id}
              className={`bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors ${getPriorityColor(update.priority)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getSourceIcon(update.source_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-medium text-white">{update.source}</span>
                      {getVerificationIcon(update.verification_status)}
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{update.reliability_score}% reliable</span>
                      </div>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(update.timestamp)}
                      </span>
                      {update.location && (
                        <>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{update.location}</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{update.title}</h3>
                    <p className="text-slate-200 mb-3 leading-relaxed">{update.content}</p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(update.category)}`}>
                          {formatCategory(update.category)}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(update.priority)}`}>
                          {update.priority.toUpperCase()}
                        </Badge>
                      </div>

                      {update.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sky-400 hover:text-sky-300 p-0 h-auto"
                          onClick={() => window.open(update.url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Source
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
