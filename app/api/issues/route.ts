import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { classifyIssueImage } from '@/lib/gemini'
import { uploadImage } from '@/lib/cloudinary'
import { generateAreaInsight } from '@/lib/gemini'
import { calculatePriorityScore, calculateLevel, getNewBadges, updateUserStatsAndBadges } from '@/lib/scoring'
import {
  promoteIfThresholdReached,
  toObjectId,
} from '@/lib/promoteIfThresholdReached'
import { activeIssueFilter } from '@/lib/queries'
import {
  CLUSTER_RADIUS_METERS,
  CLUSTER_THRESHOLD,
  DUPLICATE_DAYS,
  DUPLICATE_RADIUS_METERS,
  POINTS,
} from '@/lib/constants'
import { geocodeReverse } from '@/lib/geocode'
import { notifyCityUsers } from '@/lib/notify'
import Issue from '@/models/Issue'
import User from '@/models/User'
import InfrastructureAlert from '@/models/InfrastructureAlert'

const AHMEDABAD_CENTER = { lat: 23.0225, lng: 72.5714 }
const EARTH_RADIUS_METERS = 6378137
const VALID_CATEGORIES = new Set([
  'pothole',
  'water_leakage',
  'streetlight',
  'waste',
  'road_damage',
  'drainage',
  'other',
])
const VALID_SEVERITIES = new Set(['low', 'medium', 'high', 'critical'])

const IMAGE_SIGNATURES: Record<string, number[]> = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
}

// WebP has RIFF header (4 bytes) + file size (4 variable bytes) + WEBP (4 bytes)
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46]
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50]

function validateImageMagicBytes(bytes: Buffer): boolean {
  const header = Array.from(bytes.slice(0, 12))

  // Check standard signatures (jpeg, png, gif)
  for (const sig of Object.values(IMAGE_SIGNATURES)) {
    if (header.length >= sig.length && sig.every((b, i) => header[i] === b)) {
      return true
    }
  }

  // Check WebP: bytes 0-3 must be "RIFF" and bytes 8-11 must be "WEBP"
  if (
    header.length >= 12 &&
    WEBP_RIFF.every((b, i) => header[i] === b) &&
    WEBP_MARKER.every((b, i) => header[i + 8] === b)
  ) {
    return true
  }

  return false
}

function getValidCoordinate(value: FormDataEntryValue | null, fallback: number) {
  const coordinate = typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(coordinate) ? coordinate : fallback
}

function getValidLatitude(value: FormDataEntryValue | null) {
  const lat = getValidCoordinate(value, AHMEDABAD_CENTER.lat)
  return lat >= -90 && lat <= 90 ? lat : AHMEDABAD_CENTER.lat
}

function getValidLongitude(value: FormDataEntryValue | null) {
  const lng = getValidCoordinate(value, AHMEDABAD_CENTER.lng)
  return lng >= -180 && lng <= 180 ? lng : AHMEDABAD_CENTER.lng
}

function normalizeCategory(value: string | null | undefined, fallback = 'other') {
  return value && VALID_CATEGORIES.has(value) ? value : fallback
}

function normalizeSeverity(value: string | null | undefined, fallback = 'low') {
  return value && VALID_SEVERITIES.has(value) ? value : fallback
}

