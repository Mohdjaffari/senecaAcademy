import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Timetable from "@/models/Timetable";
import Teacher from "@/models/Teacher";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, BadRequestError } from "@/lib/utils/errors";

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
    const { teacherId, slots, replaceExisting } = body;

    if (!teacherId || !Array.isArray(slots)) {
      throw new BadRequestError("Teacher ID and slots array are required.");
    }

    await connectToDatabase();

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new BadRequestError("Teacher not found.");
    }

    if (replaceExisting) {
      // Remove previous slots for this teacher
      await Timetable.deleteMany({ schoolId: session.schoolId, teacherId });
    }

    const createdSlots = [];
    for (const s of slots) {
      if (!s.classId || !s.subjectId || !s.dayOfWeek || !s.startTime || !s.endTime) {
        continue;
      }

      // Check conflict if not replacing
      if (!replaceExisting) {
        const conflict = await Timetable.findOne({
          schoolId: session.schoolId,
          teacherId,
          dayOfWeek: s.dayOfWeek,
          periodNumber: Number(s.periodNumber) || 1,
          status: "active",
        });
        if (conflict) continue;
      }

      const doc = await Timetable.create({
        schoolId: session.schoolId,
        teacherId,
        classId: s.classId,
        subjectId: s.subjectId,
        dayOfWeek: s.dayOfWeek,
        periodNumber: Number(s.periodNumber) || 1,
        startTime: s.startTime.trim(),
        endTime: s.endTime.trim(),
        roomNumber: (s.roomNumber || "Room 101").trim(),
        notes: s.notes?.trim() || "",
        status: "active",
      });
      createdSlots.push(doc);
    }

    return apiSuccess(
      { count: createdSlots.length },
      `Successfully saved ${createdSlots.length} timetable periods for faculty.`
    );
  } catch (error) {
    return apiError(error);
  }
}
