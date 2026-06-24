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
    const issue = await Issue.findById(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    // User cannot verify their own issue
    if (issue.reportedBy.toString() === userId) {
      return NextResponse.json(
        { error: 'Cannot verify your own issue' },
        { status: 403 }
      )
    }

    // Check if already verified by this user
    if (issue.verifiedBy.map(String).includes(userId)) {
      return NextResponse.json(
        { error: 'Already verified by you' },
        { status: 400 }
      )
    }

    issue.verifiedBy.push(userId as unknown as import('mongoose').Types.ObjectId)

    // Award points to verifier
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.issuesVerified': 1, points: 5 },
    })

    await issue.save()

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Failed to verify' },
      { status: 500 }
    )
  }
}
