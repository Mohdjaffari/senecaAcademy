import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId; // Optional for daily vs subject-wise attendance
  date: Date; // Normalized to YYYY-MM-DD
  recordedByTeacherId: mongoose.Types.ObjectId;
  records: {
    studentId: mongoose.Types.ObjectId;
    status: "present" | "absent" | "late" | "excused";
    remarks?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    date: { type: Date, required: true, index: true },
    recordedByTeacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    records: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
        status: {
          type: String,
          enum: ["present", "absent", "late", "excused"],
          default: "present",
        },
        remarks: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { schoolId: 1, classId: 1, date: 1, subjectId: 1 },
  { unique: true }
);

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
