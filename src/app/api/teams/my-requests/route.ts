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

    // Get all pending requests sent by this user with receiver details
    const sentRequests = await prisma.teamRequest.findMany({
      where: {
        senderId: session.user.id,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            teamName: true,
            city: true,
            sport: true,
            rating: true,
            logo: true,
            isPro: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sentRequests)

  } catch (error) {
    console.error("Get my requests error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json(
        { error: "İstek ID'si gerekli" },
        { status: 400 }
      )
    }

    // Delete the request (only if user is the sender)
    const deletedRequest = await prisma.teamRequest.delete({
      where: {
        id: requestId,
        senderId: session.user.id,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            teamName: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `${deletedRequest.receiver.teamName} takımına gönderilen istek iptal edildi`
    })

  } catch (error) {
    console.error("Delete request error:", error)
    return NextResponse.json(
      { error: "İstek iptal edilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
