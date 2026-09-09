import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssignment extends Document {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  totalMarks: number;
  dueDate: Date;
  attachmentUrls: {
    url: string;
    name: string;
    size?: number;
  }[];
  status: "draft" | "published" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
    dueDate: { type: Date, required: true, index: true },
    attachmentUrls: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);

export default Assignment;
