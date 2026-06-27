import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getServerUser } from '@/lib/auth'
import Notification from '@/models/Notification'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const updated = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: { read: true } },
      { returnDocument: 'after' }
    )

    if (!updated) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    return NextResponse.json({ notification: updated })
  } catch (error) {
    console.error('Mark notification read error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}