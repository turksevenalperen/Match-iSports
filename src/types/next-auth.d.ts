import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      teamName: string
      city: string
      sport: string
      rating: number
      isPro: boolean
      logo: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    teamName: string
    city: string
    sport: string
    rating: number
    isPro: boolean
    logo: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    teamName: string
    city: string
    sport: string
    rating: number
    isPro: boolean
    logo: string | null
  }
}
