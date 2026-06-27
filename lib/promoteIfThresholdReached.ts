import mongoose from 'mongoose'
import Issue from '@/models/Issue'
import User from '@/models/User'
import { POINTS, VERIFICATION_THRESHOLD } from '@/lib/constants'
import { activeIssueFilter } from '@/lib/queries'
import { createNotification } from '@/lib/notify'

export async function promoteIfThresholdReached(issueId: string) {
  const current = await Issue.findOne({
    _id: issueId,
    ...activeIssueFilter(),
  }).select('upvotes status reportedBy reporterBonusAwarded notifiedVerified')
  if (!current) return null

  if (current.upvotes.length < VERIFICATION_THRESHOLD) return null

  const updated = await Issue.findOneAndUpdate(
    { _id: issueId, ...activeIssueFilter(), status: 'reported' },
    {
      $set: { status: 'community_verified' },
      $push: {
        statusHistory: {
          status: 'community_verified',
          changedAt: new Date(),
          changedBy: null,
        },
      },
    },
    { returnDocument: 'after' }
  )

  if (!updated) return null

  const bonusMarked = await Issue.findOneAndUpdate(
    { _id: issueId, ...activeIssueFilter(), reporterBonusAwarded: { $ne: true } },
    { $set: { reporterBonusAwarded: true } }
  )

  if (bonusMarked) {
    await User.findByIdAndUpdate(updated.reportedBy, {
      $inc: { points: POINTS.REPORTER_VERIFIED_BONUS },
    })
  }

  const notifiedMarked = await Issue.findOneAndUpdate(
    { _id: issueId, ...activeIssueFilter(), notifiedVerified: { $ne: true } },
    { $set: { notifiedVerified: true } }
  )

  if (notifiedMarked) {
    await createNotification(
      updated.reportedBy.toString(),
      'verified',
      'Your issue has been verified by the community'
    )
  }

  return Issue.findOne({ _id: issueId, ...activeIssueFilter() })
}

export function toObjectId(userId: string) {
  return userId as unknown as mongoose.Types.ObjectId
}
