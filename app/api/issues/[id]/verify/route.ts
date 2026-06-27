import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { ISSUE_CLOSED_STATUSES, POINTS } from '@/lib/constants'
import { toObjectId } from '@/lib/promoteIfThresholdReached'
import {
  activeIssueFilter,
  removedIssueResponse,
} from '@/lib/queries'
import { updateUserStatsAndBadges } from '@/lib/scoring'
import Issue from '@/models/Issue'
import User from '@/models/User'
import { notifyIssueOwner, notifyCityActivity } from '@/lib/notify'

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

    const { id } = await params
    const issue = await Issue.findById(id).select(
      'reportedBy status verifiedBy deletedAt'
    )
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.deletedAt) {
      return removedIssueResponse()
    }

    if (ISSUE_CLOSED_STATUSES.includes(issue.status as (typeof ISSUE_CLOSED_STATUSES)[number])) {
      return NextResponse.json(
        { error: 'Cannot verify a closed issue' },
        { status: 409 }
      )
    }

    // User cannot verify their own issue
    if (issue.reportedBy.toString() === userId) {
      return NextResponse.json(
        { error: 'Cannot verify your own issue' },
        { status: 403 }
      )
    }

    // Check if already verified by this user
    if (issue.verifiedBy.map(String).includes(userId)) {
      return NextResponse.json(
        { error: 'Already verified by you' },
        { status: 400 }
      )
    }

    const userObjectId = toObjectId(userId)
    const updated = await Issue.findOneAndUpdate(
      {
        _id: id,
        ...activeIssueFilter(),
        status: { $nin: ISSUE_CLOSED_STATUSES },
        reportedBy: { $ne: userObjectId },
        verifiedBy: { $ne: userObjectId },
      },
      { $addToSet: { verifiedBy: userObjectId } },
      { returnDocument: 'after' }
    )

    if (!updated) {
      return NextResponse.json(
        { error: 'Unable to verify issue' },
        { status: 409 }
      )
    }

    await updateUserStatsAndBadges(
      userId,
      { 'stats.issuesVerified': 1 },
      POINTS.VERIFY
    )

    // Notify the issue reporter about verification
    try {
      await notifyIssueOwner(
        issue.reportedBy.toString(),
        userId,
        'verified',
        `Someone verified your issue "${updated.title?.slice(0, 50) || 'Untitled'}"`,
        id
      )
      
      // Notify all other users in the same city
      if (issue.location?.city) {
        await notifyCityActivity(
          issue.location.city,
          userId,
          'verified',
          `An issue in your city was verified: "${updated.title?.slice(0, 50) || 'Untitled'}"`,
          id
        )
      }
    } catch (notifyError) {
      console.error('Verification notification failed (non-fatal):', notifyError)
    }

    return NextResponse.json({ issue: updated })
  } catch (error) {
    console.error('Verify error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to verify' },
      { status: 500 }
    )
  }
}
