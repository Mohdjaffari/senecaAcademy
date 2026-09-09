import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Subject from "@/models/Subject";
import Class from "@/models/Class";
import Teacher from "@/models/Teacher";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, ConflictError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view subject records.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    const query: any = {};
    if (department && department !== "all") query.department = department;

    const subjects = await Subject.find(query)
      .populate("classIds", "name gradeLevel section stream roomNumber")
      .sort({ code: 1 })
      .lean();

    const subjectIds = subjects.map((s) => s._id);

    // Fetch teachers assigned to these subjects
    const teachers = await Teacher.find({
      assignedSubjectIds: { $in: subjectIds },
      status: "active",
    })
      .populate("userId", "name email phone")
      .lean();

    const teacherMap = new Map<string, any[]>();
    for (const t of teachers) {
      for (const sId of t.assignedSubjectIds || []) {
        const key = sId.toString();
        const existing = teacherMap.get(key) || [];
        existing.push({
          id: t._id.toString(),
          name: (t.userId as any)?.name || "Teacher",
          employeeId: t.employeeId,
          specialization: t.specialization,
        });
        teacherMap.set(key, existing);
      }
    }

    let filtered = subjects.map((sub: any) => {
      const subIdStr = sub._id.toString();
      const assignedTeachers = teacherMap.get(subIdStr) || [];

      return {
        id: subIdStr,
        name: sub.name,
        code: sub.code,
        department: sub.department || "General",
        creditHours: sub.creditHours || 3,
        description:
          sub.description || "Core curriculum subject designed for academic rigor and character building.",
        offeringClasses: (sub.classIds || []).map((c: any) => `${c.name}-${c.section}`),
        classIds: (sub.classIds || []).map((c: any) => c._id?.toString() || c.toString()),
        assignedClasses: (sub.classIds || []).map((c: any) => ({
          id: c._id ? c._id.toString() : c.toString(),
          name: c.name || "Class",
          section: c.section || "",
          gradeLevel: c.gradeLevel ?? 0,
          stream: c.stream || "General",
          roomNumber: c.roomNumber || "",
          fullName: c.name && c.section ? `${c.name}-${c.section}` : (c.name || "Class"),
        })),
        assignedTeachers,
        createdAt: sub.createdAt,
      };
    });

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter((sub) => {
        return (
          sub.name.toLowerCase().includes(s) ||
          sub.code.toLowerCase().includes(s) ||
          sub.department.toLowerCase().includes(s) ||
          sub.description.toLowerCase().includes(s) ||
          sub.assignedTeachers.some((t: any) => t.name.toLowerCase().includes(s))
        );
      });
    }

    return apiSuccess(
      {
        count: filtered.length,
        subjects: filtered,
      },
      "Subjects and curriculum retrieved successfully."
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
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can add curriculum subjects.");
    }

    const body = await req.json();
    const { name, code, department, creditHours, description, classIds } = body;

    if (!name) {
      throw new ValidationError("Subject name is required.");
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration record missing.");
    }

    // 1. Generate or validate Course Code e.g. MTH-101
    let finalCode = code ? code.trim().toUpperCase() : "";
    if (!finalCode) {
      const prefix = name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "SUB";
      const randomNum = Math.floor(100 + Math.random() * 900);
      finalCode = `${prefix}-${randomNum}`;
    }

    // 2. Check if code exists in school
    const existing = await Subject.findOne({
      schoolId: school._id,
      code: finalCode,
    });
    if (existing) {
      throw new ConflictError(`Subject with course code '${finalCode}' already exists.`);
    }

    // 3. Create Subject
    const newSubject = await Subject.create({
      schoolId: school._id,
      name: name.trim(),
      code: finalCode,
      department: department ? department.trim() : "General",
      creditHours: Number(creditHours) || 3,
      description: description ? description.trim() : "Core curriculum subject designed for academic rigor.",
      classIds: Array.isArray(classIds) ? classIds : [],
    });

    return apiSuccess(
      {
        id: newSubject._id.toString(),
        name: newSubject.name,
        code: newSubject.code,
      },
      "Subject created and added to curriculum successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
