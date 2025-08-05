import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { title, description, date, location, sport } = await request.json()

    // Validation
    if (!title || !description || !date || !location || !sport) {
      return NextResponse.json(
        { error: "Tüm alanları doldurun" },
        { status: 400 }
      )
    }

    // Check if date is in the future
    const matchDate = new Date(date)
    if (matchDate <= new Date()) {
      return NextResponse.json(
        { error: "Maç tarihi gelecekte olmalı" },
        { status: 400 }
      )
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        creatorId: session.user.id,
        title,
        description,
        date: matchDate,
        location,
        sport,
        status: 'ACTIVE'
      },
      include: {
        creator: {
          select: {
            id: true,
            teamName: true,
            city: true,
            sport: true,
            rating: true
          }
        }
      }
    })

    // Create activity
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: "MATCH_CREATED",
        title: "Yeni maç ilanı verdin",
        description: `"${title}" başlıklı maç ilanınız yayınlandı.`
      }
    })

    return NextResponse.json(
      { 
        message: "Maç ilanı başarıyla oluşturuldu",
        match 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Create match error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const sport = searchParams.get('sport')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build filter
    const where: any = {
      status: 'ACTIVE',
      date: {
        gte: new Date() // Sadece gelecekteki maçlar
      }
    }

    if (city) where.creator = { city }
    if (sport) where.sport = sport

    // Get matches
    const matches = await prisma.match.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            teamName: true,
            city: true,
            sport: true,
            rating: true
          }
        },
        _count: {
          select: {
            requests: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.match.count({ where })

    return NextResponse.json({
      matches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}