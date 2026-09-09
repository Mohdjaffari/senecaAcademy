import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import Timetable from "@/models/Timetable";
import Holiday from "@/models/Holiday";
import Announcement from "@/models/Announcement";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    let teacherDoc: any = null;

    if (session.role === "teacher") {
      teacherDoc = await Teacher.findOne({ userId: session.userId, status: "active" })
        .populate("assignedClassIds", "name gradeLevel section stream roomNumber")
        .populate("assignedSubjectIds", "name code department creditHours")
        .populate("headOfClassIds", "name gradeLevel section stream")
        .lean();

      if (!teacherDoc) {
        teacherDoc = await Teacher.findOne({ email: session.email, status: "active" })
          .populate("assignedClassIds", "name gradeLevel section stream roomNumber")
          .populate("assignedSubjectIds", "name code department creditHours")
          .populate("headOfClassIds", "name gradeLevel section stream")
          .lean();
      }

      if (!teacherDoc) {
        teacherDoc = await Teacher.findOne({ status: "active" })
          .populate("assignedClassIds", "name gradeLevel section stream roomNumber")
          .populate("assignedSubjectIds", "name code department creditHours")
          .populate("headOfClassIds", "name gradeLevel section stream")
          .lean();
      }
    } else if (session.role === "super_admin" || session.role === "principal") {
      const teacherId = searchParams.get("teacherId");
      if (teacherId) {
        teacherDoc = await Teacher.findById(teacherId)
          .populate("userId", "name email phone avatarUrl")
          .populate("assignedClassIds", "name gradeLevel section stream roomNumber")
          .populate("assignedSubjectIds", "name code department creditHours")
          .populate("headOfClassIds", "name gradeLevel section stream")
          .lean();
      } else {
        teacherDoc = await Teacher.findOne({ status: "active" })
          .populate("userId", "name email phone avatarUrl")
          .populate("assignedClassIds", "name gradeLevel section stream roomNumber")
          .populate("assignedSubjectIds", "name code department creditHours")
          .populate("headOfClassIds", "name gradeLevel section stream")
          .lean();
      }
    }

    if (!teacherDoc) {
      throw new NotFoundError("Faculty profile not found.");
    }

    const teacherId = teacherDoc._id;

    // 1. Fetch weekly timetable slots
    const slots: any[] = await Timetable.find({
      teacherId,
      status: "active",
    })
      .populate("classId", "name gradeLevel section stream roomNumber")
      .populate("subjectId", "name code department creditHours")
      .sort({ periodNumber: 1, startTime: 1 })
      .lean();

    // 2. Fetch classes headed
    const headedClasses = await Class.find({
      classTeacherId: teacherId,
      status: "active",
    }).lean();

    const headClasses = [
      ...(teacherDoc.headOfClassIds || []).map((c: any) => ({
        id: c._id?.toString() || c.toString(),
        name: c.name || "Class",
        section: c.section || "A",
        gradeLevel: c.gradeLevel || 0,
        fullName: c.name ? `${c.name} (${c.section})` : "Class Section",
      })),
      ...headedClasses.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        section: c.section,
        gradeLevel: c.gradeLevel,
        fullName: `${c.name} (${c.section})`,
      })),
    ];

    const uniqueHead = Array.from(
      new Map(headClasses.map((item) => [item.id, item])).values()
    );

    // 3. Fetch school calendar holidays & events added from admin side
    const holidays: any[] = await Holiday.find({
      isPublished: true,
      targetAudience: { $in: ["all", "teachers"] },
    })
      .sort({ startDate: 1 })
      .lean();

    // 4. Fetch notices / circulars
    const notices: any[] = await Announcement.find({
      isPublished: true,
      targetRole: { $in: ["all", "teachers"] },
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    // 5. Today's Day of Week & Today's Schedule
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = daysOfWeek[new Date().getDay()];

    const todaySlots = slots
      .filter((s) => s.dayOfWeek === todayName)
      .map((s) => ({
        id: s._id.toString(),
        periodNumber: s.periodNumber,
        periodName: `Period ${s.periodNumber}`,
        time: `${s.startTime} - ${s.endTime}`,
        startTime: s.startTime,
        endTime: s.endTime,
        subject: s.subjectId?.name || "Subject",
        subjectCode: s.subjectId?.code || "",
        department: s.subjectId?.department || "General",
        className: s.classId ? `${s.classId.name} (${s.classId.section})` : "Class Section",
        classId: s.classId?._id?.toString() || s.classId?.toString() || "",
        gradeLevel: s.classId?.gradeLevel || 0,
        section: s.classId?.section || "A",
        room: s.roomNumber || s.classId?.roomNumber || "Classroom",
        isHeadOfClass: uniqueHead.some((h) => h.id === (s.classId?._id?.toString() || s.classId?.toString())),
        notes: s.notes || "",
      }));

    const formattedSlots = slots.map((s) => ({
      id: s._id.toString(),
      dayOfWeek: s.dayOfWeek,
      periodNumber: s.periodNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      time: `${s.startTime} - ${s.endTime}`,
      subjectId: s.subjectId?._id?.toString() || s.subjectId?.toString() || "",
      subjectName: s.subjectId?.name || "Subject",
      subjectCode: s.subjectId?.code || "",
      department: s.subjectId?.department || "General",
      classId: s.classId?._id?.toString() || s.classId?.toString() || "",
      className: s.classId ? `${s.classId.name} (${s.classId.section})` : "Class Section",
      gradeLevel: s.classId?.gradeLevel || 0,
      section: s.classId?.section || "A",
      roomNumber: s.roomNumber || s.classId?.roomNumber || "Standard Room",
      isHeadOfClass: uniqueHead.some((h) => h.id === (s.classId?._id?.toString() || s.classId?.toString())),
      notes: s.notes || "",
    }));

    return apiSuccess(
      {
        teacher: {
          id: teacherDoc._id.toString(),
          name: teacherDoc.userId?.name || session.name,
          employeeId: teacherDoc.employeeId,
          specialization: teacherDoc.specialization,
          qualification: teacherDoc.qualification,
          assignedClasses: (teacherDoc.assignedClassIds || []).map((c: any) => ({
            id: c._id?.toString() || c.toString(),
            name: c.name,
            gradeLevel: c.gradeLevel,
            section: c.section,
            stream: c.stream || "General",
            fullName: `${c.name} (${c.section})`,
          })),
          assignedSubjects: (teacherDoc.assignedSubjectIds || []).map((s: any) => ({
            id: s._id?.toString() || s.toString(),
            name: s.name,
            code: s.code,
            department: s.department,
            creditHours: s.creditHours || 3,
          })),
          headOfClasses: uniqueHead,
        },
        today: {
          dayName: todayName,
          dateFormatted: new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          slots: todaySlots,
        },
        weeklySlots: formattedSlots,
        holidays: holidays.map((h) => ({
          id: h._id.toString(),
          title: h.title,
          description: h.description || "",
          startDate: h.startDate,
          endDate: h.endDate,
          type: h.type,
          targetAudience: h.targetAudience,
        })),
        notices: notices.map((n) => ({
          id: n._id.toString(),
          title: n.title,
          content: n.content,
          icon: n.icon || "📢",
          colorTheme: n.colorTheme || "crimson",
          priority: n.priority || "normal",
          publishedAt: n.publishedAt || n.createdAt,
        })),
      },
      "Teacher timetable, daily agenda, and school holiday calendar retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
