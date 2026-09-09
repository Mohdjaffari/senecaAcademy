import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactSubmission extends Document {
  schoolId?: mongoose.Types.ObjectId;
  submissionId: string; // e.g. "INQ-2026-4921"
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "archived";
  notes?: string;
  repliedAt?: Date;
  repliedByUserId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", index: true },
    submissionId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "in_progress", "replied", "archived"],
      default: "new",
      index: true,
    },
    notes: { type: String, default: "" },
    repliedAt: { type: Date },
    repliedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const ContactSubmission: Model<IContactSubmission> =
  mongoose.models.ContactSubmission ||
  mongoose.model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);

export default ContactSubmission;
