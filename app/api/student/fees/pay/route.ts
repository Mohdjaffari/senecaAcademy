import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Fee from "@/models/Fee";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();

    const body = await req.json();
    const { feeId } = body;

    if (!feeId) {
      throw new ValidationError("Fee Voucher ID is required.");
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw new ValidationError("Fee voucher not found.");
    }

    fee.status = "paid";
    fee.paidAmount = fee.totalAmount;
    fee.balanceAmount = 0;
    await fee.save();

    return apiSuccess(
      {
        id: fee._id.toString(),
        status: fee.status,
        voucherNumber: fee.voucherNumber,
        paidAmount: fee.paidAmount,
      },
      "Fee payment recorded successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
