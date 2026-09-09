import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import User from "@/models/User";
import Result from "@/models/Result";
import AcademicYear from "@/models/AcademicYear";
import AuditLog from "@/models/AuditLog";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from "@/lib/utils/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators and principals can promote or transfer student grades.");
    }

    const { id } = await params;
    const body = await req.json();
    const {
      targetClassId,
      targetAcademicYearId,
      status = "promoted", // "promoted" | "transferred" | "retained" | "conditional"
      finalPercentage,
      finalGpa,
      overallGrade,
      remarks,
      newRollNumber,
      newStream,
    } = body;

    if (!targetClassId) {
      throw new ValidationError("Target Class / Grade selection is required.");
    }

    await connectToDatabase();

    const student = await Student.findById(id).populate("classId").populate("userId");
    if (!student) {
      throw new NotFoundError("Student record not found.");
    }

    const currentClass = student.classId as any;
    if (!currentClass) {
      throw new NotFoundError("Current class record for student not found.");
    }

    const targetClass = await Class.findById(targetClassId);
    if (!targetClass) {
      throw new NotFoundError("Selected target Class / Grade was not found.");
    }

    // Auto-calculate past results aggregate if percentage/grade is not manually passed
    let calculatedPercentage = finalPercentage;
    let calculatedGpa = finalGpa;
    let calculatedGrade = overallGrade;

    if (calculatedPercentage === undefined || calculatedPercentage === null) {
      const pastResults = await Result.find({
        studentId: student._id,
        classId: currentClass._id,
      }).lean();

      if (pastResults.length > 0) {
        const totalPct = pastResults.reduce((acc, r) => acc + (r.percentage || 0), 0);
        calculatedPercentage = Number((totalPct / pastResults.length).toFixed(1));

        if (!calculatedGrade) {
          if (calculatedPercentage >= 90) calculatedGrade = "A*";
          else if (calculatedPercentage >= 80) calculatedGrade = "A";
          else if (calculatedPercentage >= 70) calculatedGrade = "B";
          else if (calculatedPercentage >= 60) calculatedGrade = "C";
          else if (calculatedPercentage >= 50) calculatedGrade = "D";
          else calculatedGrade = "F";
        }

        if (calculatedGpa === undefined || calculatedGpa === null) {
          if (calculatedPercentage >= 90) calculatedGpa = 4.0;
          else if (calculatedPercentage >= 80) calculatedGpa = 3.7;
          else if (calculatedPercentage >= 70) calculatedGpa = 3.0;
          else if (calculatedPercentage >= 60) calculatedGpa = 2.0;
          else if (calculatedPercentage >= 50) calculatedGpa = 1.0;
          else calculatedGpa = 0.0;
        }
      }
    }

    let academicYearName = "Session 2026–2027";
    if (targetAcademicYearId) {
      const ayDoc = await AcademicYear.findById(targetAcademicYearId).lean();
      if (ayDoc) academicYearName = ayDoc.name;
    } else if (student.academicYearId) {
      const ayDoc = await AcademicYear.findById(student.academicYearId).lean();
      if (ayDoc) academicYearName = ayDoc.name;
    }

    const fromClassName = `${currentClass.name}${currentClass.section ? `-${currentClass.section}` : ""}`;
    const toClassName = `${targetClass.name}${targetClass.section ? `-${targetClass.section}` : ""}`;

    const historyRecord = {
      fromClassId: currentClass._id,
      fromClassName,
      fromGradeLevel: currentClass.gradeLevel,
      fromSection: currentClass.section,
      toClassId: targetClass._id,
      toClassName,
      toGradeLevel: targetClass.gradeLevel,
      toSection: targetClass.section,
      academicYearId: targetAcademicYearId || student.academicYearId,
      academicYearName,
      promotionDate: new Date(),
      status: status || "promoted",
      finalPercentage: calculatedPercentage !== undefined ? Number(calculatedPercentage) : undefined,
      finalGpa: calculatedGpa !== undefined ? Number(calculatedGpa) : undefined,
      overallGrade: calculatedGrade || undefined,
      remarks: remarks?.trim() || `Officially promoted from ${fromClassName} to ${toClassName}.`,
      promotedByUserId: session.userId,
      promotedByName: session.name || "Principal's Office",
    };

    if (!Array.isArray(student.academicHistory)) {
      student.academicHistory = [];
    }
    student.academicHistory.push(historyRecord as any);

    // Update active fields on student
    student.classId = targetClass._id;
    if (newRollNumber && newRollNumber.trim()) {
      student.rollNumber = newRollNumber.trim().toUpperCase();
    }
    if (newStream && newStream.trim()) {
      student.stream = newStream.trim();
    } else if (targetClass.stream) {
      student.stream = targetClass.stream;
    }
    if (targetAcademicYearId) {
      student.academicYearId = targetAcademicYearId;
    }

    await student.save();

    // Log administrative audit event
    const studentName = (student.userId as any)?.name || student.admissionNumber;
    await AuditLog.create({
      schoolId: student.schoolId,
      userId: session.userId,
      action: "STUDENT_PROMOTED",
      details: {
        studentId: student._id.toString(),
        studentName,
        admissionNumber: student.admissionNumber,
        fromClass: fromClassName,
        toClass: toClassName,
        status,
        finalPercentage: calculatedPercentage,
        remarks: historyRecord.remarks,
      },
    });

    // Notify student about official promotion
    try {
      if (student.userId) {
        await Notification.create({
          schoolId: student.schoolId,
          userId: student.userId._id || student.userId,
          title: "Official Academic Grade Progression & Promotion",
          message: `Congratulations ${studentName}! You have been officially ${status === "transferred" ? "transferred" : status === "retained" ? "enrolled" : "promoted"} to ${toClassName}. ${historyRecord.remarks}`,
          type: "academic",
          isRead: false,
        });
      }
    } catch (notifErr) {
      console.warn("Could not dispatch promotion notification:", notifErr);
    }

    const updatedStudent = await Student.findById(student._id)
      .populate("classId")
      .populate("userId", "name email phone avatarUrl")
      .lean();

    return apiSuccess(
      {
        student: updatedStudent,
        historyRecord,
      },
      `Student ${studentName} successfully ${status === "transferred" ? "transferred" : status === "retained" ? "retained" : "promoted"} to ${toClassName}.`
    );
  } catch (error) {
    return apiError(error);
  }
}
