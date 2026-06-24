import mongoose, { Schema, Document } from 'mongoose'

export interface IIssue extends Document {
  title: string
  description: string
  category: string
  images: string[]
  location: {
    type: string
    coordinates: number[]
    address?: string
    ward?: string
    city?: string
  }
  status: string
  severity: string
  reportedBy: mongoose.Types.ObjectId
  upvotes: mongoose.Types.ObjectId[]
  verifiedBy: mongoose.Types.ObjectId[]
  aiClassification: {
    category?: string
    severity?: string
    confidence?: number
    rawDescription?: string
    isDuplicate?: boolean
    duplicateOf?: mongoose.Types.ObjectId
  }
  priorityScore: number
  comments: Array<{
    user: mongoose.Types.ObjectId
    text: string
    createdAt: Date
  }>
  statusHistory: Array<{ status: string; changedAt: Date }>
  resolvedAt?: Date
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'pothole',
        'water_leakage',
        'streetlight',
        'waste',
        'road_damage',
        'drainage',
        'other',
      ],
      required: true,
    },
    images: [String],
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], required: true },
      address: String,
      ward: String,
      city: String,
    },
    status: {
      type: String,
      enum: [
        'reported',
        'community_verified',
        'in_progress',
        'resolved',
        'rejected',
      ],
      default: 'reported',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    verifiedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    aiClassification: {
      category: String,
      severity: String,
      confidence: Number,
      rawDescription: String,
      isDuplicate: Boolean,
      duplicateOf: Schema.Types.ObjectId,
    },
    priorityScore: { type: Number, default: 0 },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],
    resolvedAt: Date,
  },
  { timestamps: true }
)

IssueSchema.index({ location: '2dsphere' })
IssueSchema.index({ status: 1 })
IssueSchema.index({ category: 1 })
IssueSchema.index({ priorityScore: -1 })

export default mongoose.models.Issue ||
  mongoose.model<IIssue>('Issue', IssueSchema)
