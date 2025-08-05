"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Check,
  X,
  Star,
  MapPin,
  Calendar,
  Trophy,
  MessageCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"

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

export default function IncomingRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToastContext()
  const [incomingRequests, setIncomingRequests] = useState<TeamRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchIncomingRequests()
    }
  }, [status, router])

  const fetchIncomingRequests = async () => {
    try {
      const response = await fetch("/api/teams/incoming-requests")
      if (response.ok) {
        const data = await response.json()
        setIncomingRequests(data)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setIsLoadingRequests(false)
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
          toast.success("İstek Kabul Edildi", "Artık takımla sohbet edebilirsiniz.", 4000)
        } else {
          toast.info("İstek Reddedildi", "İstek başarıyla reddedildi.", 3000)
        }
        setIncomingRequests((prev) => prev.filter((req) => req.id !== requestId))
      } else {
        const errorData = await response.json()
        toast.error("Hata Oluştu", errorData.error || "İstek işlenirken bir hata oluştu.", 5000)
      }
    } catch (error) {
      toast.error("Bağlantı Hatası", "İstek işlenirken bir hata oluştu.", 5000)
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-200">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="border-orange-500/40 text-orange-300 hover:bg-orange-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  Gelen Maç İstekleri
                </h1>
                <p className="text-gray-400">Size gönderilen maç isteklerini yönetin</p>
              </div>
            </div>
            {incomingRequests.length > 0 && (
              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3 py-1">
                {incomingRequests.length} yeni istek
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {isLoadingRequests ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <div className="text-lg text-orange-300">İstekler yükleniyor...</div>
            </div>
          ) : incomingRequests.length === 0 ? (
            <Card className="border border-orange-500/30 shadow-2xl bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="h-24 w-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                  <MessageCircle className="h-12 w-12 text-orange-400/60" />
                </div>
                <h3 className="text-2xl font-medium text-orange-300 mb-3">Henüz maç isteği yok</h3>
                <p className="text-gray-400 mb-6">Başka takımlar size istek gönderdiğinde burada görünecek</p>
                <Link href="/dashboard">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                    Dashboard'a Dön
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {incomingRequests.map((request) => (
                <Card 
                  key={request.id}
                  className="border border-orange-500/30 shadow-2xl bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-6 flex-1">
                        <Avatar className="h-20 w-20 border-2 border-orange-500/30">
                          <AvatarImage
                            src={`/placeholder.svg?height=80&width=80&text=${request.sender.teamName.charAt(0)}`}
                          />
                          <AvatarFallback className="bg-orange-500/20 text-orange-300 font-bold text-2xl border border-orange-500/40">
                            {request.sender.teamName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <h3 className="font-bold text-orange-200 text-2xl">{request.sender.teamName}</h3>
                            <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-base px-3 py-1">
                              <Star className="h-4 w-4 mr-1" />
                              {request.sender.rating}/100
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-8 text-gray-400 mb-6">
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 mr-2 text-orange-400" />
                              <span className="text-lg">{request.sender.city}</span>
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-2 text-orange-400" />
                              <span className="text-lg">{request.sender.sport}</span>
                            </div>
                          </div>
                          <div className="bg-gray-800/50 rounded-2xl p-6 mb-6 border border-orange-500/20">
                            <h4 className="text-orange-300 font-semibold mb-3 text-lg">Mesaj:</h4>
                            <p className="text-orange-100 italic text-lg leading-relaxed">"{request.message}"</p>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-4 ml-8">
                        <Button
                          size="lg"
                          onClick={() => handleRequestAction(request.id, "ACCEPTED")}
                          disabled={loadingActions.has(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white min-w-[160px] h-14 shadow-lg rounded-xl text-lg font-semibold"
                        >
                          <Check className="h-5 w-5 mr-2" />
                          {loadingActions.has(request.id) ? "Kabul ediliyor..." : "Kabul Et"}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleRequestAction(request.id, "REJECTED")}
                          disabled={loadingActions.has(request.id)}
                          className="text-red-400 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 min-w-[160px] h-14 bg-black/30 rounded-xl text-lg font-semibold"
                        >
                          <X className="h-5 w-5 mr-2" />
                          {loadingActions.has(request.id) ? "Reddediliyor..." : "Reddet"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
