import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
  schoolId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  icon: string;
  colorTheme: "blue" | "orange" | "green" | "red";
  priority: "normal" | "urgent";
  targetRole: "all" | "teachers" | "students" | "public";
  isPublished: boolean;
  publishedAt: Date;
  expiresAt?: Date;
  createdByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    icon: { type: String, default: "📢" },
    colorTheme: { type: String, enum: ["blue", "orange", "green", "red"], default: "blue" },
    priority: { type: String, enum: ["normal", "urgent"], default: "normal" },
    targetRole: { type: String, enum: ["all", "teachers", "students", "public"], default: "all" },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

export default Announcement;
