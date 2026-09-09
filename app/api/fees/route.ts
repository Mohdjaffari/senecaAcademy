import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Fee from "@/models/Fee";
import FeePayment from "@/models/FeePayment";
import Student from "@/models/Student";
import Class from "@/models/Class";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import User from "@/models/User";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view fee records.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const month = searchParams.get("month");
    const search = searchParams.get("search");

    // Automatically check and update overdue status for unpaid fees past due date
    const now = new Date();
    await Fee.updateMany(
      {
        status: { $in: ["pending", "partial"] },
        dueDate: { $lt: now },
      },
      { $set: { status: "overdue" } }
    );

    const query: any = {};
    if (session.role === "student") {
      const studentDoc = await Student.findOne({ userId: session.userId });
      if (studentDoc) {
        query.studentId = studentDoc._id;
      } else {
        return apiSuccess(
          {
            fees: [],
            summary: {
              totalBilled: 0,
              totalCollected: 0,
              totalPending: 0,
              totalOverdue: 0,
              collectionRate: 0,
              statusCounts: { all: 0, paid: 0, partial: 0, pending: 0, overdue: 0, under_review: 0 },
            },
            recentPayments: [],
          },
          "No student record found."
        );
      }
    }

    if (status !== "all") query.status = status;
    if (classId && classId !== "all") query.classId = classId;
    if (studentId && studentId !== "all") query.studentId = studentId;
    if (month && month !== "all") query.month = month;

    const [fees, allFeesForSummary, recentPayments] = await Promise.all([
      Fee.find(query)
        .populate({
          path: "studentId",
          select: "admissionNumber rollNumber feeCategory guardian userId",
          populate: { path: "userId", select: "name email phone avatarUrl" },
        })
        .populate("classId", "name section gradeLevel stream")
        .sort({ createdAt: -1 })
        .limit(200)
        .lean(),

      // Aggregate global summary across all fee records in the school
      Fee.find(session.role === "student" ? query : {}).lean(),

      // Recent 50 payments for the reconciliation ledger
      FeePayment.find(session.role === "student" ? query : {})
        .populate({
          path: "studentId",
          select: "admissionNumber rollNumber userId classId",
          populate: [
            { path: "userId", select: "name email phone" },
            { path: "classId", select: "name section" },
          ],
        })
        .populate("feeId", "voucherNumber month totalAmount")
        .populate("receivedByUserId", "name email role")
        .sort({ paymentDate: -1, createdAt: -1 })
        .limit(50)
        .lean(),
    ]);

    let formatted = fees.map((f: any) => ({
      id: f._id.toString(),
      voucherNumber: f.voucherNumber,
      month: f.month,
      studentId: f.studentId?._id?.toString() || "",
      studentName: f.studentId?.userId?.name || "Enrolled Student",
      studentEmail: f.studentId?.userId?.email || "",
      studentPhone: f.studentId?.userId?.phone || "",
      fatherName: f.studentId?.guardian?.fatherName || "Parent / Guardian",
      fatherPhone: f.studentId?.guardian?.phone || "",
      feeCategory: f.studentId?.feeCategory || "Standard",
      admissionNumber: f.studentId?.admissionNumber || "SEN-N/A",
      rollNumber: f.studentId?.rollNumber || "ROL-00",
      classId: f.classId?._id?.toString() || "",
      className: f.classId ? `${f.classId.name} - Section ${f.classId.section}` : "Class Section",
      rawClassName: f.classId?.name || "Class",
      section: f.classId?.section || "A",
      tuitionFee: f.tuitionFee || 0,
      admissionFee: f.admissionFee || 0,
      securityFee: f.securityFee || 0,
      examFee: f.examFee || 0,
      otherCharges: f.otherCharges || 0,
      discount: f.discount || 0,
      fine: f.fine || 0,
      totalAmount: f.totalAmount,
      paidAmount: f.paidAmount || 0,
      balanceAmount: f.balanceAmount,
      dueDate: f.dueDate,
      formattedDueDate: new Date(f.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status: f.status,
      paidSlipUrl: f.paidSlipUrl || "",
      paidSlipBankName: f.paidSlipBankName || "",
      paidSlipTxnRef: f.paidSlipTxnRef || "",
      paidSlipDepositDate: f.paidSlipDepositDate || null,
      paidSlipNotes: f.paidSlipNotes || "",
      paidSlipUploadedAt: f.paidSlipUploadedAt || null,
      approvalStatus: f.approvalStatus || "none",
      rejectionReason: f.rejectionReason || "",
      verifiedAt: f.verifiedAt || null,
      createdAt: f.createdAt,
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (f) =>
          f.voucherNumber.toLowerCase().includes(s) ||
          f.studentName.toLowerCase().includes(s) ||
          f.admissionNumber.toLowerCase().includes(s) ||
          f.rollNumber.toLowerCase().includes(s) ||
          f.className.toLowerCase().includes(s) ||
          f.fatherName.toLowerCase().includes(s)
      );
    }

    // Dynamic Summary Aggregations
    const totalBilled = allFeesForSummary.reduce((acc, curr: any) => acc + (curr.totalAmount || 0), 0);
    const totalCollected = allFeesForSummary.reduce((acc, curr: any) => acc + (curr.paidAmount || 0), 0);
    const totalPending = allFeesForSummary.reduce(
      (acc, curr: any) => (curr.status === "pending" || curr.status === "partial" ? acc + (curr.balanceAmount || 0) : acc),
      0
    );
    const totalOverdue = allFeesForSummary.reduce(
      (acc, curr: any) => (curr.status === "overdue" ? acc + (curr.balanceAmount || 0) : acc),
      0
    );
    const collectionRate = totalBilled > 0 ? Number(((totalCollected / totalBilled) * 100).toFixed(1)) : 0;

    const statusCounts = {
      all: allFeesForSummary.length,
      paid: allFeesForSummary.filter((f: any) => f.status === "paid").length,
      partial: allFeesForSummary.filter((f: any) => f.status === "partial").length,
      pending: allFeesForSummary.filter((f: any) => f.status === "pending").length,
      overdue: allFeesForSummary.filter((f: any) => f.status === "overdue").length,
      under_review: allFeesForSummary.filter((f: any) => f.status === "under_review" || f.approvalStatus === "pending").length,
    };

    const formattedPayments = recentPayments.map((p: any) => ({
      id: p._id.toString(),
      receiptNumber: p.receiptNumber,
      amount: p.amount,
      paymentDate: p.paymentDate,
      formattedDate: new Date(p.paymentDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      paymentMethod: p.paymentMethod,
      transactionReference: p.transactionReference || "Cash Desk Deposit",
      notes: p.notes || "",
      studentName: p.studentId?.userId?.name || "Student",
      admissionNumber: p.studentId?.admissionNumber || "N/A",
      rollNumber: p.studentId?.rollNumber || "N/A",
      className: p.studentId?.classId ? `${p.studentId.classId.name} - ${p.studentId.classId.section}` : "Class Section",
      voucherNumber: p.feeId?.voucherNumber || "VCH-0000",
      month: p.feeId?.month || "Monthly Fee",
      receivedBy: p.receivedByUserId?.name || "Admin Cashier",
    }));

    const schoolDoc = (await School.findOne({ status: "active" }).lean()) || (await School.findOne({}).lean());
    const bankAccounts = (schoolDoc?.bankAccounts || []).filter((b: any) => b.isActive !== false);

    return apiSuccess(
      {
        count: formatted.length,
        fees: formatted,
        bankAccounts,
        summary: {
          totalBilled,
          totalCollected,
          totalPending,
          totalOverdue,
          collectionRate,
          statusCounts,
        },
        payments: formattedPayments,
      },
      "Fee vouchers retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    const allowedRoles = ["super_admin", "principal", "admin", "accountant"];
    if (!allowedRoles.includes(session.role)) {
      throw new AuthorizationError("Only administrators can generate fee vouchers.");
    }

    const body = await req.json();
    const {
      batch,
      classId,
      studentId,
      month,
      tuitionFee,
      admissionFee,
      securityFee,
      examFee,
      otherCharges,
      discount,
      fine,
      dueDate,
      status,
    } = body;

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let academicYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));

    if (!school || !academicYear) {
      throw new Error("School configuration missing.");
    }

    const year = new Date().getFullYear();
    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

    // ==========================================
    // 1. BATCH GENERATION FOR ENTIRE CLASS SECTION
    // ==========================================
    if (batch) {
      if (!classId || !month) {
        throw new ValidationError("classId and month are required for batch generation.");
      }

      const targetClass = await Class.findById(classId);
      if (!targetClass) {
        throw new NotFoundError("Target class not found.");
      }

      const activeStudents = await Student.find({
        classId: targetClass._id,
        status: "active",
      })
        .populate("userId", "name")
        .lean();

      if (activeStudents.length === 0) {
        throw new ValidationError("No active enrolled students found in this class section.");
      }

      const tFee = Number(tuitionFee) || 0;
      const aFee = Number(admissionFee) || 0;
      const sFee = Number(securityFee) || 0;
      const eFee = Number(examFee) || 0;
      const oFee = Number(otherCharges) || 0;
      const fFee = Number(fine) || 0;
      const baseDiscount = Number(discount) || 0;

      const generatedDocs = [];

      for (let i = 0; i < activeStudents.length; i++) {
        const s = activeStudents[i];
        let studentDiscount = baseDiscount;

        // Apply scholarship discount rules based on student feeCategory
        if (s.feeCategory === "Full Scholarship (100%)") {
          studentDiscount = tFee;
        } else if (s.feeCategory === "Merit Scholarship (50%)") {
          studentDiscount = Math.round(tFee * 0.5);
        } else if (s.feeCategory === "Sibling Discount (20%)") {
          studentDiscount = Math.round(tFee * 0.2);
        } else if (s.feeCategory === "Need-Based Concession") {
          studentDiscount = Math.max(studentDiscount, Math.round(tFee * 0.3));
        }

        const total = Math.max(0, tFee + aFee + sFee + eFee + oFee + fFee - studentDiscount);
        const randomVoucher = `VCH-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

        generatedDocs.push({
          schoolId: school._id,
          academicYearId: academicYear._id,
          studentId: s._id,
          classId: targetClass._id,
          voucherNumber: randomVoucher,
          month: month.trim(),
          tuitionFee: tFee,
          admissionFee: aFee,
          securityFee: sFee,
          examFee: eFee,
          otherCharges: oFee,
          discount: studentDiscount,
          fine: fFee,
          totalAmount: total,
          paidAmount: 0,
          balanceAmount: total,
          dueDate: parsedDueDate,
          status: status || "pending",
        });
      }

      const created = await Fee.insertMany(generatedDocs);

      return apiSuccess(
        {
          count: created.length,
          classId,
          className: `${targetClass.name} - ${targetClass.section}`,
          month: month.trim(),
        },
        `Successfully generated ${created.length} fee vouchers for ${targetClass.name} - ${targetClass.section}!`
      );
    }

    // ==========================================
    // 2. SINGLE VOUCHER GENERATION
    // ==========================================
    if (!studentId || !month) {
      throw new ValidationError("studentId and month are required.");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new NotFoundError("Student record not found.");
    }

    const tFee = Number(tuitionFee) || 0;
    const aFee = Number(admissionFee) || 0;
    const sFee = Number(securityFee) || 0;
    const eFee = Number(examFee) || 0;
    const oFee = Number(otherCharges) || 0;
    const fFee = Number(fine) || 0;
    const dFee = Number(discount) || 0;
    const total = Math.max(0, tFee + aFee + sFee + eFee + oFee + fFee - dFee);

    const randomVoucher = `VCH-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newFee = await Fee.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      studentId: student._id,
      classId: student.classId,
      voucherNumber: randomVoucher,
      month: month.trim(),
      tuitionFee: tFee,
      admissionFee: aFee,
      securityFee: sFee,
      examFee: eFee,
      otherCharges: oFee,
      discount: dFee,
      fine: fFee,
      totalAmount: total,
      paidAmount: 0,
      balanceAmount: total,
      dueDate: parsedDueDate,
      status: status || "pending",
    });

    return apiSuccess(
      {
        id: newFee._id.toString(),
        voucherNumber: newFee.voucherNumber,
        month: newFee.month,
        totalAmount: newFee.totalAmount,
        balanceAmount: newFee.balanceAmount,
        dueDate: newFee.dueDate,
        status: newFee.status,
      },
      `Fee voucher #${newFee.voucherNumber} created successfully!`
    );
  } catch (error) {
    return apiError(error);
  }
}

