import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAcademicStream extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string; // e.g. "FSc Pre-Medical (Biology, Chemistry, Physics)"
  code?: string; // e.g. "FSC-MED"
  tier: "Preschool" | "Primary" | "Middle" | "Secondary" | "Higher Secondary" | "All";
  description?: string;
  subjects?: string[];
  status: "active" | "archived" | "inactive";
  isDefault: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicStreamSchema = new Schema<IAcademicStream>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, default: "" },
    tier: {
      type: String,
      enum: ["Preschool", "Primary", "Middle", "Secondary", "Higher Secondary", "All"],
      default: "Higher Secondary",
      index: true,
    },
    description: { type: String, trim: true, default: "" },
    subjects: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["active", "archived", "inactive"],
      default: "active",
      index: true,
    },
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AcademicStreamSchema.index({ schoolId: 1, name: 1, tier: 1 }, { unique: true });

export const AcademicStream: Model<IAcademicStream> =
  mongoose.models.AcademicStream ||
  mongoose.model<IAcademicStream>("AcademicStream", AcademicStreamSchema);

export default AcademicStream;
