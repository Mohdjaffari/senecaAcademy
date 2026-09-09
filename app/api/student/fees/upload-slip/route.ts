import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import connectToDatabase from "@/lib/db/mongodb";
import Fee from "@/models/Fee";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/utils/errors";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to submit fee payment slip.");
    }

    await connectToDatabase();

    const formData = await req.formData();
    const feeId = formData.get("feeId") as string | null;
    const bankName = (formData.get("bankName") as string | null) || "Bank Deposit";
    const transactionRef = (formData.get("transactionRef") as string | null) || "";
    const depositDateStr = formData.get("depositDate") as string | null;
    const notes = (formData.get("notes") as string | null) || "";
    const file = formData.get("file") as File | null;

    if (!feeId) {
      throw new ValidationError("Fee voucher ID is required.");
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw new NotFoundError("Fee voucher not found.");
    }

    // If user is a student, verify this fee belongs to them
    if (session.role === "student") {
      const studentDoc = await Student.findOne({ userId: session.userId });
      if (!studentDoc || fee.studentId.toString() !== studentDoc._id.toString()) {
        throw new AuthorizationError("You are not authorized to modify this fee voucher.");
      }
    }

    if (!file && !fee.paidSlipUrl) {
      throw new ValidationError("Please upload a paid fee slip image or bank deposit receipt.");
    }

    let fileUrl = fee.paidSlipUrl || "";

    if (file && file.size > 0) {
      const MAX_SIZE = 8 * 1024 * 1024; // 8MB
      if (file.size > MAX_SIZE) {
        throw new ValidationError("Uploaded file exceeds the 8 MB limit.");
      }

      const allowedImageMimes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const isImage = allowedImageMimes.includes(file.type);

      if (!isImage && !isPdf) {
        throw new ValidationError("Invalid file format. Please upload a clear JPG, PNG, WebP image or PDF document.");
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (isImage) {
        try {
          const processed = await sharp(buffer)
            .resize({ width: 1400, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();

          const uploadDir = path.join(process.cwd(), "public", "uploads", "fee-slips");
          await fs.mkdir(uploadDir, { recursive: true });
          const filename = `fee_slip_${fee._id}_${Date.now()}.webp`;
          await fs.writeFile(path.join(uploadDir, filename), processed);
          fileUrl = `/uploads/fee-slips/${filename}`;
        } catch (procErr) {
          console.warn("Could not process image via filesystem, storing base64 WebP:", procErr);
          const processed = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();
          fileUrl = `data:image/webp;base64,${processed.toString("base64")}`;
        }
      } else {
        // PDF document
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads", "fee-slips");
          await fs.mkdir(uploadDir, { recursive: true });
          const filename = `fee_slip_${fee._id}_${Date.now()}.pdf`;
          await fs.writeFile(path.join(uploadDir, filename), buffer);
          fileUrl = `/uploads/fee-slips/${filename}`;
        } catch (fsErr) {
          fileUrl = `data:application/pdf;base64,${buffer.toString("base64")}`;
        }
      }
    }

    // Update Fee document
    fee.paidSlipUrl = fileUrl;
    fee.paidSlipBankName = bankName.trim();
    fee.paidSlipTxnRef = transactionRef.trim();
    fee.paidSlipDepositDate = depositDateStr ? new Date(depositDateStr) : new Date();
    fee.paidSlipNotes = notes.trim();
    fee.paidSlipUploadedAt = new Date();
    fee.status = "under_review";
    fee.approvalStatus = "pending";
    fee.rejectionReason = undefined;

    await fee.save();

    return apiSuccess(
      {
        id: fee._id.toString(),
        voucherNumber: fee.voucherNumber,
        status: fee.status,
        approvalStatus: fee.approvalStatus,
        paidSlipUrl: fee.paidSlipUrl,
        paidSlipBankName: fee.paidSlipBankName,
        paidSlipTxnRef: fee.paidSlipTxnRef,
        paidSlipDepositDate: fee.paidSlipDepositDate,
        paidSlipUploadedAt: fee.paidSlipUploadedAt,
      },
      "Paid fee slip uploaded successfully! It is now under verification by the school bursar."
    );
  } catch (error) {
    return apiError(error);
  }
}
