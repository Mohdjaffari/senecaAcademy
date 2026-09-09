import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Admission from "@/models/Admission";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/utils/errors";

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

    const admission = await Admission.findById(id);
    if (!admission) {
      throw new NotFoundError("Admission application not found.");
    }

    if (body.status) admission.status = body.status;
    if (body.notes) admission.notes = body.notes;

    await admission.save();

    return apiSuccess({ admission }, "Application status updated successfully.");
  } catch (error) {
    return apiError(error);
  }
}
