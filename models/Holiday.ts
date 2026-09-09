import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHoliday extends Document {
  schoolId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type:
    | "national_holiday"
    | "academic_break"
    | "religious_holiday"
    | "emergency_closure"
    | "school_event"
    | "exam_prep";
  targetAudience: "all" | "teachers" | "students";
  isPublished: boolean;
  autoCreateNotice: boolean;
  noticeId?: mongoose.Types.ObjectId | any;
  createdByUserId?: mongoose.Types.ObjectId | any;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    type: {
      type: String,
      enum: [
        "national_holiday",
        "academic_break",
        "religious_holiday",
        "emergency_closure",
        "school_event",
        "exam_prep",
      ],
      default: "national_holiday",
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ["all", "teachers", "students"],
      default: "all",
      index: true,
    },
    isPublished: { type: Boolean, default: true, index: true },
    autoCreateNotice: { type: Boolean, default: true },
    noticeId: { type: Schema.Types.ObjectId, ref: "Announcement" },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

HolidaySchema.index({ schoolId: 1, startDate: 1, endDate: 1 });

if (mongoose.models && mongoose.models.Holiday) {
  delete mongoose.models.Holiday;
}

export const Holiday: Model<IHoliday> =
  mongoose.models.Holiday || mongoose.model<IHoliday>("Holiday", HolidaySchema);

export default Holiday;
