import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { getUserIdFromRequest } from '@/lib/auth'
import { classifyIssueImage } from '@/lib/gemini'
import { uploadImage } from '@/lib/cloudinary'
import { generateAreaInsight } from '@/lib/gemini'
import { calculatePriorityScore, calculateLevel, getNewBadges } from '@/lib/scoring'
import Issue from '@/models/Issue'
import User from '@/models/User'
import InfrastructureAlert from '@/models/InfrastructureAlert'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {}
    if (category) filter.category = category
    if (status) filter.status = status

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

    const total = await Issue.countDocuments(
      lat && lng ? {} : filter
    )
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
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null
    const bodyTitle = formData.get('title') as string | null
    const bodyDescription = formData.get('description') as string | null
    const bodyCategory = formData.get('category') as string | null
    const bodySeverity = formData.get('severity') as string | null
    const lat = parseFloat(formData.get('lat') as string)
    const lng = parseFloat(formData.get('lng') as string)
    const address = formData.get('address') as string | null

    if (!file || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Image, lat, and lng are required' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const imageBase64 = Buffer.from(bytes).toString('base64')

    // STEP 1: Upload image to Cloudinary
    const imageUrl = await uploadImage(imageBase64)

    // STEP 2: AI Classification via Gemini
    const classification = await classifyIssueImage(imageBase64)
    const finalCategory = classification.issueDetected
      ? classification.category
      : bodyCategory || 'other'
    const finalSeverity = classification.issueDetected
      ? classification.severity
      : bodySeverity || 'low'

    // STEP 3: Duplicate Detection (same category, 200m radius, last 7 days, not resolved)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const duplicate = await Issue.findOne({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 200,
        },
      },
      category: finalCategory,
      status: { $ne: 'resolved' },
      createdAt: { $gte: sevenDaysAgo },
    })

    if (duplicate) {
      if (!duplicate.upvotes.map(String).includes(userId)) {
        duplicate.upvotes.push(userId as unknown as import('mongoose').Types.ObjectId)
        duplicate.priorityScore = calculatePriorityScore(
          duplicate.upvotes.length,
          duplicate.severity,
          duplicate.createdAt
        )
        await duplicate.save()
      }
      return NextResponse.json({ issue: duplicate, isDuplicate: true })
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
      aiClassification: { ...classification, isDuplicate: false },
      priorityScore: calculatePriorityScore(0, finalSeverity, new Date()),
      statusHistory: [{ status: 'reported', changedAt: new Date() }],
    })

    // STEP 5: Infrastructure Alert Check (3+ same category in 500m in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const nearbyCount = await Issue.countDocuments({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: 500,
        },
      },
      category: finalCategory,
      status: { $ne: 'resolved' },
      createdAt: { $gte: thirtyDaysAgo },
    })

    if (nearbyCount >= 3) {
      const nearbyIssues = await Issue.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: 500,
          },
        },
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

      await InfrastructureAlert.findOneAndUpdate(
        {
          'zone.center.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: 500,
            },
          },
          category: finalCategory,
          status: 'active',
        },
        {
          zone: {
            center: { type: 'Point', coordinates: [lng, lat] },
            radiusMeters: 500,
          },
          issueCount: nearbyCount,
          relatedIssues: nearbyIssues.map((i) => i._id),
          aiInsight,
          severity: finalSeverity,
          category: finalCategory,
        },
        { upsert: true, new: true }
      )
    }

    // Update user stats + points + level + badges
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.reportsSubmitted': 1, points: 10 },
      lastActive: new Date(),
    })

    const updatedUser = await User.findById(userId)
    if (updatedUser) {
      const newLevel = calculateLevel(updatedUser.points)
      const newBadges = getNewBadges(
        updatedUser.stats,
        updatedUser.badges.map((b: { name: string }) => b.name)
      )
      if (newLevel !== updatedUser.level || newBadges.length > 0) {
        updatedUser.level = newLevel
        for (const badge of newBadges) {
          updatedUser.badges.push({ ...badge, earnedAt: new Date() })
        }
        await updatedUser.save()
      }
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
