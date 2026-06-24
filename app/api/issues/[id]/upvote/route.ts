import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { calculatePriorityScore } from '@/lib/scoring'
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

    const upvoteIndex = issue.upvotes.map(String).indexOf(userId)
    if (upvoteIndex > -1) {
      // Remove upvote (toggle off)
      issue.upvotes.splice(upvoteIndex, 1)
    } else {
      // Add upvote (toggle on)
      issue.upvotes.push(userId as unknown as import('mongoose').Types.ObjectId)

      // Award points to upvoter
      await User.findByIdAndUpdate(userId, {
        $inc: { 'stats.upvotesGiven': 1, points: 5 },
      })
    }

    // Recalculate priority score
    issue.priorityScore = calculatePriorityScore(
      issue.upvotes.length,
      issue.severity,
      issue.createdAt
    )

    // Auto-verify if upvotes >= 3
    if (
      issue.upvotes.length >= 3 &&
      issue.status === 'reported'
    ) {
      issue.status = 'community_verified'
      issue.statusHistory.push({
        status: 'community_verified',
        changedAt: new Date(),
      })
    }

    await issue.save()

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Upvote error:', error)
    return NextResponse.json(
      { error: 'Failed to upvote' },
      { status: 500 }
    )
  }
}
