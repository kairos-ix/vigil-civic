import { createNotification } from '@/lib/notify'
import User from '@/models/User'

const SEVERITY_WEIGHTS: Record<string, number> = {
  low: 1,
  medium: 3,
  high: 7,
  critical: 15,
}

export function calculatePriorityScore(
  upvotes: number,
  severity: string,
  createdAt: Date
): number {
  const daysSince = Math.floor(
    (Date.now() - createdAt.getTime()) / 86400000
  )
  return upvotes * 2 + (SEVERITY_WEIGHTS[severity] || 1) + Math.max(0, 30 - daysSince)
}

export function calculateLevel(
  points: number
): 'newcomer' | 'reporter' | 'verifier' | 'guardian' | 'hero' {
  if (points >= 1000) return 'hero'
  if (points >= 400) return 'guardian'
  if (points >= 150) return 'verifier'
  if (points >= 50) return 'reporter'
  return 'newcomer'
}

export function getNewBadges(
  stats: {
    reportsSubmitted: number
    issuesVerified: number
    issuesResolved: number
  },
  existing: string[]
) {
  const rules = [
    { name: 'First Step', icon: '🏁', cond: stats.reportsSubmitted >= 1 },
    { name: 'On Fire', icon: '🔥', cond: stats.reportsSubmitted >= 5 },
    { name: 'Eagle Eye', icon: '👁️', cond: stats.issuesVerified >= 10 },
    { name: 'Problem Solver', icon: '✅', cond: stats.issuesResolved >= 1 },
    { name: 'Verifier', icon: '🤝', cond: stats.issuesVerified >= 25 },
    {
      name: 'Vigil Hero',
      icon: '🚀',
      cond: stats.reportsSubmitted >= 50 && stats.issuesVerified >= 100,
    },
  ]
  return rules
    .filter((r) => r.cond && !existing.includes(r.name))
    .map(({ name, icon }) => ({ name, icon }))
}

export async function updateUserStatsAndBadges(
  userId: string,
  _statsUpdates: Record<string, number>,
  _pointsToAdd: number
) {
  // Import here to avoid circular dependency
  const { computeUserStats } = await import('@/lib/computeUserStats')

  // Compute live stats from the Issue collection — single source of truth
  const { stats: liveStats, points: livePoints, level: liveLevel } =
    await computeUserStats(userId)

  // Sync the User model with accurate data
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        stats: liveStats,
        points: livePoints,
        level: liveLevel,
      },
      lastActive: new Date(),
    },
    { new: true }
  )
  if (!updatedUser) return

  // Check for new badges using live stats
  const newBadges = getNewBadges(
    liveStats,
    updatedUser.badges.map((b: { name: string }) => b.name)
  )

  if (liveLevel !== updatedUser.level || newBadges.length > 0) {
    if (liveLevel !== updatedUser.level) {
      await createNotification(
        userId,
        'badge',
        `You reached Level ${liveLevel}! Keep up the good work.`
      )
      updatedUser.level = liveLevel
    }
    
    for (const badge of newBadges) {
      updatedUser.badges.push({ ...badge, earnedAt: new Date() })
      await createNotification(
        userId,
        'badge',
        `You earned a new badge: ${badge.name}! ${badge.icon}`
      )
    }
    
    await updatedUser.save()
  }
}
