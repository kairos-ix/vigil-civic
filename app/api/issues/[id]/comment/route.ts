import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import Issue from '@/models/Issue'

export async function POST(
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
    const { text } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      )
    }

    const issue = await Issue.findById(id)
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    issue.comments.push({
      user: userId as unknown as import('mongoose').Types.ObjectId,
      text: text.trim(),
      createdAt: new Date(),
    })

    await issue.save()

    // Re-fetch with populated comments
    const updated = await Issue.findById(id)
      .populate('reportedBy', 'name avatar level')
      .populate('comments.user', 'name avatar level')

    return NextResponse.json({ issue: updated })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}
