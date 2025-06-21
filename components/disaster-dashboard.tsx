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
import {
  AlertTriangle,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  Shield,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from "lucide-react"

interface Disaster {
  id: string
  title: string
  location_name?: string
  description: string
  tags: string[]
  owner_id: string
  created_at: string
  reports?: { count: number }[] | any[]
  resources?: { count: number }[] | any[]
}

interface Report {
  id: string
  user_id: string
  content: string
  image_url?: string
  verification_status: string
  created_at: string
}

interface Resource {
  id: string
  name: string
  location_name?: string
  type: string
  created_at: string
}

interface SocialMediaPost {
  id: string
  user: string
  content: string
  timestamp: string
  location?: string
  priority: string
  keywords: string[]
}

interface OfficialUpdate {
  id: string
  title: string
  content: string
  source: string
  url: string
  publishedAt: string
  category: string
}

export default function DisasterDashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([])
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [socialMedia, setSocialMedia] = useState<SocialMediaPost[]>([])
  const [officialUpdates, setOfficialUpdates] = useState<OfficialUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  // Form states
  const [newDisaster, setNewDisaster] = useState({
    title: "",
    location_name: "",
    description: "",
    tags: "",
    owner_id: "netrunnerX",
  })
  const [newReport, setNewReport] = useState({
    content: "",
    image_url: "",
    user_id: "citizen1",
  })
  const [newResource, setNewResource] = useState({
    name: "",
    location_name: "",
    type: "shelter",
  })

  const fetchDisasters = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/disasters")

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", response.status, errorText)
        return
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
      const [disasterRes, socialRes, resourcesRes, updatesRes] = await Promise.all([
        fetch(`/api/disasters/${disasterId}`),
        fetch(`/api/disasters/${disasterId}/social-media`),
        fetch(`/api/disasters/${disasterId}/resources`),
        fetch(`/api/disasters/${disasterId}/official-updates`),
      ])

      const [disasterData, socialData, resourcesData, updatesData] = await Promise.all([
        disasterRes.json(),
        socialRes.json(),
        resourcesRes.json(),
        updatesRes.json(),
      ])

      setSelectedDisaster(disasterData.disaster)
      setReports(disasterData.disaster.reports || [])
      setSocialMedia(socialData.reports || [])
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
        setNewDisaster({ title: "", location_name: "", description: "", tags: "", owner_id: "netrunnerX" })
        fetchDisasters()
      }
    } catch (error) {
      console.error("Error creating disaster:", error)
    }
  }

  const createReport = async () => {
    if (!selectedDisaster) return

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disaster_id: selectedDisaster.id,
          ...newReport,
        }),
      })

      if (response.ok) {
        setNewReport({ content: "", image_url: "", user_id: "citizen1" })
        fetchDisasterDetails(selectedDisaster.id)
      }
    } catch (error) {
      console.error("Error creating report:", error)
    }
  }

  const createResource = async () => {
    if (!selectedDisaster) return

    try {
      const response = await fetch(`/api/disasters/${selectedDisaster.id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResource),
      })

      if (response.ok) {
        setNewResource({ name: "", location_name: "", type: "shelter" })
        fetchDisasterDetails(selectedDisaster.id)
      }
    } catch (error) {
      console.error("Error creating resource:", error)
    }
  }

  const verifyImage = async (imageUrl: string, reportId: string) => {
    try {
      const response = await fetch(`/api/disasters/${selectedDisaster?.id}/verify-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, report_id: reportId }),
      })

      const data = await response.json()
      console.log("Image verification result:", data)

      if (selectedDisaster) {
        fetchDisasterDetails(selectedDisaster.id)
      }
    } catch (error) {
      console.error("Error verifying image:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getReportCount = (disaster: Disaster) => {
    if (Array.isArray(disaster.reports) && disaster.reports.length > 0) {
      return typeof disaster.reports[0] === "object" && "count" in disaster.reports[0]
        ? disaster.reports[0].count
        : disaster.reports.length
    }
    return 0
  }

  const getResourceCount = (disaster: Disaster) => {
    if (Array.isArray(disaster.resources) && disaster.resources.length > 0) {
      return typeof disaster.resources[0] === "object" && "count" in disaster.resources[0]
        ? disaster.resources[0].count
        : disaster.resources.length
    }
    return 0
  }

  useEffect(() => {
    fetchDisasters()
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Disaster Response Coordination Platform</h1>
          <p className="text-muted-foreground">Real-time disaster management and response coordination</p>
        </div>
        <Button onClick={fetchDisasters} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disasters List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Disasters
              </CardTitle>
              <CardDescription>
                {disasters.length} active disaster{disasters.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Disaster Form */}
              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">Create New Disaster</h4>
                <Input
                  placeholder="Disaster title"
                  value={newDisaster.title}
                  onChange={(e) => setNewDisaster({ ...newDisaster, title: e.target.value })}
                />
                <Input
                  placeholder="Location (optional)"
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
                <Button onClick={createDisaster} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Disaster
                </Button>
              </div>

              <Separator />

              {/* Disasters List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {disasters.map((disaster) => (
                  <Card
                    key={disaster.id}
                    className={`cursor-pointer transition-colors ${
                      selectedDisaster?.id === disaster.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => fetchDisasterDetails(disaster.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{disaster.title}</h4>
                        {disaster.location_name && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {disaster.location_name}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(disaster.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {disaster.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {getReportCount(disaster)} reports
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {getResourceCount(disaster)} resources
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="updates">Official Updates</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {selectedDisaster.title}
                    </CardTitle>
                    <CardDescription>
                      Created by {selectedDisaster.owner_id} on {new Date(selectedDisaster.created_at).toLocaleString()}
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
                        <div className="text-2xl font-bold">{reports.length}</div>
                        <div className="text-sm text-muted-foreground">Reports</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{resources.length}</div>
                        <div className="text-sm text-muted-foreground">Resources</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{socialMedia.length}</div>
                        <div className="text-sm text-muted-foreground">Social Posts</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <Card>
                  <CardHeader>
                    <CardTitle>Citizen Reports</CardTitle>
                    <CardDescription>Reports submitted by citizens and volunteers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Create New Report Form */}
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h4 className="font-semibold">Submit New Report</h4>
                      <Textarea
                        placeholder="Report content"
                        value={newReport.content}
                        onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
                      />
                      <Input
                        placeholder="Image URL (optional)"
                        value={newReport.image_url}
                        onChange={(e) => setNewReport({ ...newReport, image_url: e.target.value })}
                      />
                      <Button onClick={createReport} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Report
                      </Button>
                    </div>

                    <Separator />

                    {/* Reports List */}
                    <div className="space-y-3">
                      {reports.map((report) => (
                        <Card key={report.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{report.user_id}</span>
                                  {getVerificationIcon(report.verification_status)}
                                  <Badge
                                    variant={
                                      report.verification_status === "verified"
                                        ? "default"
                                        : report.verification_status === "rejected"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                  >
                                    {report.verification_status}
                                  </Badge>
                                </div>
                                <p>{report.content}</p>
                                {report.image_url && (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={report.image_url || "/placeholder.svg"}
                                      alt="Report"
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => verifyImage(report.image_url!, report.id)}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Verify Image
                                    </Button>
                                  </div>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {new Date(report.created_at).toLocaleString()}
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

              <TabsContent value="social">
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Monitoring</CardTitle>
                    <CardDescription>Real-time social media reports and updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {socialMedia.map((post) => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">@{post.user}</span>
                                  <Badge className={getPriorityColor(post.priority)}>{post.priority}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(post.timestamp).toLocaleString()}
                                </div>
                              </div>
                              <p>{post.content}</p>
                              {post.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {post.location}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {post.keywords.map((keyword) => (
                                  <Badge key={keyword} variant="outline" className="text-xs">
                                    #{keyword}
                                  </Badge>
                                ))}
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
                    <CardTitle>Emergency Resources</CardTitle>
                    <CardDescription>Available shelters, supplies, and services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Create New Resource Form */}
                    <div className="space-y-2 p-4 border rounded-lg">
                      <h4 className="font-semibold">Add New Resource</h4>
                      <Input
                        placeholder="Resource name"
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      />
                      <Input
                        placeholder="Location"
                        value={newResource.location_name}
                        onChange={(e) => setNewResource({ ...newResource, location_name: e.target.value })}
                      />
                      <select
                        className="w-full p-2 border rounded"
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      >
                        <option value="shelter">Shelter</option>
                        <option value="food">Food</option>
                        <option value="medical">Medical</option>
                        <option value="evacuation">Evacuation</option>
                        <option value="supplies">Supplies</option>
                      </select>
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
                                <Badge variant="outline">{resource.type}</Badge>
                              </div>
                              {resource.location_name && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {resource.location_name}
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                Added {new Date(resource.created_at).toLocaleString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="updates">
                <Card>
                  <CardHeader>
                    <CardTitle>Official Updates</CardTitle>
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
                                <Badge variant="outline">{update.category}</Badge>
                              </div>
                              <p className="text-sm">{update.content}</p>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Source: {update.source}</span>
                                <div className="flex items-center gap-2">
                                  <span>{new Date(update.publishedAt).toLocaleString()}</span>
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={update.url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </Button>
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
                  Select a disaster from the list to view details, reports, and resources.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
