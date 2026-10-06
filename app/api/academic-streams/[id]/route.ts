import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import AcademicStream from "@/models/AcademicStream";
import Class from "@/models/Class";
import Student from "@/models/Student";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/utils/errors";

const VALID_TIERS = ["Preschool", "Primary", "Middle", "Secondary", "Higher Secondary", "All"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const stream = await AcademicStream.findById(id).lean();
    if (!stream) {
      throw new NotFoundError("Academic stream not found.");
    }

    return apiSuccess({ stream }, "Academic stream retrieved.");
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can modify academic streams.");
    }

    const { id } = await params;
    await connectToDatabase();

    const stream = await AcademicStream.findById(id);
    if (!stream) {
      throw new NotFoundError("Academic stream not found.");
    }

    const body = await req.json();
    const { name, code, tier, description, status, isDefault, order } = body;

    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        throw new ValidationError("Stream name cannot be empty.");
      }
      const cleanName = name.trim();
      const targetTier = tier !== undefined ? tier : stream.tier;

      // Duplicate check if name or tier changed
      const existing = await AcademicStream.findOne({
        _id: { $ne: stream._id },
        schoolId: stream.schoolId,
        name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        tier: targetTier,
      });

      if (existing) {
        throw new ConflictError(
          `Another stream with the name "${cleanName}" already exists for ${targetTier}.`
        );
      }

      // If name changed, optionally propagate or update linked class streams if desired
      stream.name = cleanName;
    }

    if (tier !== undefined) {
      if (!VALID_TIERS.includes(tier)) {
        throw new ValidationError(`Invalid tier. Must be one of: ${VALID_TIERS.join(", ")}`);
      }
      stream.tier = tier;
    }

    if (code !== undefined) {
      stream.code = code ? code.trim().toUpperCase() : "";
    }

    if (description !== undefined) {
      stream.description = description ? description.trim() : "";
    }

    if (status !== undefined) {
      stream.status = status === "inactive" || status === "archived" ? status : "active";
    }

    if (isDefault !== undefined) {
      stream.isDefault = Boolean(isDefault);
    }

    if (order !== undefined) {
      stream.order = Number(order) || 0;
    }

    await stream.save();

    return apiSuccess(
      {
        stream: {
          id: stream._id.toString(),
          _id: stream._id.toString(),
          name: stream.name,
          code: stream.code,
          tier: stream.tier,
          description: stream.description,
          status: stream.status,
          isDefault: stream.isDefault,
          order: stream.order,
          updatedAt: stream.updatedAt,
        },
      },
      "Academic stream updated successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can delete academic streams.");
    }

    const { id } = await params;
    await connectToDatabase();

    const stream = await AcademicStream.findById(id);
    if (!stream) {
      throw new NotFoundError("Academic stream not found.");
    }

    // Check usage in Class and Student
    const [classCount, studentCount] = await Promise.all([
      Class.countDocuments({ stream: stream.name }),
      Student.countDocuments({ stream: stream.name }),
    ]);

    if (classCount > 0 || studentCount > 0) {
      // If actively used by students/classes, soft-archive it instead of hard delete
      stream.status = "archived";
      await stream.save();
      return apiSuccess(
        {
          archived: true,
          classCount,
          studentCount,
        },
        `Stream archived instead of deleted because ${studentCount} student(s) and ${classCount} class(es) are actively allocated to it.`
      );
    }

    await AcademicStream.findByIdAndDelete(id);

    return apiSuccess(
      { deleted: true, id },
      "Academic stream deleted successfully from database."
    );
  } catch (error) {
    return apiError(error);
  }
}
