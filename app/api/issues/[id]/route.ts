import { NextRequest, NextResponse } from 'next/server'
import {
  databaseUnavailableResponse,
  isDatabaseUnavailableError,
} from '@/lib/apiErrors'
import { connectDB } from '@/lib/mongodb'
import { getServerUser } from '@/lib/auth'
import {
  CATEGORIES,
  ISSUE_DELETE_RESTRICTED_STATUSES,
  SEVERITY_COLORS,
} from '@/lib/constants'
import {
  activeIssueFilter,
  removedIssueResponse,
} from '@/lib/queries'
import Issue from '@/models/Issue'

const VALID_CATEGORIES = new Set(CATEGORIES.map((category) => category.value))
const VALID_SEVERITIES = new Set(Object.keys(SEVERITY_COLORS))

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    const issue = await Issue.findById(id)
      .populate('reportedBy', 'name avatar level')
      .populate('comments.user', 'name avatar level')

    if (issue?.deletedAt) {
      return removedIssueResponse()
    }

    if (!issue || !issue.images || issue.images.length === 0) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json({ issue })
  } catch (error) {
    console.error('Get issue error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const update: Record<string, unknown> = {}

    if (typeof body.title === 'string') {
      const title = body.title.trim()
      if (!title || title.length > 100) {
        return NextResponse.json(
          { error: 'Title must be 1-100 characters' },
          { status: 400 }
        )
      }
      update.title = title
    }

    if (typeof body.description === 'string') {
      const description = body.description.trim()
      if (!description) {
        return NextResponse.json(
          { error: 'Description is required' },
          { status: 400 }
        )
      }
      update.description = description
    }

    if (typeof body.category === 'string') {
      if (!VALID_CATEGORIES.has(body.category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        )
      }
      update.category = body.category
    }

    if (typeof body.severity === 'string') {
      if (!VALID_SEVERITIES.has(body.severity)) {
        return NextResponse.json(
          { error: 'Invalid severity' },
          { status: 400 }
        )
      }
      update.severity = body.severity
    }

    if (body.location != null) {
      const location = body.location
      const coordinates = location?.coordinates
      if (
        !Array.isArray(coordinates) ||
        coordinates.length !== 2 ||
        !isFiniteNumber(coordinates[0]) ||
        !isFiniteNumber(coordinates[1])
      ) {
        return NextResponse.json(
          { error: 'Location coordinates are required' },
          { status: 400 }
        )
      }

      update.location = {
        type: 'Point',
        coordinates,
        address:
          typeof location.address === 'string'
            ? location.address.trim()
            : undefined,
        ward: typeof location.ward === 'string' ? location.ward.trim() : undefined,
        city: typeof location.city === 'string' ? location.city.trim() : undefined,
      }
    }

    if (body.images != null) {
      if (
        !Array.isArray(body.images) ||
        body.images.some((image: unknown) => typeof image !== 'string')
      ) {
        return NextResponse.json(
          { error: 'Images must be an array of URLs' },
          { status: 400 }
        )
      }
      update.images = body.images
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields provided' },
        { status: 400 }
      )
    }

    const existing = await Issue.findById(id).select(
      'reportedBy upvotes verifiedBy deletedAt'
    )

    if (!existing) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (existing.deletedAt) {
      return removedIssueResponse()
    }

    if (existing.reportedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (existing.upvotes.length > 0 || existing.verifiedBy.length > 0) {
      return NextResponse.json(
        { error: 'Issue is locked after first community validation' },
        { status: 409 }
      )
    }

    const updatedIssue = await Issue.findOneAndUpdate(
      {
        _id: id,
        ...activeIssueFilter(),
        reportedBy: user._id,
        upvotes: { $size: 0 },
        verifiedBy: { $size: 0 },
      },
      {
        $set: {
          ...update,
          editedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )
      .populate('reportedBy', 'name avatar level')
      .populate('comments.user', 'name avatar level')

    if (!updatedIssue) {
      return NextResponse.json(
        { error: 'Issue is locked after first community validation' },
        { status: 409 }
      )
    }

    return NextResponse.json({ issue: updatedIssue })
  } catch (error) {
    console.error('Edit issue error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to edit issue' },
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
    const user = await getServerUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const existing = await Issue.findById(id).select(
      'reportedBy status mergedReportsCount deletedAt'
    )

    if (!existing) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    if (existing.deletedAt) {
      return removedIssueResponse()
    }

    const isReporter = existing.reportedBy.toString() === user._id.toString()
    const isOfficial = user.role === 'official'

    if (!isReporter && !isOfficial) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const isRestrictedStatus = ISSUE_DELETE_RESTRICTED_STATUSES.includes(
      existing.status as (typeof ISSUE_DELETE_RESTRICTED_STATUSES)[number]
    )
    const isMerged = (existing.mergedReportsCount ?? 1) > 1

    if (!isOfficial && (isRestrictedStatus || isMerged)) {
      return NextResponse.json(
        { error: 'Issue cannot be removed after official action or merge' },
        { status: 409 }
      )
    }

    const filter: Record<string, unknown> = {
      _id: id,
      ...activeIssueFilter(),
    }

    if (!isOfficial) {
      filter.reportedBy = user._id
      filter.status = { $nin: ISSUE_DELETE_RESTRICTED_STATUSES }
      filter.mergedReportsCount = { $lte: 1 }
    }

    const deletedIssue = await Issue.findOneAndUpdate(
      filter,
      { $set: { deletedAt: new Date() } },
      { returnDocument: 'after' }
    )
      .populate('reportedBy', 'name avatar level')
      .populate('comments.user', 'name avatar level')

    if (!deletedIssue) {
      return NextResponse.json(
        { error: 'Issue cannot be removed after official action or merge' },
        { status: 409 }
      )
    }

    return NextResponse.json({ issue: deletedIssue })
  } catch (error) {
    console.error('Delete issue error:', error)
    if (isDatabaseUnavailableError(error)) {
      return databaseUnavailableResponse()
    }
    return NextResponse.json(
      { error: 'Failed to remove issue' },
      { status: 500 }
    )
  }
}
