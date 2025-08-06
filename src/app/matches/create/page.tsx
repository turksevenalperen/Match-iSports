"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, MapPin, Trophy, Users, ArrowLeft, Plus } from 'lucide-react'
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
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border-white/20 px-2 sm:px-3">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard'a Dön</span>
                  <span className="sm:hidden">Geri</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Maç İlanı Oluştur</h1>
                <p className="text-orange-100 text-xs sm:text-sm hidden sm:block">Hazırlık maçı için ilan ver</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  İlan Detayları
                </CardTitle>
                <CardDescription className="text-orange-100 text-sm">
                  Maçınızın detaylarını doldurun
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-orange-300 font-medium text-sm">İlan Başlığı</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Örn: Pazar günü hazırlık maçı arıyoruz"
                      value={formData.title}
                      onChange={handleChange}
                      className="bg-gray-800 border border-orange-500/30 text-orange-200 placeholder-gray-500 focus:border-orange-500/50 focus:outline-none text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-orange-300 font-medium text-sm">Tarih</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          min={today}
                          value={formData.date}
                          onChange={handleChange}
                          className="pl-8 sm:pl-10 bg-gray-800 border border-orange-500/30 text-orange-200 focus:border-orange-500/50 focus:outline-none text-sm"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-orange-300 font-medium text-sm">Saat</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="bg-gray-800 border border-orange-500/30 text-orange-200 focus:border-orange-500/50 focus:outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-orange-300 font-medium text-sm">Konum</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                      <Input
                        id="location"
                        name="location"
                        placeholder="Örn: Florya Metin Oktay Tesisleri"
                        value={formData.location}
                        onChange={handleChange}
                        className="pl-8 sm:pl-10 bg-gray-800 border border-orange-500/30 text-orange-200 placeholder-gray-500 focus:border-orange-500/50 focus:outline-none text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sport" className="text-orange-300 font-medium text-sm">Spor Dalı</Label>
                    <div className="relative">
                      <Trophy className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                      <select
                        id="sport"
                        name="sport"
                        value={formData.sport}
                        onChange={handleChange}
                        className="w-full pl-8 sm:pl-10 pr-3 py-2 bg-gray-800 border border-orange-500/30 text-orange-200 rounded-md focus:outline-none focus:border-orange-500/50 text-sm"
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
                    <Label htmlFor="description" className="text-orange-300 font-medium text-sm">Açıklama</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Maç hakkında detaylı bilgi verin..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-800 border border-orange-500/30 text-orange-200 placeholder-gray-500 rounded-md focus:outline-none focus:border-orange-500/50 resize-none text-sm"
                      rows={3}
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
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base"
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
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-base sm:text-lg">İlan Önizlemesi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg border border-orange-500/20">
                  <h3 className="font-semibold text-base sm:text-lg text-orange-300 line-clamp-2">
                    {formData.title || "İlan başlığınız burada görünecek"}
                  </h3>
                  <div className="flex items-center text-xs sm:text-sm text-gray-300 mt-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-400 flex-shrink-0" />
                    <span className="truncate">{session?.user.teamName}</span>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-gray-300 mt-1">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-400 flex-shrink-0" />
                    <span className="truncate">{formData.sport || "Spor dalı"}</span>
                  </div>
                  {formData.date && formData.time && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-300 mt-1">
                      <CalendarDays className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-400 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(`${formData.date}T${formData.time}`).toLocaleDateString('tr-TR', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {formData.location && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-300 mt-1">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-orange-400 flex-shrink-0" />
                      <span className="truncate">{formData.location}</span>
                    </div>
                  )}
                  {formData.description && (
                    <p className="text-xs sm:text-sm text-gray-300 mt-2 sm:mt-3 line-clamp-3">
                      {formData.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-black backdrop-blur-sm border border-orange-500/30 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="text-base sm:text-lg">İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm p-4 sm:p-6">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Açık ve anlaşılır bir başlık yazın</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Konum bilgisini detaylı verin</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">Maç seviyenizi belirtin</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
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
