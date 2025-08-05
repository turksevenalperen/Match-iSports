import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    if (!socketRef.current) {
      console.log('🔄 Initializing Socket.IO connection...')
      
      // First, initialize the socket.io server
      fetch('/api/socketio')
        .then(res => res.json())
        .then(data => {
          console.log('📡 Socket.IO server status:', data)
        })
        .catch(console.error)
      
      socketRef.current = io({
        path: '/api/socketio',
        transports: ['websocket', 'polling'],
        timeout: 20000, // 20 saniye timeout
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      })

      socketRef.current.on('connect', () => {
        console.log('✅ Connected to Socket.io server:', socketRef.current?.id)
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Disconnected from Socket.io server:', reason)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('🚨 Socket connection error:', error)
      })

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to Socket.io server, attempt:', attemptNumber)
      })

      socketRef.current.on('reconnect_error', (error) => {
        console.error('🚨 Socket reconnection error:', error)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', roomId)
    }
  }

  const sendMessage = (roomId: string, message: any) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { roomId, message })
    }
  }

  const onNewMessage = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback)
    }
  }

  const setTyping = (roomId: string, isTyping: boolean, userName: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { roomId, isTyping, userName })
    }
  }

  const onUserTyping = (callback: (data: { roomId: string; isTyping: boolean; userName: string }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback)
    }
  }

  const removeListeners = () => {
    if (socketRef.current) {
      socketRef.current.off('new-message')
      socketRef.current.off('user-typing')
    }
  }

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    joinRoom,
    leaveRoom,
    sendMessage,
    onNewMessage,
    setTyping,
    onUserTyping,
    removeListeners
  }
}
