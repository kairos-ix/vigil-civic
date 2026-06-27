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
  }
  priorityScore: number
  reporterBonusAwarded: boolean
  notifiedVerified: boolean
  mergedReportsCount: number
  isSeedData: boolean
  comments: Array<{
    user: mongoose.Types.ObjectId
    text: string
    createdAt: Date
  }>
  statusHistory: Array<{
    status: string
    changedAt: Date
    changedBy?: mongoose.Types.ObjectId | null
  }>
  editedAt?: Date | null
  deletedAt?: Date | null
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
    },
    priorityScore: { type: Number, default: 0 },
reporterBonusAwarded: { type: Boolean, default: false },
  notifiedVerified: { type: Boolean, default: false },
  mergedReportsCount: { type: Number, default: 1 },
  isSeedData: { type: Boolean, default: false },
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
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
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
