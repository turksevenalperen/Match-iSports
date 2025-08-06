// Socket.io kaldırıldı. Bu dosya artık kullanılmıyor ve silinebilir.

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
