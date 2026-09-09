import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAcademicYear extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string; // e.g. "2026-2027"
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  terms: {
    name: string; // e.g. "Term 1", "Final Term"
    startDate: Date;
    endDate: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AcademicYearSchema = new Schema<IAcademicYear>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    terms: [
      {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

AcademicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const AcademicYear: Model<IAcademicYear> =
  mongoose.models.AcademicYear ||
  mongoose.model<IAcademicYear>("AcademicYear", AcademicYearSchema);

export default AcademicYear;
