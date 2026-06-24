import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  try {
    await connectDB()

    const leaders = await User.find()
      .sort({ points: -1 })
      .limit(10)
      .select('name avatar points level badges stats')

    return NextResponse.json({ users: leaders })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
