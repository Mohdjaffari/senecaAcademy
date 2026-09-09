import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Department from "@/models/Department";
import Class from "@/models/Class";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError, ConflictError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view department records.");
    }

    await connectToDatabase();

    // Auto-resolve school
    let school = await School.findById(session.schoolId);
    if (!school) {
      school = await School.findOne();
    }
    if (!school) {
      throw new ValidationError("No school tenant found.");
    }

    const { searchParams } = new URL(req.url);
    const wing = searchParams.get("wing");
    const status = searchParams.get("status") || "active";

    const query: any = { schoolId: school._id };
    if (status !== "all") query.status = status;
    if (wing && wing !== "all") query.wing = { $in: [wing, "All Wings"] };

    // Fetch purely from database
    const departments = await Department.find(query)
      .sort({ createdAt: 1 })
      .lean();

    // Attach count of classes affiliated with each department
    const classes = await Class.find({ schoolId: school._id, status: "active" }).select("departmentId").lean();
    const classCountMap: Record<string, number> = {};
    for (const c of classes) {
      if (c.departmentId) {
        const dId = c.departmentId.toString();
        classCountMap[dId] = (classCountMap[dId] || 0) + 1;
      }
    }

    const formatted = departments.map((d: any) => ({
      id: d._id.toString(),
      name: d.name,
      code: d.code,
      description: d.description || "",
      wing: d.wing || "All Wings",
      colorCode: d.colorCode || "#810D0B",
      status: d.status || "active",
      classCount: classCountMap[d._id.toString()] || 0,
      createdAt: d.createdAt,
    }));

    return apiSuccess({ count: formatted.length, departments: formatted }, "Departments fetched successfully.");
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to manage departments.");
    }
    if (!["super_admin", "principal"].includes(session.role)) {
      throw new AuthorizationError("Only administrators and principals can create departments.");
    }

    await connectToDatabase();

    const body = await req.json();
    const { name, code, description, wing, colorCode } = body;

    if (!name || !name.trim()) {
      throw new ValidationError("Department name is required.");
    }
    if (!code || !code.trim()) {
      throw new ValidationError("Department code is required.");
    }

    let school = await School.findById(session.schoolId);
    if (!school) school = await School.findOne();
    if (!school) throw new ValidationError("School tenant record not found.");

    const formattedCode = code.toUpperCase().trim();

    // Check duplicate code
    const existing = await Department.findOne({
      schoolId: school._id,
      code: formattedCode,
    });
    if (existing) {
      throw new ConflictError(`A department with code '${formattedCode}' already exists.`);
    }

    const department = await Department.create({
      schoolId: school._id,
      name: name.trim(),
      code: formattedCode,
      description: (description || "").trim(),
      wing: wing || "All Wings",
      colorCode: colorCode || "#810D0B",
      status: "active",
    });

    return apiSuccess(
      {
        id: department._id.toString(),
        name: department.name,
        code: department.code,
        wing: department.wing,
        colorCode: department.colorCode,
      },
      `Department '${department.name}' created successfully.`
    );
  } catch (error) {
    return apiError(error);
  }
}
