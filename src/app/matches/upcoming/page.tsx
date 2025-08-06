"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Trophy } from "lucide-react"
import Link from "next/link"

interface Team {
  id: string
  teamName: string
  city: string
  sport: string
  logo?: string | null
}

interface Match {
  id: string
  date?: string
  location?: string
  team1?: Team
  team2?: Team
  // Eğer API sadece rakip takım döndürüyorsa:
  teamName?: string
  city?: string
  sport?: string
  logo?: string | null
}

export default function UpcomingMatchesPage() {
  const { data: session, status } = useSession()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "authenticated") {
      fetchMatches()
    }
  }, [status])

  const fetchMatches = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/match-history")
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      setMatches([])
    } finally {
      setIsLoading(false)
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

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-orange-300">Yükleniyor...</div>
  }

  if (!session) {
    return null
  }

  // Maç iptal et fonksiyonu
  const handleCancelMatch = async (matchId: string) => {
    if (!window.confirm('Bu maçı silmek istediğine emin misin?')) return;
    try {
      const response = await fetch(`/api/match-history?id=${matchId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMatches(prev => prev.filter(m => m.id !== matchId))
      } else {
        alert('Maç silinemedi!')
      }
    } catch (err) {
      alert('Bir hata oluştu!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-orange-300 mb-8 text-center">Yaklaşan / Geçmiş Maçlar</h1>
        {isLoading ? (
          <div className="text-center text-orange-300">Maçlar yükleniyor...</div>
        ) : matches.length === 0 ? (
          <div className="text-center text-gray-400">Henüz eşleşmiş maçınız yok.</div>
        ) : (
          <div className="space-y-6">
            {matches.map((match, idx) => {
              let opponent: Team | undefined = undefined
              if (match.team1 && match.team2 && session.user?.id) {
                const isTeam1 = match.team1.id === session.user.id
                opponent = isTeam1 ? match.team2 : match.team1
              } else if (match.teamName && match.id) {
                // Sadece rakip takım objesi dönerse
                opponent = {
                  id: match.id,
                  teamName: match.teamName,
                  city: match.city || '',
                  sport: match.sport || '',
                  logo: match.logo || ''
                }
              }
              if (!opponent) return null
              return (
                <Card key={opponent.id || idx} className="border border-orange-500/30 bg-gray-900/70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-200">
                      <Users className="h-5 w-5 text-orange-400" />
                      {opponent.teamName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border-2 border-orange-500/30">
                        <AvatarImage src={opponent.logo || ''} alt={opponent.teamName} />
                        <AvatarFallback className="bg-orange-500/20 text-orange-300 font-bold">
                          {opponent.teamName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Trophy className="h-4 w-4 text-orange-400" />
                          {opponent.sport}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4 text-orange-400" />
                          {match.location || 'Belirtilmedi'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4 text-orange-400" />
                          {match.date ? formatDate(match.date) : 'Tarih yok'}
                        </div>
                      </div>
                      <Link href={`/teams/${opponent.id}`} className="text-orange-400 hover:underline font-medium">Takım Profili</Link>
                      <button
                        onClick={() => handleCancelMatch(match.id)}
                        className="ml-4 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        İptal Et
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
