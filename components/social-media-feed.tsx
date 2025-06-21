"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MessageCircle, Repeat2, Search, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface SocialMediaPost {
  id: string
  platform: "twitter" | "facebook" | "instagram"
  author: string
  verified: boolean
  content: string
  timestamp: string
  location?: string
  engagement: {
    likes: number
    comments: number
    shares: number
  }
  priority: "urgent" | "high" | "medium" | "low"
  sentiment: "positive" | "negative" | "neutral"
  tags: string[]
}

interface SocialMediaFeedProps {
  disasterId: string
}

export function SocialMediaFeed({ disasterId }: SocialMediaFeedProps) {
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [trendingTopics, setTrendingTopics] = useState<string[]>([])

  useEffect(() => {
    fetchSocialMediaData()

    // Refresh every 30 seconds
    const interval = setInterval(fetchSocialMediaData, 30000)
    return () => clearInterval(interval)
  }, [disasterId])

  const fetchSocialMediaData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/disasters/${disasterId}/social-media`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPosts(data.posts || [])
        setTrendingTopics(data.trending_topics || [])
      } else {
        console.error("API returned error:", data.error)
        setPosts([])
        setTrendingTopics([])
      }
    } catch (error) {
      console.error("Error fetching social media data:", error)
      setPosts([])
      setTrendingTopics([])
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === "all" || post.priority === priorityFilter
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter

    return matchesSearch && matchesPriority && matchesPlatform
  })

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "🐦"
      case "facebook":
        return "📘"
      case "instagram":
        return "📷"
      default:
        return "📱"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500 text-red-400"
      case "high":
        return "border-orange-500 text-orange-400"
      case "medium":
        return "border-yellow-500 text-yellow-400"
      case "low":
        return "border-green-500 text-green-400"
      default:
        return "border-slate-600 text-slate-300"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      case "neutral":
        return "text-slate-400"
      default:
        return "text-slate-400"
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

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-400">
            <TrendingUp className="h-5 w-5" />
            Social Media Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search posts, authors, keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full md:w-40 bg-slate-800 border-slate-600">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trending Topics */}
          {trendingTopics.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Trending Topics</h4>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-sky-500 text-sky-400 cursor-pointer hover:bg-sky-500/10"
                  >
                    #{topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mx-auto"></div>
            <p className="text-slate-400 mt-2">Loading social media posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No social media posts found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getPlatformIcon(post.platform)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white">{post.author}</span>
                      {post.verified && <CheckCircle className="h-4 w-4 text-blue-400" />}
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(post.timestamp)}
                      </span>
                      {post.location && (
                        <>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">{post.location}</span>
                        </>
                      )}
                    </div>

                    <p className="text-slate-200 mb-3 leading-relaxed">{post.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1 hover:text-red-400 cursor-pointer">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{post.engagement.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.engagement.comments}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
                          <Repeat2 className="h-4 w-4" />
                          <span className="text-sm">{post.engagement.shares}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(post.priority)}`}>
                          {post.priority.toUpperCase()}
                        </Badge>
                        <span className={`text-xs ${getSentimentColor(post.sentiment)}`}>{post.sentiment}</span>
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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
