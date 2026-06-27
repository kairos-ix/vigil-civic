import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { REAL_USERS_FILTER } from '@/lib/seedFilters'
import { computeBatchUserStats } from '@/lib/computeUserStats'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()

    // Fetch top 50 by db points as candidates, then sort by real computed points
    const candidates = await User.find(REAL_USERS_FILTER)
      .sort({ points: -1 })
      .limit(50)
      .select('name avatar email points level badges stats')

    const userIds = candidates.map((u) => u._id)
    const computedDataMap = await computeBatchUserStats(userIds)

    const usersWithStats = candidates.map((u) => {
      const id = u._id.toString()
      const computed = computedDataMap.get(id)
      
      const obj = u.toObject()
      const isDeveloper = obj.email === 's4hilmaurya@gmail.com'
      delete obj.email

      return {
        ...obj,
        isDeveloper,
        stats: computed?.stats || { reportsSubmitted: 0, issuesVerified: 0, issuesResolved: 0, upvotesGiven: 0 },
        points: computed?.points || 0,
        level: isDeveloper ? 'developer' : (computed?.level || 'newcomer'),
      }
    })

    // Sort by computed points descending, then take top 10
    usersWithStats.sort((a, b) => b.points - a.points)
    const users = usersWithStats.slice(0, 10)

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
