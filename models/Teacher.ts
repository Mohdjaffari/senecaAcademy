import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | any;
  employeeId: string; // e.g. "TCH-2026-001"
  specialization: string;
  qualification: string;
  experienceYears: number;
  assignedClassIds: mongoose.Types.ObjectId[] | any[];
  assignedSubjectIds: mongoose.Types.ObjectId[] | any[];
  headOfClassIds?: mongoose.Types.ObjectId[] | any[]; // Classes where this teacher is Head of Class
  rawPassword?: string;
  joinDate: Date;
  status: "active" | "on_leave" | "terminated";
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, uppercase: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experienceYears: { type: Number, default: 1 },
    assignedClassIds: [{ type: Schema.Types.ObjectId, ref: "Class" }],
    assignedSubjectIds: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    headOfClassIds: [{ type: Schema.Types.ObjectId, ref: "Class" }],
    rawPassword: { type: String },
    joinDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "on_leave", "terminated"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

TeacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });

if (mongoose.models && mongoose.models.Teacher) {
  delete mongoose.models.Teacher;
}

export const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
