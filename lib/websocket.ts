import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

export class WebSocketManager {
  private io: SocketIOServer | null = null

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    this.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("join_disaster", (disasterId: string) => {
        socket.join(`disaster_${disasterId}`)
        console.log(`Client ${socket.id} joined disaster room: ${disasterId}`)
      })

      socket.on("leave_disaster", (disasterId: string) => {
        socket.leave(`disaster_${disasterId}`)
        console.log(`Client ${socket.id} left disaster room: ${disasterId}`)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }

  emitDisasterUpdate(disasterId: string, data: any) {
    if (this.io) {
      this.io.to(`disaster_${disasterId}`).emit("disaster_updated", data)
      console.log(`Emitted disaster_updated for disaster: ${disasterId}`)
    }
  }

  emitSocialMediaUpdate(disasterId: string, data: any) {
    if (this.io) {
      this.io.to(`disaster_${disasterId}`).emit("social_media_updated", data)
      console.log(`Emitted social_media_updated for disaster: ${disasterId}`)
    }
  }

  emitResourcesUpdate(disasterId: string, data: any) {
    if (this.io) {
      this.io.to(`disaster_${disasterId}`).emit("resources_updated", data)
      console.log(`Emitted resources_updated for disaster: ${disasterId}`)
    }
  }
}

export const wsManager = new WebSocketManager()
