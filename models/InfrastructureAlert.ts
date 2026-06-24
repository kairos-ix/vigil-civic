import mongoose, { Schema, Document } from 'mongoose'

export interface IInfrastructureAlert extends Document {
  zone: {
    center: { type: string; coordinates: number[] }
    radiusMeters: number
  }
  category: string
  issueCount: number
  relatedIssues: mongoose.Types.ObjectId[]
  severity: string
  status: 'active' | 'acknowledged' | 'resolved'
  aiInsight?: string
}

const AlertSchema = new Schema<IInfrastructureAlert>(
  {
    zone: {
      center: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
      },
      radiusMeters: { type: Number, default: 500 },
    },
    category: String,
    issueCount: { type: Number, default: 0 },
    relatedIssues: [{ type: Schema.Types.ObjectId, ref: 'Issue' }],
    severity: String,
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    aiInsight: String,
  },
  { timestamps: true }
)

AlertSchema.index({ 'zone.center': '2dsphere' })

export default mongoose.models.InfrastructureAlert ||
  mongoose.model<IInfrastructureAlert>('InfrastructureAlert', AlertSchema)
