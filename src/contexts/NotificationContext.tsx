'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface MatchRequest {
  id: string
  senderId: string
  receiverId: string
  matchId: string
  message?: string
  status: string
  createdAt: string
  match: {
    title: string
    date: string
    location: string
  }
  sender: {
    teamName: string
  }
}

interface TeamRequest {
  id: string
  senderId: string
  receiverId: string
  message?: string
  status: string
  createdAt: string
  sender: {
    teamName: string
    city: string
    sport: string
  }
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
}

interface NotificationData {
  matchRequests: MatchRequest[]
  teamRequests: TeamRequest[]
  sentTeamRequests: TeamRequest[]
  activities: Activity[]
  unreadChatCount: number
}

interface NotificationContextType {
  data: NotificationData
  refreshNotifications: () => Promise<void>
  isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [data, setData] = useState<NotificationData>({
    matchRequests: [],
    teamRequests: [],
    sentTeamRequests: [],
    activities: [],
    unreadChatCount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const refreshNotifications = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      // Paralel olarak tüm notification verilerini çek
      const [
        matchRequestsRes,
        teamRequestsRes,
        sentTeamRequestsRes,
        activitiesRes,
        usersRes
      ] = await Promise.all([
        fetch('/api/matches/requests').catch(() => ({ ok: false })),
        fetch('/api/teams/incoming-requests').catch(() => ({ ok: false })),
        fetch('/api/teams/my-requests').catch(() => ({ ok: false })),
        fetch('/api/activities').catch(() => ({ ok: false })),
        fetch('/api/users').catch(() => ({ ok: false }))
      ])

      const newData: NotificationData = {
        matchRequests: [],
        teamRequests: [],
        sentTeamRequests: [],
        activities: [],
        unreadChatCount: 0
      }

      // Match requests
      if (matchRequestsRes.ok && 'json' in matchRequestsRes) {
        const matchRequests = await matchRequestsRes.json()
        newData.matchRequests = matchRequests.filter((req: MatchRequest) => req.status === 'PENDING')
      }

      // Team requests (incoming)
      if (teamRequestsRes.ok && 'json' in teamRequestsRes) {
        const teamRequests = await teamRequestsRes.json()
        newData.teamRequests = teamRequests.filter((req: TeamRequest) => req.status === 'PENDING')
      }

      // Team requests (sent)
      if (sentTeamRequestsRes.ok && 'json' in sentTeamRequestsRes) {
        const sentRequests = await sentTeamRequestsRes.json()
        newData.sentTeamRequests = sentRequests
      }

      // Activities
      if (activitiesRes.ok && 'json' in activitiesRes) {
        const activities = await activitiesRes.json()
        newData.activities = activities.slice(0, 10) // Son 10 aktivite
      }

      // Unread chat count
      if (usersRes.ok && 'json' in usersRes) {
        const users = await usersRes.json()
        const totalUnread = users.reduce((sum: number, user: any) => sum + (user.unreadCount || 0), 0)
        newData.unreadChatCount = totalUnread
      }

      setData(newData)
    } catch (error) {
      console.error('Notification refresh error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // İlk yükleme
  useEffect(() => {
    if (session?.user?.id) {
      refreshNotifications()
    }
  }, [session?.user?.id, refreshNotifications])

  // Production'da polling sistemi
  useEffect(() => {
    if (!session?.user?.id) return

    let interval: NodeJS.Timeout | null = null

    if (process.env.NODE_ENV === 'production') {
      interval = setInterval(() => {
        refreshNotifications()
      }, 3000) // 3 saniyede bir güncelle
    } else {
      // Development'da daha sık güncelle
      interval = setInterval(() => {
        refreshNotifications()
      }, 2000) // 2 saniyede bir güncelle
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [session?.user?.id, refreshNotifications])

  const value: NotificationContextType = {
    data,
    refreshNotifications,
    isLoading
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
