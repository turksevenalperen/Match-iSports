"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Lock, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email veya şifre hatalı")
      } else {
        router.push("/dashboard")
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
        <div className="absolute top-1/4 left-1/4 h-64 w-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 bg-orange-400/5 rounded-full blur-2xl"></div>
      </div>

      <Card className="w-full max-w-md relative bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl border-2 border-orange-500/20 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mb-6">
            <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg border border-orange-400/30 mx-auto mb-4">
              <LogIn className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
            Giriş Yap
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Takımınla eşleşmeye başla
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-orange-300 font-medium">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-400/60 group-focus-within:text-orange-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="takım@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-gray-800/50 border-orange-500/30 focus:border-orange-500/60 text-orange-100 placeholder-gray-400 h-12 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Giriş Yap
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-orange-500/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">veya</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="text-gray-400">Hesabın yok mu? </span>
            <Link href="/register" className="text-orange-400 hover:text-orange-300 font-semibold hover:underline transition-colors">
              Takım Oluştur
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
