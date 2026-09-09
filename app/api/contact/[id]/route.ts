import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db/mongodb";
import ContactSubmission from "@/models/ContactSubmission";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from "@/lib/utils/errors";

const updateContactSchema = z.object({
  status: z.enum(["new", "in_progress", "replied", "archived"]).optional(),
  notes: z.string().max(2000).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/contact/[id]
 * Updates status or internal notes for a contact inquiry
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can manage contact inquiries.");
    }

    const { id } = await params;
    const body = await req.json();
    const parseResult = updateContactSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError("Invalid update data.", parseResult.error.flatten().fieldErrors);
    }

    await connectToDatabase();

    const submission = await ContactSubmission.findById(id);
    if (!submission) {
      throw new NotFoundError("Contact inquiry not found.");
    }

    const updateFields: any = {};
    if (parseResult.data.status !== undefined) {
      updateFields.status = parseResult.data.status;
      if (parseResult.data.status === "replied" && !submission.repliedAt) {
        updateFields.repliedAt = new Date();
        updateFields.repliedByUserId = session.userId;
      }
    }
    if (parseResult.data.notes !== undefined) {
      updateFields.notes = parseResult.data.notes;
    }

    const updated = await ContactSubmission.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    return apiSuccess(updated, "Contact inquiry updated successfully.");
  } catch (error) {
    return apiError(error);
  }
}

/**
 * DELETE /api/contact/[id]
 * Removes a contact inquiry
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can delete contact inquiries.");
    }

    const { id } = await params;
    await connectToDatabase();

    const submission = await ContactSubmission.findByIdAndDelete(id);
    if (!submission) {
      throw new NotFoundError("Contact inquiry not found.");
    }

    return apiSuccess({ id }, "Contact inquiry removed successfully.");
  } catch (error) {
    return apiError(error);
  }
}
