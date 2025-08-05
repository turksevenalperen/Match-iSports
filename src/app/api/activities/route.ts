import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    // Son 10 aktiviteyi getir
    const activities = await prisma.activity.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json(activities)

  } catch (error) {
    console.error("Get activities error:", error)
    return NextResponse.json(
      { error: "Aktiviteler getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

// Aktivite oluşturma helper fonksiyonu
async function createActivity(
  userId: string,
  type: string,
  title: string,
  description: string,
  metadata?: any
) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        type: type as any,
        title,
        description,
        metadata
      }
    })
  } catch (error) {
    console.error("Create activity error:", error)
  }
}