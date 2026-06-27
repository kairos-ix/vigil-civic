import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import {
  activeIssueFilter,
  removedIssueResponse,
} from '@/lib/queries'
import User from '@/models/User'
import Issue from '@/models/Issue'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    await connectDB()
    const userId = await getUserIdFromRequest()

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id, commentId } = await params

    // Check if issue is deleted
    const issueCheck = await Issue.findById(id).select('deletedAt')
    if (!issueCheck) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (issueCheck.deletedAt) {
      return removedIssueResponse()
    }

    // Get user role for authorization
    const user = await User.findById(userId).select('role')

    // Check if comment exists and user has permission
    const issueWithComments = await Issue.findById(id).select('comments.user reportedBy')
    if (!issueWithComments) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const commentObjectId = new mongoose.Types.ObjectId(commentId)
    const comment = issueWithComments.comments.find(
      (c: { _id: mongoose.Types.ObjectId }) => c._id?.toString() === commentId
    )

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const isReporter =
      typeof issueWithComments.reportedBy === 'object'
        ? issueWithComments.reportedBy?._id?.toString() === userId
        : issueWithComments.reportedBy?.toString() === userId
    const isCommenter =
      typeof comment.user === 'object'
        ? comment.user?._id?.toString() === userId
        : comment.user?.toString() === userId
    const isOfficial = user?.role === 'official'

    if (!isReporter && !isCommenter && !isOfficial) {
      return NextResponse.json({ error: 'Not authorized to delete this comment' }, { status: 403 })
    }

    // Remove the comment atomically
    const updated = await Issue.findOneAndUpdate(
      { _id: id, ...activeIssueFilter() },
      { $pull: { comments: { _id: commentObjectId } } },
      { returnDocument: 'after' }
    )

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