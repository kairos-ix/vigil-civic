import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import Issue from '@/models/Issue'
import User from '@/models/User'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { status } = await req.json()

    const validStatuses = [
      'reported',
      'community_verified',
      'in_progress',
      'resolved',
      'rejected',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const issue = await Issue.findById(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    issue.status = status
    issue.statusHistory.push({ status, changedAt: new Date() })

    if (status === 'resolved') {
      issue.resolvedAt = new Date()
      // Award 25 points to the reporter
      await User.findByIdAndUpdate(issue.reportedBy, {
        $inc: { 'stats.issuesResolved': 1, points: 25 },
      })
    }

    await issue.save()

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
