export interface User {
  _id: string
  name: string
  email: string
  avatar?: string
  points: number
  level: string
  badges: Array<{ name: string; earnedAt: string; icon: string }>
  stats: {
    reportsSubmitted: number
    issuesVerified: number
    issuesResolved: number
    upvotesGiven: number
  }
  ward?: string
  city?: string
  createdAt: string
}

export interface Issue {
  _id: string
  title: string
  description: string
  category: string
  images: string[]
  location: {
    type: string
    coordinates: [number, number]
    address?: string
    ward?: string
    city?: string
  }
  status: string
  severity: string
  reportedBy: User | string
  upvotes: string[]
  verifiedBy: string[]
  aiClassification: {
    category?: string
    severity?: string
    confidence?: number
    isDuplicate?: boolean
  }
  priorityScore: number
  comments: Array<{ user: User | string; text: string; createdAt: string }>
  statusHistory: Array<{ status: string; changedAt: string }>
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface InfrastructureAlert {
  _id: string
  zone: { center: { coordinates: [number, number] }; radiusMeters: number }
  category: string
  issueCount: number
  relatedIssues: string[]
  severity: string
  status: string
  aiInsight?: string
  createdAt: string
}

export interface DashboardStats {
  total: number
  reported: number
  community_verified: number
  in_progress: number
  resolved: number
  rejected: number
  byCategory: Record<string, number>
  resolvedThisMonth: number
  activeAlerts: number
}
