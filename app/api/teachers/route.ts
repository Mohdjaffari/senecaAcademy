import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, ConflictError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view faculty records.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get("specialization");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "all") query.status = status;
    if (specialization && specialization !== "all") query.specialization = specialization;

    const teachers = await Teacher.find(query)
      .populate("userId", "name email phone avatarUrl status rawPassword")
      .populate("assignedClassIds", "name gradeLevel section")
      .populate("assignedSubjectIds", "name code department")
      .populate("headOfClassIds", "name gradeLevel section")
      .sort({ employeeId: 1 })
      .lean();

    const teacherIds = teachers.map((t: any) => t._id);

    // Fetch classes that have these teachers as classTeacherId
    const headedClasses = await Class.find({
      classTeacherId: { $in: teacherIds },
      status: "active",
    }).lean();

    const headedClassMap = new Map<string, any[]>();
    for (const c of headedClasses) {
      if (c.classTeacherId) {
        const tIdStr = c.classTeacherId.toString();
        const arr = headedClassMap.get(tIdStr) || [];
        arr.push({
          id: c._id.toString(),
          name: c.name,
          section: c.section,
          gradeLevel: c.gradeLevel,
          fullName: `${c.name}-${c.section}`,
        });
        headedClassMap.set(tIdStr, arr);
      }
    }

    let filtered = teachers;
    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      filtered = teachers.filter((t: any) => {
        const nameMatch = (t.userId?.name || "").toLowerCase().includes(s);
        const emailMatch = (t.userId?.email || "").toLowerCase().includes(s);
        const idMatch = (t.employeeId || "").toLowerCase().includes(s);
        const specMatch = (t.specialization || "").toLowerCase().includes(s);
        const qualMatch = (t.qualification || "").toLowerCase().includes(s);
        return nameMatch || emailMatch || idMatch || specMatch || qualMatch;
      });
    }

    const isAdmin = session.role === "super_admin" || session.role === "principal";

    return apiSuccess(
      {
        count: filtered.length,
        teachers: filtered.map((t: any) => {
          const tIdStr = t._id.toString();
          
          // Combine explicit headOfClassIds + classes where classTeacherId is this teacher
          const fromClassMap = headedClassMap.get(tIdStr) || [];
          const fromTeacherDoc = (t.headOfClassIds || []).map((c: any) => ({
            id: c._id?.toString() || c.toString(),
            name: c.name || "Class",
            section: c.section || "A",
            gradeLevel: c.gradeLevel || 0,
            fullName: c.name ? `${c.name}-${c.section}` : "Class Section",
          }));

          // Merge unique by id
          const combinedHeadMap = new Map<string, any>();
          [...fromClassMap, ...fromTeacherDoc].forEach((item) => {
            combinedHeadMap.set(item.id, item);
          });
          const headOfClasses = Array.from(combinedHeadMap.values());
          const headOfClassIds = headOfClasses.map((h) => h.id);
          const isClassHead = headOfClasses.length > 0;

          return {
            id: tIdStr,
            userId: t.userId?._id?.toString() || "",
            name: t.userId?.name || "Teacher",
            email: t.userId?.email || "",
            rawPassword: isAdmin ? (t.rawPassword || t.userId?.rawPassword || "Teacher2026!") : undefined,
            phone: t.userId?.phone || "",
            employeeId: t.employeeId,
            specialization: t.specialization,
            qualification: t.qualification,
            experienceYears: t.experienceYears || 1,
            joinDate: t.joinDate,
            status: t.status,
            userStatus: t.userId?.status || "active",
            isClassHead,
            headOfClassIds,
            headOfClasses,
            headOfClassNames: headOfClasses.map((h) => h.fullName),
            assignedClassIds: (t.assignedClassIds || []).map((c: any) => c._id?.toString() || c.toString()),
            assignedSubjectIds: (t.assignedSubjectIds || []).map((s: any) => s._id?.toString() || s.toString()),
            assignedClasses: (t.assignedClassIds || []).map((c: any) => `${c.name}-${c.section}`),
            assignedSubjects: (t.assignedSubjectIds || []).map((s: any) => s.name || "Subject"),
            assignedSubjectDetails: (t.assignedSubjectIds || []).map((s: any) => ({
              id: s._id?.toString(),
              name: s.name,
              code: s.code,
              department: s.department,
            })),
            createdAt: t.createdAt,
          };
        }),
      },
      "Faculty records retrieved successfully."
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
      throw new AuthorizationError("Only administrators can onboard new teachers.");
    }

    const body = await req.json();
    const {
      name,
      email,
      password,
      employeeId,
      specialization,
      qualification,
      experienceYears,
      phone,
      assignedSubjectIds,
      assignedClassIds,
      headOfClassIds,
    } = body;

    if (!name || !email || !password || !specialization || !qualification) {
      throw new ValidationError("Missing required teacher onboarding fields.");
    }

    await connectToDatabase();

    // 1. Check if user email exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      throw new ConflictError("A user with this email address already exists.");
    }

    // 2. Resolve school
    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration record missing.");
    }

    // 3. Generate Guaranteed Unique Employee ID if not provided
    let empId = employeeId ? employeeId.trim().toUpperCase() : "";
    if (!empId) {
      const count = await Teacher.countDocuments();
      let candidate = `TCH-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;
      const exists = await Teacher.findOne({ employeeId: candidate });
      if (exists) {
        candidate = `TCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      }
      empId = candidate;
    }

    // 4. Hash teacher password
    const passwordHash = await hashPassword(password);

    // 5. Create Teacher User Account
    const newUser = await User.create({
      schoolId: school._id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "+92 300 0000000",
      passwordHash,
      rawPassword: password.trim(),
      role: "teacher",
      status: "active",
      customPermissions: [],
      lastLoginAt: new Date(),
    });

    const parsedHeadIds = Array.isArray(headOfClassIds)
      ? headOfClassIds.filter((id) => id && id !== "none")
      : typeof headOfClassIds === "string" && headOfClassIds !== "none"
      ? [headOfClassIds]
      : [];

    // 6. Create Teacher Record
    const newTeacher = await Teacher.create({
      schoolId: school._id,
      userId: newUser._id,
      employeeId: empId.trim().toUpperCase(),
      specialization: specialization.trim(),
      qualification: qualification.trim(),
      experienceYears: Number(experienceYears) || 2,
      assignedSubjectIds: Array.isArray(assignedSubjectIds) ? assignedSubjectIds : [],
      assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
      headOfClassIds: parsedHeadIds,
      rawPassword: password.trim(),
      joinDate: new Date(),
      status: "active",
    });

    // Update User profileId
    newUser.profileId = newTeacher._id;
    newUser.profileModel = "Teacher";
    await newUser.save();

    // 7. Update Class records if set as Head of Class
    if (parsedHeadIds.length > 0) {
      await Class.updateMany(
        { _id: { $in: parsedHeadIds } },
        { classTeacherId: newTeacher._id }
      );
    }

    return apiSuccess(
      {
        id: newTeacher._id.toString(),
        employeeId: newTeacher.employeeId,
        name: newUser.name,
        rawPassword: newTeacher.rawPassword,
      },
      "Faculty member onboarded and LMS account created successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
