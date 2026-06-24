import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Issue from '@/models/Issue'

export async function GET() {
  try {
    await connectDB()

    const trending = await Issue.find({ status: { $ne: 'resolved' } })
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
