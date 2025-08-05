import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { email, password, teamName, city, sport, bio, logo, isPro } = await request.json()

    // Validation
    if (!email || !password || !teamName || !city || !sport) {
      return NextResponse.json(
        { error: "Tüm zorunlu alanları doldurun" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Check if team name already exists
    const existingTeam = await prisma.user.findFirst({
      where: { teamName }
    })

    if (existingTeam) {
      return NextResponse.json(
        { error: "Bu takım adı zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        teamName,
        city,
        sport,
        bio: bio || null,
        logo: logo || null,
        rating: 50, // Default rating
        isPro: isPro || false // Pro package field
      } as any
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: "Takım başarıyla oluşturuldu",
        user: userWithoutPassword 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
