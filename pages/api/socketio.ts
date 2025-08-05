import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"
import { Server as NetServer } from "http"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO
    }
  }
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log("🚀 Initializing Socket.io server...")
    
    const io = new ServerIO(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    // Socket connection handler
    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id)

      // Join a chat room
      socket.on("join-room", (roomId: string) => {
        socket.join(roomId)
        console.log(`📥 Socket ${socket.id} joined room ${roomId}`)
      })

      // Leave a chat room
      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId)
        console.log(`📤 Socket ${socket.id} left room ${roomId}`)
      })

      // Handle new message
      socket.on("send-message", (data: { roomId: string; message: any }) => {
        console.log("📨 Message received:", data)
        // Broadcast to all clients in the room except sender
        socket.to(data.roomId).emit("new-message", data.message)
      })

      // Handle typing indicator
      socket.on("typing", (data: { roomId: string; isTyping: boolean; userName: string }) => {
        socket.to(data.roomId).emit("user-typing", data)
      })

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id)
      })
    })

    res.socket.server.io = io
    console.log("✅ Socket.io server initialized successfully!")
  }
  
  res.json({
    message: "Socket.io server is running",
    connected: true,
    clients: res.socket.server.io?.engine?.clientsCount || 0
  })
}

export default ioHandler
