import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Gallery from "@/models/Gallery";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/utils/errors";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) throw new AuthenticationError("Authentication required.");
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized action.");
    }

    const { id } = await params;
    const body = await req.json();

    await connectToDatabase();

    const item = await Gallery.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!item) throw new NotFoundError("Gallery item not found.");

    return apiSuccess({ item }, "Gallery item updated successfully!");
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
    if (!session) throw new AuthenticationError("Authentication required.");
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Unauthorized action.");
    }

    const { id } = await params;

    await connectToDatabase();

    const item = await Gallery.findByIdAndDelete(id);
    if (!item) throw new NotFoundError("Gallery item not found.");

    return apiSuccess(null, "Gallery item removed successfully.");
  } catch (error) {
    return apiError(error);
  }
}
