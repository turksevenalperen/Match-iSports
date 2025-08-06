'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
// import { useSocket } from '@/hooks/useSocket'
import { useNotifications } from '@/contexts/NotificationContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToastContext } from '@/components/toast-provider'
import Link from 'next/link'
import { ArrowLeft, Send, MessageCircle } from 'lucide-react'

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
  // Polling için interval ref
  const pollingMessagesRef = useRef<NodeJS.Timeout | null>(null)
  const { data: session } = useSession()
  const { toast } = useToastContext()
  // const socket = useSocket()
  const { data: notificationData, refreshNotifications } = useNotifications()
  
  // States
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showUserList, setShowUserList] = useState(true) // Mobile için
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Production'da polling için interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // ✅ RefreshData'yı sadece mesajlar için kullan
  const refreshData = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      // KULLANICI LİSTESİNİ YENİDEN YÜKLEME!
      // Sadece seçili kullanıcının mesajlarını güncelle
      if (selectedUser) {
        console.log('🟡 [DEBUG] Refreshing messages for:', selectedUser.teamName)
        const messagesResponse = await fetch(`/api/messages?otherUserId=${selectedUser.id}`)
        if (messagesResponse.ok) {
          const messageData = await messagesResponse.json()
          setMessages(messageData)
          scrollToBottom()
        }
      }
    } catch (error) {
      console.error('🔴 [ERROR] refreshData:', error)
    }
  }, [session?.user?.id, selectedUser])

  // ✅ Kullanıcıları yükle - Sadece bir kez
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/match-history')
        if (response.ok) {
          const data = await response.json()
          
          // ✅ Debug: API'den gelen veriyi kontrol et
          console.log('🔵 [DEBUG] Match History API Response:', data)
          
          const myId = session?.user?.id
          const usersList = data
            .map((match: any) => {
              const otherUser = match.team1Id === myId 
                ? {
                    id: match.team2Id,
                    teamName: match.team2Name || match.team2?.teamName || 'Bilinmeyen Takım',
                    city: match.team2?.city || '',
                    sport: match.team2?.sport || '',
                  }
                : {
                    id: match.team1Id,
                    teamName: match.team1Name || match.team1?.teamName || 'Bilinmeyen Takım', 
                    city: match.team1?.city || '',
                    sport: match.team1?.sport || '',
                  }
              
              // ✅ Her user'ın ID'sini kontrol et
              console.log('🔵 [DEBUG] Created user:', otherUser)
              
              return otherUser
            })
            .filter((user: any, index: number, arr: any[]) => {
              // ✅ ID'si undefined/null olan kullanıcıları filtrele
              if (!user.id) {
                console.warn('⚠️ [WARNING] User with empty ID filtered out:', user)
                return false
              }
              return arr.findIndex(u => u.id === user.id) === index
            })
          
          console.log('🔵 [DEBUG] Final users list:', usersList)
          setUsers(usersList)
        }
      } catch (error) {
        console.error('🔴 [ERROR] fetchUsers:', error)
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
      
      // ✅ SADECE BİLDİRİMLERİ GÜNCELLE - Kullanıcı listesini sürekli yenileme!
      if (process.env.NODE_ENV === 'production') {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            await refreshNotifications()
            console.log('🟡 [POLLING] Notifications refreshed')
          } catch (error) {
            console.error('🔴 [POLLING ERROR]:', error)
          }
        }, 5000) // 5 saniyede bir sadece bildirimler
      }
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [session]) // ✅ selectedUser'ı dependency'den kaldırdım

  // Kullanıcı seçildiğinde mesajları yükle
  useEffect(() => {
    if (selectedUser && session?.user?.id) {
      loadMessages(selectedUser.id)
      // Mesajları okunmuş olarak işaretle
      markMessagesAsRead(selectedUser.id)
      // 1 saniyede bir mesajları güncelle (polling)
      if (pollingMessagesRef.current) clearInterval(pollingMessagesRef.current)
      pollingMessagesRef.current = setInterval(() => {
        loadMessages(selectedUser.id)
      }, 1000)
    } else {
      // Kullanıcı seçili değilse polling'i durdur
      if (pollingMessagesRef.current) {
        clearInterval(pollingMessagesRef.current)
        pollingMessagesRef.current = null
      }
    }

    // Cleanup
    return () => {
      if (pollingMessagesRef.current) {
        clearInterval(pollingMessagesRef.current)
        pollingMessagesRef.current = null
      }
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

  // ✅ Mesaj gönderme fonksiyonunu güvenli hale getir
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !session?.user?.id) {
      console.warn('⚠️ [WARNING] Message send blocked - missing data')
      return
    }

    // ✅ ID kontrolü ekle
    if (!selectedUser.id) {
      console.error('🔴 [ERROR] Selected user has no ID:', selectedUser)
      toast.error('Geçersiz kullanıcı seçimi')
      return
    }

    console.log('🔵 [DEBUG] Sending message to:', {
      receiverId: selectedUser.id,
      receiverName: selectedUser.teamName,
      senderId: session.user.id,
      senderName: session.user.teamName
    })

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
        scrollToBottom()
        console.log('✅ [SUCCESS] Message sent successfully')
      } else {
        const errorData = await response.json()
        console.error('🔴 [ERROR] Message send failed:', errorData)
        toast.error(`Mesaj gönderilemedi: ${errorData.error}`)
      }
    } catch (error) {
      console.error('🔴 [ERROR] Message send error:', error)
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

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    setShowUserList(false) // Mobilde chat'e geç
  }

  const handleBackToUsers = () => {
    setShowUserList(true)
    setSelectedUser(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mx-auto mb-3 sm:mb-4"></div>
          <div className="text-white text-sm sm:text-base">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              {/* Mobile: Chat açıkken geri butonu */}
              {!showUserList && selectedUser ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-orange-500/20 lg:hidden px-2"
                  onClick={handleBackToUsers}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="text-sm">Geri</span>
                </Button>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-orange-500/20 px-2 sm:px-3">
                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden text-sm">Geri</span>
                  </Button>
                </Link>
              )}
              <div className="min-w-0 flex-1">
                {!showUserList && selectedUser ? (
                  // Mobile: Chat başlığı
                  <div className="lg:hidden">
                    <h1 className="text-lg font-bold text-white truncate">{selectedUser.teamName}</h1>
                    <p className="text-orange-200 text-xs truncate">{selectedUser.city} • {selectedUser.sport}</p>
                  </div>
                ) : (
                  // Normal başlık
                  <div>
                    <h1 className="text-lg sm:text-2xl font-bold text-white">Real-Time Chat</h1>
                    <p className="text-orange-200 text-xs sm:text-sm hidden sm:block">Anlık mesajlaşma</p>
                  </div>
                )}
              </div>
            </div>
            {notificationData.unreadChatCount > 0 && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
                  {notificationData.unreadChatCount > 99 ? '99+' : notificationData.unreadChatCount}
                </div>
                <span className="text-xs sm:text-sm text-orange-200 hidden sm:inline">Okunmamış mesaj</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Kullanıcı Listesi - Desktop */}
          <div className="lg:col-span-1">
            <Card className="h-full p-4 bg-gray-800/50 border-gray-700 overflow-hidden">
              <h2 className="text-lg font-semibold mb-4 text-white">Kullanıcılar</h2>
              <div className="space-y-2 overflow-y-auto scrollbar-custom" style={{height: '500px'}}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors relative flex items-center gap-3 ${
                      selectedUser?.id === user.id
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <Avatar className="h-10 w-10 border border-orange-500/30 bg-gray-900">
                      <AvatarImage src={''} alt={user.teamName} />
                      <AvatarFallback className="bg-orange-500/30 text-orange-900 font-bold">
                        {user.teamName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{user.teamName || user.id || 'Bilinmeyen Takım'}</div>
                      <div className="text-gray-400 text-sm truncate">{user.city} • {user.sport}</div>
                    </div>
                    {(user.unreadCount || 0) > 0 && (
                      <div className="ml-2 bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px]">
                        {(user.unreadCount || 0) > 99 ? '99+' : user.unreadCount}
                      </div>
                    )}
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

          {/* Chat Alanı - Desktop */}
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

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {showUserList ? (
            /* Kullanıcı Listesi - Mobile */
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-orange-400" />
                  Sohbetler
                </h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="p-4 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700/30 transition-colors active:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-orange-500/30 bg-gray-900 flex-shrink-0">
                        <AvatarImage src={''} alt={user.teamName} />
                        <AvatarFallback className="bg-orange-500/30 text-orange-900 font-bold text-lg">
                          {user.teamName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate text-base">{user.teamName || 'Bilinmeyen Takım'}</div>
                        <div className="text-gray-400 text-sm truncate">{user.city} • {user.sport}</div>
                      </div>
                      {(user.unreadCount || 0) > 0 && (
                        <div className="bg-orange-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center min-w-[24px] flex-shrink-0">
                          {(user.unreadCount || 0) > 99 ? '99+' : user.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="text-gray-400 text-center py-12">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-base mb-2">Henüz sohbet yok</p>
                    <p className="text-sm">Maç eşleşmeleriniz burada görünecek</p>
                  </div>
                )}
              </div>
            </Card>
          ) : selectedUser ? (
            /* Chat Alanı - Mobile */
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden h-[calc(100vh-120px)] flex flex-col">
              {/* Mesajlar */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMyMessage = message.senderId === session?.user?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[280px] px-3 py-2 rounded-2xl ${
                          isMyMessage
                            ? 'bg-orange-600 text-white rounded-br-md'
                            : 'bg-gray-700 text-white rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
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
              
              {/* Mesaj Input - Mobile */}
              <div className="p-3 border-t border-gray-700 bg-gray-800/30">
                <div className="flex gap-2 items-end">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Mesaj yazın..."
                    className="flex-1 bg-gray-700 border-gray-600 text-white rounded-full px-4 py-2 min-h-[44px] text-base"
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
                    className="bg-orange-600 hover:bg-orange-700 rounded-full h-11 w-11 p-0 flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}