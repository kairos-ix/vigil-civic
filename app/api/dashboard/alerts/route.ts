import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import InfrastructureAlert from '@/models/InfrastructureAlert'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius') || '20000'

    const filter: Record<string, unknown> = { status: 'active' }
    if (lat && lng) {
      filter['zone.center'] = {
        $geoWithin: {
          $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseInt(radius) / 6378137]
        }
      }
    }

    const alerts = await InfrastructureAlert.find(filter)
      .sort({ issueCount: -1 })
      .limit(10)

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Dashboard alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
