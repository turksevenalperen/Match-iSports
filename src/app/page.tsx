"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Search, MessageCircle, Trophy, Target, Zap, Shield, Star, MapPin, Calendar } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Eğer kullanıcı giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-orange-200">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <div className="mb-8 relative">
            <div className="h-24 w-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border border-orange-400/30 mx-auto mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-orange-600/20 animate-pulse"></div>
              <Trophy className="h-12 w-12 relative z-10" />
            </div>
            {/* Glow effect */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 h-24 w-24 bg-orange-500/20 rounded-full blur-xl"></div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent drop-shadow-2xl">
            MatchInSports

            </span>
            <br />
   
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Profesyonel spor takımları için hazırlık maçı bulma platformu. 
            <br />
            <span className="text-orange-300 font-semibold">Takımını kaydet, eşleş, oyna!</span> Gerçek rakipler, gerçek deneyim.
          </p>
          
          <div className="flex gap-6 justify-center flex-wrap">
            <Link href="/packages">
              <Button size="lg" className="text-xl px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 font-semibold">
                <Users className="mr-3 h-6 w-6" />
                Takım Oluştur
                <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-xl px-10 py-4 border-2 border-orange-500 text-orange-300 hover:bg-orange-500/10 hover:text-orange-200 hover:border-orange-400 backdrop-blur-sm bg-black/20 transition-all duration-300 font-semibold">
                <Shield className="mr-3 h-6 w-6" />
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {/* İlan Ver */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/80 border-2 border-orange-500/20 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 backdrop-blur-sm transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 text-center pb-4">
              <div className="h-20 w-20 mx-auto mb-6 relative">
                <div className="h-20 w-20 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-2xl flex items-center justify-center border border-orange-500/40 group-hover:border-orange-400/60 transition-all duration-300 group-hover:scale-110">
                  <Users className="h-10 w-10 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <div className="absolute -inset-2 bg-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <CardTitle className="text-2xl text-orange-300 group-hover:text-orange-200 transition-colors duration-300 font-bold">İlan Ver</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-gray-400 text-lg leading-relaxed">
                Hazırlık maçı ilanı oluştur, kaliteli takımların başvurularını bekle ve en uygun rakibi seç
              </CardDescription>
              <div className="flex items-center justify-center mt-4 text-orange-400/60">
                <Target className="h-4 w-4 mr-2" />
                <span className="text-sm">Hızlı Eşleşme</span>
              </div>
            </CardContent>
          </Card>

          {/* Takım Ara */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/80 border-2 border-orange-500/20 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 backdrop-blur-sm transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 text-center pb-4">
              <div className="h-20 w-20 mx-auto mb-6 relative">
                <div className="h-20 w-20 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-2xl flex items-center justify-center border border-orange-500/40 group-hover:border-orange-400/60 transition-all duration-300 group-hover:scale-110">
                  <Search className="h-10 w-10 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <div className="absolute -inset-2 bg-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <CardTitle className="text-2xl text-orange-300 group-hover:text-orange-200 transition-colors duration-300 font-bold">Takım Ara</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-gray-400 text-lg leading-relaxed">
                Gelişmiş filtrelerle şehir, spor dalı ve rating'e göre arama yap, ideal rakibi bul
              </CardDescription>
              <div className="flex items-center justify-center mt-4 text-orange-400/60">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Akıllı Filtreleme</span>
              </div>
            </CardContent>
          </Card>

          {/* Eşleş & Sohbet */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/80 border-2 border-orange-500/20 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 backdrop-blur-sm transform hover:-translate-y-2 md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10 text-center pb-4">
              <div className="h-20 w-20 mx-auto mb-6 relative">
                <div className="h-20 w-20 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-2xl flex items-center justify-center border border-orange-500/40 group-hover:border-orange-400/60 transition-all duration-300 group-hover:scale-110">
                  <MessageCircle className="h-10 w-10 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                </div>
                <div className="absolute -inset-2 bg-orange-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <CardTitle className="text-2xl text-orange-300 group-hover:text-orange-200 transition-colors duration-300 font-bold">Eşleş & Sohbet</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-gray-400 text-lg leading-relaxed">
                Eşleşen takımlarla gerçek zamanlı sohbet et, maç detaylarını planla ve organize ol
              </CardDescription>
              <div className="flex items-center justify-center mt-4 text-orange-400/60">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">Anlık Mesajlaşma</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10 rounded-3xl"></div>
          <div className="absolute top-10 right-10 h-32 w-32 bg-orange-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-10 h-24 w-24 bg-orange-400/15 rounded-full blur-xl"></div>
          
          <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-orange-500/30">
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-2 bg-orange-500/20 px-6 py-3 rounded-full border border-orange-500/40 mb-6">
                  <Star className="h-5 w-5 text-orange-400" />
                  <span className="text-orange-300 font-semibold">Premium Deneyim</span>
                  <Star className="h-5 w-5 text-orange-400" />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
                  Hazır mısın?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                <span className="text-orange-300 font-semibold">Futbol, basketbol, voleybol ve tenis</span> takımları seni bekliyor!
                <br />
                Profesyonel spor deneyimi için hemen katıl.
              </p>
              
              <div className="flex gap-6 justify-center flex-wrap mb-8">
                <Link href="/packages">
                  <Button size="lg" className="text-xl px-12 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 font-bold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <Trophy className="mr-3 h-6 w-6 relative z-10" />
                    <span className="relative z-10">Şimdi Başla</span>
                    <Zap className="ml-3 h-5 w-5 relative z-10" />
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-300 mb-1">500+</div>
                  <div className="text-sm text-gray-400">Aktif Takım</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-300 mb-1">1000+</div>
                  <div className="text-sm text-gray-400">Tamamlanan Maç</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-300 mb-1">50+</div>
                  <div className="text-sm text-gray-400">Şehir</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
