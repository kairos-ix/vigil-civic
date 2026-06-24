import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import InfrastructureAlert from '@/models/InfrastructureAlert'

export async function GET() {
  try {
    await connectDB()

    const alerts = await InfrastructureAlert.find({ status: 'active' })
      .sort({ issueCount: -1 })
      .limit(10)

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Dashboard alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
