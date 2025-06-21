"use client"

import { useEffect, useState } from "react"
import { mockWebSocket } from "@/lib/mock-websocket"

interface WebSocketClientProps {
  onDisasterUpdate?: (data: any) => void
  onSocialMediaUpdate?: (data: any) => void
  onResourcesUpdate?: (data: any) => void
}

export function useWebSocket({ onDisasterUpdate, onSocialMediaUpdate, onResourcesUpdate }: WebSocketClientProps) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connect to mock WebSocket
    mockWebSocket.connect().then(() => {
      setConnected(true)
    })

    // Listen for connection changes
    const unsubscribe = mockWebSocket.onConnectionChange(setConnected)

    return () => {
      unsubscribe()
    }
  }, [])

  const joinDisaster = (disasterId: string) => {
    const handleUpdate = (data: any) => {
      switch (data.type) {
        case "disaster_updated":
          onDisasterUpdate?.(data)
          break
        case "social_media_updated":
          onSocialMediaUpdate?.(data)
          break
        case "resources_updated":
          onResourcesUpdate?.(data)
          break
      }
    }

    mockWebSocket.joinDisaster(disasterId, handleUpdate)

    return () => {
      mockWebSocket.leaveDisaster(disasterId, handleUpdate)
    }
  }

  const leaveDisaster = (disasterId: string) => {
    // This will be handled by the cleanup function returned by joinDisaster
  }

  return {
    socket: mockWebSocket,
    connected,
    joinDisaster,
    leaveDisaster,
  }
}
