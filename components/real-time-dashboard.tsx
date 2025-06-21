"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Wifi, WifiOff, Clock, TrendingUp, Database, Zap, Shield, AlertTriangle } from "lucide-react"
import { mockWebSocket } from "@/lib/mock-websocket"
import { mockCache } from "@/lib/mock-cache"
import { mockRateLimiter } from "@/lib/mock-rate-limiter"

export default function RealTimeDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeUpdates, setRealtimeUpdates] = useState<any[]>([])
  const [cacheStats, setCacheStats] = useState<any>({})
  const [rateLimitStats, setRateLimitStats] = useState<any>({})

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true)

    // Set up mock real-time updates
    const handleUpdate = (data: any) => {
      setRealtimeUpdates((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          ...data,
        },
        ...prev.slice(0, 9), // Keep last 10 updates
      ])
    }

    // Join a mock disaster room
    mockWebSocket.joinDisaster("demo-disaster", handleUpdate)

    // Update stats every 5 seconds
    const statsInterval = setInterval(() => {
      setCacheStats(mockCache.getStats())
      setRateLimitStats(mockRateLimiter.getGlobalStats())
    }, 5000)

    // Initial stats load
    setCacheStats(mockCache.getStats())
    setRateLimitStats(mockRateLimiter.getGlobalStats())

    return () => {
      mockWebSocket.leaveDisaster("demo-disaster", handleUpdate)
      clearInterval(statsInterval)
    }
  }, [])

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "social_media_updated":
        return <Activity className="h-4 w-4 text-blue-500" />
      case "resources_updated":
        return <Shield className="h-4 w-4 text-green-500" />
      case "disaster_updated":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Zap className="h-4 w-4 text-purple-500" />
    }
  }

  const getUpdateColor = (type: string) => {
    switch (type) {
      case "social_media_updated":
        return "border-l-blue-500"
      case "resources_updated":
        return "border-l-green-500"
      case "disaster_updated":
        return "border-l-orange-500"
      default:
        return "border-l-purple-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={isConnected ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <div className="flex items-center gap-2">
          {isConnected ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
          <AlertDescription className={isConnected ? "text-green-800" : "text-red-800"}>
            Real-time connection: {isConnected ? "Connected" : "Disconnected"}
            {isConnected && " - Receiving live updates"}
          </AlertDescription>
        </div>
      </Alert>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Cache Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hit Rate</span>
                <Badge variant="secondary">{cacheStats.hitRate || "0%"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Entries</span>
                <span className="text-sm font-medium">{cacheStats.entries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Requests</span>
                <span className="text-sm font-medium">{cacheStats.totalRequests || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tracked IPs</span>
                <span className="text-sm font-medium">{rateLimitStats.totalTrackedIdentifiers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Blocked</span>
                <Badge variant={rateLimitStats.blockedIPs > 0 ? "destructive" : "secondary"}>
                  {rateLimitStats.blockedIPs || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Violations</span>
                <span className="text-sm font-medium">{rateLimitStats.activeViolations || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Real-time Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Updates</span>
                <span className="text-sm font-medium">{realtimeUpdates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Connection</span>
                <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "Live" : "Offline"}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Update</span>
                <span className="text-xs text-muted-foreground">
                  {realtimeUpdates[0] ? new Date(realtimeUpdates[0].timestamp).toLocaleTimeString() : "None"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Updates Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Updates Feed
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setRealtimeUpdates([])}>
              Clear Feed
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {realtimeUpdates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Waiting for real-time updates...</p>
              <p className="text-sm">Updates will appear here as they happen</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realtimeUpdates.map((update) => (
                <Card key={update.id} className={`border-l-4 ${getUpdateColor(update.type)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getUpdateIcon(update.type)}
                        <span className="font-medium text-sm">
                          {update.type.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    {update.data && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {update.type === "social_media_updated" && (
                          <p>New social media post: "{update.data.content?.substring(0, 100)}..."</p>
                        )}
                        {update.type === "resources_updated" && (
                          <p>
                            Resource added: {update.data.name} ({update.data.type})
                          </p>
                        )}
                        {update.type === "disaster_updated" && <p>Disaster status updated</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => mockCache.clear()}>
              Clear Cache
            </Button>
            <Button variant="outline" size="sm" onClick={() => mockCache.cleanup()}>
              Cleanup Cache
            </Button>
            <Button variant="outline" size="sm" onClick={() => mockRateLimiter.cleanup()}>
              Reset Rate Limits
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCacheStats(mockCache.getStats())
                setRateLimitStats(mockRateLimiter.getGlobalStats())
              }}
            >
              Refresh Stats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
