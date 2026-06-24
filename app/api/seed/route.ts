import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth'
import User from '@/models/User'
import Issue from '@/models/Issue'
import InfrastructureAlert from '@/models/InfrastructureAlert'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    await connectDB()

    // Clear existing data
    await User.deleteMany({})
    await Issue.deleteMany({})
    await InfrastructureAlert.deleteMany({})

    const passwordHash = await hashPassword('password123')

    // Create 5 demo users
    const users = await User.insertMany([
      {
        name: 'Aarav Patel',
        email: 'aarav@demo.com',
        passwordHash,
        points: 450,
        level: 'guardian',
        badges: [
          { name: 'First Step', icon: '🏁', earnedAt: new Date() },
          { name: 'On Fire', icon: '🔥', earnedAt: new Date() },
        ],
        stats: { reportsSubmitted: 12, issuesVerified: 8, issuesResolved: 3, upvotesGiven: 15 },
        city: 'Ahmedabad',
        ward: 'Navrangpura',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@demo.com',
        passwordHash,
        points: 280,
        level: 'verifier',
        badges: [{ name: 'First Step', icon: '🏁', earnedAt: new Date() }],
        stats: { reportsSubmitted: 8, issuesVerified: 15, issuesResolved: 2, upvotesGiven: 20 },
        city: 'Ahmedabad',
        ward: 'Satellite',
      },
      {
        name: 'Rahul Mehta',
        email: 'rahul@demo.com',
        passwordHash,
        points: 150,
        level: 'verifier',
        badges: [{ name: 'First Step', icon: '🏁', earnedAt: new Date() }],
        stats: { reportsSubmitted: 5, issuesVerified: 12, issuesResolved: 1, upvotesGiven: 10 },
        city: 'Ahmedabad',
        ward: 'Vastrapur',
      },
      {
        name: 'Neha Desai',
        email: 'neha@demo.com',
        passwordHash,
        points: 75,
        level: 'reporter',
        badges: [{ name: 'First Step', icon: '🏁', earnedAt: new Date() }],
        stats: { reportsSubmitted: 3, issuesVerified: 5, issuesResolved: 0, upvotesGiven: 8 },
        city: 'Ahmedabad',
        ward: 'Paldi',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@demo.com',
        passwordHash,
        points: 30,
        level: 'newcomer',
        badges: [],
        stats: { reportsSubmitted: 1, issuesVerified: 2, issuesResolved: 0, upvotesGiven: 3 },
        city: 'Ahmedabad',
        ward: 'Maninagar',
      },
    ])

    // Ahmedabad center: 23.0225, 72.5714
    // Create 25 realistic issues around Ahmedabad
    const issueData = [
      { title: 'Large pothole on SG Highway', description: 'Deep pothole causing traffic slowdown near Iskon cross roads. Multiple vehicles damaged.', category: 'pothole', severity: 'critical', lat: 23.0300, lng: 72.5100, address: 'SG Highway, Ahmedabad', ward: 'Bodakdev' },
      { title: 'Water pipe burst on CG Road', description: 'Major water leakage from broken main pipe. Road is flooded and slippery.', category: 'water_leakage', severity: 'high', lat: 23.0350, lng: 72.5600, address: 'CG Road, Navrangpura', ward: 'Navrangpura' },
      { title: 'Broken streetlight near Law Garden', description: 'Streetlight not working for past 3 days. Area is very dark at night.', category: 'streetlight', severity: 'medium', lat: 23.0290, lng: 72.5620, address: 'Law Garden, Ellisbridge', ward: 'Ellisbridge' },
      { title: 'Garbage dump on Ashram Road', description: 'Overflowing garbage bin attracting stray animals. Strong odor in the area.', category: 'waste', severity: 'high', lat: 23.0400, lng: 72.5700, address: 'Ashram Road, Usmanpura', ward: 'Usmanpura' },
      { title: 'Cracked road divider at Nehru Bridge', description: 'Road divider broken causing dangerous conditions for two-wheelers.', category: 'road_damage', severity: 'high', lat: 23.0200, lng: 72.5800, address: 'Nehru Bridge, Ahmedabad', ward: 'Kalupur' },
      { title: 'Blocked drainage at Manek Chowk', description: 'Drainage blocked causing water logging during rains. Mosquito breeding ground.', category: 'drainage', severity: 'critical', lat: 23.0260, lng: 72.5830, address: 'Manek Chowk, Old City', ward: 'Kalupur' },
      { title: 'Pothole cluster near IIM Ahmedabad', description: 'Series of potholes on the road leading to IIM. Very dangerous for cyclists.', category: 'pothole', severity: 'high', lat: 23.0320, lng: 72.5280, address: 'Near IIM, Vastrapur', ward: 'Vastrapur' },
      { title: 'Water leakage at Satellite junction', description: 'Continuous water leak from underground pipe at the main junction.', category: 'water_leakage', severity: 'medium', lat: 23.0150, lng: 72.5250, address: 'Satellite Road, Ahmedabad', ward: 'Satellite' },
      { title: 'Multiple streetlights out on Ring Road', description: '5-6 consecutive streetlights not working. Stretch is accident-prone at night.', category: 'streetlight', severity: 'high', lat: 23.0500, lng: 72.5500, address: 'Ring Road, Ranip', ward: 'Ranip' },
      { title: 'Construction waste dumped near Sabarmati', description: 'Illegal construction debris dumped near river bank. Environmental hazard.', category: 'waste', severity: 'critical', lat: 23.0450, lng: 72.5780, address: 'Sabarmati Riverfront', ward: 'Sabarmati' },
      { title: 'Deep pothole near Paldi crossroads', description: 'Pothole filled with water making it invisible to drivers. Two accidents reported.', category: 'pothole', severity: 'critical', lat: 23.0100, lng: 72.5650, address: 'Paldi, Ahmedabad', ward: 'Paldi' },
      { title: 'Sewage overflow at Naroda', description: 'Sewage overflowing onto main road. Extremely unhygienic conditions for residents.', category: 'drainage', severity: 'critical', lat: 23.0700, lng: 72.6100, address: 'Naroda, Ahmedabad', ward: 'Naroda' },
      { title: 'Damaged road surface on 132ft Ring Road', description: 'Large section of road surface peeled off exposing gravel underneath.', category: 'road_damage', severity: 'medium', lat: 23.0380, lng: 72.5400, address: '132ft Ring Road', ward: 'Satellite' },
      { title: 'Garbage pile near Jivraj Park', description: 'Uncollected garbage for over a week. Health hazard for nearby school.', category: 'waste', severity: 'high', lat: 23.0050, lng: 72.5550, address: 'Jivraj Park, Ahmedabad', ward: 'Jivraj Park' },
      { title: 'Broken water meter leaking', description: 'Municipal water meter broken and leaking continuously. Water wastage issue.', category: 'water_leakage', severity: 'low', lat: 23.0180, lng: 72.5450, address: 'Ambawadi, Ahmedabad', ward: 'Ambawadi' },
      { title: 'Pothole on Drive-in Road', description: 'Pothole right at the speed breaker causing vehicles to swerve dangerously.', category: 'pothole', severity: 'high', lat: 23.0480, lng: 72.5350, address: 'Drive-in Road, Thaltej', ward: 'Thaltej' },
      { title: 'Streetlight flickering at Shivranjani', description: 'Streetlight has been flickering for weeks, creating disorienting effect for drivers.', category: 'streetlight', severity: 'low', lat: 23.0130, lng: 72.5300, address: 'Shivranjani Crossroads', ward: 'Satellite' },
      { title: 'Road cave-in near Bopal', description: 'Small road cave-in due to underground water erosion. Barricaded but not fixed.', category: 'road_damage', severity: 'critical', lat: 22.9900, lng: 72.5050, address: 'Bopal, Ahmedabad', ward: 'Bopal' },
      { title: 'Open drain cover at Navrangpura', description: 'Drain cover missing creating safety hazard for pedestrians, especially at night.', category: 'drainage', severity: 'high', lat: 23.0370, lng: 72.5580, address: 'Navrangpura, Ahmedabad', ward: 'Navrangpura' },
      { title: 'Overflowing dustbin near Kankaria Lake', description: 'Public dustbins overflowing near popular tourist spot. Bad impression on visitors.', category: 'waste', severity: 'medium', lat: 23.0070, lng: 72.5960, address: 'Kankaria Lake, Ahmedabad', ward: 'Maninagar' },
      { title: 'Pothole on university road', description: 'Multiple potholes near Gujarat University main gate causing traffic congestion.', category: 'pothole', severity: 'high', lat: 23.0340, lng: 72.5470, address: 'University Road, Ahmedabad', ward: 'Navrangpura' },
      { title: 'Water logging at Vastral', description: 'Chronic water logging issue during monsoon. Residents unable to commute.', category: 'drainage', severity: 'high', lat: 23.0100, lng: 72.6300, address: 'Vastral, Ahmedabad', ward: 'Vastral' },
      { title: 'Streetlight pole tilting dangerously', description: 'Streetlight pole leaning at 45 degrees. Could fall on vehicles or pedestrians any time.', category: 'streetlight', severity: 'critical', lat: 23.0550, lng: 72.5650, address: 'CTM Crossroads, Ahmedabad', ward: 'Amraiwadi' },
      { title: 'Illegal dumping near BRTS corridor', description: 'Regular dumping of household waste near BRTS bus stops. Very unsightly.', category: 'waste', severity: 'medium', lat: 23.0250, lng: 72.5150, address: 'BRTS Corridor, SG Highway', ward: 'Bodakdev' },
      { title: 'Speed breaker damaged on SP Ring Road', description: 'Speed breaker partially broken creating dangerous road bump for two-wheelers.', category: 'road_damage', severity: 'medium', lat: 22.9950, lng: 72.5400, address: 'SP Ring Road, Ahmedabad', ward: 'South Bopal' },
    ]

    const statuses = ['reported', 'reported', 'reported', 'community_verified', 'in_progress', 'resolved'] as const
    const createdIssues = []

    for (let i = 0; i < issueData.length; i++) {
      const d = issueData[i]
      const reporter = users[i % users.length]
      const status = statuses[i % statuses.length]
      const daysAgo = Math.floor(Math.random() * 20) + 1
      const createdAt = new Date(Date.now() - daysAgo * 86400000)

      const upvoters = users
        .filter((u) => u._id.toString() !== reporter._id.toString())
        .slice(0, Math.floor(Math.random() * 4))

      const issue = await Issue.create({
        title: d.title,
        description: d.description,
        category: d.category,
        severity: d.severity,
        images: [`https://placehold.co/800x600/1D4ED8/white?text=${encodeURIComponent(d.category)}`],
        location: {
          type: 'Point',
          coordinates: [d.lng, d.lat],
          address: d.address,
          ward: d.ward,
          city: 'Ahmedabad',
        },
        status,
        reportedBy: reporter._id,
        upvotes: upvoters.map((u) => u._id),
        aiClassification: {
          category: d.category,
          severity: d.severity,
          confidence: 0.85 + Math.random() * 0.15,
          isDuplicate: false,
        },
        priorityScore: Math.floor(Math.random() * 40) + 10,
        statusHistory: [{ status: 'reported', changedAt: createdAt }],
        createdAt,
        resolvedAt: status === 'resolved' ? new Date() : undefined,
      })

      createdIssues.push(issue)
    }

    // Create 3 infrastructure alerts
    await InfrastructureAlert.insertMany([
      {
        zone: { center: { type: 'Point', coordinates: [72.5100, 23.0300] }, radiusMeters: 500 },
        category: 'pothole',
        issueCount: 5,
        relatedIssues: createdIssues.filter((i) => i.category === 'pothole').slice(0, 5).map((i) => i._id),
        severity: 'critical',
        status: 'active',
        aiInsight: 'Multiple pothole reports concentrated on SG Highway corridor. Road resurfacing recommended for the 2km stretch between Iskon and Bodakdev junction.',
      },
      {
        zone: { center: { type: 'Point', coordinates: [72.5830, 23.0260] }, radiusMeters: 500 },
        category: 'drainage',
        issueCount: 4,
        relatedIssues: createdIssues.filter((i) => i.category === 'drainage').slice(0, 4).map((i) => i._id),
        severity: 'critical',
        status: 'active',
        aiInsight: 'Drainage infrastructure in Old City area showing systemic failure. Pre-monsoon inspection and clearing of 3 major storm drains recommended immediately.',
      },
      {
        zone: { center: { type: 'Point', coordinates: [72.5780, 23.0450] }, radiusMeters: 500 },
        category: 'waste',
        issueCount: 3,
        relatedIssues: createdIssues.filter((i) => i.category === 'waste').slice(0, 3).map((i) => i._id),
        severity: 'high',
        status: 'active',
        aiInsight: 'Waste management gaps identified near Sabarmati Riverfront. Increased collection frequency and placement of additional bins recommended.',
      },
    ])

    return NextResponse.json({
      message: 'Seeded successfully',
      users: users.length,
      issues: createdIssues.length,
      alerts: 3,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}
