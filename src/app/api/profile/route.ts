import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SportType } from "@prisma/client"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { teamName, city, sport, logo } = body

    // Validation
    if (!teamName || !city || !sport) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur" },
        { status: 400 }
      )
    }

    if (teamName.length < 3 || teamName.length > 50) {
      return NextResponse.json(
        { error: "Takım adı 3-50 karakter arasında olmalıdır" },
        { status: 400 }
      )
    }

    // Sport mapping - Hem frontend hem de uppercase formatları destekle
    const sportMapping: { [key: string]: SportType } = {
      "Futbol": "FUTBOL",
      "Basketbol": "BASKETBOL", 
      "Voleybol": "VOLEYBOL",
      "Tenis": "TENIS",
      "FUTBOL": "FUTBOL",
      "BASKETBOL": "BASKETBOL",
      "VOLEYBOL": "VOLEYBOL", 
      "TENIS": "TENIS"
    }

    const prismaSpor = sportMapping[sport] || sport as SportType
    
    // Debug log
    console.log('Sport mapping:', { sport, prismaSpor })

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        teamName,
        city,
        sport: prismaSpor,  // Doğru format
        logo: logo || null  // Logo update
      }
    })

    return NextResponse.json({
      message: "Profil başarıyla güncellendi",
      user: {
        id: updatedUser.id,
        teamName: updatedUser.teamName,
        city: updatedUser.city,
        sport: updatedUser.sport,
        rating: updatedUser.rating
      }
    })

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    )
  }
}