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

    // Get all pending requests received by this user
    const receivedRequests = await prisma.teamRequest.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            teamName: true,
            city: true,
            sport: true,
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(receivedRequests)

  } catch (error) {
    console.error("Get incoming requests error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { requestId, action } = await request.json()

    if (!requestId || !action || !['ACCEPTED', 'REJECTED'].includes(action)) {
      return NextResponse.json(
        { error: "Geçersiz parametreler" },
        { status: 400 }
      )
    }

    // Update the request status
    const updatedRequest = await prisma.teamRequest.update({
      where: {
        id: requestId,
        receiverId: session.user.id // Make sure user can only update their own requests
      },
      data: {
        status: action
      },
      include: {
        sender: {
          select: {
            id: true,
            teamName: true
          }
        },
        receiver: {
          select: {
            teamName: true
          }
        }
      }
    })

    // Create activity for both teams
    if (action === 'ACCEPTED') {
      // Activity for receiver (who accepted)
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          type: 'REQUEST_ACCEPTED',
          title: 'Maç İsteği Kabul Edildi',
          description: `${updatedRequest.sender.teamName} takımının maç isteğini kabul ettiniz`,
          metadata: {
            teamName: updatedRequest.sender.teamName,
            requestId: requestId
          }
        }
      })

      // Activity for sender (who sent the request)
      await prisma.activity.create({
        data: {
          userId: updatedRequest.sender.id,
          type: 'REQUEST_ACCEPTED',
          title: 'Maç İsteğiniz Kabul Edildi! 🎉',
          description: `${updatedRequest.receiver.teamName} takımı maç isteğinizi kabul etti`,
          metadata: {
            teamName: updatedRequest.receiver.teamName,
            requestId: requestId
          }
        }
      })
    } else {
      // Activity for sender (request rejected)
      await prisma.activity.create({
        data: {
          userId: updatedRequest.sender.id,
          type: 'REQUEST_REJECTED',
          title: 'Maç İsteği Reddedildi',
          description: `${updatedRequest.receiver.teamName} takımı maç isteğinizi reddetti`,
          metadata: {
            teamName: updatedRequest.receiver.teamName,
            requestId: requestId
          }
        }
      })
    }

    const message = action === 'ACCEPTED' 
      ? `${updatedRequest.sender.teamName} takımının isteği kabul edildi!`
      : `${updatedRequest.sender.teamName} takımının isteği reddedildi!`

    return NextResponse.json({
      message,
      request: updatedRequest
    })

  } catch (error) {
    console.error("Update request error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
