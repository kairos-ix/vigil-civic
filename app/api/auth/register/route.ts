import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import {
  hashPassword,
  toSafeUser,
} from '@/lib/auth'
import { AUTH } from '@/lib/constants'
import {
  emailVerificationExpiresAt,
  generateEmailVerificationCode,
  hashEmailVerificationCode,
} from '@/lib/emailVerification'
import {
  EmailDeliveryError,
  isEmailConfigured,
  sendEmailVerificationCodeEmail,
} from '@/lib/email'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    await connectDB()
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < AUTH.MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${AUTH.MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser && existingUser.emailVerified !== false) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)
    const verificationCode = generateEmailVerificationCode()
    const verificationCodeHash = hashEmailVerificationCode(verificationCode)
    const verificationCodeExpiresAt = emailVerificationExpiresAt()

    const user = existingUser
      ? await User.findOneAndUpdate(
          {
            email: normalizedEmail,
            emailVerified: false,
          },
          {
            $set: {
              name,
              passwordHash,
              emailVerificationCodeHash: verificationCodeHash,
              emailVerificationCodeExpiresAt: verificationCodeExpiresAt,
              lastActive: new Date(),
            },
          },
          { new: true }
        )
      : await User.create({
          name,
          email: normalizedEmail,
          passwordHash,
          emailVerified: false,
          emailVerificationCodeHash: verificationCodeHash,
          emailVerificationCodeExpiresAt: verificationCodeExpiresAt,
        })

    if (!user) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    try {
      await sendEmailVerificationCodeEmail(
        user.email,
        user.name,
        verificationCode
      )
    } catch (error) {
      if (existingUser) {
        await User.findOneAndUpdate(
          {
            _id: user._id,
            emailVerificationCodeHash: verificationCodeHash,
            emailVerified: false,
          },
          {
            $unset: {
              emailVerificationCodeHash: '',
              emailVerificationCodeExpiresAt: '',
            },
          },
          { new: true }
        )
      } else {
        await User.findOneAndDelete({
          _id: user._id,
          email: normalizedEmail,
        })
      }
      console.error('Register email delivery error:', error)
      return NextResponse.json(
        {
          error:
            error instanceof EmailDeliveryError
              ? error.publicMessage
              : 'Verification email could not be sent',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        user: toSafeUser(user),
        message: 'Verification code sent. Check your email to finish signup.',
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('Register error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
