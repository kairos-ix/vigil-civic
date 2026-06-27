import { NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import RateLimit from '@/models/RateLimit'

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

export async function isRateLimited(key: string, max: number): Promise<boolean> {
  await connectDB()
  const now = new Date()
  const doc = await RateLimit.findOne({ key })
  if (!doc || doc.resetAt <= now) return false
  return doc.count >= max
}

export async function incrementRateLimit(
  key: string,
  windowMs: number
): Promise<number> {
  await connectDB()
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  const inWindow = await RateLimit.findOneAndUpdate(
    { key, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true }
  )
  if (inWindow) return inWindow.count

  const fresh = await RateLimit.findOneAndUpdate(
    { key },
    { $set: { count: 1, resetAt } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  return fresh!.count
}
