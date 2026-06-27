import mongoose from 'mongoose'
import Issue from '@/models/Issue'
import { POINTS } from '@/lib/constants'
import { calculateLevel } from '@/lib/scoring'

export interface ComputedUserStats {
  reportsSubmitted: number
  issuesVerified: number
  issuesResolved: number
  upvotesGiven: number
  upvotesReceived: number
}

export interface ComputedUserData {
  stats: ComputedUserStats
  points: number
  level: 'newcomer' | 'reporter' | 'verifier' | 'guardian' | 'hero'
}

/**
 * Compute accurate, live user stats by aggregating directly from the Issue collection.
 * This is the single source of truth — never rely on cached User.stats counters.
 */
export async function computeUserStats(
  userId: string | mongoose.Types.ObjectId
): Promise<ComputedUserData> {
  const objectId =
    userId instanceof mongoose.Types.ObjectId
      ? userId
      : new mongoose.Types.ObjectId(userId)

  const [[reportRes], [verifyRes], [resolveRes], [upvoteRes], [upvotesReceivedRes]] =
    await Promise.all([
      Issue.aggregate([
        { $match: { reportedBy: objectId, deletedAt: null } },
        { $count: 'count' },
      ]),
      Issue.aggregate([
        { $match: { verifiedBy: objectId, deletedAt: null } },
        { $count: 'count' },
      ]),
      Issue.aggregate([
        {
          $match: {
            reportedBy: objectId,
            deletedAt: null,
            status: 'resolved',
          },
        },
        { $count: 'count' },
      ]),
      Issue.aggregate([
        { $match: { upvotes: objectId, deletedAt: null } },
        { $count: 'count' },
      ]),
      Issue.aggregate([
        { $match: { reportedBy: objectId, deletedAt: null } },
        { $project: { upvoteCount: { $size: { $ifNull: ['$upvotes', []] } } } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ]),
    ])

  const reportsSubmitted = reportRes?.count ?? 0
  const issuesVerified = verifyRes?.count ?? 0
  const issuesResolved = resolveRes?.count ?? 0
  const upvotesGiven = upvoteRes?.count ?? 0
  const upvotesReceived = upvotesReceivedRes?.total ?? 0

  const stats: ComputedUserStats = {
    reportsSubmitted,
    issuesVerified,
    issuesResolved,
    upvotesGiven,
    upvotesReceived,
  }

  const points =
    reportsSubmitted * POINTS.REPORT +
    issuesVerified * POINTS.VERIFY +
    upvotesGiven * POINTS.UPVOTE +
    issuesResolved * POINTS.RESOLVED

  const level = calculateLevel(points)

  return { stats, points, level }
}

/**
 * Batch compute stats for multiple users at once.
 * More efficient than calling computeUserStats() in a loop for leaderboard.
 */
export async function computeBatchUserStats(
  userIds: (string | mongoose.Types.ObjectId)[]
): Promise<Map<string, ComputedUserData>> {
  const objectIds = userIds.map((id) =>
    id instanceof mongoose.Types.ObjectId
      ? id
      : new mongoose.Types.ObjectId(id)
  )

  const [reportResults, verifyResults, resolveResults, upvoteResults, upvotesReceivedResults] =
    await Promise.all([
      Issue.aggregate([
        { $match: { reportedBy: { $in: objectIds }, deletedAt: null } },
        { $group: { _id: '$reportedBy', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { verifiedBy: { $in: objectIds }, deletedAt: null } },
        { $unwind: '$verifiedBy' },
        { $match: { verifiedBy: { $in: objectIds } } },
        { $group: { _id: '$verifiedBy', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        {
          $match: {
            reportedBy: { $in: objectIds },
            deletedAt: null,
            status: 'resolved',
          },
        },
        { $group: { _id: '$reportedBy', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { upvotes: { $in: objectIds }, deletedAt: null } },
        { $unwind: '$upvotes' },
        { $match: { upvotes: { $in: objectIds } } },
        { $group: { _id: '$upvotes', count: { $sum: 1 } } },
      ]),
      Issue.aggregate([
        { $match: { reportedBy: { $in: objectIds }, deletedAt: null } },
        { $project: { reportedBy: 1, upvoteCount: { $size: { $ifNull: ['$upvotes', []] } } } },
        { $group: { _id: '$reportedBy', count: { $sum: '$upvoteCount' } } },
      ]),
    ])

  const toMap = (
    results: Array<{ _id: { toString: () => string }; count: number }>
  ) => {
    const map = new Map<string, number>()
    for (const r of results) {
      map.set(r._id.toString(), r.count)
    }
    return map
  }

  const reportsMap = toMap(reportResults)
  const verifiesMap = toMap(verifyResults)
  const resolvesMap = toMap(resolveResults)
  const upvotesMap = toMap(upvoteResults)
  const upvotesReceivedMap = toMap(upvotesReceivedResults)

  const result = new Map<string, ComputedUserData>()

  for (const oid of objectIds) {
    const id = oid.toString()
    const reportsSubmitted = reportsMap.get(id) || 0
    const issuesVerified = verifiesMap.get(id) || 0
    const issuesResolved = resolvesMap.get(id) || 0
    const upvotesGiven = upvotesMap.get(id) || 0
    const upvotesReceived = upvotesReceivedMap.get(id) || 0

    const stats: ComputedUserStats = {
      reportsSubmitted,
      issuesVerified,
      issuesResolved,
      upvotesGiven,
      upvotesReceived,
    }

    const points =
      reportsSubmitted * POINTS.REPORT +
      issuesVerified * POINTS.VERIFY +
      upvotesGiven * POINTS.UPVOTE +
      issuesResolved * POINTS.RESOLVED

    const level = calculateLevel(points)

    result.set(id, { stats, points, level })
  }

  return result
}
