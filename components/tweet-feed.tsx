"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MessageSquare,
  Heart,
  Repeat2,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
} from "lucide-react"
import { mockTweets, type MockTweet } from "@/lib/mock-data"

interface TweetFeedProps {
  selectedDisaster?: string | null
}

export default function TweetFeed({ selectedDisaster }: TweetFeedProps) {
  const [tweets, setTweets] = useState<MockTweet[]>(mockTweets)
  const [filter, setFilter] = useState<"all" | "urgent" | "high" | "medium" | "low">("all")
  const [loading, setLoading] = useState(false)

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

  const formatTime = (timeString: string) => {
    const time = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return time.toLocaleDateString()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const refreshTweets = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Add some randomness to engagement numbers
      const updatedTweets = mockTweets.map((tweet) => ({
        ...tweet,
        engagement: {
          likes: tweet.engagement.likes + Math.floor(Math.random() * 50),
          retweets: tweet.engagement.retweets + Math.floor(Math.random() * 20),
          replies: tweet.engagement.replies + Math.floor(Math.random() * 10),
        },
      }))
      setTweets(updatedTweets)
      setLoading(false)
    }, 1000)
  }

  const filteredTweets = tweets.filter((tweet) => filter === "all" || tweet.priority === filter)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Social Media Feed
              <Badge variant="secondary">{filteredTweets.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setFilter(filter === "all" ? "urgent" : "all")}>
                <Filter className="h-4 w-4 mr-2" />
                {filter === "all" ? "All" : "Urgent"}
              </Button>
              <Button variant="outline" size="sm" onClick={refreshTweets} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
          {filteredTweets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No tweets found</h3>
              <p className="text-muted-foreground">
                {filter !== "all"
                  ? `No ${filter} priority tweets available.`
                  : "No social media updates available at the moment."}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setFilter("all")}>
                Show All Tweets
              </Button>
            </div>
          ) : (
            filteredTweets.map((tweet) => (
              <Card key={tweet.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {tweet.user.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">@{tweet.user}</span>
                            {tweet.verified && <CheckCircle className="h-4 w-4 text-blue-500" />}
                            <Badge className={getPriorityColor(tweet.priority)}>{tweet.priority}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(tweet.time)}
                          </div>
                        </div>
                      </div>
                      {tweet.priority === "urgent" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </div>

                    {/* Content */}
                    <p className="text-sm leading-relaxed">{tweet.text}</p>

                    {/* Location */}
                    {tweet.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {tweet.location}
                      </div>
                    )}

                    {/* Engagement */}
                    <div className="flex items-center gap-6 pt-2 border-t">
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        {formatNumber(tweet.engagement.likes)}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-500 transition-colors">
                        <Repeat2 className="h-4 w-4" />
                        {formatNumber(tweet.engagement.retweets)}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        {formatNumber(tweet.engagement.replies)}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Tweet Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tweet Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Tweets", value: tweets.length, color: "text-blue-600" },
              { label: "Urgent", value: tweets.filter((t) => t.priority === "urgent").length, color: "text-red-600" },
              {
                label: "High Priority",
                value: tweets.filter((t) => t.priority === "high").length,
                color: "text-orange-600",
              },
              { label: "Verified Users", value: tweets.filter((t) => t.verified).length, color: "text-green-600" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
