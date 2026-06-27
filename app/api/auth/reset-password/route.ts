import { NextRequest, NextResponse } from 'next/server'

import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { hashPassword } from '@/lib/auth'
import { AUTH } from '@/lib/constants'
import { connectDB } from '@/lib/mongodb'
import { hashPasswordResetCode } from '@/lib/passwordReset'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const { email, code, newPassword } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Reset code is required' },
        { status: 400 }
      )
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    if (newPassword.length < AUTH.MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${AUTH.MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 }
      )
    }

    await connectDB()

    const normalizedEmail = email.toLowerCase().trim()
    const codeHash = hashPasswordResetCode(code.trim())
    const passwordHash = await hashPassword(newPassword)

    const user = await User.findOneAndUpdate(
      {
        email: normalizedEmail,
        resetCodeHash: codeHash,
        resetCodeExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash },
        $unset: { resetCodeHash: '', resetCodeExpiresAt: '' },
      },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message:
        'Password reset successfully. You can log in with your new password.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
