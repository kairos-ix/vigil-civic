import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth'
import User from '@/models/User'

const OFFICIAL_EMAIL = 'demoauthority@vigil.com'
const OFFICIAL_PASSWORD = 'demoauthority'

export async function GET() {
  try {
    await connectDB()

    const existing = await User.findOne({ email: OFFICIAL_EMAIL })
    if (existing) {
      return NextResponse.json({
        message: 'Official account already exists',
        user: {
          email: OFFICIAL_EMAIL,
          name: existing.name,
          role: existing.role,
        },
      })
    }

    const passwordHash = await hashPassword(OFFICIAL_PASSWORD)
    const user = await User.create({
      name: 'Demo Authority',
      email: OFFICIAL_EMAIL,
      passwordHash,
      role: 'official',
      level: 'guardian',
      points: 100,
      isSeedUser: true,
      city: 'Ahmedabad',
      ward: 'Navrangpura',
      badges: [
        { name: 'Official Badge', earnedAt: new Date(), icon: '🛡️' },
      ],
      stats: {
        reportsSubmitted: 0,
        issuesVerified: 0,
        issuesResolved: 0,
        upvotesGiven: 0,
      },
    })

    return NextResponse.json(
      {
        message: 'Official account created successfully',
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed official account' },
      { status: 500 }
    )
  }
}
