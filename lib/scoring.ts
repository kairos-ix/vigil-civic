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
