import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { matchId } = await params // await eklendi

    // Check if match exists
    const match = await prisma.match.findFirst({
      where: {
        id: matchId,
        status: 'ACTIVE'
      },
      include: {
        creator: {
          select: {
            id: true,
            teamName: true
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: "Maç bulunamadı" },
        { status: 404 }
      )
    }

    // Check if user is trying to request their own match
    if (match.creatorId === session.user.id) {
      return NextResponse.json(
        { error: "Kendi ilanınıza istek gönderemezsiniz" },
        { status: 400 }
      )
    }

    // Check if user already sent a request - DUPLICATE CHECK
    const existingRequest = await prisma.matchRequest.findFirst({
      where: {
        matchId,
        requesterId: session.user.id
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Bu maça zaten istek gönderdiniz" },
        { status: 400 }
      )
    }

    // Create match request
    await prisma.matchRequest.create({
      data: {
        matchId,
        requesterId: session.user.id,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: "İstek başarıyla gönderildi"
    })

  } catch (error) {
    console.error("Send match request error:", error)
    return NextResponse.json(
      { error: "İstek gönderilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}