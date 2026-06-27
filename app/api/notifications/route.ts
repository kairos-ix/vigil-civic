import { NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getServerUser } from '@/lib/auth'
import Notification from '@/models/Notification'

export async function GET() {
  try {
    await connectDB()
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ user: user._id, read: false }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error('Get notifications error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}