import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string; // e.g. "Science & Mathematics", "Computer Science & IT"
  code: string; // e.g. "SCI-DEPT", "CS-DEPT"
  description?: string;
  headOfDepartmentId?: mongoose.Types.ObjectId; // Teacher ref (HOD)
  wing?: "Early Years" | "Primary" | "Middle" | "Secondary" | "Higher Secondary" | "All Wings";
  colorCode?: string; // Hex color e.g. "#810D0B", "#E27B1F", "#059669"
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    headOfDepartmentId: { type: Schema.Types.ObjectId, ref: "Teacher" },
    wing: {
      type: String,
      enum: ["Early Years", "Primary", "Middle", "Secondary", "Higher Secondary", "All Wings"],
      default: "All Wings",
    },
    colorCode: { type: String, default: "#810D0B" },
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ schoolId: 1, code: 1 }, { unique: true });

export const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
