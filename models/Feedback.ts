import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedback extends Document {
  name: string;
  email: string;
  role: "Parent" | "Student" | "Alumni" | "Prospective Parent" | "Visitor" | "Teacher";
  relationship?: string; // e.g. "Parent of Grade 9 & Grade 6 Students"
  studentGrade?: string;
  rating: number; // 1 to 5
  category:
    | "Academic Excellence"
    | "Faculty & Mentorship"
    | "Campus Facilities & Labs"
    | "Discipline & Moral Values"
    | "Admissions & Administration"
    | "Sports & Extracurriculars"
    | "General Review";
  title: string;
  comment: string;
  recommend: boolean;
  avatarUrl?: string;
  status: "approved" | "pending" | "rejected" | "hidden";
  isFeatured: boolean;
  likesCount: number;
  likedByIps?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Email cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: ["Parent", "Student", "Alumni", "Prospective Parent", "Visitor", "Teacher"],
      default: "Parent",
      required: true,
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [120, "Relationship description cannot exceed 120 characters"],
    },
    studentGrade: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: 5,
    },
    category: {
      type: String,
      enum: [
        "Academic Excellence",
        "Faculty & Mentorship",
        "Campus Facilities & Labs",
        "Discipline & Moral Values",
        "Admissions & Administration",
        "Sports & Extracurriculars",
        "General Review",
      ],
      default: "Academic Excellence",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: [15, "Comment must be at least 15 characters long"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    recommend: {
      type: Boolean,
      default: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected", "hidden"],
      default: "approved",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedByIps: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ rating: -1, isFeatured: -1 });
FeedbackSchema.index({ category: 1, role: 1 });

const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;
