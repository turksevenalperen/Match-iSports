"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin, Trophy, Users, ArrowLeft, Search, Filter } from "lucide-react"
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

interface Match {
  id: string
  title: string
  description: string
  date: string
  location: string
  sport: string
  creator: {
    id: string
    teamName: string
    city: string
    sport: string
    rating: number
  }
  _count: {
    requests: number
  }
}

export default function MatchesPage() {
  const { data: session } = useSession()
  const { toast } = useToastContext()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    city: "",
    sport: "",
  })

  const fetchMatches = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.sport) params.append('sport', filters.sport)

      const response = await fetch(`/api/matches?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMatches()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());

  // Kullanıcının gönderdiği istekleri çek
  const fetchSentRequests = async () => {
    try {
      const response = await fetch("/api/teams/my-requests");
      if (response.ok) {
        const data = await response.json();
        setSentRequests(data);
      }
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    fetchSentRequests();
  }, []);

  const sendMatchRequest = async (match: Match) => {
    setLoadingActions(prev => new Set([...prev, match.creator.id]));
    try {
      const response = await fetch('/api/teams/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTeamId: match.creator.id,
          message: `Merhaba ${match.creator.teamName}! İlanınıza başvuru yapmak istiyoruz.`
        })
      });

      if (response.ok) {
        toast.success("İstek başarıyla gönderildi!");
        fetchMatches();
        fetchSentRequests();
      } else {
        const data = await response.json();
        toast.error(data.error || "Bir hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(match.creator.id);
        return newSet;
      });
    }
  };

  const cancelMatchRequest = async (requestId: string, teamName: string, teamId: string) => {
    setLoadingActions(prev => new Set([...prev, teamId]));
    try {
      const response = await fetch('/api/teams/my-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (response.ok) {
        toast.info("İstek iptal edildi: " + teamName);
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
        fetchMatches();
      } else {
        const data = await response.json();
        toast.error(data.error || "İptal sırasında hata oluştu");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(teamId);
        return newSet;
      });
    }
  };

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
                <h1 className="text-2xl font-bold text-orange-300">Maç İlanları</h1>
                <p className="text-gray-400">Hazırlık maçı arayan takımlar</p>
              </div>
            </div>
            <Link href="/matches/create">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                <Trophy className="h-4 w-4 mr-2" />
                İlan Ver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/40">
                <Filter className="h-5 w-5 text-orange-400" />
              </div>
              <CardTitle className="text-xl text-orange-300">Filtreler</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Şehir</label>
                <select
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-orange-500/30 rounded-lg text-orange-200 focus:border-orange-500/50 focus:outline-none"
                >
                  <option value="">Tüm Şehirler</option>
                  {CITIES.slice(1).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Spor Dalı</label>
                <select
                  value={filters.sport}
                  onChange={(e) => handleFilterChange('sport', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-orange-500/30 rounded-lg text-orange-200 focus:border-orange-500/50 focus:outline-none"
                >
                  {SPORTS.map(sport => (
                    <option key={sport.value} value={sport.value}>{sport.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-orange-300">İlanlar yükleniyor...</div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="h-16 w-16 text-orange-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-300 mb-2">Henüz ilan yok</h3>
            <p className="text-gray-400 mb-6">Bu kriterlere uygun ilan bulunamadı</p>
            <Link href="/matches/create">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">İlk İlanı Sen Ver</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl hover:shadow-orange-500/20 hover:border-orange-500/50 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-orange-300 group-hover:text-orange-200 transition-colors">{match.title}</CardTitle>
                  <CardDescription className="text-gray-400 line-clamp-2">
                    {match.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="h-4 w-4 mr-2 text-orange-400" />
                    <span className="font-medium">{match.creator.teamName}</span>
                    <span className="ml-2 text-yellow-400">⭐ {match.creator.rating}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <Trophy className="h-4 w-4 mr-2 text-orange-400" />
                    {match.sport} • {match.creator.city}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <CalendarDays className="h-4 w-4 mr-2 text-orange-400" />
                    {new Date(match.date).toLocaleDateString('tr-TR', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-orange-400" />
                    {match.location}
                  </div>

                  <div className="pt-4 border-t border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {match._count.requests} başvuru
                      </span>
                      {session?.user?.id !== match.creator.id ? (
                        (() => {
                          // Bu ilana daha önce istek gönderilmiş mi?
                          const sentRequest = sentRequests.find(req => req.receiver?.id === match.creator.id);
                          if (sentRequest) {
                            return (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                                onClick={() => cancelMatchRequest(sentRequest.id, match.creator.teamName, match.creator.id)}
                                disabled={loadingActions.has(match.creator.id)}
                              >
                                {loadingActions.has(match.creator.id) ? "İptal Ediliyor..." : "İstek İptal Et"}
                              </Button>
                            );
                          } else {
                            return (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                                onClick={() => sendMatchRequest(match)}
                                disabled={loadingActions.has(match.creator.id)}
                              >
                                {loadingActions.has(match.creator.id) ? "Gönderiliyor..." : "İstek Gönder"}
                              </Button>
                            );
                          }
                        })()
                      ) : (
                        <span className="text-sm text-orange-400 font-medium bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30">
                          Senin İlanın
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
