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

    // Tüm kullanıcıları getir (kendisi hariç)
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: session.user.id
        }
      },
      select: {
        id: true,
        teamName: true,
        city: true,
        sport: true,
      },
      orderBy: {
        teamName: 'asc'
      }
    })

    // Her kullanıcı için okunmamış mesaj sayısını hesapla
    const usersWithUnreadCount = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            senderId: user.id,
            receiverId: session.user.id,
            isRead: false
          }
        })

        return {
          ...user,
          unreadCount
        }
      })
    )

    return NextResponse.json(usersWithUnreadCount)
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
