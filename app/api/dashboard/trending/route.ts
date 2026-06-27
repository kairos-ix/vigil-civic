import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { activeIssueFilter } from '@/lib/queries'
import { REAL_ISSUES_FILTER } from '@/lib/seedFilters'
import Issue from '@/models/Issue'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '20000'

    const filter: Record<string, unknown> = {
      ...activeIssueFilter(),
      status: { $ne: 'resolved' },
      'images.0': { $exists: true },
      ...REAL_ISSUES_FILTER,
    }
    
    if (lat && lng) {
      filter.location = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseInt(radius) / 6378137]
        }
      }
    }

    const trending = await Issue.find(filter)
      .sort({ priorityScore: -1 })
      .limit(5)
      .populate('reportedBy', 'name avatar level')

    return NextResponse.json({ issues: trending })
  } catch (error) {
    console.error('Dashboard trending error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending' },
      { status: 500 }
    )
  }
}
