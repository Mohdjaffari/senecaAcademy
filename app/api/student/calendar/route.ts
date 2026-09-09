import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Timetable from "@/models/Timetable";
import Holiday from "@/models/Holiday";
import Announcement from "@/models/Announcement";
import Exam from "@/models/Exam";
import Attendance from "@/models/Attendance";
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

    let studentDoc: any = null;
    if (session.role === "student") {
      studentDoc = await Student.findOne({ userId: session.userId, status: "active" })
        .populate("classId", "name gradeLevel section")
        .lean();
    } else {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      if (studentId) {
        studentDoc = await Student.findById(studentId)
          .populate("classId", "name gradeLevel section")
          .lean();
      } else {
        studentDoc = await Student.findOne({ schoolId: session.schoolId, status: "active" })
          .populate("classId", "name gradeLevel section")
          .lean();
      }
    }

    if (!studentDoc) {
      throw new NotFoundError("Student record not found.");
    }

    const classId = studentDoc.classId?._id || studentDoc.classId;
    const studentId = studentDoc._id;

    // 0. Class & Class Teacher Info
    const classDoc: any = classId
      ? await Class.findById(classId)
          .populate({
            path: "classTeacherId",
            populate: { path: "userId", select: "name email phone avatarUrl" },
          })
          .lean()
      : null;

    // 1. Class Timetable Slots
    const timetableSlots: any[] = await Timetable.find({
      schoolId: session.schoolId,
      classId,
      status: "active",
    })
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
        select: "employeeId specialization userId",
      })
      .populate("subjectId", "name code department")
      .sort({ periodNumber: 1, startTime: 1 })
      .lean();

    // 2. School Holidays & Leaves
    const holidays: any[] = await Holiday.find({
      schoolId: session.schoolId,
      isPublished: true,
      targetAudience: { $in: ["all", "students"] },
    })
      .sort({ startDate: 1 })
      .lean();

    // 3. Upcoming Exams
    const exams: any[] = await Exam.find({
      schoolId: session.schoolId,
      classId,
      status: { $in: ["scheduled", "in_progress"] },
    })
      .populate("subjectId", "name code")
      .sort({ examDate: 1 })
      .lean();

    // 4. Announcements
    const notices: any[] = await Announcement.find({
      schoolId: session.schoolId,
      isPublished: true,
      targetRole: { $in: ["all", "students"] },
    })
      .sort({ publishedAt: -1 })
      .limit(8)
      .lean();

    // 5. Daily Class Attendance (Taken by Homeroom / Class Teacher)
    const attendanceDocs: any[] =
      classId && studentId
        ? await Attendance.find({
            schoolId: session.schoolId,
            classId,
            "records.studentId": studentId,
          })
            .populate({
              path: "recordedByTeacherId",
              populate: { path: "userId", select: "name email phone" },
            })
            .sort({ date: -1 })
            .lean()
        : [];

    let totalAttDays = 0;
    let presentAttDays = 0;
    let absentAttDays = 0;
    let lateAttDays = 0;
    let excusedAttDays = 0;

    const formattedAttendance = attendanceDocs.map((att) => {
      const rec = att.records?.find(
        (r: any) => r.studentId?.toString() === studentId.toString()
      );
      const status: "present" | "absent" | "late" | "excused" = rec?.status || "present";
      totalAttDays++;
      if (status === "present") presentAttDays++;
      else if (status === "absent") absentAttDays++;
      else if (status === "late") lateAttDays++;
      else if (status === "excused") excusedAttDays++;

      const dateStr =
        att.date instanceof Date
          ? att.date.toISOString().slice(0, 10)
          : new Date(att.date).toISOString().slice(0, 10);

      return {
        id: att._id.toString(),
        date: dateStr,
        dateFormatted: new Date(att.date).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: status,
        remarks: rec?.remarks || "",
        recordedByTeacher:
          att.recordedByTeacherId?.userId?.name ||
          classDoc?.classTeacherId?.userId?.name ||
          "Class Teacher",
      };
    });

    const attendanceRate =
      totalAttDays > 0
        ? `${(((presentAttDays + lateAttDays) / totalAttDays) * 100).toFixed(1)}%`
        : "100%";

    // Today's schedule
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = daysOfWeek[new Date().getDay()];

    const formattedSlots = timetableSlots.map((s) => ({
      id: s._id.toString(),
      dayOfWeek: s.dayOfWeek,
      periodNumber: s.periodNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      time: `${s.startTime} - ${s.endTime}`,
      subjectName: s.subjectId?.name || "Subject",
      subjectCode: s.subjectId?.code || "",
      teacherName: s.teacherId?.userId?.name || "Teacher",
      teacherAvatar: s.teacherId?.userId?.avatarUrl,
      roomNumber: s.roomNumber || "Classroom",
    }));

    return apiSuccess(
      {
        student: {
          id: studentDoc._id.toString(),
          name: session.name,
          rollNumber: studentDoc.rollNumber,
          admissionNumber: studentDoc.admissionNumber,
          className: studentDoc.classId ? `${studentDoc.classId.name}-${studentDoc.classId.section}` : "Class Section",
        },
        classTeacher: {
          name: classDoc?.classTeacherId?.userId?.name || "Assigned Class Teacher",
          email: classDoc?.classTeacherId?.userId?.email || "",
          phone: classDoc?.classTeacherId?.userId?.phone || "",
        },
        attendance: {
          rate: attendanceRate,
          totalDays: totalAttDays,
          presentDays: presentAttDays,
          absentDays: absentAttDays,
          lateDays: lateAttDays,
          excusedDays: excusedAttDays,
          records: formattedAttendance,
        },
        today: {
          dayName: todayName,
          dateFormatted: new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          slots: formattedSlots.filter((s) => s.dayOfWeek === todayName),
        },
        weeklyTimetable: formattedSlots,
        holidays: holidays.map((h) => ({
          id: h._id.toString(),
          title: h.title,
          description: h.description,
          startDate: h.startDate,
          endDate: h.endDate,
          type: h.type,
          targetAudience: h.targetAudience,
        })),
        exams: exams.map((e) => ({
          id: e._id.toString(),
          title: e.title,
          subjectName: e.subjectId?.name || "Subject",
          examDate: e.examDate,
          startTime: e.startTime,
          endTime: e.endTime,
          roomNumber: e.roomNumber || "Main Hall",
          totalMarks: e.totalMarks,
        })),
        notices: notices.map((n) => ({
          id: n._id.toString(),
          title: n.title,
          content: n.content,
          icon: n.icon,
          colorTheme: n.colorTheme,
          priority: n.priority,
          publishedAt: n.publishedAt,
        })),
      },
      "Student calendar, attendance, holidays, and schedule retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
