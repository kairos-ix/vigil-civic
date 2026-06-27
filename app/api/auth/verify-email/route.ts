import { NextRequest, NextResponse } from 'next/server'

import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import {
  generateToken,
  setAuthCookie,
  toSafeUser,
} from '@/lib/auth'
import { AUTH } from '@/lib/constants'
import { connectDB } from '@/lib/mongodb'
import { hashEmailVerificationCode } from '@/lib/emailVerification'
import {
  getClientIp,
  incrementRateLimit,
  isRateLimited,
} from '@/lib/rateLimit'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()
    const ip = getClientIp(req)
    const rateKey = `verify-email:${ip}:${normalizedEmail}`

    if (await isRateLimited(rateKey, AUTH.VERIFY_EMAIL_MAX_ATTEMPTS)) {
      const retryMinutes = Math.round(AUTH.VERIFY_EMAIL_WINDOW_MS / 60000)
      return NextResponse.json(
        {
          error: `Too many verification attempts. Try again in ${retryMinutes} minutes.`,
        },
        { status: 429 }
      )
    }

    const codeHash = hashEmailVerificationCode(code.trim())
    const user = await User.findOneAndUpdate(
      {
        email: normalizedEmail,
        emailVerified: false,
        emailVerificationCodeHash: codeHash,
        emailVerificationCodeExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          emailVerified: true,
          lastActive: new Date(),
        },
        $unset: {
          emailVerificationCodeHash: '',
          emailVerificationCodeExpiresAt: '',
        },
      },
      { new: true }
    )

    if (!user) {
      await incrementRateLimit(rateKey, AUTH.VERIFY_EMAIL_WINDOW_MS)
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    const token = generateToken(user._id.toString())
    await setAuthCookie(token)

    return NextResponse.json({ user: toSafeUser(user) })
  } catch (error) {
    console.error('Verify email error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
