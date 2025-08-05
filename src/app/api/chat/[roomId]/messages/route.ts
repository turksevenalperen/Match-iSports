import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { roomId } = await params
    
    // Parse room ID to get both team IDs
    const teamIds = roomId.split('_')
    if (teamIds.length !== 2) {
      return NextResponse.json(
        { error: "Geçersiz chat room ID" },
        { status: 400 }
      )
    }

    // Check if current user is part of this chat
    if (!teamIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Bu chat'e erişim yetkiniz yok" },
        { status: 403 }
      )
    }

    // Get all messages between these two teams
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: teamIds[0],
            receiverId: teamIds[1]
          },
          {
            senderId: teamIds[1],
            receiverId: teamIds[0]
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        isRead: true,
        createdAt: true
      }
    })

    // Mark messages as read if they were sent to current user
    await prisma.chatMessage.updateMany({
      where: {
        receiverId: session.user.id,
        senderId: {
          in: teamIds.filter(id => id !== session.user.id)
        },
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json(messages)

  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    const { roomId } = await params
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Mesaj içeriği boş olamaz" },
        { status: 400 }
      )
    }

    // Parse room ID to get both team IDs
    const teamIds = roomId.split('_')
    if (teamIds.length !== 2) {
      return NextResponse.json(
        { error: "Geçersiz chat room ID" },
        { status: 400 }
      )
    }

    // Check if current user is part of this chat
    if (!teamIds.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Bu chat'e erişim yetkiniz yok" },
        { status: 403 }
      )
    }

    // Determine receiver (the other team)
    const receiverId = teamIds.find(id => id !== session.user.id)
    if (!receiverId) {
      return NextResponse.json(
        { error: "Alıcı bulunamadı" },
        { status: 400 }
      )
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        senderId: session.user.id,
        receiverId: receiverId,
        content: content.trim()
      },
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        isRead: true,
        createdAt: true
      }
    })

    // Emit message to Socket.io clients
    try {
      if ((global as any).io) {
        (global as any).io.to(roomId).emit("new-message", message)
      }
    } catch (socketError) {
      console.error("Socket emission error:", socketError)
    }

    return NextResponse.json(message)

  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
