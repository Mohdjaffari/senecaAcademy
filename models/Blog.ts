import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlog extends Document {
  schoolId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: string;
  tags: string[];
  authorName: string;
  authorId?: mongoose.Types.ObjectId;
  status: "draft" | "published";
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    category: { type: String, default: "Academics", index: true },
    tags: [{ type: String }],
    authorName: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["draft", "published"], default: "published", index: true },
    publishedAt: { type: Date, default: Date.now },
    seoTitle: { type: String },
    seoDescription: { type: String },
  },
  { timestamps: true }
);

BlogSchema.index({ schoolId: 1, slug: 1 }, { unique: true });

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
