import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Timetable from "@/models/Timetable";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    const { id } = await params;
    await connectToDatabase();

    const slot: any = await Timetable.findById(id)
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
        select: "employeeId specialization userId",
      })
      .populate("classId", "name gradeLevel section")
      .populate("subjectId", "name code department")
      .lean();

    if (!slot) {
      throw new NotFoundError("Timetable slot not found.");
    }

    return apiSuccess({ slot }, "Timetable slot retrieved.");
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized action.");
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const slot = await Timetable.findById(id);
    if (!slot) {
      throw new NotFoundError("Timetable slot not found.");
    }

    if (body.classId) slot.classId = body.classId;
    if (body.subjectId) slot.subjectId = body.subjectId;
    if (body.dayOfWeek) slot.dayOfWeek = body.dayOfWeek;
    if (body.periodNumber !== undefined) slot.periodNumber = Number(body.periodNumber);
    if (body.startTime) slot.startTime = body.startTime.trim();
    if (body.endTime) slot.endTime = body.endTime.trim();
    if (body.roomNumber !== undefined) slot.roomNumber = body.roomNumber.trim();
    if (body.notes !== undefined) slot.notes = body.notes.trim();
    if (body.status) slot.status = body.status;

    await slot.save();

    const updated = await Timetable.findById(id)
      .populate({
        path: "teacherId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
        select: "employeeId specialization userId",
      })
      .populate("classId", "name gradeLevel section")
      .populate("subjectId", "name code department")
      .lean();

    return apiSuccess({ slot: updated }, "Timetable slot updated successfully.");
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can delete timetable slots.");
    }

    const { id } = await params;
    await connectToDatabase();

    const slot = await Timetable.findByIdAndDelete(id);
    if (!slot) {
      throw new NotFoundError("Timetable slot not found.");
    }

    return apiSuccess(null, "Timetable slot deleted successfully.");
  } catch (error) {
    return apiError(error);
  }
}
