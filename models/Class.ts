import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClass extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  name: string; // e.g. "Grade 5", "Class 9", "Nursery", "Grade 11"
  gradeLevel: number; // numeric order, e.g. 0 (Nursery), 1..11
  section: string; // e.g. "A", "B", "C", "D"
  capacity: number;
  departmentId?: mongoose.Types.ObjectId; // Department ref
  stream?: string; // e.g. "Science", "Commerce", "Pre-Medical", "General"
  classTeacherId?: mongoose.Types.ObjectId; // Teacher ref
  roomNumber?: string;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true, index: true },
    name: { type: String, required: true, trim: true },
    gradeLevel: { type: Number, required: true, index: true },
    section: { type: String, required: true, uppercase: true, trim: true, default: "A" },
    capacity: { type: Number, default: 35 },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    stream: { type: String, trim: true, default: "General" },
    classTeacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
    roomNumber: { type: String, trim: true },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

ClassSchema.index(
  { schoolId: 1, academicYearId: 1, name: 1, section: 1 },
  { unique: true }
);

export const Class: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);

export default Class;
