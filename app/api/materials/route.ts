import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import CourseMaterial from "@/models/CourseMaterial";
import ClassModel from "@/models/Class";
import Subject from "@/models/Subject";
import Teacher from "@/models/Teacher";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view course materials.");
    }

    await connectToDatabase();

    // 1. Identify teacher profile & their assigned teaching books
    let teacherProfile: any = null;
    if (session.role === "teacher") {
      teacherProfile = await Teacher.findOne({ userId: session.userId, status: "active" })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .lean();

      if (!teacherProfile) {
        teacherProfile = await Teacher.findOne({ email: session.email, status: "active" })
          .populate("assignedClassIds")
          .populate("assignedSubjectIds")
          .lean();
      }
    }

    // Fallback for demo / admin impersonation if needed
    if (!teacherProfile && session.role !== "super_admin" && session.role !== "principal") {
      teacherProfile = await Teacher.findOne({ status: "active" })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .lean();
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const search = searchParams.get("search");

    const queryConditions: any[] = [];

    // Filter strictly by teacher's assigned subjects (teaching books) or uploaded materials
    if (teacherProfile) {
      const assignedSubjectIds = (teacherProfile.assignedSubjectIds || []).map((s: any) =>
        (s._id || s).toString()
      );
      const assignedClassIds = (teacherProfile.assignedClassIds || []).map((c: any) =>
        (c._id || c).toString()
      );

      const teacherMatches: any[] = [{ teacherId: teacherProfile._id }];
      if (assignedSubjectIds.length > 0) {
        teacherMatches.push({ subjectId: { $in: assignedSubjectIds } });
      }
      if (assignedClassIds.length > 0) {
        teacherMatches.push({ classId: { $in: assignedClassIds } });
      }

      queryConditions.push({ $or: teacherMatches });
    }

    if (classId && classId !== "all") {
      queryConditions.push({ classId });
    }
    if (subjectId && subjectId !== "all") {
      queryConditions.push({ subjectId });
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      queryConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { fileName: searchRegex },
        ],
      });
    }

    const finalQuery = queryConditions.length > 0 ? { $and: queryConditions } : {};

    const materials = await CourseMaterial.find(finalQuery)
      .populate("classId", "name gradeLevel section")
      .populate("subjectId", "name code department")
      .populate("teacherId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = materials.map((m: any) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description || "",
      fileName: m.fileName,
      fileSize: m.fileSize || 2500000,
      formattedSize: ((m.fileSize || 2500000) / (1024 * 1024)).toFixed(2) + " MB",
      mimeType: m.mimeType || "application/pdf",
      fileUrl: m.fileUrl || "/docs/sample-syllabus.pdf",
      isPublished: m.isPublished ?? true,
      className: m.classId?.name ? `${m.classId.name} (${m.classId.section || "A"})` : "All Classes",
      classId: m.classId?._id?.toString(),
      subjectId: m.subjectId?._id?.toString(),
      subjectName: m.subjectId?.name || "Curriculum Book",
      subjectCode: m.subjectId?.code || "SUB-101",
      createdAt: m.createdAt,
      formattedDate: new Date(m.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    return apiSuccess({ count: formatted.length, materials: formatted });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to upload materials.");
    }
    if (session.role !== "teacher" && session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only faculty members can publish course materials.");
    }

    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      throw new ValidationError("Material title is required.");
    }

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let teacher = (await Teacher.findOne({ email: session.email })) || (await Teacher.findOne({}));
    let classDoc = body.classId ? await ClassModel.findById(body.classId) : await ClassModel.findOne({});
    let subjectDoc = body.subjectId ? await Subject.findById(body.subjectId) : await Subject.findOne({});

    if (!school) {
      throw new ValidationError("School record not found.");
    }

    const material = await CourseMaterial.create({
      schoolId: school._id,
      classId: classDoc ? classDoc._id : undefined,
      subjectId: subjectDoc ? subjectDoc._id : undefined,
      teacherId: teacher ? teacher._id : undefined,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      fileUrl: body.fileUrl || "/docs/sample-syllabus.pdf",
      fileName: body.fileName || `${body.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      fileSize: body.fileSize || 2048576,
      mimeType: body.mimeType || "application/pdf",
      isPublished: body.isPublished !== false,
    });

    return apiSuccess(material, "Course material published successfully.", 201);
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new AuthenticationError("Please log in.");
    if (session.role !== "teacher" && session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized.");
    }

    await connectToDatabase();
    const body = await req.json();
    const { id, title, description, fileName, fileUrl, classId, subjectId, isPublished } = body;

    if (!id) {
      throw new ValidationError("Material ID is required for editing.");
    }

    const material = await CourseMaterial.findById(id);
    if (!material) {
      throw new NotFoundError("Course material not found.");
    }

    if (title) material.title = title.trim();
    if (description !== undefined) material.description = description.trim();
    if (fileName) material.fileName = fileName.trim();
    if (fileUrl) material.fileUrl = fileUrl;
    if (classId) material.classId = classId;
    if (subjectId) material.subjectId = subjectId;
    if (isPublished !== undefined) material.isPublished = isPublished;

    await material.save();

    return apiSuccess(material, "Course material updated successfully.");
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new AuthenticationError("Please log in.");
    if (session.role !== "teacher" && session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized.");
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) throw new ValidationError("Material ID is required.");

    await CourseMaterial.findByIdAndDelete(id);
    return apiSuccess(null, "Course material deleted successfully.");
  } catch (error) {
    return apiError(error);
  }
}
