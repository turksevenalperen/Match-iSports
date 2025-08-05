"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Trophy, Users, ArrowLeft, Search, Filter, Star, MessageCircle, X } from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"

const SPORTS = [
  { value: "", label: "Tüm Sporlar" },
  { value: "FUTBOL", label: "Futbol" },
  { value: "BASKETBOL", label: "Basketbol" },
  { value: "VOLEYBOL", label: "Voleybol" },
  { value: "TENIS", label: "Tenis" },
]

const CITIES = [
  "", "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep"
]

interface Team {
  id: string
  teamName: string
  city: string
  sport: string
  rating: number
  bio?: string
  logo?: string
  _count: {
    createdMatches: number
    matchHistory1: number
    matchHistory2: number
  }
}

export default function TeamSearchPage() {
  const { data: session } = useSession()
  const { toast } = useToastContext()
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [requestedTeams, setRequestedTeams] = useState<Set<string>>(new Set())
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    search: "",
    city: "",
    sport: "",
    minRating: "",
    maxRating: "",
  })

  const fetchTeams = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.city) params.append('city', filters.city)
      if (filters.sport) params.append('sport', filters.sport)
      if (filters.minRating) params.append('minRating', filters.minRating)
      if (filters.maxRating) params.append('maxRating', filters.maxRating)

      const [teamsResponse, requestsResponse] = await Promise.all([
        fetch(`/api/teams/search?${params}`),
        fetch('/api/teams/my-requests')
      ])
      
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json()
        setTeams(teamsData.teams)
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        const requestedTeamIds = new Set<string>(requestsData.map((req: any) => req.receiverId as string))
        setRequestedTeams(requestedTeamIds)
      }
    } catch (error) {
      console.error("Error fetching teams:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const sendTeamRequest = async (teamId: string) => {
    setLoadingRequests(prev => new Set([...prev, teamId]))
    try {
      const response = await fetch(`/api/teams/${teamId}/request`, {
        method: "POST"
      })
      
      if (response.ok) {
        setRequestedTeams(prev => new Set([...prev, teamId]))
        toast.success("Maç isteği gönderildi!", "İstek başarıyla gönderildi, yanıt bekleniyor.")
      } else {
        const data = await response.json()
        toast.error("İstek gönderilemedi", data.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error("Bağlantı hatası", "İnternet bağlantınızı kontrol edin")
    } finally {
      setLoadingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(teamId)
        return newSet
      })
    }
  }

  const cancelTeamRequest = async (teamId: string) => {
    setLoadingRequests(prev => new Set([...prev, teamId]))
    try {
      const response = await fetch(`/api/teams/${teamId}/request`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setRequestedTeams(prev => {
          const newSet = new Set(prev)
          newSet.delete(teamId)
          return newSet
        })
        toast.info("İstek iptal edildi", "Maç isteği başarıyla iptal edildi")
      } else {
        const data = await response.json()
        toast.error("İptal edilemedi", data.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error("Bağlantı hatası", "İnternet bağlantınızı kontrol edin")
    } finally {
      setLoadingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(teamId)
        return newSet
      })
    }
  }

  const getTotalMatches = (team: Team) => {
    return team._count.matchHistory1 + team._count.matchHistory2
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-black/5">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Takım Ara</h1>
                <p className="text-orange-100">Diğer takımları keşfet ve maç isteği gönder</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <Search className="h-5 w-5 mr-2" />
              Takım Ara
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                <Input
                  placeholder="Takım adı ara..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Şehir</label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tüm Şehirler</option>
                    {CITIES.slice(1).map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Spor Dalı</label>
                  <select
                    value={filters.sport}
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SPORTS.map(sport => (
                      <option key={sport.value} value={sport.value}>{sport.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Rating</label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Rating</label>
                  <Input
                    type="number"
                    placeholder="100"
                    min="0"
                    max="100"
                    value={filters.maxRating}
                    onChange={(e) => handleFilterChange('maxRating', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-lg">Takımlar yükleniyor...</div>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Takım bulunamadı</h3>
            <p className="text-gray-600 mb-4">Bu kriterlere uygun takım bulunamadı</p>
            <Button onClick={() => setFilters({ search: "", city: "", sport: "", minRating: "", maxRating: "" })}>
              Filtreleri Temizle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-5 w-5 mr-2 text-blue-600" />
                      {team.teamName}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{team.rating}</span>
                    </div>
                  </div>
                  {team.bio && (
                    <CardDescription className="line-clamp-2">
                      {team.bio}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {team.city}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Trophy className="h-4 w-4 mr-2" />
                    {team.sport}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-600">{team._count.createdMatches}</div>
                      <div className="text-xs text-gray-600">İlan</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-600">{getTotalMatches(team)}</div>
                      <div className="text-xs text-gray-600">Maç</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <Link href={`/teams/${team.id}`}>
                        <Button variant="outline" size="sm">
                          Profil Gör
                        </Button>
                      </Link>
                      {session?.user?.id !== team.id ? (
                        requestedTeams.has(team.id) ? (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => cancelTeamRequest(team.id)}
                            disabled={loadingRequests.has(team.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            {loadingRequests.has(team.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                                İptal Ediliyor...
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                İsteği İptal Et
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => sendTeamRequest(team.id)}
                            disabled={loadingRequests.has(team.id)}
                          >
                            {loadingRequests.has(team.id) ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Gönderiliyor...
                              </>
                            ) : (
                              <>
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Maç İste
                              </>
                            )}
                          </Button>
                        )
                      ) : (
                        <span className="text-sm text-blue-600 font-medium">
                          Sen
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
