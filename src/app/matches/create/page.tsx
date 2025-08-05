"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin, Trophy, Users, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useToastContext } from "@/components/toast-provider"

const SPORTS = [
  { value: "FUTBOL", label: "Futbol" },
  { value: "BASKETBOL", label: "Basketbol" },
  { value: "VOLEYBOL", label: "Voleybol" },
  { value: "TENIS", label: "Tenis" },
]

const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Adana", "Konya", "Gaziantep"
]

export default function CreateMatchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToastContext()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    sport: session?.user.sport || "",
  })

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
      // Tarih ve saati birleştir
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: dateTime.toISOString(),
        }),
      })

      if (response.ok) {
        toast.success("Maç ilanı başarıyla oluşturuldu!")
        router.push("/dashboard")
      } else {
        const data = await response.json()
        toast.error(data.error || "Bir hata oluştu")
      }
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  // Bugünün tarihi (minimum tarih için)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-lg shadow-2xl border-b border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border-white/20">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard'a Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Maç İlanı Oluştur</h1>
                <p className="text-orange-100">Hazırlık maçı için ilan ver</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  İlan Detayları
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Maçınızın detaylarını doldurun
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-orange-300 font-medium">İlan Başlığı</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Örn: Pazar günü hazırlık maçı arıyoruz"
                      value={formData.title}
                      onChange={handleChange}
                      className="bg-gray-800 border border-orange-500/30 text-orange-200 placeholder-gray-500 focus:border-orange-500/50 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-orange-300 font-medium">Tarih</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          min={today}
                          value={formData.date}
                          onChange={handleChange}
                          className="pl-10 bg-gray-800 border border-orange-500/30 text-orange-200 focus:border-orange-500/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-orange-300 font-medium">Saat</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="bg-gray-800 border border-orange-500/30 text-orange-200 focus:border-orange-500/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-orange-300 font-medium">Konum</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="Örn: Florya Metin Oktay Tesisleri"
                        value={formData.location}
                        onChange={handleChange}
                        className="pl-10 bg-gray-800 border border-orange-500/30 text-orange-200 placeholder-gray-500 focus:border-orange-500/50 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sport" className="text-orange-300 font-medium">Spor Dalı</Label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                      <select
                        id="sport"
                        name="sport"
                        value={formData.sport}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-orange-500/30 text-orange-200 rounded-md focus:outline-none focus:border-orange-500/50"
                        required
                      >
                        <option value="">Spor Dalı Seç</option>
                        {SPORTS.map(sport => (
                          <option key={sport.value} value={sport.value}>{sport.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-orange-300 font-medium">Açıklama</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Maç hakkında detaylı bilgi verin..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800 border border-orange-500/30 text-orange-200 placeholder-gray-500 rounded-md focus:outline-none focus:border-orange-500/50 resize-none"
                      rows={4}
                      required
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? "İlan oluşturuluyor..." : "İlanı Yayınla"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview / Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-lg">İlan Önizlemesi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-orange-500/20">
                  <h3 className="font-semibold text-lg text-orange-300">
                    {formData.title || "İlan başlığınız burada görünecek"}
                  </h3>
                  <div className="flex items-center text-sm text-gray-300 mt-2">
                    <Users className="h-4 w-4 mr-1 text-orange-400" />
                    {session?.user.teamName}
                  </div>
                  <div className="flex items-center text-sm text-gray-300 mt-1">
                    <Trophy className="h-4 w-4 mr-1 text-orange-400" />
                    {formData.sport || "Spor dalı"}
                  </div>
                  {formData.date && formData.time && (
                    <div className="flex items-center text-sm text-gray-300 mt-1">
                      <CalendarDays className="h-4 w-4 mr-1 text-orange-400" />
                      {new Date(`${formData.date}T${formData.time}`).toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {formData.location && (
                    <div className="flex items-center text-sm text-gray-300 mt-1">
                      <MapPin className="h-4 w-4 mr-1 text-orange-400" />
                      {formData.location}
                    </div>
                  )}
                  {formData.description && (
                    <p className="text-sm text-gray-300 mt-3">
                      {formData.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="text-lg">İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm p-6">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">Açık ve anlaşılır bir başlık yazın</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">Konum bilgisini detaylı verin</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">Maç seviyenizi belirtin</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <p className="text-gray-300">İletişim bilgilerinizi ekleyin</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
