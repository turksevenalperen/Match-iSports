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

    const { targetTeamId, message } = await request.json()

    if (!targetTeamId) {
      return NextResponse.json(
        { error: "Hedef takım ID'si gerekli" },
        { status: 400 }
      )
    }

    // Kendine istek göndermeyi engelle
    if (targetTeamId === session.user.id) {
      return NextResponse.json(
        { error: "Kendi takımınıza istek gönderemezsiniz" },
        { status: 400 }
      )
    }

    // Daha önce istek gönderilip gönderilmediğini kontrol et
    const existingRequest = await prisma.teamRequest.findFirst({
      where: {
        senderId: session.user.id,
        receiverId: targetTeamId,
        status: "PENDING"
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Bu takıma zaten bir istek gönderdiniz" },
        { status: 400 }
      )
    }

    // Hedef takımın var olup olmadığını kontrol et
    const targetTeam = await prisma.user.findUnique({
      where: { id: targetTeamId },
      select: { id: true, teamName: true }
    })

    if (!targetTeam) {
      return NextResponse.json(
        { error: "Hedef takım bulunamadı" },
        { status: 404 }
      )
    }

    // İsteği oluştur
    const teamRequest = await prisma.teamRequest.create({
      data: {
        senderId: session.user.id,
        receiverId: targetTeamId,
        message: message || "Merhaba! Sizinle bir hazırlık maçı yapmak istiyoruz.",
        status: "PENDING"
      },
      include: {
        sender: {
          select: {
            id: true,
            teamName: true,
            city: true,
            sport: true,
            rating: true,
            logo: true
          }
        },
        receiver: {
          select: {
            id: true,
            teamName: true
          }
        }
      }
    })

    // Gönderen için aktivite oluştur
    await prisma.activity.create({
      data: {
        userId: session.user.id,
        type: 'REQUEST_SENT',
        title: 'Maç İsteği Gönderildi',
        description: `${targetTeam.teamName} takımına maç isteği gönderdiniz`,
        metadata: {
          targetTeamName: targetTeam.teamName,
          requestId: teamRequest.id
        }
      }
    })

    // Alıcı için aktivite oluştur (bildirim)
    await prisma.activity.create({
      data: {
        userId: targetTeamId,
        type: 'REQUEST_RECEIVED',
        title: 'Yeni Maç İsteği! 📬',
        description: `${teamRequest.sender.teamName} takımından maç isteği aldınız`,
        metadata: {
          senderTeamName: teamRequest.sender.teamName,
          requestId: teamRequest.id
        }
      }
    })

    return NextResponse.json({
      message: "İstek başarıyla gönderildi",
      request: teamRequest
    })

  } catch (error) {
    console.error("Team request error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
