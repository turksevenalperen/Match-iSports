'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  senderName: string
  timestamp: string
}

interface MockSocket {
  socket: null
  connected: boolean
  onNewMessage: (callback: (message: Message) => void) => void
  sendMessage: (roomId: string, message: Message) => void
  joinRoom: (roomId: string) => void
  removeListeners: () => void
}

interface RealSocket {
  socket: Socket | null
  connected: boolean
  onNewMessage: (callback: (message: Message) => void) => void
  sendMessage: (roomId: string, message: Message) => void
  joinRoom: (roomId: string) => void
  removeListeners: () => void
}

type SocketHook = MockSocket | RealSocket

export function useSocket(): SocketHook {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // Production ortamında Socket.io'yu devre dışı bırak
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (isProduction) {
      // Production'da socket bağlantısı yapma
      console.log('🚫 Socket.io production ortamında devre dışı')
      return
    }

    // Development ortamında normal socket bağlantısı
    const socketInstance = io({
      path: '/api/socketio',
      addTrailingSlash: false,
    })

    socketInstance.on('connect', () => {
      console.log('✅ Socket bağlandı:', socketInstance.id)
      setConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket bağlantısı kesildi')
      setConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error)
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [isProduction])

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (isProduction || !socket) return

    socket.on('new-message', callback)
  }, [socket, isProduction])

  const sendMessage = useCallback((roomId: string, message: Message) => {
    if (isProduction || !socket) return

    socket.emit('send-message', { roomId, message })
  }, [socket, isProduction])

  const joinRoom = useCallback((roomId: string) => {
    if (isProduction || !socket) return

    socket.emit('join-room', roomId)
  }, [socket, isProduction])

  const removeListeners = useCallback(() => {
    if (isProduction || !socket) return

    socket.off('new-message')
  }, [socket, isProduction])

  if (isProduction) {
    // Production için mock socket döndür
    return {
      socket: null,
      connected: false,
      onNewMessage: () => {},
      sendMessage: () => {},
      joinRoom: () => {},
      removeListeners: () => {}
    }
  }

  // Development için gerçek socket döndür
  return {
    socket,
    connected,
    onNewMessage,
    sendMessage,
    joinRoom,
    removeListeners
  }
}
