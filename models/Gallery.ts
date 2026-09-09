import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGallery extends Document {
  schoolId: mongoose.Types.ObjectId;
  caption: string;
  subcaption?: string;
  imageUrl: string;
  category: "campus" | "events" | "sports" | "academics" | "lab";
  size: "default" | "large" | "wide";
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGallery>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    caption: { type: String, required: true, trim: true },
    subcaption: { type: String, trim: true },
    imageUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ["campus", "events", "sports", "academics", "lab"],
      default: "campus",
      index: true,
    },
    size: { type: String, enum: ["default", "large", "wide"], default: "default" },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Gallery: Model<IGallery> =
  mongoose.models.Gallery || mongoose.model<IGallery>("Gallery", GallerySchema);

export default Gallery;
