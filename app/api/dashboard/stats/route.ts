import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { activeIssueFilter } from '@/lib/queries'
import { REAL_ISSUES_FILTER } from '@/lib/seedFilters'
import Issue from '@/models/Issue'
import InfrastructureAlert from '@/models/InfrastructureAlert'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '20000'

    const matchStage: Record<string, unknown> = {
      ...activeIssueFilter(),
      'images.0': { $exists: true },
      ...REAL_ISSUES_FILTER,
    }
    if (lat && lng) {
      matchStage.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseInt(radius) / 6378137]
        }
      }
    }

    // Total counts by status
    const statusAgg = await Issue.aggregate([
      { $match: matchStage },
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
      { $match: matchStage },
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
      ...matchStage,
      status: 'resolved',
      resolvedAt: { $gte: startOfMonth },
    })

    // Active alerts count
    const alertMatch: Record<string, unknown> = { status: 'active' }
    if (lat && lng) {
      alertMatch['zone.center'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseInt(radius) / 6378137]
        }
      }
    }
    const activeAlerts = await InfrastructureAlert.countDocuments(alertMatch)

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
