"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Search,
  MessageCircle,
  Trophy,
  LogOut,
  Plus,
  Check,
  X,
  Star,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Activity,
  Zap,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"
import { useNotifications } from "@/contexts/NotificationContext"

interface TeamRequest {
  id: string
  message: string
  createdAt: string
  sender: {
    id: string
    teamName: string
    city: string
    sport: string
    rating: number
  }
}

interface SentRequest {
  id: string
  message: string
  createdAt: string
  receiver: {
    id: string
    teamName: string
    city: string
    sport: string
    rating: number
    logo: string | null
    isPro: boolean
  }
}

interface Team {
  id: string
  teamName: string
  city: string
  sport: string
  rating: number
  isPro: boolean
  logo: string | null
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  metadata?: any
  createdAt: string
}

interface UserStats {
  totalMatches: number
  thisMonthMatches: number
  winRate: number
  recentMatches: Array<{
    id: string
    opponent: string
    score: string
    won: boolean
    date: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToastContext()
  const { data: notificationData, refreshNotifications } = useNotifications()
  
  // Local states for UI interactions
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([])
  const [isLoadingSentRequests, setIsLoadingSentRequests] = useState(false)
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    sport: "",
    rating: ""
  })

  // Notification context'inden gelen veriler
  const incomingRequests = notificationData.teamRequests
  const activities = notificationData.activities
  const isLoadingRequests = false // Context handles loading
  const isLoadingActivities = false // Context handles loading

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const fetchSentRequests = async () => {
    setIsLoadingSentRequests(true)
    try {
      const response = await fetch("/api/teams/my-requests")
      if (response.ok) {
        const data = await response.json()
        setSentRequests(data)
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error)
    } finally {
      setIsLoadingSentRequests(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchTeams() // İlk yüklemede takımları getir
      fetchSentRequests() // Gönderilen istekleri getir
    }
  }, [status, router])

  const fetchTeams = async () => {
    setIsLoadingTeams(true)
    try {
      const params = new URLSearchParams()
      if (searchFilters.city) params.append("city", searchFilters.city)
      if (searchFilters.sport) params.append("sport", searchFilters.sport)
      if (searchFilters.rating) {
        const [min, max] = searchFilters.rating.split("-").map(Number)
        params.append("minRating", min.toString())
        params.append("maxRating", max.toString())
      }

      const response = await fetch(`/api/teams/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // API response'da teams array'i içerisinde geliyor
        setTeams(data.teams || [])
      } else {
        console.error("Error fetching teams:", response.statusText)
        setTeams([])
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
      setTeams([])
    } finally {
      setIsLoadingTeams(false)
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Filtreler değiştiğinde takımları yeniden getir
  useEffect(() => {
    if (status === "authenticated") {
      fetchTeams()
    }
  }, [searchFilters, status])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "PLATFORM_JOIN":
        return <Shield className="h-5 w-5 text-white" />
      case "REQUEST_SENT":
        return <MessageCircle className="h-5 w-5 text-white" />
      case "REQUEST_RECEIVED":
        return <MessageCircle className="h-5 w-5 text-white" />
      case "REQUEST_ACCEPTED":
        return <Check className="h-5 w-5 text-white" />
      case "REQUEST_REJECTED":
        return <X className="h-5 w-5 text-white" />
      case "REQUEST_CANCELLED":
        return <X className="h-5 w-5 text-white" />
      case "CHAT_STARTED":
        return <MessageCircle className="h-5 w-5 text-white" />
      default:
        return <Activity className="h-5 w-5 text-white" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "PLATFORM_JOIN":
        return "bg-orange-500"
      case "REQUEST_SENT":
        return "bg-blue-500"
      case "REQUEST_RECEIVED":
        return "bg-purple-500"
      case "REQUEST_ACCEPTED":
        return "bg-green-500"
      case "REQUEST_REJECTED":
        return "bg-red-500"
      case "REQUEST_CANCELLED":
        return "bg-gray-500"
      case "CHAT_STARTED":
        return "bg-orange-400"
      default:
        return "bg-gray-600"
    }
  }

  const handleRequestAction = async (requestId: string, action: "ACCEPTED" | "REJECTED") => {
    setLoadingActions((prev) => new Set([...prev, requestId]))
    try {
      const response = await fetch("/api/teams/incoming-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, action }),
      })
      if (response.ok) {
        const data = await response.json()
        if (action === "ACCEPTED") {
          toast.success("İstek Kabul Edildi! ✅ Artık takımla sohbet edebilirsiniz.")
        } else {
          toast.info("İstek Reddedildi 📝 İstek başarıyla reddedildi.")
        }
        
        // Başarılı işlem sonrası bildirimleri yenile
        await refreshNotifications()
      } else {
        const errorData = await response.json()
        toast.error("Hata Oluştu! ❌ " + (errorData.error || "İstek işlenirken bir hata oluştu."))
      }
    } catch (error) {
      toast.error("Bağlantı Hatası! 🌐 İstek işlenirken bir hata oluştu.")
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleSendRequest = async (targetTeamId: string, targetTeamName: string) => {
    if (!session?.user?.id) return
    
    setLoadingActions((prev) => new Set([...prev, targetTeamId]))
    try {
      const response = await fetch('/api/teams/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetTeamId,
          message: `Merhaba ${targetTeamName}! Sizinle bir hazırlık maçı yapmak istiyoruz. İletişime geçelim!`
        }),
      })

      if (response.ok) {
        // Başarı bildirimi
        toast.success("İstek Gönderildi! ✅ " + `${targetTeamName} takımına maç isteğiniz başarıyla gönderildi.`)
        
        // Aktivite ekle
        const newActivity = {
          id: Date.now().toString(),
          type: "REQUEST_SENT",
          title: "Maç İsteği Gönderildi",
          description: `${targetTeamName} takımına maç isteği gönderdiniz`,
          createdAt: new Date().toISOString()
        }
        
        // Aktiviteleri yenile
        await refreshNotifications()
        
        // Gönderilen istekleri yenile
        fetchSentRequests()
        
      } else {
        const error = await response.json()
        toast.error("Hata! ❌ " + (error.error || "İstek gönderilirken bir hata oluştu."))
      }
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error("Bağlantı Hatası! 🌐 İnternet bağlantınızı kontrol edin.")
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(targetTeamId)
        return newSet
      })
    }
  }

  const handleCancelRequest = async (requestId: string, targetTeamName: string) => {
    setLoadingActions((prev) => new Set([...prev, requestId]))
    try {
      const response = await fetch('/api/teams/my-requests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        toast.info("İstek İptal Edildi ❌ " + `${targetTeamName} takımına gönderilen istek iptal edildi.`)
        
        // Gönderilen istekleri listeden kaldır
        setSentRequests(prev => prev.filter(req => req.id !== requestId))
        
        // Aktivite ekle
        const newActivity = {
          id: Date.now().toString(),
          type: "REQUEST_CANCELLED",
          title: "Maç İsteği İptal Edildi",
          description: `${targetTeamName} takımına gönderilen istek iptal edildi`,
          createdAt: new Date().toISOString()
        }
        
        // Aktiviteleri yenile
        await refreshNotifications()
        
      } else {
        const error = await response.json()
        toast.error("Hata! ❌ " + (error.error || "İstek iptal edilirken bir hata oluştu."))
      }
    } catch (error) {
      console.error('Error cancelling request:', error)
      toast.error("Bağlantı Hatası! 🌐 İnternet bağlantınızı kontrol edin.")
    } finally {
      setLoadingActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "futbol":
        return "⚽"
      case "basketbol":
        return "🏀"
      case "voleybol":
        return "🏐"
      case "tenis":
        return "🎾"
      default:
        return "🏆"
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-emerald-400"
    if (rating >= 60) return "text-yellow-400"
    if (rating >= 40) return "text-orange-400"
    return "text-red-400"
  }

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    if (rating >= 60) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    if (rating >= 40) return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    return "bg-red-500/20 text-red-300 border-red-500/30"
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-200">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    // Önce session'ı temizle
    await signOut({ 
      callbackUrl: "/",
      redirect: false 
    })
    
    // Cookieleri temizle
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Ana sayfaya yönlendir
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-14 w-14 border-2 border-orange-500/30 ring-2 ring-orange-500/20">
                <AvatarImage 
                  src={session.user.logo || ''} 
                  alt={`${session.user.teamName} logo`}
                  className="object-cover w-full h-full rounded-full"
                  style={{ objectPosition: 'center' }}
                />
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl font-bold">
                  {getSportIcon(session.user.sport)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                    {session.user.teamName}
                  </h1>
                  {session.user.isPro && (
                    <div className="flex items-center bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/40">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">PRO</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-gray-300">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-orange-400" />
                    {session.user.city}
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-orange-400" />
                    {session.user.sport}
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold">
                    <Star className="h-3 w-3 mr-1" />
                    {session.user.rating}/100
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/50 bg-black/50 border-gray-600 text-gray-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>

      {/* Top Navigation */}
      <nav className="bg-black/90 backdrop-blur-lg border-b border-orange-500/20 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-6">
              <Link href="/matches" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-500/10 transition-colors">
                <Users className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">İlanlar</span>
              </Link>
              <Link href="/chat" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-500/10 transition-colors">
                <MessageCircle className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Mesajlar</span>
              </Link>
              <Link href="/profile" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-500/10 transition-colors">
                <Award className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Profil</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/teams/incoming-requests" className="relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-orange-500/10 transition-colors">
                <MessageCircle className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Gelen İstekler</span>
                {incomingRequests.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {incomingRequests.length}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="border border-orange-500/30 shadow-lg bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-300 mb-2">0</div>
                  <div className="text-sm text-gray-400">Toplam Maç</div>
                  <div className="w-8 h-1 bg-orange-500 mx-auto mt-2 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-orange-500/30 shadow-lg bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-200 mb-2">{session.user.rating}</div>
                  <div className="text-sm text-gray-400">Rating</div>
                  <div className="w-8 h-1 bg-orange-400 mx-auto mt-2 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-orange-500/30 shadow-lg bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-300 mb-2">0</div>
                  <div className="text-sm text-gray-400">Bu Ay</div>
                  <div className="w-8 h-1 bg-orange-500 mx-auto mt-2 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Link href="/matches/create">
              <Card className="border border-orange-500/30 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 backdrop-blur-sm cursor-pointer hover:shadow-xl hover:shadow-orange-500/30 transition-all group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Plus className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-white font-semibold">Maç İlanı Ver</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Team Search Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Search */}
            <div className="lg:col-span-2">
              <Card className="border border-orange-500/30 shadow-2xl bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/40">
                      <Search className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-orange-300">Takım Ara</CardTitle>
                      <CardDescription className="text-gray-400">Maç yapmak için takım bulun</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Search Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-300 mb-2">Şehir</label>
                        <select 
                          value={searchFilters.city}
                          onChange={(e) => handleFilterChange("city", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-orange-500/30 rounded-lg text-orange-200 focus:border-orange-500/50 focus:outline-none">
                          <option value="">Tümü</option>
                          <option value="İstanbul">İstanbul</option>
                          <option value="Ankara">Ankara</option>
                          <option value="İzmir">İzmir</option>
                          <option value="Bursa">Bursa</option>
                          <option value="Antalya">Antalya</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-300 mb-2">Spor</label>
                        <select 
                          value={searchFilters.sport}
                          onChange={(e) => handleFilterChange("sport", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-orange-500/30 rounded-lg text-orange-200 focus:border-orange-500/50 focus:outline-none">
                          <option value="">Tümü</option>
                          <option value="FUTBOL">Futbol</option>
                          <option value="BASKETBOL">Basketbol</option>
                          <option value="VOLEYBOL">Voleybol</option>
                          <option value="TENIS">Tenis</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-orange-300 mb-2">Rating</label>
                        <select 
                          value={searchFilters.rating}
                          onChange={(e) => handleFilterChange("rating", e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-orange-500/30 rounded-lg text-orange-200 focus:border-orange-500/50 focus:outline-none">
                          <option value="">Tümü</option>
                          <option value="80-100">80-100</option>
                          <option value="60-79">60-79</option>
                          <option value="40-59">40-59</option>
                          <option value="0-39">0-39</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Search Results */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {isLoadingTeams ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                          <div className="text-orange-300">Takımlar yükleniyor...</div>
                        </div>
                      ) : teams.length === 0 ? (
                        <div className="text-center py-8">
                          <Search className="h-12 w-12 mx-auto mb-3 text-orange-400/50" />
                          <p className="font-medium text-orange-300/80 text-sm">Takım bulunamadı</p>
                          <p className="text-xs text-gray-500">Farklı filtreler deneyin</p>
                        </div>
                      ) : (
                        (Array.isArray(teams) ? teams : []).map((team) => {
                          // Bu takıma daha önce istek gönderilmiş mi kontrol et
                          const sentRequest = sentRequests.find(req => req.receiver.id === team.id)
                          
                          return (
                            <div key={team.id} className="border border-orange-500/20 rounded-xl p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-800/70 hover:to-gray-900/70 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => router.push(`/teams/${team.id}`)}>
                                  <Avatar className="h-12 w-12 border-2 border-orange-500/40 ring-1 ring-orange-500/20">
                                    <AvatarImage 
                                      src={team.logo || ''} 
                                      alt={`${team.teamName} logo`}
                                      className="object-cover w-full h-full rounded-full"
                                      style={{ objectPosition: 'center' }}
                                    />
                                    <AvatarFallback className="bg-orange-500/20 text-orange-300 font-bold">
                                      {getSportIcon(team.sport)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-orange-200 hover:text-orange-100 transition-colors">{team.teamName}</h4>
                                      {team.isPro && (
                                        <CheckCircle className="h-4 w-4 text-blue-400" />
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                                      <span>{getSportIcon(team.sport)} {team.sport}</span>
                                      <span>📍 {team.city}</span>
                                      <Badge className={getRatingBadgeColor(team.rating)}>
                                        <Star className="h-3 w-3 mr-1" />
                                        {team.rating}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {sentRequest ? (
                                  <Button 
                                    variant="outline"
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                                    onClick={() => handleCancelRequest(sentRequest.id, team.teamName)}
                                    disabled={loadingActions.has(sentRequest.id)}
                                  >
                                    {loadingActions.has(sentRequest.id) ? "İptal Ediliyor..." : "İstek İptal Et"}
                                  </Button>
                                ) : (
                                  <Button 
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                    onClick={() => handleSendRequest(team.id, team.teamName)}
                                    disabled={loadingActions.has(team.id)}
                                  >
                                    {loadingActions.has(team.id) ? "Gönderiliyor..." : "İstek Gönder"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Activity Sidebar */}
            <div>
              <Card className="border border-orange-500/30 shadow-2xl bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/40">
                      <Activity className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-orange-300">Son Aktiviteler</CardTitle>
                      <CardDescription className="text-gray-400">Son hareketler</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoadingActivities ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                        <div className="text-xs text-gray-400">Yükleniyor...</div>
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="text-center py-8">
                        <Zap className="h-10 w-10 mx-auto mb-3 text-orange-400/50" />
                        <p className="font-medium text-orange-300/80 text-sm">Henüz aktivite yok</p>
                        <p className="text-xs text-gray-500">İlk ilanını ver!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {activities.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg border border-orange-500/20">
                            <div className={`h-8 w-8 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center`}>
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-orange-200 truncate">{activity.title}</p>
                              <p className="text-xs text-gray-400 truncate">{activity.description}</p>
                              <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}