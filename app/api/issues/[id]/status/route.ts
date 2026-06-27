import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { POINTS, STATUS_CONFIG } from '@/lib/constants'
import { toObjectId } from '@/lib/promoteIfThresholdReached'
import { updateUserStatsAndBadges } from '@/lib/scoring'
import {
  activeIssueFilter,
  removedIssueResponse,
} from '@/lib/queries'
import { createNotification, notifyCityActivity } from '@/lib/notify'
import Issue from '@/models/Issue'
import User from '@/models/User'

const VALID_STATUSES = [
  'reported',
  'community_verified',
  'in_progress',
  'resolved',
  'rejected',
] as const

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const actor = await User.findById(userId).select('role')
    if (!actor || actor.role !== 'official') {
      return NextResponse.json(
        { error: 'Official access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { status } = await req.json()

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const issue = await Issue.findById(id).select(
      'status reportedBy deletedAt location.city'
    )
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.deletedAt) {
      return removedIssueResponse()
    }

    const setUpdate: Record<string, unknown> = { status }
    if (status === 'resolved') {
      setUpdate.resolvedAt = new Date()
    }

    const updated = await Issue.findOneAndUpdate(
      {
        _id: id,
        ...activeIssueFilter(),
        status: issue.status,
      },
      {
        $set: setUpdate,
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
            changedBy: toObjectId(userId),
          },
        },
      },
      { returnDocument: 'after' }
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'Issue status changed. Please refresh and try again.' },
        { status: 409 }
      )
    }

    if (status === 'resolved') {
      await updateUserStatsAndBadges(
        issue.reportedBy.toString(),
        { 'stats.issuesResolved': 1 },
        POINTS.RESOLVED
      )
    }

    await createNotification(
      issue.reportedBy.toString(),
      'status_changed',
      `Your issue status was updated to ${STATUS_CONFIG[status]?.label ?? status}`,
      id
    )

    // Notify all city users about the authority action
    if (issue.location?.city) {
      await notifyCityActivity(
        issue.location.city,
        userId,
        'status_changed',
        `An issue in your city was updated to ${STATUS_CONFIG[status]?.label ?? status}`,
        id
      )
    }

    return NextResponse.json({ issue: updated })
  } catch (error) {
    console.error('Status update error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
