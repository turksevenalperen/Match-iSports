"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Search, 
  MessageCircle, 
  Trophy, 
  Check, 
  Star, 
  Shield, 
  Zap,
  Crown,
  Sparkles,
  Target,
  Award
} from "lucide-react"

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 bg-blue-500/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/3 h-32 w-32 bg-orange-600/5 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="h-20 w-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl border border-orange-400/30 mx-auto mb-6">
              <Crown className="h-10 w-10" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
              PAKET SEÇİMİ
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Takımının ihtiyaçlarına uygun paketi seç ve özelliklerinin tadını çıkar
          </p>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Normal Package */}
          <Card className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 border-2 border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="h-16 w-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-gray-300" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-300 mb-2">Normal Paket</CardTitle>
              <CardDescription className="text-gray-400 text-lg">Temel özelliklerle başla</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-black text-gray-300">ÜCRETSİZ</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Takım profili oluşturma</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Maç ilanları verme</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Takım arama (temel filtreler)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Mesajlaşma</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Rating sistemi</span>
                </div>
                <div className="flex items-center space-x-3 opacity-50">
                  <span className="h-5 w-5 text-gray-500">×</span>
                  <span className="text-gray-500">Öncelikli eşleşme</span>
                </div>
                <div className="flex items-center space-x-3 opacity-50">
                  <span className="h-5 w-5 text-gray-500">×</span>
                  <span className="text-gray-500">Gelişmiş istatistikler</span>
                </div>
              </div>
              
              <Link href="/register?package=normal">
                <Button className="w-full h-12 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold">
                  <Shield className="mr-2 h-5 w-5" />
                  Normal ile Başla
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Package */}
          <Card className="relative bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500/50 hover:border-blue-400/70 transition-all duration-300 backdrop-blur-sm transform hover:scale-[1.02] shadow-2xl shadow-blue-500/10">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 text-sm font-bold">
                <Sparkles className="mr-1 h-4 w-4" />
                POPÜLER
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-8 pt-8">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                <Crown className="h-8 w-8 text-white" />
                <div className="absolute -inset-2 bg-blue-500/20 rounded-2xl blur-lg"></div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Pro Paket
              </CardTitle>
              <CardDescription className="text-gray-300 text-lg">Profesyonel özelliklerle öne çık</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">$100</span>
                <span className="text-gray-400 ml-2">/ay</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200">Tüm Normal özellikler</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200 font-semibold">Mavi tik - Doğrulanmış takım</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200">Öncelikli eşleşme</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200">Gelişmiş arama filtreleri</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200">Detaylı istatistikler ve analitik</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200">Özel profil teması</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-200">Öncelikli destek</span>
                </div>
              </div>
              
              <Link href="/register?package=pro">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Crown className="mr-2 h-5 w-5" />
                  Pro ile Başla
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/" className="text-orange-400 hover:text-orange-300 transition-colors">
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  )
}
