import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const sport = searchParams.get('sport')
    const minRating = searchParams.get('minRating')
    const maxRating = searchParams.get('maxRating')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    console.log('Search filters:', { search, city, sport, minRating, maxRating })

    // Build filter
    const where: any = {
      id: {
        not: session.user.id // Kendi takımını hariç tut
      }
    }

    if (search) {
      where.teamName = {
        contains: search,
        mode: 'insensitive'
      }
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      }
    }
    if (sport) {
      where.sport = sport // Enum field için sadece equals kullanılabilir
    }
    
    if (minRating || maxRating) {
      where.rating = {}
      if (minRating) where.rating.gte = parseInt(minRating)
      if (maxRating) where.rating.lte = parseInt(maxRating)
    }

    // Get teams
    const teams = await prisma.user.findMany({
      where,
      select: {
        id: true,
        teamName: true,
        city: true,
        sport: true,
        rating: true,
        bio: true,
        logo: true,
        isPro: true,
        createdAt: true,
        _count: {
          select: {
            createdMatches: true,
            matchHistory1: true,
            matchHistory2: true
          }
        }
      } as any,
      orderBy: {
        rating: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    return NextResponse.json({
      teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Search teams error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
