import { NextRequest, NextResponse } from 'next/server'

import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { AUTH, PASSWORD_RESET } from '@/lib/constants'
import {
  EmailDeliveryError,
  isEmailConfigured,
  sendPasswordResetCodeEmail,
} from '@/lib/email'
import {
  generatePasswordResetCode,
  hashPasswordResetCode,
  passwordResetCodeExpiresAt,
} from '@/lib/passwordReset'
import { incrementRateLimit, isRateLimited, getClientIp } from '@/lib/rateLimit'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

const normalizedEmail = email.toLowerCase().trim()
  const ip = getClientIp(req)
  const rateKey = `forgot:${ip}:${normalizedEmail}`

    if (await isRateLimited(rateKey, AUTH.FORGOT_PASSWORD_MAX_ATTEMPTS)) {
      return NextResponse.json({
        message: PASSWORD_RESET.GENERIC_SUCCESS_MESSAGE,
      })
    }

    await connectDB()

    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      await incrementRateLimit(rateKey, AUTH.FORGOT_PASSWORD_WINDOW_MS)
      return NextResponse.json({
        message: PASSWORD_RESET.GENERIC_SUCCESS_MESSAGE,
      })
    }

    const rawCode = generatePasswordResetCode()
    const resetCodeHash = hashPasswordResetCode(rawCode)
    const expiresAt = passwordResetCodeExpiresAt()
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          resetCodeHash,
          resetCodeExpiresAt: expiresAt,
        },
      },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({
        message: PASSWORD_RESET.GENERIC_SUCCESS_MESSAGE,
      })
    }

    try {
      await sendPasswordResetCodeEmail(
        updatedUser.email,
        updatedUser.name,
        rawCode
      )
      await incrementRateLimit(rateKey, AUTH.FORGOT_PASSWORD_WINDOW_MS)
    } catch (error) {
      await User.findOneAndUpdate(
        {
          _id: updatedUser._id,
          resetCodeHash,
        },
        {
          $unset: { resetCodeHash: '', resetCodeExpiresAt: '' },
        },
        { new: true }
      )
      console.error('Forgot password email delivery error:', error)
      return NextResponse.json(
        {
          error:
            error instanceof EmailDeliveryError
              ? error.publicMessage
              : 'Password reset email could not be sent',
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      message: PASSWORD_RESET.GENERIC_SUCCESS_MESSAGE,
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
