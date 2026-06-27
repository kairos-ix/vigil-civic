import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { ISSUE_CLOSED_STATUSES, POINTS, VERIFICATION_THRESHOLD } from '@/lib/constants'
import { calculatePriorityScore, updateUserStatsAndBadges } from '@/lib/scoring'
import {
  promoteIfThresholdReached,
  toObjectId,
} from '@/lib/promoteIfThresholdReached'
import {
  activeIssueFilter,
  removedIssueResponse,
} from '@/lib/queries'
import Issue from '@/models/Issue'
import { checkUpvoteMilestone, notifyCityActivity } from '@/lib/notify'

const TERMINAL_STATUSES = ISSUE_CLOSED_STATUSES

async function recalcPriority(issueId: string) {
  const issue = await Issue.findOne({ _id: issueId, ...activeIssueFilter() })
  if (!issue) return null

  const priorityScore = calculatePriorityScore(
    issue.upvotes.length,
    issue.severity,
    issue.createdAt
  )

  return Issue.findOneAndUpdate(
    { _id: issueId, ...activeIssueFilter() },
    { $set: { priorityScore } },
    { returnDocument: 'after' }
  )
}

async function downgradeIfBelowThreshold(issueId: string) {
  const current = await Issue.findOne({
    _id: issueId,
    ...activeIssueFilter(),
  }).select('upvotes status')
  if (!current) return null
  if (current.upvotes.length >= VERIFICATION_THRESHOLD) return null

  return Issue.findOneAndUpdate(
    { _id: issueId, ...activeIssueFilter(), status: 'community_verified' },
    {
      $set: { status: 'reported' },
      $push: {
        statusHistory: {
          status: 'reported',
          changedAt: new Date(),
          changedBy: null,
        },
      },
    },
    { returnDocument: 'after' }
  )
}

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
    const existing = await Issue.findById(id).select('reportedBy status upvotes deletedAt')
    if (!existing) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (existing.deletedAt) {
      return removedIssueResponse()
    }

    if (existing.reportedBy.toString() === userId) {
      return NextResponse.json(
        { error: 'Cannot upvote your own issue' },
        { status: 403 }
      )
    }

    if (TERMINAL_STATUSES.includes(existing.status as (typeof TERMINAL_STATUSES)[number])) {
      return NextResponse.json(
        { error: 'Cannot vote on a closed issue' },
        { status: 409 }
      )
    }

    const userObjectId = toObjectId(userId)

    // Step A: atomic add via $addToSet (no-op if already upvoted)
    let issue = await Issue.findOneAndUpdate(
      {
        _id: id,
        ...activeIssueFilter(),
        upvotes: { $ne: userObjectId },
        status: { $nin: TERMINAL_STATUSES },
        reportedBy: { $ne: userObjectId },
      },
      { $addToSet: { upvotes: userObjectId } },
      { returnDocument: 'after' }
    )

    if (issue) {
      await updateUserStatsAndBadges(
        userId,
        { 'stats.upvotesGiven': 1 },
        POINTS.UPVOTE
      )

      issue = await recalcPriority(id)
      if (!issue) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
      }

      const promoted = await promoteIfThresholdReached(id)
      issue = promoted ?? issue

      // Check for milestones and notify the owner
      try {
        await checkUpvoteMilestone(
          issue.upvotes.length,
          issue.reportedBy.toString(),
          userId,
          id,
          issue.title || 'Untitled'
        )

        // Notify all other users in the same city
        if (issue.location?.city) {
          await notifyCityActivity(
            issue.location.city,
            userId,
            'upvote',
            `An issue in your city received an upvote: "${issue.title?.slice(0, 50) || 'Untitled'}"`,
            id
          )
        }
      } catch (notifyError) {
        console.error('Upvote notification failed (non-fatal):', notifyError)
      }

      return NextResponse.json({ issue })
    }

    const alreadyUpvoted = existing.upvotes.map(String).includes(userId)
    if (!alreadyUpvoted) {
      return NextResponse.json(
        { error: 'Cannot vote on a closed issue' },
        { status: 409 }
      )
    }

    // Toggle off: $pull existing upvote
    issue = await Issue.findOneAndUpdate(
      {
        _id: id,
        ...activeIssueFilter(),
        upvotes: userObjectId,
        status: { $nin: TERMINAL_STATUSES },
      },
      { $pull: { upvotes: userObjectId } },
      { returnDocument: 'after' }
    )

    if (!issue) {
      return NextResponse.json(
        { error: 'Cannot vote on a closed issue' },
        { status: 409 }
      )
    }

    issue = await recalcPriority(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const downgraded = await downgradeIfBelowThreshold(id)
    issue = downgraded ?? issue

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Upvote error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json({ error: 'Failed to upvote' }, { status: 500 })
  }
}
