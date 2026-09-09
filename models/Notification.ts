import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  schoolId: mongoose.Types.ObjectId;
  recipientUserId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type:
    | "assignment"
    | "submission"
    | "quiz"
    | "exam"
    | "attendance"
    | "fee"
    | "admission"
    | "message"
    | "announcement"
    | "system";
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    recipientUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "assignment",
        "submission",
        "quiz",
        "exam",
        "attendance",
        "fee",
        "admission",
        "message",
        "announcement",
        "system",
      ],
      default: "system",
      index: true,
    },
    actionUrl: { type: String },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