function withinRadiusFilter(lng: number, lat: number, radiusMeters: number) {
  return {
    $geoWithin: {
      $centerSphere: [[lng, lat], radiusMeters / EARTH_RADIUS_METERS],
    },
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const reportedBy = searchParams.get('reportedBy')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { ...activeIssueFilter(), 'images.0': { $exists: true } }
    if (category) filter.category = category
    if (status) filter.status = status
    if (reportedBy) filter.reportedBy = reportedBy

    let query
    if (lat && lng) {
      filter.location = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(radius || '5000'),
        },
      }
      query = Issue.find(filter)
    } else {
      query = Issue.find(filter).sort({ priorityScore: -1 })
    }

    const total = await Issue.countDocuments(filter)
    const issues = await query
      .populate('reportedBy', 'name avatar level')
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      issues,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Get issues error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const userId = await getUserIdFromRequest()
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const bodyTitle = formData.get('title') as string | null
    const bodyDescription = formData.get('description') as string | null
    const bodyCategory = formData.get('category') as string | null
    const bodySeverity = formData.get('severity') as string | null
    const rawLat = formData.get('lat')
    const rawLng = formData.get('lng')
    const lat = getValidLatitude(rawLat)
    const lng = getValidLongitude(rawLng)
    const address = formData.get('address') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!validateImageMagicBytes(buffer)) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      )
    }

    const imageBase64 = buffer.toString('base64')

    // STEP 1: Upload image to Cloudinary
    const imageUrl = await uploadImage(imageBase64, file.type || 'image/jpeg')

    // STEP 2: AI Classification via Gemini
    const classification = await classifyIssueImage(imageBase64)
    const finalCategory = classification.issueDetected
      ? normalizeCategory(classification.category, normalizeCategory(bodyCategory))
      : normalizeCategory(bodyCategory)
    const finalSeverity = classification.issueDetected
      ? normalizeSeverity(classification.severity, normalizeSeverity(bodySeverity))
      : normalizeSeverity(bodySeverity)

    // STEP 3: Duplicate Detection (same category, 200m radius, last 7 days, not resolved)
    const sevenDaysAgo = new Date(
      Date.now() - DUPLICATE_DAYS * 24 * 60 * 60 * 1000
    )
    const duplicate = await Issue.findOne({
      ...activeIssueFilter(),
      location: withinRadiusFilter(lng, lat, DUPLICATE_RADIUS_METERS),
      category: finalCategory,
      status: { $ne: 'resolved' },
      createdAt: { $gte: sevenDaysAgo },
    })

    if (duplicate) {
      const duplicateId = duplicate._id.toString()
      const userObjectId = toObjectId(userId)

      let merged = await Issue.findByIdAndUpdate(
        duplicate._id,
        { $inc: { mergedReportsCount: 1 } },
        { returnDocument: 'after' }
      )

      if (!merged) {
        return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
      }

      const withUpvote = await Issue.findOneAndUpdate(
        { _id: duplicate._id, ...activeIssueFilter(), upvotes: { $ne: userObjectId } },
        { $addToSet: { upvotes: userObjectId } },
        { returnDocument: 'after' }
      )

      if (withUpvote) {
        const priorityScore = calculatePriorityScore(
          withUpvote.upvotes.length,
          withUpvote.severity,
          withUpvote.createdAt
        )
        merged = await Issue.findByIdAndUpdate(
          withUpvote._id,
          { $set: { priorityScore } },
          { returnDocument: 'after' }
        )
        const promoted = await promoteIfThresholdReached(duplicateId)
        merged = promoted ?? merged
      } else {
        merged = await Issue.findOne({ _id: duplicate._id, ...activeIssueFilter() })
      }

      return NextResponse.json({ issue: merged, isDuplicate: true })
    }

    // STEP 4: Create Issue with priority score
    const issue = await Issue.create({
      title: classification.title || bodyTitle || 'Civic Issue Reported',
      description:
        classification.description ||
        bodyDescription ||
        'Issue requires attention.',
      category: finalCategory,
      severity: finalSeverity,
      images: [imageUrl],
      location: { type: 'Point', coordinates: [lng, lat], address },
      reportedBy: userId,
      aiClassification: { ...classification },
      priorityScore: calculatePriorityScore(0, finalSeverity, new Date()),
      statusHistory: [{ status: 'reported', changedAt: new Date() }],
    })

    // STEP 5: Infrastructure Alert Check & User Stats (non-fatal — issue is already created)
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const nearbyCount = await Issue.countDocuments({
        ...activeIssueFilter(),
        location: withinRadiusFilter(lng, lat, CLUSTER_RADIUS_METERS),
        category: finalCategory,
        status: { $ne: 'resolved' },
        createdAt: { $gte: thirtyDaysAgo },
      })

      if (nearbyCount >= CLUSTER_THRESHOLD) {
        const nearbyIssues = await Issue.find({
          ...activeIssueFilter(),
          location: withinRadiusFilter(lng, lat, CLUSTER_RADIUS_METERS),
          category: finalCategory,
          status: { $ne: 'resolved' },
        })
          .limit(10)
          .select('_id')

        const aiInsight = await generateAreaInsight(
          finalCategory,
          nearbyCount,
          address || 'this area'
        )

        let alert = await InfrastructureAlert.findOne({
          'zone.center': withinRadiusFilter(lng, lat, CLUSTER_RADIUS_METERS),
          category: finalCategory,
          status: 'active',
        })

        if (alert) {
          alert.issueCount = nearbyCount
          alert.relatedIssues = nearbyIssues.map((i) => i._id)
          alert.aiInsight = aiInsight
          alert.severity = finalSeverity
          await alert.save()
        } else {
          await InfrastructureAlert.create({
            zone: {
              center: { type: 'Point', coordinates: [lng, lat] },
              radiusMeters: CLUSTER_RADIUS_METERS,
            },
            category: finalCategory,
            status: 'active',
            issueCount: nearbyCount,
            relatedIssues: nearbyIssues.map((i) => i._id),
            aiInsight,
            severity: finalSeverity,
          })
        }
      }
    } catch (alertError) {
      console.error('Infrastructure alert check failed (non-fatal):', alertError)
    }

    // Update user stats + points + level + badges
    try {
      await updateUserStatsAndBadges(
        userId,
        { 'stats.reportsSubmitted': 1 },
        POINTS.REPORT
      )
    } catch (statsError) {
      console.error('User stats update failed (non-fatal):', statsError)
    }

    // STEP 6: Notify users in the same city (non-fatal)
    try {
      let issueCity = ''
      // Try to get city from geocode
      if (lat && lng) {
        const geo = await geocodeReverse(lat, lng)
        issueCity = geo.city

        // Also update the issue with ward/city if not set
        if (geo.city || geo.ward) {
          await Issue.findByIdAndUpdate(issue._id, {
            $set: {
              ...(geo.city && { 'location.city': geo.city }),
              ...(geo.ward && { 'location.ward': geo.ward }),
              ...(!address && geo.address && { 'location.address': geo.address }),
            },
          })
        }
      }

      if (issueCity) {
        await notifyCityUsers(
          issueCity,
          userId,
          issue.title,
          issue._id.toString()
        )
      }
    } catch (notifyError) {
      console.error('City notification failed (non-fatal):', notifyError)
    }

    return NextResponse.json({ issue, isDuplicate: false }, { status: 201 })
  } catch (error) {
    console.error('Create issue error:', error)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    )
  }
}
