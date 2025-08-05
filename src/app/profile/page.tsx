"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ProfileImageUpload from "@/components/ui/profile-image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  User,
  MapPin,
  Trophy,
  Star,
  Save,
  ArrowLeft,
  Crown,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"

const cities = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"
]

const sports = [
  "FUTBOL", "BASKETBOL", "VOLEYBOL", "TENIS"
]

interface ProfileForm {
  teamName: string
  city: string
  sport: string
  logo: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { toast } = useToastContext()
  const [form, setForm] = useState<ProfileForm>({
    teamName: "",
    city: "",
    sport: "",
    logo: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user) {
      console.log('Session user:', session.user) // Debug log
      setForm({
        teamName: session.user.teamName,
        city: session.user.city,
        sport: session.user.sport,
        logo: session.user.logo || ""
      })
    }
  }, [status, session, router])

  const getSportIcon = (sport: string) => {
    switch (sport?.toUpperCase()) {
      case "FUTBOL": return "⚽"
      case "BASKETBOL": return "🏀"
      case "VOLEYBOL": return "🏐"
      case "TENIS": return "🎾"
      default: return "🏆"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        toast.success("Profil Güncellendi - Bilgileriniz başarıyla kaydedildi.")
        
        await update({
          teamName: form.teamName,
          city: form.city,
          sport: form.sport,
          logo: form.logo
        })

        router.push("/dashboard")
      } else {
        const data = await response.json()
        toast.error("Hata: " + (data.error || "Profil güncellenirken bir hata oluştu."))
      }
    } catch (error) {
      toast.error("Hata - Profil güncellenirken bir hata oluştu.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  }

  if (!session?.user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" className="border-orange-500/40 text-orange-300 hover:bg-orange-500/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-orange-500/30">
                <AvatarImage 
                  src={session.user.logo || ''} 
                  alt={`${session.user.teamName} logo`}
                  className="object-cover w-full h-full rounded-full"
                />
                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold">
                  {getSportIcon(session.user.sport)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                    {session.user.teamName}
                  </h1>
                  {session.user.isPro && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <p className="text-gray-400 text-sm">Profil Düzenle</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Image & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Image Upload */}
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl border-2 border-orange-500/20 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  Profil Fotoğrafı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileImageUpload
                  currentImage={form.logo}
                  onImageChange={(imageUrl) => setForm(prev => ({ ...prev, logo: imageUrl }))}
                  teamName={form.teamName || "Takım"}
                />
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl border-2 border-orange-500/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  Takım Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="h-5 w-5 text-orange-400" />
                  <span>{session.user.city}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Trophy className="h-5 w-5 text-orange-400" />
                  <span>{session.user.sport}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Rating</span>
                  <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/40 font-semibold">
                    <Star className="h-4 w-4 mr-1" />
                    {session.user.rating}/100
                  </Badge>
                </div>
                {session.user.isPro && (
                  <div className="flex items-center space-x-3 text-blue-400">
                    <Crown className="h-5 w-5" />
                    <span className="font-semibold">Pro Member</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl border-2 border-orange-500/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
                  Profil Bilgilerini Düzenle
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Takım bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Team Name */}
                  <div className="space-y-2">
                    <Label htmlFor="teamName" className="text-orange-300 font-medium">
                      Takım Adı
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors" />
                      <Input
                        id="teamName"
                        value={form.teamName}
                        onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                        className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 placeholder-gray-400 h-12"
                        placeholder="Takım adınızı girin"
                        required
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label className="text-orange-300 font-medium">Şehir</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 z-10" />
                      <Select value={form.city} onValueChange={(value) => setForm({ ...form, city: value })}>
                        <SelectTrigger className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 h-12">
                          <SelectValue placeholder="Şehir seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-orange-500/20">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city} className="text-orange-100 focus:bg-orange-500/20">
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sport */}
                  <div className="space-y-2">
                    <Label className="text-orange-300 font-medium">Spor Dalı</Label>
                    <div className="relative group">
                      <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 z-10" />
                      <Select value={form.sport} onValueChange={(value) => setForm({ ...form, sport: value })}>
                        <SelectTrigger className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 h-12">
                          <SelectValue placeholder="Spor dalı seçin" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-orange-500/20">
                          {sports.map((sport) => (
                            <SelectItem key={sport} value={sport} className="text-orange-100 focus:bg-orange-500/20">
                              {sport}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Link href="/dashboard">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                      >
                        İptal
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Kaydediliyor...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>Profili Kaydet</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
