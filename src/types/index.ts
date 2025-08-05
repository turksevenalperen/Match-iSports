// Ana tip tanımlamaları
export interface User {
  id: string
  email: string
  teamName: string
  city: string
  sport: string
  rating: number
  bio?: string
  logo?: string
  createdAt: Date
  updatedAt: Date
}

export interface Match {
  id: string
  creatorId: string
  title: string
  description: string
  date: Date
  location: string
  sport: string
  status: 'ACTIVE' | 'MATCHED' | 'COMPLETED' | 'CANCELLED'
  creator?: User
  createdAt: Date
  updatedAt: Date
}

export interface MatchRequest {
  id: string
  matchId: string
  requesterId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  match?: Match
  requester?: User
  createdAt: Date
}

export interface Message {
  id: string
  matchId: string
  senderId: string
  content: string
  sender?: User
  createdAt: Date
}

export interface MatchHistory {
  id: string
  team1Id: string
  team2Id: string
  score1?: number
  score2?: number
  location: string
  date: Date
  rating1?: number
  rating2?: number
  team1?: User
  team2?: User
}

export type SportType = 'FUTBOL' | 'BASKETBOL' | 'VOLEYBOL' | 'TENIS'
