"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Filter,
  Search,
  Globe,
  Activity,
  Heart,
  MessageCircle,
  Repeat2,
} from "lucide-react"

interface Disaster {
  id: string
  title: string
  description: string
  location_name?: string
  tags: string[]
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "monitoring" | "resolved"
  created_by: string
  created_at: string
  verified: boolean
  reports?: { count: number }[]
  resources?: { count: number }[]
  social_media_posts?: { count: number }[]
  official_updates?: { count: number }[]
}

interface SocialMediaPost {
  id: string
  platform: string
  user_handle: string
  content: string
  hashtags: string[]
  location_name?: string
  priority: "low" | "medium" | "high" | "urgent"
  sentiment: "positive" | "neutral" | "negative" | "urgent"
  engagement_metrics: {
    likes: number
    retweets: number
    replies: number
    quotes?: number
  }
  created_at: string
  verified: boolean
}

interface Resource {
  id: string
  name: string
  description?: string
  location_name?: string
  type: string
  capacity?: number
  availability: "available" | "limited" | "full" | "closed"
  contact_info: any
  distance_km?: number
  verified: boolean
  created_at: string
}

interface OfficialUpdate {
  id: string
  title: string
  content: string
  source: string
  source_url?: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  published_at: string
}

export default function EnhancedDisasterDashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [officialUpdates, setOfficialUpdates] = useState<OfficialUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  // Filters
  const [filters, setFilters] = useState({
    severity: "all",
    status: "all",
    tag: "all",
    search: "",
  })

  // Form states
  const [newDisaster, setNewDisaster] = useState({
    title: "",
    description: "",
    location_name: "",
    tags: "",
    severity: "medium",
    created_by: "disaster_coordinator",
  })

  const [newResource, setNewResource] = useState({
    name: "",
    description: "",
    location_name: "",
    type: "shelter",
    capacity: "",
    contact_info: "",
  })

  const fetchDisasters = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.severity !== "all") params.append("severity", filters.severity)
      if (filters.status !== "all") params.append("status", filters.status)
      if (filters.tag !== "all") params.append("tag", filters.tag)

      const response = await fetch(`/api/disasters?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setDisasters(data.disasters || [])
      setUsingMockData(data.mock || false)
    } catch (error) {
      console.error("Error fetching disasters:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDisasterDetails = async (disasterId: string) => {
    try {
      const [socialRes, resourcesRes, updatesRes] = await Promise.all([
        fetch(`/api/disasters/${disasterId}/social-media`),
        fetch(`/api/disasters/${disasterId}/resources`),
        fetch(`/api/disasters/${disasterId}/official-updates`),
      ])

      const [socialData, resourcesData, updatesData] = await Promise.all([
        socialRes.json(),
        resourcesRes.json(),
        updatesRes.json(),
      ])

      setSocialPosts(socialData.posts || [])
      setResources(resourcesData.resources || [])
      setOfficialUpdates(updatesData.updates || [])
    } catch (error) {
      console.error("Error fetching disaster details:", error)
    }
  }

  const createDisaster = async () => {
    try {
      const response = await fetch("/api/disasters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newDisaster,
          tags: newDisaster.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      if (response.ok) {
        setNewDisaster({
          title: "",
          description: "",
          location_name: "",
          tags: "",
          severity: "medium",
          created_by: "disaster_coordinator",
        })
        fetchDisasters()
      }
    } catch (error) {
      console.error("Error creating disaster:", error)
    }
  }

  const createResource = async () => {
    if (!selectedDisaster) return

    try {
      const response = await fetch(`/api/disasters/${selectedDisaster.id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newResource,
          capacity: newResource.capacity ? Number.parseInt(newResource.capacity) : null,
          contact_info: newResource.contact_info ? JSON.parse(newResource.contact_info) : {},
        }),
      })

      if (response.ok) {
        setNewResource({
          name: "",
          description: "",
          location_name: "",
          type: "shelter",
          capacity: "",
          contact_info: "",
        })
        fetchDisasterDetails(selectedDisaster.id)
      }
    } catch (error) {
      console.error("Error creating resource:", error)
    }
  }

  const refreshSocialMedia = async () => {
    if (!selectedDisaster) return

    try {
      const response = await fetch(`/api/disasters/${selectedDisaster.id}/social-media?refresh=true`)
      const data = await response.json()
      setSocialPosts(data.posts || [])
    } catch (error) {
      console.error("Error refreshing social media:", error)
    }
  }

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
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

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "negative":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-green-600"
      case "limited":
        return "text-yellow-600"
      case "full":
        return "text-red-600"
      case "closed":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredDisasters = disasters.filter((disaster) => {
    if (filters.search && !disaster.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  })

  useEffect(() => {
    fetchDisasters()
  }, [filters.severity, filters.status, filters.tag])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🇮🇳 India Disaster Response Platform</h1>
          <p className="text-muted-foreground">Real-time disaster management and coordination system</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDisasters} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {usingMockData && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Currently showing mock data. Database connection not available. Set up Supabase integration to use real
            data.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search disasters..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.tag} onValueChange={(value) => setFilters({ ...filters, tag: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="flood">Flood</SelectItem>
                <SelectItem value="earthquake">Earthquake</SelectItem>
                <SelectItem value="cyclone">Cyclone</SelectItem>
                <SelectItem value="fire">Fire</SelectItem>
                <SelectItem value="landslide">Landslide</SelectItem>
                <SelectItem value="aviation">Aviation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disasters List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Disasters ({filteredDisasters.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Disaster Form */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">Report New Disaster</h4>
                <Input
                  placeholder="Disaster title"
                  value={newDisaster.title}
                  onChange={(e) => setNewDisaster({ ...newDisaster, title: e.target.value })}
                />
                <Input
                  placeholder="Location (e.g., Mumbai, Maharashtra)"
                  value={newDisaster.location_name}
                  onChange={(e) => setNewDisaster({ ...newDisaster, location_name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newDisaster.description}
                  onChange={(e) => setNewDisaster({ ...newDisaster, description: e.target.value })}
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={newDisaster.tags}
                  onChange={(e) => setNewDisaster({ ...newDisaster, tags: e.target.value })}
                />
                <Select
                  value={newDisaster.severity}
                  onValueChange={(value) => setNewDisaster({ ...newDisaster, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createDisaster} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Disaster
                </Button>
              </div>

              <Separator />

              {/* Disasters List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDisasters.map((disaster) => (
                  <Card
                    key={disaster.id}
                    className={`cursor-pointer transition-colors ${
                      selectedDisaster?.id === disaster.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedDisaster(disaster)
                      fetchDisasterDetails(disaster.id)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold">{disaster.title}</h4>
                          <div className="flex items-center gap-1">
                            <Badge className={getSeverityColor(disaster.severity)}>{disaster.severity}</Badge>
                            {disaster.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                        {disaster.location_name && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {disaster.location_name}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(disaster.created_at).toLocaleDateString("en-IN")}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {disaster.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {disaster.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{disaster.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {disaster.social_media_posts?.[0]?.count || 0} posts
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {disaster.resources?.[0]?.count || 0} resources
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disaster Details */}
        <div className="lg:col-span-2">
          {selectedDisaster ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="social">
                  Social Media
                  {socialPosts.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {socialPosts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="resources">
                  Resources
                  {resources.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {resources.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="official">
                  Official
                  {officialUpdates.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {officialUpdates.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {selectedDisaster.title}
                      <Badge className={getSeverityColor(selectedDisaster.severity)}>{selectedDisaster.severity}</Badge>
                      {selectedDisaster.verified && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>
                      Reported by {selectedDisaster.created_by} on{" "}
                      {new Date(selectedDisaster.created_at).toLocaleString("en-IN")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDisaster.location_name && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedDisaster.location_name}</span>
                      </div>
                    )}
                    <p>{selectedDisaster.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDisaster.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{socialPosts.length}</div>
                        <div className="text-sm text-muted-foreground">Social Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{resources.length}</div>
                        <div className="text-sm text-muted-foreground">Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{officialUpdates.length}</div>
                        <div className="text-sm text-muted-foreground">Official Updates</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Social Media Monitoring
                        </CardTitle>
                        <CardDescription>Real-time social media reports and updates</CardDescription>
                      </div>
                      <Button onClick={refreshSocialMedia} size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {socialPosts.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">@{post.user_handle}</span>
                                  {post.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                                  <Badge className={getPriorityColor(post.priority)}>{post.priority}</Badge>
                                  {getSentimentIcon(post.sentiment)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(post.created_at).toLocaleString("en-IN")}
                                </div>
                              </div>
                              <p className="text-sm">{post.content}</p>
                              {post.location_name && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {post.location_name}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {post.hashtags.map((hashtag) => (
                                  <Badge key={hashtag} variant="outline" className="text-xs">
                                    #{hashtag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {post.engagement_metrics.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Repeat2 className="h-3 w-3" />
                                  {post.engagement_metrics.retweets}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  {post.engagement_metrics.replies}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Emergency Resources
                    </CardTitle>
                    <CardDescription>Available shelters, supplies, and services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add New Resource Form */}
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h4 className="font-semibold">Add New Resource</h4>
                      <Input
                        placeholder="Resource name"
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      />
                      <Input
                        placeholder="Description"
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      />
                      <Input
                        placeholder="Location"
                        value={newResource.location_name}
                        onChange={(e) => setNewResource({ ...newResource, location_name: e.target.value })}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={newResource.type}
                          onValueChange={(value) => setNewResource({ ...newResource, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shelter">Shelter</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="water">Water</SelectItem>
                            <SelectItem value="rescue_center">Rescue Center</SelectItem>
                            <SelectItem value="relief_camp">Relief Camp</SelectItem>
                            <SelectItem value="evacuation">Evacuation Point</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Capacity"
                          type="number"
                          value={newResource.capacity}
                          onChange={(e) => setNewResource({ ...newResource, capacity: e.target.value })}
                        />
                      </div>
                      <Textarea
                        placeholder="Contact info (JSON format)"
                        value={newResource.contact_info}
                        onChange={(e) => setNewResource({ ...newResource, contact_info: e.target.value })}
                      />
                      <Button onClick={createResource} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Resource
                      </Button>
                    </div>

                    <Separator />

                    {/* Resources List */}
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <Card key={resource.id}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{resource.name}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{resource.type}</Badge>
                                  <span
                                    className={`text-sm font-medium ${getAvailabilityColor(resource.availability)}`}
                                  >
                                    {resource.availability}
                                  </span>
                                  {resource.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                                </div>
                              </div>
                              {resource.description && (
                                <p className="text-sm text-muted-foreground">{resource.description}</p>
                              )}
                              {resource.location_name && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {resource.location_name}
                                  {resource.distance_km && <span>({resource.distance_km.toFixed(1)} km away)</span>}
                                </div>
                              )}
                              {resource.capacity && (
                                <div className="text-sm">
                                  <strong>Capacity:</strong> {resource.capacity} people
                                </div>
                              )}
                              {resource.contact_info && Object.keys(resource.contact_info).length > 0 && (
                                <div className="text-sm">
                                  <strong>Contact:</strong> {JSON.stringify(resource.contact_info)}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                Added {new Date(resource.created_at).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="official">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Official Updates
                    </CardTitle>
                    <CardDescription>Updates from government agencies and relief organizations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {officialUpdates.map((update) => (
                        <Card key={update.id}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{update.title}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{update.category}</Badge>
                                  <Badge className={getPriorityColor(update.priority)}>{update.priority}</Badge>
                                </div>
                              </div>
                              <p className="text-sm">{update.content}</p>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                  <strong>Source:</strong> {update.source}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span>{new Date(update.published_at).toLocaleString("en-IN")}</span>
                                  {update.source_url && (
                                    <Button size="sm" variant="ghost" asChild>
                                      <a href={update.source_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Disaster Selected</h3>
                <p className="text-muted-foreground">
                  Select a disaster from the list to view details, social media monitoring, resources, and official
                  updates.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
