import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import Principal from "@/models/Principal";
import Subject from "@/models/Subject";
import Class from "@/models/Class";
import Timetable from "@/models/Timetable";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, ValidationError } from "@/lib/utils/errors";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view your profile.");
    }

    await connectToDatabase();

    // Ensure models are registered
    const _ensureModels = [Subject, Class, Timetable, Teacher, Student, Principal];

    const user = await User.findById(session.userId).select("-passwordHash -rawPassword").lean();
    if (!user) {
      throw new Error("User record not found.");
    }

    let teacherData: any = null;
    let studentData: any = null;
    let principalData: any = null;

    if (user.role === "teacher" || session.role === "teacher") {
      let teacherDoc = await Teacher.findOne({ userId: user._id })
        .populate("assignedClassIds")
        .populate("assignedSubjectIds")
        .populate("headOfClassIds")
        .lean();

      if (!teacherDoc) {
        teacherDoc = await Teacher.findOne({ email: user.email })
          .populate("assignedClassIds")
          .populate("assignedSubjectIds")
          .populate("headOfClassIds")
          .lean();
      }

      if (!teacherDoc && session.role !== "super_admin") {
        teacherDoc = await Teacher.findOne({ status: "active" })
          .populate("assignedClassIds")
          .populate("assignedSubjectIds")
          .populate("headOfClassIds")
          .lean();
      }

      if (teacherDoc) {
        // Calculate live enrolled student counts for assigned classes
        const assignedClasses = await Promise.all(
          (teacherDoc.assignedClassIds || []).map(async (c: any) => {
            const studentCount = await Student.countDocuments({
              classId: c._id,
              status: "active",
            });
            return {
              _id: c._id.toString(),
              name: c.name,
              section: c.section,
              gradeLevel: c.gradeLevel,
              stream: c.stream || "General",
              capacity: c.capacity || 35,
              roomNumber: c.roomNumber || "",
              studentCount,
            };
          })
        );

        const assignedSubjects = (teacherDoc.assignedSubjectIds || []).map((s: any) => ({
          _id: s._id.toString(),
          name: s.name,
          code: s.code,
          department: s.department || "General",
          creditHours: s.creditHours || 3,
          description: s.description || "",
        }));

        const headOfClasses = (teacherDoc.headOfClassIds || []).map((c: any) => ({
          _id: c._id.toString(),
          name: c.name,
          section: c.section,
          gradeLevel: c.gradeLevel,
          stream: c.stream || "General",
        }));

        // Fetch real weekly timetable
        const timetableDocs = await Timetable.find({
          teacherId: teacherDoc._id,
          status: "active",
        })
          .populate("classId", "name section gradeLevel")
          .populate("subjectId", "name code department")
          .sort({ periodNumber: 1 })
          .lean();

        const timetable = timetableDocs.map((t: any) => ({
          _id: t._id.toString(),
          day: t.dayOfWeek,
          period: `Period ${t.periodNumber}`,
          periodNumber: t.periodNumber,
          startTime: t.startTime,
          endTime: t.endTime,
          time: `${t.startTime} - ${t.endTime}`,
          className: t.classId ? `${t.classId.name} (${t.classId.section})` : "Unassigned Class",
          classId: t.classId?._id?.toString(),
          subject: t.subjectId ? t.subjectId.name : "Unassigned Subject",
          subjectCode: t.subjectId?.code || "",
          room: t.roomNumber || "Classroom",
          notes: t.notes || "",
        }));

        teacherData = {
          _id: teacherDoc._id.toString(),
          employeeId: teacherDoc.employeeId,
          specialization: teacherDoc.specialization || "Academic Faculty",
          qualification: teacherDoc.qualification || "Faculty Credential",
          experienceYears: teacherDoc.experienceYears || 0,
          status: teacherDoc.status || "active",
          joinDate: teacherDoc.joinDate || teacherDoc.createdAt,
          assignedClasses,
          assignedSubjects,
          headOfClasses,
          timetable,
        };
      }
    } else if (user.role === "student" || session.role === "student") {
      let studentDoc: any = await Student.findOne({ userId: user._id })
        .populate("classId")
        .populate("academicYearId")
        .lean();

      if (!studentDoc) {
        studentDoc = await Student.findOne({ status: "active" })
          .populate("classId")
          .populate("academicYearId")
          .lean();
      }

      if (studentDoc) {
        let timetable: any[] = [];
        if (studentDoc.classId?._id) {
          const timetableDocs = await Timetable.find({
            classId: studentDoc.classId._id,
            status: "active",
          })
            .populate("subjectId", "name code department")
            .populate({
              path: "teacherId",
              populate: { path: "userId", select: "name" },
            })
            .sort({ periodNumber: 1 })
            .lean();

          timetable = timetableDocs.map((t: any) => ({
            _id: t._id.toString(),
            day: t.dayOfWeek,
            period: `Period ${t.periodNumber}`,
            periodNumber: t.periodNumber,
            startTime: t.startTime,
            endTime: t.endTime,
            time: `${t.startTime} - ${t.endTime}`,
            subject: t.subjectId?.name || "Subject",
            subjectCode: t.subjectId?.code || "",
            teacherName: t.teacherId?.userId?.name || "Faculty",
            room: t.roomNumber || "Classroom",
          }));
        }

        studentData = {
          _id: studentDoc._id.toString(),
          admissionNumber: studentDoc.admissionNumber,
          rollNumber: studentDoc.rollNumber,
          admissionType: studentDoc.admissionType,
          stream: studentDoc.stream || (studentDoc.classId as any)?.stream || "General",
          dateOfBirth: studentDoc.dateOfBirth,
          gender: studentDoc.gender,
          bloodGroup: studentDoc.bloodGroup || "Not Specified",
          address: studentDoc.address || "",
          guardian: studentDoc.guardian || {},
          className: studentDoc.classId
            ? `${(studentDoc.classId as any).name} (${(studentDoc.classId as any).section})`
            : "Unassigned Class",
          classDetails: studentDoc.classId,
          academicYear: (studentDoc.academicYearId as any)?.name || "2026-2027",
          academicHistory: studentDoc.academicHistory || [],
          status: studentDoc.status,
          timetable,
        };
      }
    } else {
      // Principal / Super Admin / Admin
      let principalDoc = await Principal.findOne({ userId: user._id }).lean();
      if (!principalDoc) {
        principalDoc = await Principal.findOne({}).lean();
      }

      const [totalStudents, totalTeachers, totalClasses] = await Promise.all([
        Student.countDocuments({ status: "active" }),
        Teacher.countDocuments({ status: "active" }),
        Class.countDocuments({ status: "active" }),
      ]);

      principalData = {
        qualification: principalDoc?.qualification || "M.Ed / Ph.D in Educational Leadership",
        experienceYears: principalDoc?.experienceYears || 15,
        message: principalDoc?.message || "",
        signatureUrl: principalDoc?.signatureUrl || "",
        totalStudents,
        totalTeachers,
        totalClasses,
      };
    }

    return apiSuccess(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
          avatarUrl: user.avatarUrl || "",
          joinedDate: user.createdAt,
        },
        teacher: teacherData,
        student: studentData,
        principal: principalData,
      },
      "Profile retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    const body = await req.json();
    const {
      name,
      phone,
      avatarUrl,
      currentPassword,
      newPassword,
      // Teacher specific fields
      qualification,
      specialization,
      experienceYears,
      // Student specific fields
      address,
      bloodGroup,
      guardianName,
      guardianPhone,
      emergencyContact,
      // Principal specific fields
      message,
      signatureUrl,
    } = body;

    await connectToDatabase();

    const user = await User.findById(session.userId);
    if (!user) throw new Error("User not found.");

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    // Password change verification
    if (newPassword && newPassword.trim()) {
      if (!currentPassword) {
        throw new ValidationError("Current password is required to set a new password.");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new ValidationError("Incorrect current password.");
      }
      if (newPassword.length < 6) {
        throw new ValidationError("New password must be at least 6 characters.");
      }
      user.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    // If teacher, update teacher record
    if (user.role === "teacher") {
      let teacher = await Teacher.findOne({ userId: user._id });
      if (!teacher) {
        teacher = await Teacher.findOne({ email: user.email });
      }
      if (teacher) {
        if (qualification !== undefined) teacher.qualification = qualification.trim();
        if (specialization !== undefined) teacher.specialization = specialization.trim();
        if (experienceYears !== undefined) teacher.experienceYears = Number(experienceYears);
        await teacher.save();
      }
    }

    // If student, update student record
    if (user.role === "student") {
      let student = await Student.findOne({ userId: user._id });
      if (!student) {
        student = await Student.findOne({ email: user.email });
      }
      if (student) {
        if (address !== undefined) student.address = address.trim();
        if (bloodGroup !== undefined) student.bloodGroup = bloodGroup.trim();
        if (guardianName !== undefined) {
          student.guardian.fatherName = guardianName.trim();
        }
        if (guardianPhone !== undefined) {
          student.guardian.phone = guardianPhone.trim();
        }
        if (emergencyContact !== undefined) {
          student.guardian.emergencyContact = emergencyContact.trim();
        }
        await student.save();
      }
    }

    // If principal, update principal record
    if (user.role === "principal" || user.role === "super_admin") {
      const principal = await Principal.findOne({ userId: user._id });
      if (principal) {
        if (qualification !== undefined) principal.qualification = qualification.trim();
        if (experienceYears !== undefined) principal.experienceYears = Number(experienceYears);
        if (message !== undefined) principal.message = message.trim();
        if (signatureUrl !== undefined) principal.signatureUrl = signatureUrl;
        await principal.save();
      }
    }

    return apiSuccess(
      {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
      "Profile updated successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}

