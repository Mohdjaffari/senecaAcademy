import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import AcademicStream from "@/models/AcademicStream";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, ConflictError } from "@/lib/utils/errors";
import { ensureDefaultAcademicStreams } from "@/lib/db/academic-streams-defaults";

const VALID_TIERS = ["Preschool", "Primary", "Middle", "Secondary", "Higher Secondary", "All"];

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      return apiSuccess({ count: 0, streams: [] }, "No school profile configured.");
    }

    // Auto-seed defaults if database collection is empty for this school
    await ensureDefaultAcademicStreams(school._id);

    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const status = searchParams.get("status") || "active";
    const search = searchParams.get("search");

    const query: any = { schoolId: school._id };

    if (status && status !== "all") {
      query.status = status;
    }

    if (tier && tier !== "all") {
      // Include specific tier as well as streams applicable to "All"
      query.tier = { $in: [tier, "All"] };
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { code: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    const streams = await AcademicStream.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    return apiSuccess(
      {
        count: streams.length,
        streams: streams.map((s: any) => ({
          id: s._id.toString(),
          _id: s._id.toString(),
          name: s.name,
          code: s.code || "",
          tier: s.tier,
          description: s.description || "",
          status: s.status,
          isDefault: !!s.isDefault,
          order: s.order ?? 0,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
      },
      "Academic streams retrieved successfully."
    );
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
      throw new AuthorizationError("Only administrators can add academic streams.");
    }

    await connectToDatabase();

    const body = await req.json();
    const {
      name,
      code = "",
      tier = "Higher Secondary",
      description = "",
      status = "active",
      isDefault = false,
      order = 0,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new ValidationError("Stream title/name is required.");
    }

    const cleanName = name.trim();

    if (!VALID_TIERS.includes(tier)) {
      throw new ValidationError(`Invalid tier. Must be one of: ${VALID_TIERS.join(", ")}`);
    }

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new ValidationError("School profile missing.");
    }

    // Ensure defaults first
    await ensureDefaultAcademicStreams(school._id);

    // Duplicate check
    const existing = await AcademicStream.findOne({
      schoolId: school._id,
      name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      tier,
    });

    if (existing) {
      throw new ConflictError(`An academic stream with the name "${cleanName}" already exists for ${tier}.`);
    }

    const newStream = await AcademicStream.create({
      schoolId: school._id,
      name: cleanName,
      code: code ? code.trim().toUpperCase() : "",
      tier,
      description: description ? description.trim() : "",
      status: status === "inactive" || status === "archived" ? status : "active",
      isDefault: Boolean(isDefault),
      order: Number(order) || 0,
    });

    return apiSuccess(
      {
        stream: {
          id: newStream._id.toString(),
          _id: newStream._id.toString(),
          name: newStream.name,
          code: newStream.code,
          tier: newStream.tier,
          description: newStream.description,
          status: newStream.status,
          isDefault: newStream.isDefault,
          order: newStream.order,
        },
      },
      "Academic stream created successfully.",
      201
    );
  } catch (error) {
    return apiError(error);
  }
}
