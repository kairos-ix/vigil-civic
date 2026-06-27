import mongoose from 'mongoose'
import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { getServerUser, toSafeUser, clearAuthCookie } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { POINTS } from '@/lib/constants'
import { calculateLevel } from '@/lib/scoring'
import { computeUserStats } from '@/lib/computeUserStats'
import User from '@/models/User'
import Issue from '@/models/Issue'

export async function GET() {
  try {
    const user = await getServerUser()

    if (!user) {
      await clearAuthCookie()
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const safeUser = toSafeUser(user)
    const isDeveloper = safeUser.email === 's4hilmaurya@gmail.com'

    const { stats, points, level } = await computeUserStats(user._id)

    return NextResponse.json({
      user: {
        ...safeUser,
        isDeveloper,
        stats,
        points,
        level: isDeveloper ? 'developer' : level,
      },
    })
  } catch (error) {
    console.error('Auth me error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getServerUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { name, avatar, city, ward } = body

    // Build update object with only allowed fields
    const update: Record<string, unknown> = {}

    if (typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 100) {
      update.name = name.trim()
    }

    if (typeof avatar === 'string') {
      // Allow empty string to remove avatar, or a valid URL
      if (avatar === '' || avatar.startsWith('https://')) {
        update.avatar = avatar || undefined
      }
    }

    if (typeof city === 'string') {
      update.city = city.trim() || undefined
    }

    if (typeof ward === 'string') {
      update.ward = ward.trim() || undefined
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: update },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const safeUser = toSafeUser(updatedUser)
    const isDeveloper = safeUser.email === 's4hilmaurya@gmail.com'
    const { stats, points, level } = await computeUserStats(updatedUser._id)
    
    return NextResponse.json({
      user: { ...safeUser, isDeveloper, stats, points, level: isDeveloper ? 'developer' : level },
    })
  } catch (error) {
    console.error('Profile update error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
