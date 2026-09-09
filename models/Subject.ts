import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubject extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string; // e.g. "Mathematics", "Computer Science"
  code: string; // e.g. "MATH-101", "CS-501"
  description?: string;
  department?: string; // e.g. "Science", "Humanities"
  creditHours?: number;
  classIds: mongoose.Types.ObjectId[]; // Classes offering this subject
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String },
    department: { type: String, default: "General" },
    creditHours: { type: Number, default: 3 },
    classIds: [{ type: Schema.Types.ObjectId, ref: "Class" }],
  },
  { timestamps: true }
);

SubjectSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;
