import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacherApplication extends Document {
  schoolId: mongoose.Types.ObjectId;
  applicationId: string; // e.g. "APP_1713400000000"
  name: string;
  email: string;
  phone: string;
  subject: string;
  experienceYears: string;
  qualification: string;
  coverLetter?: string;
  cvUrl: string;
  cvFileName: string;
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired";
  reviewedByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherApplicationSchema = new Schema<ITeacherApplication>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    applicationId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    experienceYears: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    coverLetter: { type: String },
    cvUrl: { type: String, required: true },
    cvFileName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
      index: true,
    },
    reviewedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const TeacherApplication: Model<ITeacherApplication> =
  mongoose.models.TeacherApplication ||
  mongoose.model<ITeacherApplication>("TeacherApplication", TeacherApplicationSchema);

export default TeacherApplication;
