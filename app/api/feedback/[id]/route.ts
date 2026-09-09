import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Feedback from "@/models/Feedback";
import AuditLog from "@/models/AuditLog";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const feedback = await Feedback.findById(id).lean();
    if (!feedback) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: feedback });
  } catch (error: any) {
    console.error("GET /api/feedback/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch review" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "super_admin" && session.role !== "principal")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updateFields: any = {};
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.isFeatured !== undefined) updateFields.isFeatured = Boolean(body.isFeatured);
    if (body.name !== undefined) updateFields.name = body.name.trim();
    if (body.email !== undefined) updateFields.email = body.email.trim().toLowerCase();
    if (body.role !== undefined) updateFields.role = body.role;
    if (body.relationship !== undefined) updateFields.relationship = body.relationship;
    if (body.studentGrade !== undefined) updateFields.studentGrade = body.studentGrade;
    if (body.rating !== undefined) updateFields.rating = Number(body.rating);
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.title !== undefined) updateFields.title = body.title.trim();
    if (body.comment !== undefined) updateFields.comment = body.comment.trim();
    if (body.recommend !== undefined) updateFields.recommend = Boolean(body.recommend);
    if (body.avatarUrl !== undefined) updateFields.avatarUrl = body.avatarUrl;
    if (body.likesCount !== undefined) updateFields.likesCount = Number(body.likesCount);

    const updated = await Feedback.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Optional audit log for status changes or edits
    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (school) {
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: "UPDATE_FEEDBACK_REVIEW",
        category: "WEBSITE_MANAGEMENT",
        description: `Updated feedback review for "${updated.name}" (Status: ${updated.status}, Featured: ${updated.isFeatured}).`,
        details: { feedbackId: id, updatedFields: Object.keys(updateFields) },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully.",
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/feedback/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "super_admin" && session.role !== "principal")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { id } = await params;

    const existing = await Feedback.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    await Feedback.findByIdAndDelete(id);

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (school) {
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: "DELETE_FEEDBACK_REVIEW",
        category: "WEBSITE_MANAGEMENT",
        description: `Permanently deleted review submitted by "${existing.name}".`,
        details: { feedbackId: id, author: existing.name, title: existing.title },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted permanently.",
    });
  } catch (error: any) {
    console.error("DELETE /api/feedback/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review." },
      { status: 500 }
    );
  }
}
