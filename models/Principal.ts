import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPrincipal extends Document {
  schoolId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | any;
  qualification: string;
  experienceYears: number;
  message?: string;
  signatureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrincipalSchema = new Schema<IPrincipal>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    qualification: { type: String, default: "M.Ed / Ph.D" },
    experienceYears: { type: Number, default: 15 },
    message: { type: String },
    signatureUrl: { type: String },
  },
  { timestamps: true }
);

export const Principal: Model<IPrincipal> =
  mongoose.models.Principal || mongoose.model<IPrincipal>("Principal", PrincipalSchema);

export default Principal;
