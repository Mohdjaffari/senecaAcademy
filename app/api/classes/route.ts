import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Class from "@/models/Class";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Subject from "@/models/Subject";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, ConflictError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view class records.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "active";

    const query: any = {};
    if (status !== "all") query.status = status;

    const classes = await Class.find(query)
      .populate({
        path: "classTeacherId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
      })
      .populate("departmentId", "name code colorCode wing")
      .sort({ gradeLevel: 1, section: 1 })
      .lean();

    const classIds = classes.map((c) => c._id);

    // 1. Compute live student enrollment counts for each class
    const enrollmentCounts = await Student.aggregate([
      { $match: { classId: { $in: classIds }, status: "active" } },
      { $group: { _id: "$classId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    enrollmentCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    // 2. Fetch all subjects offering to these classes
    const subjects = await Subject.find({ classIds: { $in: classIds } }).lean();

    // 3. Fetch teachers assigned to these classes or subjects
    const teachers = await Teacher.find({
      $or: [{ assignedClassIds: { $in: classIds } }, { status: "active" }],
    })
      .populate("userId", "name email phone avatarUrl")
      .lean();

    // Map subjects by class ID
    const classSubjectsMap = new Map<string, any[]>();
    for (const sub of subjects) {
      for (const cId of sub.classIds || []) {
        const key = cId.toString();
        const existing = classSubjectsMap.get(key) || [];
        // Find specialist teachers teaching this subject in this class
        const specialistTeachers = teachers
          .filter((t: any) => {
            const teachesSubject = (t.assignedSubjectIds || []).some(
              (sId: any) => sId.toString() === sub._id.toString()
            );
            const assignedToClass = (t.assignedClassIds || []).some(
              (clsId: any) => clsId.toString() === key
            );
            return teachesSubject || assignedToClass;
          })
          .map((t: any) => ({
            id: t._id.toString(),
            name: t.userId?.name || "Faculty Specialist",
            employeeId: t.employeeId,
            specialization: t.specialization,
            phone: t.userId?.phone,
          }));

        existing.push({
          id: sub._id.toString(),
          name: sub.name,
          code: sub.code,
          department: sub.department,
          creditHours: sub.creditHours || 3,
          specialistTeachers,
        });
        classSubjectsMap.set(key, existing);
      }
    }

    let formatted = classes.map((cls: any) => {
      const clsIdStr = cls._id.toString();
      const enrolled = countMap.get(clsIdStr) || 0;
      const capacity = cls.capacity || 35;
      const occupancyRate = Math.round((enrolled / capacity) * 100);
      const allocatedSubjects = classSubjectsMap.get(clsIdStr) || [];

      return {
        id: clsIdStr,
        name: cls.name,
        gradeLevel: cls.gradeLevel,
        section: cls.section,
        fullName: `${cls.name}-${cls.section}`,
        capacity,
        enrolledCount: enrolled,
        occupancyRate,
        roomNumber: cls.roomNumber || "Main Building",
        status: cls.status,
        stream: cls.stream || "General",
        department: cls.departmentId
          ? {
              id: cls.departmentId._id.toString(),
              name: cls.departmentId.name,
              code: cls.departmentId.code,
              colorCode: cls.departmentId.colorCode || "#810D0B",
              wing: cls.departmentId.wing || "All Wings",
            }
          : null,
        classTeacher: cls.classTeacherId
          ? {
              id: cls.classTeacherId._id.toString(),
              name: cls.classTeacherId.userId?.name || "Teacher",
              email: cls.classTeacherId.userId?.email || "",
              phone: cls.classTeacherId.userId?.phone || "",
              employeeId: cls.classTeacherId.employeeId,
              specialization: cls.classTeacherId.specialization,
            }
          : null,
        allocatedSubjects,
        createdAt: cls.createdAt,
      };
    });

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter((c) => {
        return (
          c.name.toLowerCase().includes(s) ||
          c.section.toLowerCase().includes(s) ||
          c.fullName.toLowerCase().includes(s) ||
          c.roomNumber.toLowerCase().includes(s) ||
          c.stream.toLowerCase().includes(s) ||
          (c.department?.name || "").toLowerCase().includes(s) ||
          (c.classTeacher?.name || "").toLowerCase().includes(s)
        );
      });
    }

    return apiSuccess(
      {
        count: formatted.length,
        classes: formatted,
      },
      "Classes and sections retrieved successfully."
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
      throw new AuthorizationError("Only administrators can create class sections.");
    }

    const body = await req.json();
    const { name, gradeLevel, section, capacity, classTeacherId, roomNumber, departmentId, stream } = body;

    if (!name || gradeLevel === undefined || !section) {
      throw new ValidationError("Missing required class fields: name, gradeLevel, or section.");
    }

    await connectToDatabase();

    // 1. Resolve school and current academic year
    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let academicYear =
      (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));

    if (!school || !academicYear) {
      throw new Error("School or academic year record missing.");
    }

    // 2. Check for duplicate class name & section in the same academic year
    const existing = await Class.findOne({
      schoolId: school._id,
      academicYearId: academicYear._id,
      name: name.trim(),
      section: section.trim().toUpperCase(),
    });

    if (existing) {
      throw new ConflictError(`Class '${name}-${section.toUpperCase()}' already exists in current session.`);
    }

    // 3. Create Class
    const newClass = await Class.create({
      schoolId: school._id,
      academicYearId: academicYear._id,
      name: name.trim(),
      gradeLevel: Number(gradeLevel),
      section: section.trim().toUpperCase(),
      capacity: Number(capacity) || 35,
      departmentId: departmentId && departmentId !== "none" ? departmentId : undefined,
      stream: (stream || "General").trim(),
      classTeacherId: classTeacherId && classTeacherId !== "none" ? classTeacherId : undefined,
      roomNumber: roomNumber ? roomNumber.trim() : "Main Building",
      status: "active",
    });

    return apiSuccess(
      {
        id: newClass._id.toString(),
        name: newClass.name,
        section: newClass.section,
      },
      "Class section created successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
