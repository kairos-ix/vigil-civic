import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Issue from '@/models/Issue'
import InfrastructureAlert from '@/models/InfrastructureAlert'

export async function GET() {
  try {
    await connectDB()

    // Total counts by status
    const statusAgg = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const statusMap: Record<string, number> = {}
    let total = 0
    for (const s of statusAgg) {
      statusMap[s._id] = s.count
      total += s.count
    }

    // Counts by category
    const categoryAgg = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])
    const byCategory: Record<string, number> = {}
    for (const c of categoryAgg) {
      byCategory[c._id] = c.count
    }

    // Resolved this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const resolvedThisMonth = await Issue.countDocuments({
      status: 'resolved',
      resolvedAt: { $gte: startOfMonth },
    })

    // Active alerts count
    const activeAlerts = await InfrastructureAlert.countDocuments({
      status: 'active',
    })

    return NextResponse.json({
      total,
      reported: statusMap['reported'] || 0,
      community_verified: statusMap['community_verified'] || 0,
      in_progress: statusMap['in_progress'] || 0,
      resolved: statusMap['resolved'] || 0,
      rejected: statusMap['rejected'] || 0,
      byCategory,
      resolvedThisMonth,
      activeAlerts,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
