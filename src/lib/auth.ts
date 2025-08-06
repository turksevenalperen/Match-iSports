import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          teamName: user.teamName,
          city: user.city,
          sport: user.sport,
          rating: user.rating,
          isPro: (user as any).isPro,
          logo: (user as any).logo,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.teamName = (user as any).teamName || 'Bilinmeyen Takım'
        token.city = (user as any).city || ''
        token.sport = (user as any).sport || ''
        token.rating = (user as any).rating || 0
        token.isPro = (user as any).isPro || false
        token.logo = (user as any).logo || null
      }
      // Fallbacklar
      token.teamName = token.teamName || 'Bilinmeyen Takım'
      token.city = token.city || ''
      token.sport = token.sport || ''
      token.rating = token.rating || 0
      token.isPro = token.isPro || false
      token.logo = token.logo || null
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.teamName = token.teamName || 'Bilinmeyen Takım'
        session.user.city = token.city || ''
        session.user.sport = token.sport || ''
        session.user.rating = token.rating || 0
        session.user.isPro = token.isPro || false
        session.user.logo = token.logo || null
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
}
