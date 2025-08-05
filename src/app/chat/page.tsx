"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, ArrowLeft, MessageCircle, Search, Send, Clock, Star, MapPin } from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"
import { useSocket } from "@/hooks/useSocket"

interface ChatRoom {
  id: string
  otherTeam: {
    id: string
    teamName: string
    city: string
    sport: string
    rating: number
  }
  lastMessage?: {
    content: string
    createdAt: string
    senderId: string
  }
  unreadCount: number
}

export default function ChatPage() {
  const { data: session } = useSession()
  const { toast } = useToastContext()
  const socket = useSocket()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchChatRooms()
    }
  }, [session])

  // Socket listeners
  useEffect(() => {
    if (!socket.socket) return

    socket.onNewMessage((message: any) => {
      setMessages(prev => [...prev, message])
      setChatRooms(prev => prev.map(room => 
        room.id === selectedChat?.id 
          ? { ...room, lastMessage: message }
          : room
      ))
      scrollToBottom()
    })

    socket.onUserTyping((data) => {
      if (data.roomId === selectedChat?.id) {
        setTypingUser(data.isTyping ? data.userName : null)
      }
    })

    // Socket bağlantı durumu için listeners
    if (socket.socket) {
      socket.socket.on('connect', () => {
        console.log('Chat: Socket connected')
      })

      socket.socket.on('disconnect', (reason) => {
        console.log('Chat: Socket disconnected:', reason)
        toast.error("Bağlantı kesildi - Yeniden bağlanıyor...")
      })

      socket.socket.on('connect_error', (error) => {
        console.error('Chat: Socket connection error:', error)
        toast.error("Mesajlaşma hizmetine bağlanılamıyor")
      })

      socket.socket.on('reconnect', () => {
        console.log('Chat: Socket reconnected')
        toast.success("Mesajlaşma hizmeti yeniden aktif")
      })
    }

    return () => {
      socket.removeListeners()
    }
  }, [socket.socket, selectedChat?.id, toast])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatRooms = async () => {
    try {
      const response = await fetch('/api/chat/rooms')
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data)
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (chatRoomId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatRoomId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  useEffect(() => {
    if (selectedChat && socket.socket) {
      socket.joinRoom(selectedChat.id)
      fetchMessages(selectedChat.id)
      
      return () => {
        socket.leaveRoom(selectedChat.id)
      }
    }
  }, [selectedChat, socket.socket])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sendingMessage) return

    setSendingMessage(true)
    try {
      const response = await fetch(`/api/chat/${selectedChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        const newMsg = await response.json()
        setMessages(prev => [...prev, newMsg])
        setNewMessage("")
        
        if (socket.socket && session?.user?.teamName) {
          socket.setTyping(selectedChat.id, false, session.user.teamName)
        }
        
        setChatRooms(prev => prev.map(room => 
          room.id === selectedChat.id 
            ? { ...room, lastMessage: newMsg }
            : room
        ))
      } else {
        toast.error("Mesaj gönderilemedi")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Bağlantı hatası")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleChatSelect = (chat: ChatRoom) => {
    setSelectedChat(chat)
  }

  const handleTyping = (value: string) => {
    setNewMessage(value)
    
    if (socket.socket && selectedChat && session?.user?.teamName) {
      const isTypingNow = value.trim().length > 0
      if (isTypingNow !== isTyping) {
        setIsTyping(isTypingNow)
        socket.setTyping(selectedChat.id, isTypingNow, session.user.teamName)
      }
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return formatTime(dateString)
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Dün"
    } else {
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-200">Chat'ler yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-orange-500/20 border-orange-500/30 bg-orange-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Mesajlar</h1>
                <p className="text-orange-200">Eşleşen takımlarla sohbet edin</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          <div className="lg:col-span-1">
            <Card className="h-full bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-black/95 backdrop-blur-lg text-white border-b border-orange-500/20">
                <CardTitle className="flex items-center text-lg text-orange-300">
                  <MessageCircle className="h-5 w-5 mr-2 text-orange-400" />
                  Sohbetler ({chatRooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {chatRooms.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Henüz sohbet yok</h3>
                    <p className="text-gray-400 mb-4">Takım istekleri kabul edildiğinde burada görünecek</p>
                    <Link href="/teams/search">
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500/30">Takım Ara</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-orange-500/20">
                    {chatRooms.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={`p-4 cursor-pointer hover:bg-orange-500/10 transition-colors ${
                          selectedChat?.id === chat.id ? 'bg-orange-500/20 border-r-2 border-orange-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 border border-orange-500/30">
                            <Users className="h-5 w-5 text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-200 truncate">
                                {chat.otherTeam.teamName}
                              </h4>
                              {chat.lastMessage && (
                                <span className="text-xs text-gray-400">
                                  {formatDate(chat.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-sm text-gray-400 mt-1">
                              <MapPin className="h-3 w-3 mr-1 text-orange-400" />
                              {chat.otherTeam.city}
                              <Star className="h-3 w-3 ml-2 mr-1 text-yellow-400" />
                              {chat.otherTeam.rating}
                            </div>
                            {chat.lastMessage && (
                              <p className="text-sm text-gray-300 truncate mt-1">
                                {chat.lastMessage.senderId === session?.user?.id ? 'Sen: ' : ''}
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                          {chat.unreadCount > 0 && (
                            <div className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border border-orange-400">
                              {chat.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border-orange-500/30 shadow-2xl">
              {selectedChat ? (
                <>
                  <CardHeader className="border-b border-orange-500/20 bg-black/95 backdrop-blur-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-500/30">
                        <Users className="h-5 w-5 text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-200">{selectedChat.otherTeam.teamName}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {selectedChat.otherTeam.city} • {selectedChat.otherTeam.sport} • Rating: {selectedChat.otherTeam.rating}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900/50 to-black/50">
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                          <p className="text-gray-400">Henüz mesaj yok. İlk mesajı gönderin!</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-lg ${
                                message.senderId === session?.user?.id
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border border-orange-400'
                                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 border border-gray-600'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.senderId === session?.user?.id ? 'text-orange-100' : 'text-gray-400'
                              }`}>
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {typingUser && (
                        <div className="flex justify-start">
                          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-gray-200 px-4 py-2 rounded-lg border border-gray-600">
                            <p className="text-sm italic text-orange-300">{typingUser} yazıyor...</p>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  <div className="p-4 border-t border-orange-500/20 bg-black/95 backdrop-blur-lg">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Mesajınızı yazın..."
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 bg-gray-800/50 border-orange-500/30 text-gray-200 placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-500/30"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900/50 to-black/50">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Sohbet Seçin</h3>
                    <p className="text-gray-400">Mesajlaşmaya başlamak için sol taraftan bir takım seçin</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
