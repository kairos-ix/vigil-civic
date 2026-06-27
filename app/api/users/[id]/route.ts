import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { computeUserStats } from '@/lib/computeUserStats'
import User from '@/models/User'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const user = await User.findById(id).select('-passwordHash')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isDeveloper = user.email === 's4hilmaurya@gmail.com'
    const userObj = user.toObject()
    delete userObj.email

    const { stats, points, level } = await computeUserStats(id)

    return NextResponse.json({
      user: {
        ...userObj,
        isDeveloper,
        stats,
        points,
        level: isDeveloper ? 'developer' : level,
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
