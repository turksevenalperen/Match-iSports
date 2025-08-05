"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Star,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"

interface SentRequest {
  id: string
  message: string | null
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  createdAt: string
  receiver: {
    id: string
    teamName: string
    city: string
    sport: string
    rating: number
  }
}

export default function RequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToastContext()
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingRequests, setDeletingRequests] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchSentRequests()
    }
  }, [status, router])

  const fetchSentRequests = async () => {
    try {
      const response = await fetch("/api/matches/requests")
      if (response.ok) {
        const data = await response.json()
        setSentRequests(data)
      }
    } catch (error) {
      console.error("Error fetching sent requests:", error)
      toast.error("Hata", "İstekler yüklenirken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    setDeletingRequests((prev) => new Set([...prev, requestId]))
    try {
      const response = await fetch("/api/matches/requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      })

      if (response.ok) {
        toast.success("İstek İptal Edildi", "İsteğiniz başarıyla iptal edildi.")
        setSentRequests((prev) => prev.filter((req) => req.id !== requestId))
      } else {
        const errorData = await response.json()
        toast.error("Hata", errorData.error || "İstek iptal edilirken bir hata oluştu.")
      }
    } catch (error) {
      toast.error("Bağlantı Hatası", "İstek iptal edilirken bir hata oluştu.")
    } finally {
      setDeletingRequests((prev) => {
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
    switch (sport.toUpperCase()) {
      case "FUTBOL":
        return "⚽"
      case "BASKETBOL":
        return "🏀"
      case "VOLEYBOL":
        return "🏐"
      case "TENIS":
        return "🎾"
      default:
        return "🏆"
    }
  }

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    if (rating >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    if (rating >= 40) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Bekliyor
          </Badge>
        )
      case "ACCEPTED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Kabul Edildi
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        )
      default:
        return null
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700 dark:text-gray-200">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const pendingRequests = sentRequests.filter((req) => req.status === "PENDING")
  const respondedRequests = sentRequests.filter((req) => req.status !== "PENDING")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gönderilen İstekler</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Takımlara gönderdiğiniz maç istekleri</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                {sentRequests.length} toplam istek
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-sm text-gray-500 dark:text-gray-400">İstekler yükleniyor...</div>
          </div>
        ) : sentRequests.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Henüz istek göndermediniz</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Takım arama sayfasından diğer takımlara maç isteği gönderebilirsiniz
              </p>
              <Link href="/teams/search">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Takım Ara
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Bekleyen İstekler */}
            {pendingRequests.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                          Bekleyen İstekler
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Henüz yanıtlanmayan istekleriniz
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {pendingRequests.length} bekliyor
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800/50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={`/placeholder.svg?height=48&width=48&text=${request.receiver.teamName.charAt(0)}`}
                              />
                              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                                {request.receiver.teamName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                  {request.receiver.teamName}
                                </h4>
                                <Badge className={getRatingBadgeColor(request.receiver.rating)}>
                                  <Star className="h-3 w-3 mr-1" />
                                  {request.receiver.rating}
                                </Badge>
                                {getStatusBadge(request.status)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {request.receiver.city}
                                </div>
                                <div className="flex items-center">
                                  <Trophy className="h-4 w-4 mr-1" />
                                  {getSportIcon(request.receiver.sport)} {request.receiver.sport}
                                </div>
                              </div>
                              {request.message && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                    "{request.message}"
                                  </p>
                                </div>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRequest(request.id)}
                            disabled={deletingRequests.has(request.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 min-w-[100px]"
                          >
                            {deletingRequests.has(request.id) ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                                <span>İptal...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Trash2 className="h-3 w-3" />
                                <span>İptal Et</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Yanıtlanan İstekler */}
            {respondedRequests.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        Yanıtlanan İstekler
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Kabul edilen veya reddedilen istekleriniz
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {respondedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800/50"
                      >
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`/placeholder.svg?height=48&width=48&text=${request.receiver.teamName.charAt(0)}`}
                            />
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold">
                              {request.receiver.teamName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                {request.receiver.teamName}
                              </h4>
                              <Badge className={getRatingBadgeColor(request.receiver.rating)}>
                                <Star className="h-3 w-3 mr-1" />
                                {request.receiver.rating}
                              </Badge>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {request.receiver.city}
                              </div>
                              <div className="flex items-center">
                                <Trophy className="h-4 w-4 mr-1" />
                                {getSportIcon(request.receiver.sport)} {request.receiver.sport}
                              </div>
                            </div>
                            {request.message && (
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                                  "{request.message}"
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}