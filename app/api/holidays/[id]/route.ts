import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Holiday from "@/models/Holiday";
import Announcement from "@/models/Announcement";
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

    const holiday = await Holiday.findById(id)
      .populate("noticeId")
      .populate("createdByUserId", "name")
      .lean();

    if (!holiday) {
      throw new NotFoundError("Holiday record not found.");
    }

    return apiSuccess({ holiday }, "Holiday retrieved.");
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

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      throw new NotFoundError("Holiday record not found.");
    }

    if (body.title) holiday.title = body.title.trim();
    if (body.description !== undefined) holiday.description = body.description.trim();
    if (body.startDate) holiday.startDate = new Date(body.startDate);
    if (body.endDate) holiday.endDate = new Date(body.endDate);
    if (body.type) holiday.type = body.type;
    if (body.targetAudience) holiday.targetAudience = body.targetAudience;
    if (body.isPublished !== undefined) holiday.isPublished = body.isPublished;

    await holiday.save();

    return apiSuccess({ holiday }, "Holiday updated successfully.");
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
      throw new AuthorizationError("Unauthorized action.");
    }

    const { id } = await params;
    await connectToDatabase();

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      throw new NotFoundError("Holiday record not found.");
    }

    // Remove linked announcement if exists
    if (holiday.noticeId) {
      await Announcement.findByIdAndDelete(holiday.noticeId);
    }

    await Holiday.findByIdAndDelete(id);

    return apiSuccess(null, "Holiday and associated notice removed successfully.");
  } catch (error) {
    return apiError(error);
  }
}
