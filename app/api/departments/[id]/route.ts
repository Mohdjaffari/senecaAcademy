import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Department from "@/models/Department";
import Class from "@/models/Class";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, NotFoundError } from "@/lib/utils/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new AuthenticationError("Authentication required.");

    await connectToDatabase();
    const department = await Department.findById(id)
      .populate({
        path: "headOfDepartmentId",
        populate: { path: "userId", select: "name email phone avatarUrl" },
      })
      .lean();

    if (!department) throw new NotFoundError("Department not found.");
    return apiSuccess({ department }, "Department fetched.");
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new AuthenticationError("Authentication required.");
    if (!["super_admin", "principal"].includes(session.role)) {
      throw new AuthorizationError("Only administrators can modify departments.");
    }

    await connectToDatabase();
    const body = await req.json();

    const department = await Department.findById(id);
    if (!department) throw new NotFoundError("Department record not found.");

    if (body.name !== undefined) department.name = body.name.trim();
    if (body.code !== undefined) department.code = body.code.toUpperCase().trim();
    if (body.description !== undefined) department.description = body.description.trim();
    if (body.wing !== undefined) department.wing = body.wing;
    if (body.colorCode !== undefined) department.colorCode = body.colorCode;
    if (body.status !== undefined) department.status = body.status;
    if (body.headOfDepartmentId !== undefined) {
      department.headOfDepartmentId =
        body.headOfDepartmentId && body.headOfDepartmentId !== "none"
          ? body.headOfDepartmentId
          : undefined;
    }

    await department.save();

    return apiSuccess(
      {
        id: department._id.toString(),
        name: department.name,
        code: department.code,
      },
      "Department updated successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) throw new AuthenticationError("Authentication required.");
    if (!["super_admin", "principal"].includes(session.role)) {
      throw new AuthorizationError("Only administrators can delete departments.");
    }

    await connectToDatabase();

    const department = await Department.findById(id);
    if (!department) throw new NotFoundError("Department record not found.");

    // Remove department reference from affiliated classes
    await Class.updateMany({ departmentId: department._id }, { $unset: { departmentId: 1 } });

    await Department.findByIdAndDelete(id);

    return apiSuccess({ deletedId: id }, `Department '${department.name}' deleted.`);
  } catch (error) {
    return apiError(error);
  }
}
