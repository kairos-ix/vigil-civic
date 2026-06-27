import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  avatar?: string
  points: number
  level: 'newcomer' | 'reporter' | 'verifier' | 'guardian' | 'hero' | 'developer'
  role: 'citizen' | 'official'
  isSeedUser: boolean
  emailVerified?: boolean
  emailVerificationCodeHash?: string
  emailVerificationCodeExpiresAt?: Date
  badges: Array<{ name: string; earnedAt: Date; icon: string }>
  stats: {
    reportsSubmitted: number
    issuesVerified: number
    issuesResolved: number
    upvotesGiven: number
  }
  ward?: string
  city?: string
  lastActive: Date
  resetCodeHash?: string
  resetCodeExpiresAt?: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar: String,
    points: { type: Number, default: 0 },
    level: {
      type: String,
      enum: ['newcomer', 'reporter', 'verifier', 'guardian', 'hero', 'developer'],
      default: 'newcomer',
    },
    role: {
      type: String,
      enum: ['citizen', 'official'],
      default: 'citizen',
    },
    isSeedUser: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: true },
    emailVerificationCodeHash: String,
    emailVerificationCodeExpiresAt: Date,
    badges: [
      {
        name: String,
        earnedAt: { type: Date, default: Date.now },
        icon: String,
      },
    ],
    stats: {
      reportsSubmitted: { type: Number, default: 0 },
      issuesVerified: { type: Number, default: 0 },
      issuesResolved: { type: Number, default: 0 },
      upvotesGiven: { type: Number, default: 0 },
    },
    ward: String,
    city: String,
    lastActive: { type: Date, default: Date.now },
    resetCodeHash: String,
    resetCodeExpiresAt: Date,
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
