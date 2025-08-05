import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const otherUserId = searchParams.get('otherUserId')

    if (!otherUserId) {
      return NextResponse.json({ error: 'otherUserId required' }, { status: 400 })
    }

    // İki kullanıcı arasındaki mesajları getir
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: session.user.id
          }
        ]
      },
      include: {
        sender: {
          select: {
            teamName: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      senderName: msg.sender.teamName,
      timestamp: msg.createdAt.toISOString()
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Messages GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, receiverId, senderName } = await req.json()

    if (!content || !receiverId) {
      return NextResponse.json({ error: 'content and receiverId required' }, { status: 400 })
    }

    // Mesajı kaydet
    const message = await prisma.chatMessage.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
        isRead: false
      }
    })

    // Formatted response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      senderName: senderName || session.user.teamName,
      timestamp: message.createdAt.toISOString()
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error('Messages POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { senderId } = await req.json()

    if (!senderId) {
      return NextResponse.json({ error: 'senderId required' }, { status: 400 })
    }

    // Belirli bir kullanıcıdan gelen tüm okunmamış mesajları okunmuş olarak işaretle
    await prisma.chatMessage.updateMany({
      where: {
        senderId: senderId,
        receiverId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Messages PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
