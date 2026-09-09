import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBankAccount {
  id?: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban?: string;
  branchName?: string;
  branchCode?: string;
  routingCode?: string; // 1Link / Raast Biller ID
  instructions?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface ISchool extends Document {
  name: string;
  code: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  websiteUrl?: string;
  currentAcademicYearId?: mongoose.Types.ObjectId;
  status: "active" | "inactive";
  bankAccounts?: IBankAccount[];
  settings: {
    themeColor?: string;
    currency: string;
    timezone: string;
    gradingSystem: "percentage" | "gpa";
  };
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    bankName: { type: String, required: true, trim: true },
    accountTitle: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    iban: { type: String, trim: true, default: "" },
    branchName: { type: String, trim: true, default: "" },
    branchCode: { type: String, trim: true, default: "" },
    routingCode: { type: String, trim: true, default: "" },
    instructions: { type: String, trim: true, default: "" },
    isPrimary: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true }
);

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    websiteUrl: { type: String },
    currentAcademicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    bankAccounts: { type: [BankAccountSchema], default: [] },
    settings: {
      themeColor: { type: String, default: "#810D0B" },
      currency: { type: String, default: "PKR" },
      timezone: { type: String, default: "Asia/Karachi" },
      gradingSystem: { type: String, enum: ["percentage", "gpa"], default: "percentage" },
    },
  },
  { timestamps: true }
);

export const School: Model<ISchool> =
  mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema);

export default School;
