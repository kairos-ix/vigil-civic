import Notification from '@/models/Notification'
import User from '@/models/User'
import { connectDB } from '@/lib/mongodb'
import type { NotificationType } from '@/models/Notification'

/**
 * Create a single notification for one user.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  message: string,
  issueId?: string
) {
  await connectDB()
  return Notification.create({
    user: userId,
    type,
    message,
    issueId,
  })
}

/**
 * Notify the owner of an issue (convenience wrapper).
 * Skips notification if the actor IS the owner.
 */
export async function notifyIssueOwner(
  ownerId: string,
  actorId: string,
  type: NotificationType,
  message: string,
  issueId: string
) {
  if (ownerId === actorId) return // don't notify yourself
  return createNotification(ownerId, type, message, issueId)
}

/**
 * Notify all users in the same city about a new issue.
 * Excludes the reporter themselves.
 * Uses insertMany for efficient bulk insert.
 */
export async function notifyCityUsers(
  city: string,
  reporterId: string,
  issueTitle: string,
  issueId: string
) {
  if (!city) return

  await connectDB()
  const usersInCity = await User.find({
    city: { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') },
    _id: { $ne: reporterId },
  })
    .select('_id')
    .limit(500) // cap to avoid massive fan-out
    .lean()

  if (usersInCity.length === 0) return

  const notifications = usersInCity.map((u) => ({
    user: u._id,
    type: 'new_issue' as NotificationType,
    message: `New issue reported in your city: "${truncate(issueTitle, 60)}"`,
    issueId,
    read: false,
  }))

  await Notification.insertMany(notifications, { ordered: false })
}

/**
 * Notify all users in the same city about a specific activity (verification, upvote).
 * Excludes the actor.
 */
export async function notifyCityActivity(
  city: string,
  actorId: string,
  type: NotificationType,
  message: string,
  issueId: string
) {
  if (!city) return

  await connectDB()
  const usersInCity = await User.find({
    city: { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') },
    _id: { $ne: actorId },
  })
    .select('_id')
    .limit(500) // cap to avoid massive fan-out
    .lean()

  if (usersInCity.length === 0) return

  const notifications = usersInCity.map((u) => ({
    user: u._id,
    type,
    message,
    issueId,
    read: false,
  }))

  await Notification.insertMany(notifications, { ordered: false })
}

/** Upvote milestone thresholds */
const UPVOTE_MILESTONES = [5, 10, 25, 50, 100]

/**
 * Check if upvote count just hit a milestone, and notify the issue owner.
 */
export async function checkUpvoteMilestone(
  upvoteCount: number,
  ownerId: string,
  actorId: string,
  issueId: string,
  issueTitle: string
) {
  if (ownerId === actorId) return
  if (!UPVOTE_MILESTONES.includes(upvoteCount)) return

  return createNotification(
    ownerId,
    'upvote_milestone',
    `Your issue "${truncate(issueTitle, 50)}" reached ${upvoteCount} upvotes!`,
    issueId
  )
}

// ── helpers ──────────────────────────────────────────────

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}