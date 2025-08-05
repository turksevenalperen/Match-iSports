'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/hooks/useSocket'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToastContext } from '@/components/toast-provider'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface User {
  id: string
  teamName: string
  city: string
  sport: string
  unreadCount?: number
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  senderName: string
  timestamp: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const { toast } = useToastContext()
  const socket = useSocket()
  
  // States
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Production'da polling için interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Kullanıcıları ve mesajları yükle
  const refreshData = async () => {
    if (!session?.user?.id) return

    try {
      // Kullanıcıları yenile
      const usersResponse = await fetch('/api/users')
      if (usersResponse.ok) {
        const userData = await usersResponse.json()
        setUsers(userData.filter((user: User) => user.id !== session?.user?.id))
      }

      // Seçili kullanıcı varsa mesajları yenile
      if (selectedUser) {
        const messagesResponse = await fetch(`/api/messages?otherUserId=${selectedUser.id}`)
        if (messagesResponse.ok) {
          const messageData = await messagesResponse.json()
          setMessages(messageData)
          scrollToBottom()
        }
      }
    } catch (error) {
      console.error('Data refresh error:', error)
    }
  }

  // Kullanıcıları yükle
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.filter((user: User) => user.id !== session?.user?.id))
        }
      } catch (error) {
        console.error('Users yüklenemedi:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Browser notification izni iste
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    if (session?.user?.id) {
      fetchUsers()

      // Production'da polling başlat
      if (process.env.NODE_ENV === 'production') {
        pollingIntervalRef.current = setInterval(() => {
          refreshData()
        }, 3000) // 3 saniyede bir yenile
      }
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [session])

  // Socket listeners
  useEffect(() => {
    if (!socket.socket) return

    socket.onNewMessage((message: Message) => {
      console.log('📨 Yeni mesaj geldi:', message)
      
      // Eğer seçili kullanıcı ile ilgili mesajsa ekle
      if (selectedUser && 
          ((message.senderId === selectedUser.id && message.receiverId === session?.user?.id) ||
           (message.senderId === session?.user?.id && message.receiverId === selectedUser.id))) {
        setMessages(prev => [...prev, message])
        
        // Eğer gelen mesaj seçili kullanıcıdan ise hemen okunmuş olarak işaretle
        if (message.senderId === selectedUser.id && message.receiverId === session?.user?.id) {
          markMessagesAsRead(selectedUser.id)
        }
        
        // Otomatik scroll
        setTimeout(() => scrollToBottom(), 100)
        
        // Bildirim (sadece gelen mesajlar için)
        if (message.senderId !== session?.user?.id) {
          toast.success(`${message.senderName}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`)
          
          // Browser notification (izin varsa)
          if (Notification.permission === 'granted') {
            new Notification('Yeni Mesaj', {
              body: `${message.senderName}: ${message.content}`,
              icon: '/favicon.ico'
            })
          }
        }
      } else if (message.receiverId === session?.user?.id && message.senderId !== session?.user?.id) {
        // Seçili olmayan kullanıcıdan gelen mesaj - okunmamış sayısını artır
        setUsers(prev => prev.map(user => 
          user.id === message.senderId 
            ? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
            : user
        ))
        
        // Bildirim göster
        toast.success(`${message.senderName}: ${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}`)
        
        // Browser notification (izin varsa)
        if (Notification.permission === 'granted') {
          new Notification('Yeni Mesaj', {
            body: `${message.senderName}: ${message.content}`,
            icon: '/favicon.ico'
          })
        }
      }
    })

    return () => {
      socket.removeListeners()
    }
  }, [socket.socket, selectedUser, session?.user?.id, toast])

  // Kullanıcı seçildiğinde mesajları yükle
  useEffect(() => {
    if (selectedUser && session?.user?.id) {
      loadMessages(selectedUser.id)
      
      // Mesajları okunmuş olarak işaretle
      markMessagesAsRead(selectedUser.id)
      
      // Chat room'una katıl (her iki kullanıcının ID'si ile room oluştur)
      const roomId = createRoomId(session.user.id, selectedUser.id)
      socket.joinRoom(roomId)
      console.log('🏠 Chat room\'una katıldı:', roomId)
    }
  }, [selectedUser, session?.user?.id])

  const createRoomId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_')
  }

  const loadMessages = async (otherUserId: string) => {
    try {
      const response = await fetch(`/api/messages?otherUserId=${otherUserId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        scrollToBottom()
      }
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error)
    }
  }

  const markMessagesAsRead = async (senderId: string) => {
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId })
      })
      
      // Kullanıcı listesindeki okunmamış mesaj sayısını güncelle
      setUsers(prev => prev.map(user => 
        user.id === senderId 
          ? { ...user, unreadCount: 0 }
          : user
      ))
    } catch (error) {
      console.error('Mesajları okunmuş olarak işaretleme hatası:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !session?.user?.id) return

    const messageData = {
      content: newMessage.trim(),
      receiverId: selectedUser.id,
      senderName: session.user.teamName
    }

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])
        setNewMessage('')
        
        // Socket ile real-time gönder
        const roomId = createRoomId(session.user.id, selectedUser.id)
        socket.sendMessage(roomId, newMsg)
        console.log('📤 Mesaj gönderildi:', newMsg)
        
        scrollToBottom()
      } else {
        toast.error('Mesaj gönderilemedi')
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      toast.error('Bağlantı hatası')
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-orange-500/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Real-Time Chat</h1>
                <p className="text-orange-200">Anlık mesajlaşma</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${socket.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-300">
                {socket.connected ? 'Bağlı' : 'Bağlantısız'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{height: '600px'}}>
          
          {/* Kullanıcı Listesi */}
          <div className="lg:col-span-1">
            <Card className="h-full p-4 bg-gray-800/50 border-gray-700 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4 text-white">Kullanıcılar</h2>
              <div className="space-y-2 overflow-y-auto scrollbar-custom" style={{height: '500px'}}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                      selectedUser?.id === user.id
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium">{user.teamName}</div>
                        <div className="text-gray-400 text-sm">{user.city} • {user.sport}</div>
                      </div>
                      {(user.unreadCount || 0) > 0 && (
                        <div className="ml-2 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                          {(user.unreadCount || 0) > 99 ? '99+' : user.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-gray-400 text-center py-8">
                    Henüz kullanıcı yok
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Chat Alanı */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col bg-gray-800/50 border-gray-700 overflow-hidden">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{selectedUser.teamName}</h3>
                    <p className="text-gray-400 text-sm">{selectedUser.city} • {selectedUser.sport}</p>
                  </div>

                  {/* Mesajlar */}
                  <div className="flex-1 p-4 overflow-y-auto max-h-[400px] scrollbar-custom">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isMyMessage = message.senderId === session?.user?.id
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isMyMessage
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-700 text-white'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isMyMessage ? 'text-orange-100' : 'text-gray-400'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Mesaj Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 bg-gray-700 border-gray-600 text-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Gönder
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <p className="text-lg mb-2">Bir kullanıcı seçin</p>
                    <p className="text-sm">Mesajlaşmaya başlamak için soldaki listeden birini seçin</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
