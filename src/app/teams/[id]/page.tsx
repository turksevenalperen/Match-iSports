"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Trophy, Users, ArrowLeft, Star, MessageCircle, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useToastContext } from "@/components/toast-provider"

interface TeamProfile {
  id: string
  teamName: string
  city: string
  sport: string
  rating: number
  bio?: string
  logo?: string | null
  isPro?: boolean
  createdAt: string
  _count: {
    createdMatches: number
    matchHistory1: number
    matchHistory2: number
  }
  createdMatches: Array<{
    id: string
    title: string
    date: string
    location: string
    description?: string
    status: string
  }>
}

export default function TeamProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const { toast } = useToastContext()
  const [team, setTeam] = useState<TeamProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRequested, setIsRequested] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTeamProfile()
    }
  }, [params.id])

  const fetchTeamProfile = async () => {
    try {
      const response = await fetch(`/api/teams/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTeam(data)
      }
    } catch (error) {
      console.error("Error fetching team profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTeamRequest = async () => {
    try {
      const response = await fetch(`/api/teams/${params.id}/request`, {
        method: "POST"
      })
      
      if (response.ok) {
        setIsRequested(true)
        toast.success("Maç isteği başarıyla gönderildi!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    }
  }

  const cancelTeamRequest = async () => {
    try {
      const response = await fetch(`/api/teams/${params.id}/request`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setIsRequested(false)
        toast.success("İstek başarıyla iptal edildi!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    }
  }

  const getTotalMatches = (team: TeamProfile) => {
    return team._count.matchHistory1 + team._count.matchHistory2
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-orange-300">Takım profili yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-orange-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-300 mb-2">Takım bulunamadı</h3>
          <p className="text-gray-400 mb-4">Bu takım mevcut değil veya kaldırılmış</p>
          <Link href="/teams/search">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
              Takım Aramaya Dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwnTeam = session?.user?.id === team.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-orange-300 hover:bg-orange-500/10 hover:text-orange-400">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-orange-300">Takım Profili</h1>
                <p className="text-gray-400 text-sm">Takım detayları ve istatistikleri</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-6">
                    <Avatar className="h-20 w-20 border-2 border-orange-500/30 ring-2 ring-orange-500/20 shadow-lg">
                      <AvatarImage 
                        src={team.logo || ''} 
                        alt={`${team.teamName} logo`}
                        className="object-cover w-full h-full rounded-full"
                        style={{ objectPosition: 'center' }}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl font-bold">
                        {getSportIcon(team.sport)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-3xl text-orange-300">{team.teamName}</CardTitle>
                        {team.isPro && (
                          <div className="flex items-center bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/40">
                            <Star className="h-4 w-4 mr-1" />
                            <span className="text-xs font-semibold">PRO</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-6 mt-3">
                        <div className="flex items-center text-gray-300">
                          <MapPin className="h-4 w-4 mr-2 text-orange-400" />
                          {team.city}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Trophy className="h-4 w-4 mr-2 text-orange-400" />
                          {team.sport}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-5 w-5 text-yellow-400" />
                          <span className="font-bold text-orange-300 text-lg">{team.rating}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!isOwnTeam && (
                    <div>
                      {isRequested ? (
                        <Button 
                          variant="outline"
                          onClick={cancelTeamRequest}
                          className="text-green-400 border-green-500/50 hover:bg-green-500/10 bg-black/50"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          İstek Gönderildi
                        </Button>
                      ) : (
                        <Button 
                          onClick={sendTeamRequest}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Maç İste
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {team.bio && (
                  <CardDescription className="mt-6 text-base text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-orange-500/20">
                    {team.bio}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-3 gap-6 mt-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/30">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{team._count.createdMatches}</div>
                    <div className="text-sm text-gray-300">Aktif İlan</div>
                    <div className="w-8 h-1 bg-blue-500 mx-auto mt-2 rounded-full"></div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30">
                    <div className="text-3xl font-bold text-green-400 mb-2">{getTotalMatches(team)}</div>
                    <div className="text-sm text-gray-300">Toplam Maç</div>
                    <div className="w-8 h-1 bg-green-500 mx-auto mt-2 rounded-full"></div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{team.rating}</div>
                    <div className="text-sm text-gray-300">Rating</div>
                    <div className="w-8 h-1 bg-orange-500 mx-auto mt-2 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            {team.createdMatches.length > 0 && (
              <Card className="mt-6 bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/40">
                      <Calendar className="h-5 w-5 text-orange-400" />
                    </div>
                    <CardTitle className="text-xl text-orange-300">Son İlanlar</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {team.createdMatches.slice(0, 3).map((match) => (
                      <div key={match.id} className="border border-orange-500/20 rounded-xl p-5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-800/70 hover:to-gray-900/70 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-orange-200 text-lg mb-3">{match.title}</h4>
                            <div className="flex items-center space-x-6 text-sm text-gray-300">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-orange-400" />
                                {formatDate(match.date)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-orange-400" />
                                {match.location}
                              </div>
                            </div>
                            {match.description && (
                              <p className="text-sm text-gray-400 mt-3 bg-gray-800/30 p-3 rounded-lg">{match.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                              match.status === 'OPEN' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                              {match.status === 'OPEN' ? 'Açık' : 'Kapalı'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/40">
                    <Users className="h-5 w-5 text-orange-400" />
                  </div>
                  <CardTitle className="text-xl text-orange-300">Takım Bilgileri</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Kuruluş Tarihi</label>
                  <p className="text-gray-300 mt-1 text-lg">{formatDate(team.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Spor Dalı</label>
                  <p className="text-gray-300 mt-1 text-lg">{team.sport}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Şehir</label>
                  <p className="text-gray-300 mt-1 text-lg">{team.city}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Rating</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300 font-bold text-lg">{team.rating}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isOwnTeam && (
              <Card className="mt-6 bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/40">
                      <Trophy className="h-5 w-5 text-orange-400" />
                    </div>
                    <CardTitle className="text-xl text-orange-300">Takım Yönetimi</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full text-orange-300 border-orange-500/50 hover:bg-orange-500/10 bg-black/50">
                      Dashboard'a Git
                    </Button>
                  </Link>
                  <Link href="/matches/create">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                      Yeni İlan Ver
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
