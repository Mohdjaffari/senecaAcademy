import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFee extends Document {
  schoolId: mongoose.Types.ObjectId;
  academicYearId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  voucherNumber: string; // e.g. "VCH-2026-05-0012"
  month: string; // e.g. "May 2026", "First Term 2026"
  tuitionFee: number;
  admissionFee: number;
  securityFee?: number;
  examFee: number;
  otherCharges: number;
  discount: number;
  fine: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: Date;
  status: "paid" | "partial" | "pending" | "overdue" | "under_review";
  // Paid slip verification fields
  paidSlipUrl?: string;
  paidSlipBankName?: string;
  paidSlipTxnRef?: string;
  paidSlipDepositDate?: Date;
  paidSlipNotes?: string;
  paidSlipUploadedAt?: Date;
  approvalStatus?: "none" | "pending" | "approved" | "rejected";
  rejectionReason?: string;
  verifiedByUserId?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema = new Schema<IFee>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    voucherNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    month: { type: String, required: true, trim: true },
    tuitionFee: { type: Number, default: 0 },
    admissionFee: { type: Number, default: 0 },
    securityFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    fine: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["paid", "partial", "pending", "overdue", "under_review"],
      default: "pending",
      index: true,
    },
    paidSlipUrl: { type: String, trim: true },
    paidSlipBankName: { type: String, trim: true },
    paidSlipTxnRef: { type: String, trim: true },
    paidSlipDepositDate: { type: Date },
    paidSlipNotes: { type: String, trim: true },
    paidSlipUploadedAt: { type: Date },
    approvalStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },
    rejectionReason: { type: String, trim: true },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const Fee: Model<IFee> =
  mongoose.models.Fee || mongoose.model<IFee>("Fee", FeeSchema);

export default Fee;
