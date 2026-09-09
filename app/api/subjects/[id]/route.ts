import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Subject from "@/models/Subject";
import Teacher from "@/models/Teacher";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/utils/errors";

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

    const subject: any = await Subject.findById(id)
      .populate("classIds", "name gradeLevel section stream roomNumber")
      .lean();

    if (!subject) {
      throw new NotFoundError("Subject not found.");
    }

    const teachers = await Teacher.find({
      assignedSubjectIds: subject._id,
      status: "active",
    })
      .populate("userId", "name email phone avatarUrl")
      .lean();

    const assignedTeachers = teachers.map((t: any) => ({
      id: t._id.toString(),
      name: t.userId?.name || "Faculty Specialist",
      employeeId: t.employeeId,
      specialization: t.specialization,
      phone: t.userId?.phone,
      email: t.userId?.email,
    }));

    const formatted = {
      id: subject._id.toString(),
      name: subject.name,
      code: subject.code,
      department: subject.department || "General",
      creditHours: subject.creditHours || 3,
      description: subject.description || "",
      offeringClasses: (subject.classIds || []).map((c: any) => `${c.name}-${c.section}`),
      classIds: (subject.classIds || []).map((c: any) => c._id?.toString() || c.toString()),
      assignedClasses: (subject.classIds || []).map((c: any) => ({
        id: c._id ? c._id.toString() : c.toString(),
        name: c.name || "Class",
        section: c.section || "",
        gradeLevel: c.gradeLevel ?? 0,
        stream: c.stream || "General",
        roomNumber: c.roomNumber || "",
        fullName: c.name && c.section ? `${c.name}-${c.section}` : (c.name || "Class"),
      })),
      assignedTeachers,
      createdAt: subject.createdAt,
    };

    return apiSuccess({ subject: formatted }, "Subject details retrieved successfully.");
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
      throw new AuthorizationError("Only administrators can modify subject details.");
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const subject = await Subject.findById(id);
    if (!subject) {
      throw new NotFoundError("Subject not found.");
    }

    if (body.name !== undefined) {
      if (!body.name.trim()) throw new ValidationError("Subject name cannot be empty.");
      subject.name = body.name.trim();
    }

    if (body.code !== undefined) {
      const codeFormatted = body.code.trim().toUpperCase();
      if (!codeFormatted) throw new ValidationError("Subject course code cannot be empty.");
      if (codeFormatted !== subject.code) {
        const existing = await Subject.findOne({
          schoolId: subject.schoolId,
          code: codeFormatted,
          _id: { $ne: subject._id },
        });
        if (existing) {
          throw new ConflictError(`Another subject with code '${codeFormatted}' already exists.`);
        }
        subject.code = codeFormatted;
      }
    }

    if (body.department !== undefined) subject.department = body.department.trim();
    if (body.creditHours !== undefined) subject.creditHours = Number(body.creditHours);
    if (body.description !== undefined) subject.description = body.description.trim();
    if (Array.isArray(body.classIds)) subject.classIds = body.classIds;

    await subject.save();

    const updated: any = await Subject.findById(id)
      .populate("classIds", "name gradeLevel section stream roomNumber")
      .lean();

    return apiSuccess({ subject: updated }, "Subject details updated successfully.");
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
      throw new AuthorizationError("Only administrators can delete subjects.");
    }

    const { id } = await params;

    await connectToDatabase();

    const subject = await Subject.findById(id);
    if (!subject) {
      throw new NotFoundError("Subject not found.");
    }

    await Subject.findByIdAndDelete(id);

    return apiSuccess(null, "Subject removed from curriculum successfully.");
  } catch (error) {
    return apiError(error);
  }
}

