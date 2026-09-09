import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimetable extends Document {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId | any;
  academicYearId?: mongoose.Types.ObjectId | any;
  classId: mongoose.Types.ObjectId | any;
  subjectId: mongoose.Types.ObjectId | any;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  periodNumber: number; // 1, 2, 3, 4, 5, 6, 7, 8
  startTime: string; // e.g. "08:30 AM" or "08:30"
  endTime: string; // e.g. "09:15 AM" or "09:15"
  roomNumber?: string; // e.g. "Room 101", "Physics Lab", "Auditorium"
  notes?: string;
  status: "active" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
      index: true,
    },
    periodNumber: { type: Number, required: true, default: 1 },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    roomNumber: { type: String, trim: true, default: "Standard Classroom" },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent same teacher having 2 different classes on the same day and period
TimetableSchema.index({ schoolId: 1, teacherId: 1, dayOfWeek: 1, periodNumber: 1 });
// Prevent same class having 2 different periods at the same time
TimetableSchema.index({ schoolId: 1, classId: 1, dayOfWeek: 1, periodNumber: 1 });

if (mongoose.models && mongoose.models.Timetable) {
  delete mongoose.models.Timetable;
}

export const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);

export default Timetable;
