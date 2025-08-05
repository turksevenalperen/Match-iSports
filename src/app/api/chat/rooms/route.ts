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

    // Get all accepted team requests where this user is involved
    const acceptedRequests = await prisma.teamRequest.findMany({
      where: {
        AND: [
          {
            OR: [
              { senderId: session.user.id },
              { receiverId: session.user.id }
            ]
          },
          { status: 'ACCEPTED' }
        ]
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
        },
        receiver: {
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

    // Create chat rooms from accepted requests
    type Team = {
      id: string;
      teamName: string;
      city: string;
      sport: string;
      rating: number;
    };

    type AcceptedRequest = {
      senderId: string;
      receiverId: string;
      status: string;
      sender: Team;
      receiver: Team;
    };

    const chatRooms = await Promise.all(
      acceptedRequests.map(async (request: AcceptedRequest) => {
        // Determine which team is the "other" team
        const isCurrentUserSender = request.senderId === session.user.id
        const otherTeam = isCurrentUserSender ? request.receiver : request.sender
        
        // Create a unique chat room ID based on both team IDs (sorted for consistency)
        const teamIds = [request.senderId, request.receiverId].sort()
        const chatRoomId = `${teamIds[0]}_${teamIds[1]}`

        // Get last message for this chat room
        const lastMessage = await prisma.chatMessage.findFirst({
          where: {
            OR: [
              {
                senderId: request.senderId,
                receiverId: request.receiverId
              },
              {
                senderId: request.receiverId,
                receiverId: request.senderId
              }
            ]
          },
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        })

        // Count unread messages (messages sent by other team)
        const unreadCount = await prisma.chatMessage.count({
          where: {
            senderId: otherTeam.id,
            receiverId: session.user.id,
            isRead: false
          }
        })

        return {
          id: chatRoomId,
          otherTeam,
          lastMessage,
          unreadCount
        }
      })
    )

    // Sort by last message time (most recent first)
    chatRooms.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    })

    return NextResponse.json(chatRooms)

  } catch (error) {
    console.error("Get chat rooms error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
