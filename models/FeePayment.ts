import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeePayment extends Document {
  schoolId: mongoose.Types.ObjectId;
  feeId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  receiptNumber: string; // e.g. "RCT-2026-0042"
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "bank_transfer" | "online_card" | "cheque";
  transactionReference?: string;
  receivedByUserId: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeePaymentSchema = new Schema<IFeePayment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    feeId: { type: Schema.Types.ObjectId, ref: "Fee", required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    receiptNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "online_card", "cheque"],
      default: "cash",
    },
    transactionReference: { type: String, trim: true },
    receivedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const FeePayment: Model<IFeePayment> =
  mongoose.models.FeePayment ||
  mongoose.model<IFeePayment>("FeePayment", FeePaymentSchema);

export default FeePayment;
