import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import User from "@/models/User";
import Class from "@/models/Class";
import Result from "@/models/Result";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    const { id } = await params;
    await connectToDatabase();

    const student = await Student.findById(id)
      .populate("userId", "name email phone avatarUrl status")
      .populate("classId", "name section gradeLevel stream capacity roomNumber")
      .populate("academicYearId", "name startDate endDate")
      .lean();

    if (!student) {
      throw new NotFoundError("Student record not found.");
    }

    // Fetch all student results sorted chronologically
    const results = await Result.find({ studentId: student._id })
      .populate("classId", "name section gradeLevel stream")
      .populate("subjectId", "name code")
      .populate("examId", "title examDate totalMarks passingMarks")
      .sort({ createdAt: -1 })
      .lean();

    const stdUser = (student.userId || {}) as any;
    const stdClass = (student.classId || {}) as any;

    return apiSuccess({
      student: {
        ...student,
        id: student._id.toString(),
        name: stdUser.name || "Student",
        email: stdUser.email || "",
        phone: stdUser.phone || student.guardian?.phone || "",
        avatarUrl: stdUser.avatarUrl || "",
        className: stdClass.name || "Class",
        section: stdClass.section || "A",
        gradeLevel: stdClass.gradeLevel,
        stream: student.stream || stdClass.stream || "General",
      },
      results,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized action.");
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const student = await Student.findById(id);
    if (!student) {
      throw new NotFoundError("Student record not found.");
    }

    if (body.status) {
      student.status = body.status;
      await User.findByIdAndUpdate(student.userId, { status: body.status === "active" ? "active" : "suspended" });
    }

    if (body.rollNumber) student.rollNumber = body.rollNumber.trim().toUpperCase();
    if (body.classId) student.classId = body.classId;
    if (body.address) student.address = body.address.trim();

    if (body.guardian) {
      student.guardian = {
        ...student.guardian,
        ...body.guardian,
      };
    }

    await student.save();

    return apiSuccess({ student }, "Student record updated successfully.");
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can delete student records.");
    }

    const { id } = await params;

    await connectToDatabase();

    const student = await Student.findById(id);
    if (!student) {
      throw new NotFoundError("Student not found.");
    }

    // Delete associated user record & student record
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }
    await Student.findByIdAndDelete(id);

    return apiSuccess(null, "Student record deleted successfully.");
  } catch (error) {
    return apiError(error);
  }
}
