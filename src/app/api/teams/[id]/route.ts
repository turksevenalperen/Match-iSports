import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const team = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            createdMatches: true,
            matchHistory1: true,
            matchHistory2: true
          }
        },
        createdMatches: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
            status: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Takım bulunamadı" },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password, email, ...teamProfile } = team

    return NextResponse.json(teamProfile)

  } catch (error) {
    console.error("Get team profile error:", error)
    return NextResponse.json(
      { error: "Bir hata oluştu" },
      { status: 500 }
    )
  }
}
