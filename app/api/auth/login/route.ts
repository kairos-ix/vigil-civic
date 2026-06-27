import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import {
  comparePassword,
  generateToken,
  setAuthCookie,
  toSafeUser,
} from '@/lib/auth'
import { AUTH } from '@/lib/constants'
import {
  getClientIp,
  incrementRateLimit,
  isRateLimited,
} from '@/lib/rateLimit'
import { computeUserStats } from '@/lib/computeUserStats'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()
    const ip = getClientIp(req)
    const rateKey = `login:${ip}:${normalizedEmail}`

    if (await isRateLimited(rateKey, AUTH.LOGIN_MAX_ATTEMPTS)) {
      const retryMinutes = Math.round(AUTH.LOGIN_WINDOW_MS / 60000)
      return NextResponse.json(
        {
          error: `Too many login attempts. Try again in ${retryMinutes} minutes.`,
        },
        { status: 429 }
      )
    }

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      await incrementRateLimit(rateKey, AUTH.LOGIN_WINDOW_MS)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      await incrementRateLimit(rateKey, AUTH.LOGIN_WINDOW_MS)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (user.emailVerified === false) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 403 }
      )
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { lastActive: new Date() } },
      { new: true }
    )

    const token = generateToken(user._id.toString())
    await setAuthCookie(token)

    const finalUser = updatedUser || user
    const safeUser = toSafeUser(finalUser)
    const isDeveloper = safeUser.email === 's4hilmaurya@gmail.com'
    const { stats, points, level } = await computeUserStats(finalUser._id)

    return NextResponse.json({
      user: { ...safeUser, isDeveloper, stats, points, level: isDeveloper ? 'developer' : level },
    })
  } catch (error) {
    console.error('Login error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