// ==========================================
// 3. RECORD PAYMENT / RECONCILE
// ==========================================
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    const allowedRoles = ["super_admin", "principal", "admin", "accountant"];
    if (!allowedRoles.includes(session.role)) {
      throw new AuthorizationError("Only administrators can record fee payments.");
    }

    const body = await req.json();
    const { feeId, amount, paymentMethod, transactionReference, notes, paymentDate } = body;

    if (!feeId) {
      throw new ValidationError("feeId is required.");
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new ValidationError("Valid positive payment amount is required.");
    }

    await connectToDatabase();

    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw new NotFoundError("Fee voucher not found.");
    }

    const newPaidAmount = (fee.paidAmount || 0) + payAmount;
    const newBalanceAmount = Math.max(0, fee.totalAmount - newPaidAmount);
    const newStatus = newBalanceAmount === 0 ? "paid" : "partial";

    fee.paidAmount = newPaidAmount;
    fee.balanceAmount = newBalanceAmount;
    fee.status = newStatus;
    await fee.save();

    // Create payment receipt record
    const year = new Date().getFullYear();
    const randomReceipt = `RCT-${year}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Try finding admin user id
    let adminUserId: any = session.userId;
    if (!adminUserId) {
      const adminUser = await User.findOne({ role: { $in: ["principal", "super_admin", "admin"] } });
      adminUserId = adminUser?._id || fee.schoolId;
    }

    const payment = await FeePayment.create({
      schoolId: fee.schoolId,
      feeId: fee._id,
      studentId: fee.studentId,
      receiptNumber: randomReceipt,
      amount: payAmount,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || "cash",
      transactionReference: transactionReference?.trim() || "Cash Desk Deposit",
      receivedByUserId: adminUserId,
      notes: notes?.trim() || "",
    });

    return apiSuccess(
      {
        fee: {
          id: fee._id.toString(),
          voucherNumber: fee.voucherNumber,
          totalAmount: fee.totalAmount,
          paidAmount: fee.paidAmount,
          balanceAmount: fee.balanceAmount,
          status: fee.status,
        },
        payment: {
          id: payment._id.toString(),
          receiptNumber: payment.receiptNumber,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          transactionReference: payment.transactionReference,
        },
      },
      `Payment of PKR ${payAmount.toLocaleString()} recorded successfully! Receipt #${randomReceipt}`
    );
  } catch (error) {
    return apiError(error);
  }
}

// ==========================================
// 4. VOID / DELETE FEE VOUCHER
// ==========================================
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    const allowedRoles = ["super_admin", "principal", "admin", "accountant"];
    if (!allowedRoles.includes(session.role)) {
      throw new AuthorizationError("Only administrators can void or delete fee vouchers.");
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new ValidationError("Voucher id is required.");
    }

    await connectToDatabase();

    const fee = await Fee.findById(id);
    if (!fee) {
      throw new NotFoundError("Fee voucher not found.");
    }

    await Promise.all([
      Fee.findByIdAndDelete(id),
      FeePayment.deleteMany({ feeId: id }),
    ]);

    return apiSuccess(
      { id, voucherNumber: fee.voucherNumber },
      `Fee voucher #${fee.voucherNumber} has been voided and deleted.`
    );
  } catch (error) {
    return apiError(error);
  }
}
