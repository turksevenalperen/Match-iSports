"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProfileImageUpload from "@/components/ui/profile-image-upload"
import { Mail, Lock, Users, MapPin, Trophy, Crown, Shield, Star } from "lucide-react"

const SPORTS = [
  { value: "FUTBOL", label: "Futbol" },
  { value: "BASKETBOL", label: "Basketbol" },
  { value: "VOLEYBOL", label: "Voleybol" },
  { value: "TENIS", label: "Tenis" },
]

const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep"
]

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const packageType = searchParams.get('package') || 'normal'
  const isPro = packageType === 'pro'
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    teamName: "",
    city: "",
    sport: "",
    bio: "",
    logo: "",
    isPro: isPro
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // URL'den paket tipini al ve form data'yı güncelle
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isPro: isPro
    }))
  }, [isPro])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/login?message=Kayıt başarılı! Giriş yapabilirsin.")
      } else {
        const data = await response.json()
        setError(data.error || "Bir hata oluştu")
      }
    } catch (error) {
      setError("Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/6 h-72 w-72 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/6 h-56 w-56 bg-orange-400/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/2 h-32 w-32 bg-orange-600/5 rounded-full blur-xl"></div>
      </div>

      <Card className={`w-full max-w-2xl relative backdrop-blur-xl border-2 shadow-2xl ${
        isPro 
          ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/50' 
          : 'bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-orange-500/20'
      }`}>
        <CardHeader className="text-center pb-8">
          {isPro && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-sm font-bold">
                <Star className="mr-1 h-4 w-4" />
                PRO PAKET
              </Badge>
            </div>
          )}
          <div className="mb-6">
            <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto mb-4 ${
              isPro 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 border border-blue-400/30' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600 border border-orange-400/30'
            }`}>
              {isPro ? <Crown className="h-10 w-10" /> : <Users className="h-10 w-10" />}
            </div>
          </div>
          <CardTitle className={`text-4xl font-bold mb-2 ${
            isPro 
              ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent'
          }`}>
            {isPro ? 'Pro Takım Oluştur' : 'Takım Oluştur'}
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            {isPro 
              ? 'Pro özelliklerle takımını kaydet ve öne çık' 
              : 'Takımını kaydet ve eşleşmeye başla'
            }
          </CardDescription>
          {isPro && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-blue-400">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-semibold">Mavi tik ve özel özellikler dahil</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profil Fotoğrafı Upload */}
            <div className="flex justify-center mb-8">
              <ProfileImageUpload
                currentImage={formData.logo}
                onImageChange={(imageUrl) => setFormData(prev => ({ ...prev, logo: imageUrl }))}
                teamName={formData.teamName || "Takım"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="teamName" className="text-orange-300 font-medium">Takım Adı</Label>
                <div className="relative group">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors" />
                  <Input
                    id="teamName"
                    name="teamName"
                    placeholder="Galatasaray U21"
                    value={formData.teamName}
                    onChange={handleChange}
                    className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 placeholder-gray-400 h-12 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-orange-300 font-medium">Şehir</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors z-10" />
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 h-12 bg-gray-800/50 border-2 border-orange-500/30 focus:border-orange-500/60 rounded-md focus:outline-none text-orange-100 backdrop-blur-sm transition-colors"
                    required
                  >
                    <option value="" className="bg-gray-800">Şehir Seç</option>
                    {CITIES.map(city => (
                      <option key={city} value={city} className="bg-gray-800">{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport" className="text-orange-300 font-medium">Spor Dalı</Label>
              <div className="relative group">
                <Trophy className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors z-10" />
                <select
                  id="sport"
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 h-12 bg-gray-800/50 border-2 border-orange-500/30 focus:border-orange-500/60 rounded-md focus:outline-none text-orange-100 backdrop-blur-sm transition-colors"
                  required
                >
                  <option value="" className="bg-gray-800">Spor Dalı Seç</option>
                  {SPORTS.map(sport => (
                    <option key={sport.value} value={sport.value} className="bg-gray-800">{sport.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-300 font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="takım@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 placeholder-gray-400 h-12 backdrop-blur-sm"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-300 font-medium">Şifre</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 placeholder-gray-400 h-12 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-orange-300 font-medium">Takım Hakkında (Opsiyonel)</Label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Takımınız hakkında kısa bilgi..."
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-4 bg-gray-800/50 border-2 border-orange-500/30 focus:border-orange-500/60 rounded-md focus:outline-none text-orange-100 placeholder-gray-400 backdrop-blur-sm transition-colors resize-none"
                rows={4}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Takım oluşturuluyor...
                </div>
              ) : (
                <>
                  <Users className="mr-3 h-6 w-6" />
                  Takım Oluştur
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-orange-500/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">veya</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-gray-400">Zaten hesabın var mı? </span>
              <Link href="/login" className="text-orange-400 hover:text-orange-300 font-semibold hover:underline transition-colors">
                Giriş Yap
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
