import mongoose, { Schema, Document } from 'mongoose'

export interface IRateLimit extends Document {
  key: string
  count: number
  resetAt: Date
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { timestamps: false }
)

RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.RateLimit ||
  mongoose.model<IRateLimit>('RateLimit', RateLimitSchema)
