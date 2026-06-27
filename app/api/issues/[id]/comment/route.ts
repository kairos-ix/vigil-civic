import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { toObjectId } from '@/lib/promoteIfThresholdReached'
import {
  activeIssueFilter,
  removedIssueResponse,
} from '@/lib/queries'
import { notifyIssueOwner } from '@/lib/notify'
import Issue from '@/models/Issue'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const userId = await getUserIdFromRequest()
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

    const issue = await Issue.findById(id).select('deletedAt')
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issue.deletedAt) {
      return removedIssueResponse()
    }

const updated = await Issue.findOneAndUpdate(
       { _id: id, ...activeIssueFilter() },
       {
         $push: {
           comments: {
             user: toObjectId(userId),
             text: text.trim(),
             createdAt: new Date(),
           },
         },
       },
       { returnDocument: 'after' }
     )
       .populate('reportedBy', 'name avatar level')
       .populate('comments.user', 'name avatar level')

     if (!updated) {
       return removedIssueResponse()
     }

     const reportedById =
       typeof updated.reportedBy === 'object' ? updated.reportedBy._id : updated.reportedBy
     const commenterName =
       typeof updated.comments[updated.comments.length - 1]?.user === 'object'
         ? (updated.comments[updated.comments.length - 1]?.user as { name?: string }).name
         : 'Someone'

     await notifyIssueOwner(
       reportedById.toString(),
       userId,
       'comment',
       `${commenterName} commented on your issue "${updated.title.slice(0, 50)}"`,
       id
     )

     return NextResponse.json({ issue: updated })
  } catch (error) {
    console.error('Comment error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(req.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    const updated = await Issue.findOneAndUpdate(
      { _id: id, ...activeIssueFilter() },
      { $pull: { comments: { _id: commentId, user: toObjectId(userId) } } },
      { returnDocument: 'after' }
    )
      .populate('reportedBy', 'name avatar level')
      .populate('comments.user', 'name avatar level')

    if (!updated) {
      return removedIssueResponse()
    }

    return NextResponse.json({ issue: updated })
  } catch (error) {
    console.error('Delete comment error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
