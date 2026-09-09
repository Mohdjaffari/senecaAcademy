import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import Class from "@/models/Class";
import { hashPassword } from "@/lib/auth/password";
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

    const teacher: any = await Teacher.findById(id)
      .populate("userId", "name email phone avatarUrl status rawPassword")
      .populate("assignedClassIds", "name gradeLevel section")
      .populate("assignedSubjectIds", "name code department")
      .populate("headOfClassIds", "name gradeLevel section")
      .lean();

    if (!teacher) {
      throw new NotFoundError("Faculty member not found.");
    }

    const classesHeaded = await Class.find({
      classTeacherId: teacher._id,
      status: "active",
    }).lean();

    const headClasses = [
      ...(teacher.headOfClassIds || []).map((c: any) => ({
        id: c._id?.toString() || c.toString(),
        name: c.name || "Class",
        section: c.section || "A",
        fullName: c.name ? `${c.name}-${c.section}` : "Class Section",
      })),
      ...classesHeaded.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        section: c.section,
        fullName: `${c.name}-${c.section}`,
      })),
    ];

    const uniqueHead = Array.from(
      new Map(headClasses.map((item) => [item.id, item])).values()
    );

    const isAdmin = session.role === "super_admin" || session.role === "principal";

    const formatted = {
      id: teacher._id.toString(),
      name: teacher.userId?.name || "Teacher",
      email: teacher.userId?.email || "",
      rawPassword: isAdmin ? (teacher.rawPassword || teacher.userId?.rawPassword || "Teacher2026!") : undefined,
      phone: teacher.userId?.phone || "",
      employeeId: teacher.employeeId,
      specialization: teacher.specialization,
      qualification: teacher.qualification,
      experienceYears: teacher.experienceYears || 1,
      joinDate: teacher.joinDate,
      status: teacher.status,
      userStatus: teacher.userId?.status || "active",
      isClassHead: uniqueHead.length > 0,
      headOfClasses: uniqueHead,
      headOfClassIds: uniqueHead.map((h) => h.id),
      assignedClassIds: (teacher.assignedClassIds || []).map((c: any) => c._id?.toString() || c.toString()),
      assignedSubjectIds: (teacher.assignedSubjectIds || []).map((s: any) => s._id?.toString() || s.toString()),
      assignedClasses: (teacher.assignedClassIds || []).map((c: any) => `${c.name}-${c.section}`),
      assignedSubjects: (teacher.assignedSubjectIds || []).map((s: any) => s.name || "Subject"),
      createdAt: teacher.createdAt,
    };

    return apiSuccess({ teacher: formatted }, "Teacher profile retrieved successfully.");
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

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new NotFoundError("Faculty member not found.");
    }

    // 1. Status Update
    if (body.status) {
      teacher.status = body.status;
      let userStatus: "active" | "suspended" | "deactivated" = "active";
      if (body.status === "suspended" || body.status === "terminated") {
        userStatus = "suspended";
      } else if (body.status === "on_leave") {
        userStatus = "active";
      }
      await User.findByIdAndUpdate(teacher.userId, { status: userStatus });
    }

    // 2. Password / Email / User details
    const updateUserData: any = {};
    if (body.name) updateUserData.name = body.name.trim();
    if (body.phone) updateUserData.phone = body.phone.trim();
    if (body.email) updateUserData.email = body.email.toLowerCase().trim();

    if (body.password && body.password.trim()) {
      const passwordHash = await hashPassword(body.password.trim());
      updateUserData.passwordHash = passwordHash;
      updateUserData.rawPassword = body.password.trim();
      teacher.rawPassword = body.password.trim();
    }

    if (Object.keys(updateUserData).length > 0) {
      await User.findByIdAndUpdate(teacher.userId, updateUserData);
    }

    // 3. Teaching profile updates
    if (body.specialization !== undefined) teacher.specialization = body.specialization.trim();
    if (body.qualification !== undefined) teacher.qualification = body.qualification.trim();
    if (body.experienceYears !== undefined) teacher.experienceYears = Number(body.experienceYears);

    if (Array.isArray(body.assignedSubjectIds)) {
      teacher.assignedSubjectIds = body.assignedSubjectIds;
    }

    if (Array.isArray(body.assignedClassIds)) {
      teacher.assignedClassIds = body.assignedClassIds;
    }

    // 4. Head of Class (Class Teacher) synchronization
    if (body.headOfClassIds !== undefined) {
      const parsedHeadIds: string[] = Array.isArray(body.headOfClassIds)
        ? body.headOfClassIds.filter((cid: any) => cid && cid !== "none")
        : typeof body.headOfClassIds === "string" && body.headOfClassIds !== "none"
        ? [body.headOfClassIds]
        : [];

      // Unassign this teacher from classes they previously headed if not in the new list
      await Class.updateMany(
        { classTeacherId: teacher._id, _id: { $nin: parsedHeadIds } },
        { $unset: { classTeacherId: 1 } }
      );

      // Assign this teacher as classTeacherId for the new classes
      if (parsedHeadIds.length > 0) {
        await Class.updateMany(
          { _id: { $in: parsedHeadIds } },
          { classTeacherId: teacher._id }
        );
      }

      teacher.headOfClassIds = parsedHeadIds as any;
    }

    await teacher.save();

    const updated = await Teacher.findById(id)
      .populate("userId", "name email phone avatarUrl status rawPassword")
      .populate("assignedClassIds", "name gradeLevel section")
      .populate("assignedSubjectIds", "name code department")
      .populate("headOfClassIds", "name gradeLevel section")
      .lean();

    return apiSuccess({ teacher: updated }, "Faculty record, credentials, and teaching allocations updated successfully.");
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
      throw new AuthorizationError("Only administrators can remove faculty records.");
    }

    const { id } = await params;

    await connectToDatabase();

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      throw new NotFoundError("Teacher not found.");
    }

    // Remove classTeacherId reference on classes
    await Class.updateMany(
      { classTeacherId: teacher._id },
      { $unset: { classTeacherId: 1 } }
    );

    if (teacher.userId) {
      await User.findByIdAndDelete(teacher.userId);
    }
    await Teacher.findByIdAndDelete(id);

    return apiSuccess(null, "Faculty record deleted successfully.");
  } catch (error) {
    return apiError(error);
  }
}
