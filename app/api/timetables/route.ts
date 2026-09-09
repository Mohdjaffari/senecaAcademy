import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Timetable from "@/models/Timetable";
import Teacher from "@/models/Teacher";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, BadRequestError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const classId = searchParams.get("classId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    const query: any = { schoolId: session.schoolId, status: "active" };
    if (teacherId && teacherId !== "all") query.teacherId = teacherId;
    if (classId && classId !== "all") query.classId = classId;
    if (dayOfWeek && dayOfWeek !== "all") query.dayOfWeek = dayOfWeek;

    const slots: any[] = await Timetable.find(query)
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
        select: "employeeId specialization userId",
      })
      .populate("classId", "name gradeLevel section")
      .populate("subjectId", "name code department")
      .sort({ dayOfWeek: 1, periodNumber: 1, startTime: 1 })
      .lean();

    const formatted = slots.map((s) => ({
      id: s._id.toString(),
      teacherId: s.teacherId?._id?.toString() || s.teacherId?.toString(),
      teacherName: s.teacherId?.userId?.name || "Faculty Specialist",
      employeeId: s.teacherId?.employeeId || "",
      classId: s.classId?._id?.toString() || s.classId?.toString(),
      className: s.classId ? `${s.classId.name}-${s.classId.section}` : "Class Section",
      gradeLevel: s.classId?.gradeLevel || 0,
      subjectId: s.subjectId?._id?.toString() || s.subjectId?.toString(),
      subjectName: s.subjectId?.name || "Subject",
      subjectCode: s.subjectId?.code || "",
      dayOfWeek: s.dayOfWeek,
      periodNumber: s.periodNumber,
      startTime: s.startTime,
      endTime: s.endTime,
      roomNumber: s.roomNumber || "Standard Classroom",
      notes: s.notes || "",
      status: s.status,
    }));

    return apiSuccess({ count: formatted.length, slots: formatted }, "Timetable fetched successfully.");
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
      throw new AuthorizationError("Only administrators can configure teaching timetables.");
    }

    const body = await req.json();
    const {
      teacherId,
      classId,
      subjectId,
      dayOfWeek,
      periodNumber,
      startTime,
      endTime,
      roomNumber,
      notes,
    } = body;

    if (!teacherId || !classId || !subjectId || !dayOfWeek || !startTime || !endTime) {
      throw new BadRequestError("Teacher, Class, Subject, Day, and Time are required.");
    }

    await connectToDatabase();

    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new BadRequestError("Selected teacher not found.");
    }

    // Check for conflict (teacher already teaching in this period/day)
    const existingConflict = await Timetable.findOne({
      schoolId: session.schoolId,
      teacherId,
      dayOfWeek,
      periodNumber: Number(periodNumber) || 1,
      status: "active",
    });

    let slot: any;
    if (existingConflict) {
      if (body.overrideConflict) {
        existingConflict.classId = classId;
        existingConflict.subjectId = subjectId;
        existingConflict.startTime = startTime.trim();
        existingConflict.endTime = endTime.trim();
        existingConflict.roomNumber = (roomNumber || "Room 101").trim();
        existingConflict.notes = notes?.trim() || "";
        await existingConflict.save();
        slot = existingConflict;
      } else {
        throw new BadRequestError(
          `Teacher is already scheduled for Period ${periodNumber} on ${dayOfWeek}. You can edit or replace it.`
        );
      }
    } else {
      slot = await Timetable.create({
        schoolId: session.schoolId,
        teacherId,
        classId,
        subjectId,
        dayOfWeek,
        periodNumber: Number(periodNumber) || 1,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        roomNumber: (roomNumber || "Room 101").trim(),
        notes: notes?.trim() || "",
        status: "active",
      });
    }

    const populated: any = await Timetable.findById(slot._id)
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
        select: "employeeId specialization userId",
      })
      .populate("classId", "name gradeLevel section")
      .populate("subjectId", "name code department")
      .lean();

    return apiSuccess({ slot: populated }, "Timetable slot added successfully.", 201);
  } catch (error) {
    return apiError(error);
  }
}
