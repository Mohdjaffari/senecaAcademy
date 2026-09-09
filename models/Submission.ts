import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SubmissionStatus = "submitted" | "late" | "graded" | "resubmitted";

export interface ISubmissionAttachment {
  url: string;
  name: string;
  size?: number;
}

export interface ISubmission extends Document {
  schoolId: Types.ObjectId;
  assignmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  classId: Types.ObjectId;
  submittedAt: Date;
  content?: string;
  attachmentUrls: ISubmissionAttachment[];
  obtainedMarks?: number;
  feedback?: string;
  gradedByTeacherId?: Types.ObjectId;
  gradedAt?: Date;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    submittedAt: { type: Date, default: Date.now },
    content: { type: String, trim: true },
    attachmentUrls: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: Number },
      },
    ],
    obtainedMarks: { type: Number, min: 0 },
    feedback: { type: String, trim: true },
    gradedByTeacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
    gradedAt: { type: Date },
    status: {
      type: String,
      enum: ["submitted", "late", "graded", "resubmitted"],
      default: "submitted",
      index: true,
    },
  },
  { timestamps: true }
);

// Compound unique index ensuring one submission per student per assignment per school
SubmissionSchema.index({ schoolId: 1, assignmentId: 1, studentId: 1 }, { unique: true });
SubmissionSchema.index({ schoolId: 1, classId: 1, status: 1 });

export const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;
