import { connectDB } from '../lib/mongodb'
import User from '../models/User'
import { computeBatchUserStats } from '../lib/computeUserStats'

async function syncAllUsers() {
  try {
    console.log('Connecting to DB...')
    await connectDB()
    console.log('Connected.')

    console.log('Fetching all users...')
    const users = await User.find({}).select('_id')
    const userIds = users.map(u => u._id)
    console.log(`Found ${userIds.length} users.`)

    console.log('Computing live stats for all users...')
    const computedDataMap = await computeBatchUserStats(userIds)

    console.log('Updating database...')
    let updatedCount = 0
    for (const userId of userIds) {
      const id = userId.toString()
      const computed = computedDataMap.get(id)
      
      if (computed) {
        await User.findByIdAndUpdate(userId, {
          $set: {
            stats: computed.stats,
            points: computed.points,
            level: computed.level
          }
        })
        updatedCount++
      }
    }

    console.log(`Successfully synced ${updatedCount} users.`)
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

syncAllUsers()
