import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Attendance from "@/models/Attendance";
import Class from "@/models/Class";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view attendance records.");
    }

    await connectToDatabase();

    let teacherRecord: any = null;
    let isClassHead = false;
    let headClasses: any[] = [];

    if (session.role === "teacher") {
      teacherRecord = await Teacher.findOne({ userId: session.userId }).lean();
      if (teacherRecord) {
        const classesHeaded = await Class.find({
          $or: [
            { classTeacherId: teacherRecord._id },
            { _id: { $in: teacherRecord.headOfClassIds || [] } },
          ],
          status: "active",
        }).lean();

        headClasses = classesHeaded.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          section: c.section,
          fullName: `${c.name}-${c.section}`,
          gradeLevel: c.gradeLevel,
        }));
        isClassHead = headClasses.length > 0;
      }
    } else if (session.role === "super_admin" || session.role === "principal") {
      isClassHead = true;
      const allClasses = await Class.find({ status: "active" }).sort({ gradeLevel: 1, section: 1 }).lean();
      headClasses = allClasses.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        section: c.section,
        fullName: `${c.name}-${c.section}`,
        gradeLevel: c.gradeLevel,
      }));
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const classId = searchParams.get("classId");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const query: any = {};
    if (classId && classId !== "all") query.classId = classId;

    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (dateParam) {
      const selected = new Date(dateParam);
      const start = new Date(selected.setHours(0, 0, 0, 0));
      const end = new Date(selected.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const attendanceSessions = await Attendance.find(query)
      .populate("classId", "name section gradeLevel capacity")
      .populate({
        path: "recordedByTeacherId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "records.studentId",
        select: "admissionNumber rollNumber userId status parentName parentPhone guardianPhone",
        populate: { path: "userId", select: "name email phone avatarUrl" },
      })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    const formatted = attendanceSessions.map((sessionDoc: any) => {
      const total = sessionDoc.records?.length || 0;
      const presentCount = sessionDoc.records?.filter((r: any) => r.status === "present").length || 0;
      const absentCount = sessionDoc.records?.filter((r: any) => r.status === "absent").length || 0;
      const lateCount = sessionDoc.records?.filter((r: any) => r.status === "late").length || 0;
      const excusedCount = sessionDoc.records?.filter((r: any) => r.status === "excused").length || 0;
      const presentRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

      return {
        id: sessionDoc._id.toString(),
        date: sessionDoc.date,
        formattedDate: new Date(sessionDoc.date).toLocaleDateString("en-PK", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        classInfo: sessionDoc.classId
          ? {
              id: sessionDoc.classId._id.toString(),
              name: sessionDoc.classId.name,
              section: sessionDoc.classId.section,
              fullName: `${sessionDoc.classId.name}-${sessionDoc.classId.section}`,
            }
          : { id: "unknown", name: "Grade Class", section: "A", fullName: "Class Section" },
        teacher: sessionDoc.recordedByTeacherId?.userId?.name || "Faculty Mentor",
        totalStudents: total,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        presentRate,
        records: (sessionDoc.records || []).map((r: any) => ({
          studentId: r.studentId?._id?.toString(),
          studentName: r.studentId?.userId?.name || "Student",
          admissionNumber: r.studentId?.admissionNumber || "SEN-N/A",
          rollNumber: r.studentId?.rollNumber || "ROL-00",
          status: r.status,
          remarks: r.remarks || "",
          parentName: r.studentId?.parentName || "",
          parentPhone: r.studentId?.parentPhone || r.studentId?.guardianPhone || "",
          avatarUrl: r.studentId?.userId?.avatarUrl || "",
        })),
        createdAt: sessionDoc.createdAt,
      };
    });

    return apiSuccess(
      {
        count: formatted.length,
        isClassHead,
        headClasses,
        attendance: formatted,
      },
      "Attendance records retrieved successfully."
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

    const body = await req.json();
    const { classId, date, records } = body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      throw new ValidationError("Missing required attendance fields: classId, date, or records.");
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let academicYear = (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));

    if (!school || !academicYear) {
      throw new Error("School or academic session configuration missing.");
    }

    let recordedByTeacherId = null;

    // Authorization & Head of Class Verification
    if (session.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: session.userId });
      if (!teacher) {
        throw new AuthorizationError("Teacher profile not found.");
      }
      if (teacher.status !== "active") {
        throw new AuthorizationError("Your teacher status is not active. Please contact administrator.");
      }

      // Verify if teacher is the designated Head of Class for this target class
      const targetClass = await Class.findById(classId);
      if (!targetClass) {
        throw new ValidationError("Target class section not found.");
      }

      const isClassTeacher = targetClass.classTeacherId && targetClass.classTeacherId.toString() === teacher._id.toString();
      const inHeadOfClasses = (teacher.headOfClassIds || []).some((id: any) => id.toString() === classId.toString());

      if (!isClassTeacher && !inHeadOfClasses) {
        throw new AuthorizationError(
          "Permission Denied: Only the designated Head of Class (Class Teacher) can record student attendance for this class."
        );
      }

      recordedByTeacherId = teacher._id;
    } else if (session.role === "super_admin" || session.role === "principal") {
      const anyTeacher = await Teacher.findOne({});
      recordedByTeacherId = anyTeacher ? anyTeacher._id : school._id;
    } else {
      throw new AuthorizationError("You are not authorized to submit classroom attendance.");
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Upsert attendance for this class and date
    const attendanceDoc = await Attendance.findOneAndUpdate(
      {
        schoolId: school._id,
        classId: classId,
        date: targetDate,
      },
      {
        schoolId: school._id,
        academicYearId: academicYear._id,
        classId: classId,
        date: targetDate,
        recordedByTeacherId,
        records: records.map((r: any) => ({
          studentId: r.studentId,
          status: r.status || "present",
          remarks: r.remarks || "",
        })),
      },
      { upsert: true, new: true }
    );

    return apiSuccess(
      { id: attendanceDoc._id.toString() },
      "Attendance record saved successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
