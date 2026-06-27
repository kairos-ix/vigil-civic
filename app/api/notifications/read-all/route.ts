import { NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getServerUser } from '@/lib/auth'
import Notification from '@/models/Notification'

export async function PATCH() {
  try {
    await connectDB()
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await Notification.updateMany(
      { user: user._id, read: false },
      { $set: { read: true } }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Mark all notifications read error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}