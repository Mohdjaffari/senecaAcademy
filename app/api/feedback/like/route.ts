import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Feedback from "@/models/Feedback";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { feedbackId } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, error: "Missing feedbackId parameter" },
        { status: 400 }
      );
    }

    const updated = await Feedback.findByIdAndUpdate(
      feedbackId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      likesCount: updated.likesCount,
    });
  } catch (error: any) {
    console.error("POST /api/feedback/like error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update like count." },
      { status: 500 }
    );
  }
}
