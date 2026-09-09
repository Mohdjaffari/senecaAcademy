import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/lib/auth/permissions";

export interface IUser extends Document {
  schoolId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  rawPassword?: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  status: "active" | "pending" | "suspended" | "deactivated";
  customPermissions: string[];
  lastLoginAt?: Date;
  profileModel?: "Principal" | "Teacher" | "Student";
  profileId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    rawPassword: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "principal", "teacher", "student", "user"],
      default: "user",
      required: true,
      index: true,
    },
    avatarUrl: { type: String },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "pending", "suspended", "deactivated"],
      default: "active",
      index: true,
    },
    customPermissions: [{ type: String }],
    lastLoginAt: { type: Date },
    profileModel: { type: String, enum: ["Principal", "Teacher", "Student"] },
    profileId: { type: Schema.Types.ObjectId, refPath: "profileModel" },
  },
  { timestamps: true }
);

UserSchema.index({ schoolId: 1, email: 1 }, { unique: true });

// Ensure Mongoose hot-reloads the schema with updated enum values in Next.js dev server
if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
