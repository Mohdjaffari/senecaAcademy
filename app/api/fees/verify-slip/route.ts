import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Fee from "@/models/Fee";
import FeePayment from "@/models/FeePayment";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only School Administrators and Bursars can verify fee payment slips.");
    }

    await connectToDatabase();

    const body = await req.json();
    const { feeId, action, rejectionReason, notes } = body;

    if (!feeId) {
      throw new ValidationError("Fee Voucher ID is required.");
    }

    if (!action || !["approve", "reject"].includes(action)) {
      throw new ValidationError("Invalid verification action. Must be 'approve' or 'reject'.");
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw new NotFoundError("Fee voucher not found.");
    }

    if (action === "approve") {
      fee.status = "paid";
      fee.paidAmount = fee.totalAmount;
      fee.balanceAmount = 0;
      fee.approvalStatus = "approved";
      fee.rejectionReason = undefined;
      fee.verifiedByUserId = session.userId as any;
      fee.verifiedAt = new Date();

      await fee.save();

      // Generate official FeePayment receipt record
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const receiptNumber = `RCT-${year}-${randomSuffix}`;

      let paymentMethod: "cash" | "bank_transfer" | "online_card" | "cheque" = "bank_transfer";
      const bankLower = (fee.paidSlipBankName || "").toLowerCase();
      if (bankLower.includes("card") || bankLower.includes("online") || bankLower.includes("1link")) {
        paymentMethod = "online_card";
      } else if (bankLower.includes("cash")) {
        paymentMethod = "cash";
      }

      const payment = await FeePayment.create({
        schoolId: fee.schoolId,
        feeId: fee._id,
        studentId: fee.studentId,
        receiptNumber,
        amount: fee.totalAmount,
        paymentDate: fee.paidSlipDepositDate || new Date(),
        paymentMethod,
        transactionReference: fee.paidSlipTxnRef || `SLIP-${fee.voucherNumber}`,
        receivedByUserId: session.userId,
        notes: notes || `Verified paid challan slip deposited at ${fee.paidSlipBankName || "Bank"}.`,
      });

      return apiSuccess(
        {
          id: fee._id.toString(),
          voucherNumber: fee.voucherNumber,
          status: fee.status,
          approvalStatus: fee.approvalStatus,
          receiptNumber: payment.receiptNumber,
          paidAmount: fee.paidAmount,
          verifiedAt: fee.verifiedAt,
        },
        `Fee challan #${fee.voucherNumber} approved successfully! Official receipt ${receiptNumber} generated.`
      );
    } else {
      // Reject action
      if (!rejectionReason || !rejectionReason.trim()) {
        throw new ValidationError("A reason for rejecting the paid fee slip is required.");
      }

      fee.status = "pending";
      fee.approvalStatus = "rejected";
      fee.rejectionReason = rejectionReason.trim();
      fee.verifiedByUserId = session.userId as any;
      fee.verifiedAt = new Date();

      await fee.save();

      return apiSuccess(
        {
          id: fee._id.toString(),
          voucherNumber: fee.voucherNumber,
          status: fee.status,
          approvalStatus: fee.approvalStatus,
          rejectionReason: fee.rejectionReason,
          verifiedAt: fee.verifiedAt,
        },
        `Fee challan #${fee.voucherNumber} marked as rejected. Student will be prompted to re-upload.`
      );
    }
  } catch (error) {
    return apiError(error);
  }
}
