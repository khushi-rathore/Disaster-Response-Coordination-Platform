"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Zap, Brain, AlertCircle } from "lucide-react"

export function AIStatusIndicator() {
  const [aiStatus, setAiStatus] = useState<"active" | "fallback" | "offline">("active")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    // Simulate AI status checking
    const checkAIStatus = () => {
      // This would normally check actual AI service availability
      const random = Math.random()
      if (random > 0.8) {
        setAiStatus("fallback")
      } else if (random > 0.95) {
        setAiStatus("offline")
      } else {
        setAiStatus("active")
      }
      setLastUpdate(new Date())
    }

    const interval = setInterval(checkAIStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusConfig = () => {
    switch (aiStatus) {
      case "active":
        return {
          icon: <Zap className="h-3 w-3" />,
          text: "AI Active",
          variant: "default" as const,
          className: "bg-green-500 text-white",
        }
      case "fallback":
        return {
          icon: <Brain className="h-3 w-3" />,
          text: "AI Fallback",
          variant: "secondary" as const,
          className: "bg-yellow-500 text-white",
        }
      case "offline":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: "Manual Mode",
          variant: "destructive" as const,
          className: "bg-red-500 text-white",
        }
    }
  }

  const config = getStatusConfig()

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        {config.text}
      </Badge>
      <span className="text-xs text-muted-foreground">Updated {lastUpdate.toLocaleTimeString()}</span>
    </div>
  )
}
