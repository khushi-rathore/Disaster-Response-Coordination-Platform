"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Upload, MapPin, Clock, CheckCircle } from "lucide-react"

interface DisasterReportFormProps {
  onSubmit?: (result: any) => void
}

export function DisasterReportForm({ onSubmit }: DisasterReportFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location_name: "",
    tags: "",
    image_url: "",
    user_id: "550e8400-e29b-41d4-a716-446655440002", // Default user
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/disasters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        onSubmit?.(data)
        // Reset form
        setFormData({
          title: "",
          description: "",
          location_name: "",
          tags: "",
          image_url: "",
          user_id: "550e8400-e29b-41d4-a716-446655440002",
        })
      } else {
        throw new Error(data.error || "Failed to submit report")
      }
    } catch (error) {
      console.error("Error submitting report:", error)
      alert("Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (result) {
    return (
      <Card className="bg-slate-900 border-slate-700 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle className="h-6 w-6" />
            Report Submitted Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <h3 className="font-semibold text-white mb-2">{result.disaster.title}</h3>
            <p className="text-sm text-slate-300 mb-3">{result.disaster.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-slate-400">Location</Label>
                <p className="text-white">{result.disaster.location_name}</p>
              </div>
              <div>
                <Label className="text-slate-400">Severity</Label>
                <Badge
                  className={`ml-2 ${
                    result.disaster.severity === "critical"
                      ? "bg-red-500"
                      : result.disaster.severity === "high"
                        ? "bg-orange-500"
                        : result.disaster.severity === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  }`}
                >
                  {result.disaster.severity.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label className="text-slate-400">Disaster Type</Label>
                <p className="text-white capitalize">{result.disaster.disaster_type}</p>
              </div>
              <div>
                <Label className="text-slate-400">Status</Label>
                <Badge variant="outline" className="ml-2 border-blue-500 text-blue-400">
                  {result.disaster.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300">AI Analysis Results</h4>

            {result.analysis.location && (
              <div className="p-3 bg-slate-800 rounded-lg">
                <Label className="text-slate-400 text-sm">Location Analysis</Label>
                <p className="text-white text-sm">Extracted: {result.analysis.location.location_name}</p>
                <p className="text-slate-400 text-xs">
                  Confidence: {result.analysis.location.extracted_info.confidence}%
                </p>
              </div>
            )}

            {result.analysis.content && (
              <div className="p-3 bg-slate-800 rounded-lg">
                <Label className="text-slate-400 text-sm">Content Analysis</Label>
                <p className="text-white text-sm">
                  Severity: {result.analysis.content.severity}, Urgency: {result.analysis.content.urgency}
                </p>
                <p className="text-slate-400 text-xs">Confidence: {result.analysis.content.confidence}%</p>
              </div>
            )}

            {result.analysis.image_verification && (
              <div className="p-3 bg-slate-800 rounded-lg">
                <Label className="text-slate-400 text-sm">Image Verification</Label>
                <p className="text-white text-sm">
                  Status: {result.analysis.image_verification.is_authentic ? "Authentic" : "Suspicious"}
                </p>
                <p className="text-slate-400 text-xs">Confidence: {result.analysis.image_verification.confidence}%</p>
              </div>
            )}
          </div>

          <Button onClick={() => setResult(null)} className="w-full bg-sky-600 hover:bg-sky-700">
            Submit Another Report
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900 border-slate-700 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
          Report Emergency Situation
        </CardTitle>
        <p className="text-slate-400">
          Provide details about the disaster situation for immediate AI analysis and coordination
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">
              Emergency Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Severe Flooding in Mumbai Suburbs"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">
              Detailed Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the situation in detail including severity, affected areas, and immediate needs..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              rows={4}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location *
            </Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, Maharashtra or specific area/landmark"
              value={formData.location_name}
              onChange={(e) => handleInputChange("location_name", e.target.value)}
              required
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-slate-300">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              placeholder="e.g., flood, evacuation, urgent, mumbai"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-slate-300 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Image URL (optional)
            </Label>
            <Input
              id="image"
              type="url"
              placeholder="https://example.com/disaster-image.jpg"
              value={formData.image_url}
              onChange={(e) => handleInputChange("image_url", e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            />
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              AI-Powered Analysis
            </h4>
            <p className="text-sm text-slate-300">
              Your report will be automatically analyzed using Google Gemini AI for:
            </p>
            <ul className="text-sm text-slate-400 mt-2 space-y-1">
              <li>• Location extraction and verification</li>
              <li>• Severity assessment and urgency classification</li>
              <li>• Image authenticity verification (if provided)</li>
              <li>• Disaster type identification</li>
            </ul>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing with AI...
              </div>
            ) : (
              "Submit Emergency Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
