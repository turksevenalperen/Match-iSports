import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's match history stats
    const matchHistory = await prisma.matchHistory.findMany({
      where: {
        OR: [
          { team1Id: userId },
          { team2Id: userId }
        ]
      },
      include: {
        team1: {
          select: {
            teamName: true,
            id: true
          }
        },
        team2: {
          select: {
            teamName: true,
            id: true
          }
        }
      }
    });

    // Calculate stats
    const totalMatches = matchHistory.length;
    let wins = 0;
    let losses = 0;

    matchHistory.forEach(match => {
      // Determine winner based on scores
      if (match.score1 !== null && match.score2 !== null) {
        if (match.team1Id === userId) {
          // User is team1
          if (match.score1 > match.score2) {
            wins++;
          } else if (match.score1 < match.score2) {
            losses++;
          }
        } else {
          // User is team2
          if (match.score2 > match.score1) {
            wins++;
          } else if (match.score2 < match.score1) {
            losses++;
          }
        }
      }
    });

    // Calculate win rate
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    // Get current rating from user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true }
    });

    // Get recent activities count
    const recentActivities = await prisma.activity.count({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    // Get total team requests sent
    const totalRequestsSent = await prisma.teamRequest.count({
      where: {
        senderId: userId
      }
    });

    // Get total team requests received
    const totalRequestsReceived = await prisma.teamRequest.count({
      where: {
        receiverId: userId
      }
    });

    const stats = {
      totalMatches,
      wins,
      losses,
      winRate,
      currentRating: user?.rating || 1000,
      recentActivities,
      totalRequestsSent,
      totalRequestsReceived
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
