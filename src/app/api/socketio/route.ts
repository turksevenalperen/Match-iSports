import { NextRequest } from "next/server"
import { Server as ServerIO } from "socket.io"
import { Server as NetServer } from "http"

export async function GET(req: NextRequest) {
  if (!(global as any).io) {
    console.log("Initializing Socket.io server...")
    
    const httpServer = new NetServer()
    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    // Socket connection handler
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      // Join a chat room
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room ${roomId}`)
      })

      // Leave a chat room
      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId)
        console.log(`Socket ${socket.id} left room ${roomId}`)
      })

      // Handle new message
      socket.on("send-message", (data: { roomId: string; message: any }) => {
        console.log("Message received:", data)
        // Broadcast to all clients in the room except sender
        socket.to(data.roomId).emit("new-message", data.message)
      })

      // Handle typing indicator
      socket.on("typing", (data: { roomId: string; isTyping: boolean; userName: string }) => {
        socket.to(data.roomId).emit("user-typing", data)
      })

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })

    ;(global as any).io = io
    console.log("Socket.io server initialized")
  }

  return new Response("Socket.io server is running", { status: 200 })
}
