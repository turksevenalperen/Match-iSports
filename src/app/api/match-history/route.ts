export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Geçersiz istek: id eksik' }, { status: 400 })
    }
    // Sadece kendi takımı dahilse silebilsin
    const match = await prisma.matchHistory.findUnique({ where: { id } })
    if (!match || (match.team1Id !== session.user.id && match.team2Id !== session.user.id)) {
      return NextResponse.json({ error: 'Bu maçı silme yetkiniz yok' }, { status: 403 })
    }
    await prisma.matchHistory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Match silme hatası:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
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

    // Kullanıcının dahil olduğu tüm eşleşmeleri getir (her iki takım, tarih, lokasyon dahil)
    const matches = await prisma.matchHistory.findMany({
      where: {
        OR: [
          { team1Id: session.user.id },
          { team2Id: session.user.id }
        ]
      },
      include: {
        team1: {
          select: { id: true, teamName: true, city: true, sport: true, logo: true }
        },
        team2: {
          select: { id: true, teamName: true, city: true, sport: true, logo: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Tüm eşleşmeleri olduğu gibi dön
        return NextResponse.json(matches.map(match => ({
            ...match,
            team1Name: match.team1.teamName,
            team2Name: match.team2.teamName
        })))
  } catch (error) {
    console.error("Get match history error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
