import mongoose, { Schema, Document } from 'mongoose'

export type NotificationType = 'verified' | 'status_changed' | 'comment' | 'badge' | 'new_issue' | 'upvote_milestone' | 'upvote'

export interface INotification extends Document {
  user: mongoose.Types.ObjectId
  type: NotificationType
  issueId?: mongoose.Types.ObjectId
  message: string
  read: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['verified', 'status_changed', 'comment', 'badge', 'new_issue', 'upvote_milestone', 'upvote'],
      required: true,
    },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

NotificationSchema.index({ user: 1, read: 1 })
NotificationSchema.index({ user: 1, createdAt: -1 })

export default mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema)