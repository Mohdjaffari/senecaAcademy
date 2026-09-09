import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import TeacherApplication from "@/models/TeacherApplication";
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

    const application = await TeacherApplication.findById(id);
    if (!application) {
      throw new NotFoundError("Teacher application not found.");
    }

    if (body.status) application.status = body.status;

    await application.save();

    return apiSuccess({ application }, "Candidate recruitment status updated successfully.");
  } catch (error) {
    return apiError(error);
  }
}
