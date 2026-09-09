import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Class from "@/models/Class";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from "@/lib/utils/errors";

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

    const cls = await Class.findById(id);
    if (!cls) {
      throw new NotFoundError("Class not found.");
    }

    if (body.name) cls.name = body.name.trim();
    if (body.section) cls.section = body.section.trim().toUpperCase();
    if (body.gradeLevel !== undefined) cls.gradeLevel = Number(body.gradeLevel);
    if (body.capacity !== undefined) cls.capacity = Number(body.capacity);
    if (body.roomNumber) cls.roomNumber = body.roomNumber.trim();
    if (body.stream !== undefined) cls.stream = body.stream.trim();
    if (body.departmentId !== undefined) {
      cls.departmentId = body.departmentId && body.departmentId !== "none" ? body.departmentId : undefined;
    }
    if (body.classTeacherId !== undefined) {
      const oldTeacherId = cls.classTeacherId;
      const newTeacherId = body.classTeacherId && body.classTeacherId !== "none" ? body.classTeacherId : undefined;
      cls.classTeacherId = newTeacherId;

      // Sync Teacher models
      if (oldTeacherId && oldTeacherId.toString() !== (newTeacherId ? newTeacherId.toString() : "")) {
        const Teacher = (await import("@/models/Teacher")).default;
        await Teacher.findByIdAndUpdate(oldTeacherId, {
          $pull: { headOfClassIds: cls._id },
        });
      }

      if (newTeacherId) {
        const Teacher = (await import("@/models/Teacher")).default;
        await Teacher.findByIdAndUpdate(newTeacherId, {
          $addToSet: { headOfClassIds: cls._id },
        });
      }
    }
    if (body.status) cls.status = body.status;

    await cls.save();

    return apiSuccess({ class: cls }, "Class details updated successfully.");
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
      throw new AuthorizationError("Only administrators can delete class sections.");
    }

    const { id } = await params;

    await connectToDatabase();

    const cls = await Class.findById(id);
    if (!cls) {
      throw new NotFoundError("Class section not found.");
    }

    // Check if students are enrolled in this class
    const studentCount = await Student.countDocuments({ classId: id, status: "active" });
    if (studentCount > 0) {
      throw new ValidationError(
        `Cannot delete '${cls.name}-${cls.section}' because ${studentCount} active students are currently assigned to it. Reassign or archive the class instead.`
      );
    }

    await Class.findByIdAndDelete(id);

    return apiSuccess(null, "Class section removed successfully.");
  } catch (error) {
    return apiError(error);
  }
}
