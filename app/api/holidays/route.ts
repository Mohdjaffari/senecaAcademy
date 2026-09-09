import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Holiday from "@/models/Holiday";
import Announcement from "@/models/Announcement";
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
    const audience = searchParams.get("audience");
    const year = searchParams.get("year");
    const month = searchParams.get("month");

    const query: any = { schoolId: session.schoolId, isPublished: true };

    if (audience && audience !== "all") {
      query.targetAudience = { $in: ["all", audience] };
    }

    if (year) {
      const y = parseInt(year);
      const startOfYear = new Date(y, 0, 1);
      const endOfYear = new Date(y, 11, 31, 23, 59, 59);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const holidays: any[] = await Holiday.find(query)
      .populate("noticeId", "title content priority publishedAt")
      .populate("createdByUserId", "name role")
      .sort({ startDate: 1 })
      .lean();

    const formatted = holidays.map((h) => ({
      id: h._id.toString(),
      title: h.title,
      description: h.description || "",
      startDate: h.startDate,
      endDate: h.endDate,
      type: h.type,
      targetAudience: h.targetAudience,
      isPublished: h.isPublished,
      autoCreateNotice: h.autoCreateNotice,
      noticeId: h.noticeId?._id?.toString() || h.noticeId?.toString(),
      noticeTitle: h.noticeId?.title || null,
      createdByName: h.createdByUserId?.name || "Administration",
      createdAt: h.createdAt,
    }));

    return apiSuccess({ count: formatted.length, holidays: formatted }, "School holidays retrieved.");
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
      throw new AuthorizationError("Only school administrators can declare holidays and leaves.");
    }

    const body = await req.json();
    const {
      title,
      description,
      startDate,
      endDate,
      type,
      targetAudience = "all",
      autoCreateNotice = true,
    } = body;

    if (!title || !startDate || !endDate) {
      throw new BadRequestError("Holiday title, start date, and end date are required.");
    }

    await connectToDatabase();

    const start = new Date(startDate);
    const end = new Date(endDate);

    let noticeDoc: any = null;

    if (autoCreateNotice) {
      const isMultiDay = start.toDateString() !== end.toDateString();
      const dateRangeStr = isMultiDay
        ? `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} to ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

      const iconMap: Record<string, string> = {
        national_holiday: "🇵🇰",
        academic_break: "🏖️",
        religious_holiday: "🌙",
        emergency_closure: "⚠️",
        school_event: "🎉",
        exam_prep: "📚",
      };

      const themeMap: Record<string, "blue" | "orange" | "green" | "red"> = {
        national_holiday: "green",
        academic_break: "blue",
        religious_holiday: "orange",
        emergency_closure: "red",
        school_event: "blue",
        exam_prep: "orange",
      };

      noticeDoc = await Announcement.create({
        schoolId: session.schoolId,
        title: `Official Notice: ${title.trim()} (${dateRangeStr})`,
        content: description
          ? `${description.trim()}\n\nDates: ${dateRangeStr}. Seneca Academy campus will observe holiday/leave schedule.`
          : `Please be advised that Seneca Academy will observe holiday schedule for ${title.trim()} on ${dateRangeStr}. All scheduled physical classes stand suspended.`,
        icon: iconMap[type] || "📅",
        colorTheme: themeMap[type] || "blue",
        priority: type === "emergency_closure" ? "urgent" : "normal",
        targetRole: targetAudience,
        isPublished: true,
        publishedAt: new Date(),
        expiresAt: new Date(end.getTime() + 24 * 60 * 60 * 1000),
        createdByUserId: session.userId,
      });
    }

    const holiday = await Holiday.create({
      schoolId: session.schoolId,
      title: title.trim(),
      description: description?.trim() || "",
      startDate: start,
      endDate: end,
      type: type || "national_holiday",
      targetAudience,
      isPublished: true,
      autoCreateNotice: Boolean(autoCreateNotice),
      noticeId: noticeDoc?._id || null,
      createdByUserId: session.userId,
    });

    return apiSuccess(
      { holiday, noticeCreated: Boolean(noticeDoc) },
      "School holiday declared and broadcast notice published successfully.",
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
