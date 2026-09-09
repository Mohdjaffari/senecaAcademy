import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Gallery from "@/models/Gallery";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query: any = {};
    if (category && category !== "all") query.category = category;

    const items = await Gallery.find(query).sort({ order: 1, createdAt: -1 }).lean();

    const formatted = items.map((g: any) => ({
      id: g._id.toString(),
      caption: g.caption,
      subcaption: g.subcaption || "",
      imageUrl: g.imageUrl,
      category: g.category,
      size: g.size || "default",
      order: g.order || 0,
      isPublished: g.isPublished,
      formattedDate: new Date(g.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    return apiSuccess({ count: formatted.length, items: formatted }, "Gallery items retrieved successfully.");
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
      throw new AuthorizationError("Unauthorized action.");
    }

    const body = await req.json();
    const { caption, subcaption, imageUrl, category, size } = body;

    if (!caption || !imageUrl) {
      throw new ValidationError("Caption and Image URL are required.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School missing.");

    const newItem = await Gallery.create({
      schoolId: school._id,
      caption: caption.trim(),
      subcaption: subcaption?.trim() || "",
      imageUrl: imageUrl.trim(),
      category: category || "campus",
      size: size || "default",
      isPublished: true,
      order: 0,
    });

    return apiSuccess({ item: newItem }, "Gallery photo uploaded successfully!");
  } catch (error) {
    return apiError(error);
  }
}
