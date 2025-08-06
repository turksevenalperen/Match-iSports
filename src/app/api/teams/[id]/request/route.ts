import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { id: targetTeamId } = await params

    // Check if target team exists
    const targetTeam = await prisma.user.findUnique({
      where: { id: targetTeamId }
    })

    if (!targetTeam) {
      return NextResponse.json(
        { error: "Takım bulunamadı" },
        { status: 404 }
      )
    }

    // Check if requesting own team
    if (session.user.id === targetTeamId) {
      return NextResponse.json(
        { error: "Kendi takımınıza istek gönderemezsiniz" },
        { status: 400 }
      )
    }


    // Check if there's already a pending request
    const existingRequest = await prisma.teamRequest.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: targetTeamId,
        status: "PENDING"
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Bu takıma zaten istek gönderdiniz" },
        { status: 400 }
      )
    }

    // Create the team request
    const teamRequest = await prisma.teamRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: targetTeamId,
        message: `${session.user.teamName} takımı sizinle maç yapmak istiyor!`
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
      }
    })

    // Create activity for sent request
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'REQUEST_SENT',
        title: 'Maç İsteği Gönderildi',
        description: `${targetTeam.teamName} takımına maç isteği gönderdiniz`,
        metadata: {
          teamName: targetTeam.teamName,
          requestId: teamRequest.id
        }
      }
    })
    
    return NextResponse.json(
      { 
        message: `${targetTeam.teamName} takımına maç isteği gönderildi!`,
        request: teamRequest
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Send team request error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { id: targetTeamId } = await params

    // Check if target team exists
    const targetTeam = await prisma.user.findUnique({
      where: { id: targetTeamId }
    })

    if (!targetTeam) {
      return NextResponse.json(
        { error: "Takım bulunamadı" },
        { status: 404 }
      )
    }

    // Find and delete the request
    const deletedRequest = await prisma.teamRequest.deleteMany({
      where: {
        senderId: session.user.id,
        receiverId: targetTeamId,
        status: 'PENDING'
      }
    })

    if (deletedRequest.count === 0) {
      return NextResponse.json(
        { error: "Silinecek istek bulunamadı" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { 
        message: `${targetTeam.teamName} takımına gönderilen istek iptal edildi!`
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Cancel team request error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
