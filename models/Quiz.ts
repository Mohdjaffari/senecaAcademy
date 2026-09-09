import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuizQuestion {
  question: string;
  type: "multiple_choice" | "true_false";
  options: string[];
  correctAnswer: number; // 0-indexed index
  marks: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: IQuizQuestion[];
  startDate: Date;
  endDate: Date;
  status: "draft" | "published" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    type: { type: String, enum: ["multiple_choice", "true_false"], default: "multiple_choice" },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    marks: { type: Number, required: true, default: 1 },
    explanation: { type: String },
  },
  { _id: true }
);

const QuizSchema = new Schema<IQuiz>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    durationMinutes: { type: Number, required: true, default: 15 },
    totalMarks: { type: Number, required: true, default: 10 },
    passingMarks: { type: Number, required: true, default: 5 },
    questions: [QuizQuestionSchema],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

export const Quiz: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
