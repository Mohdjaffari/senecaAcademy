import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Class from "@/models/Class";
import School from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import Department from "@/models/Department";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export interface BatchClassItem {
  name: string; // e.g. "Nursery", "Grade 1", "Grade 11"
  gradeLevel: number;
  sections: string[]; // e.g. ["A", "B", "C"]
  capacity?: number;
  departmentId?: string;
  stream?: string;
  roomPrefix?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can batch provision classes.");
    }

    await connectToDatabase();

    const body = await req.json();
    const { classes: classItems } = body as { classes: BatchClassItem[] };

    if (!Array.isArray(classItems) || classItems.length === 0) {
      throw new ValidationError("Please provide a list of classes to provision.");
    }

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    let academicYear =
      (await AcademicYear.findOne({ isCurrent: true })) || (await AcademicYear.findOne({}));

    if (!school || !academicYear) {
      throw new Error("School or academic year record missing.");
    }

    let createdCount = 0;
    let skippedCount = 0;
    const createdClasses = [];

    for (const item of classItems) {
      const gradeName = item.name.trim();
      const gradeLevel = Number(item.gradeLevel);
      const sections = Array.isArray(item.sections) && item.sections.length > 0 ? item.sections : ["A"];
      const capacity = Number(item.capacity) || 35;
      const departmentId = item.departmentId && item.departmentId !== "none" ? item.departmentId : undefined;
      const stream = item.stream || "General";
      const roomPrefix = item.roomPrefix || "Wing";

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i].toUpperCase().trim();
        const existing = await Class.findOne({
          schoolId: school._id,
          academicYearId: academicYear._id,
          name: gradeName,
          section: sec,
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        const roomNumber = `${roomPrefix} Room ${gradeLevel > 0 ? gradeLevel * 100 + (i + 1) : 100 + (i + 1)}`;

        const newClass = await Class.create({
          schoolId: school._id,
          academicYearId: academicYear._id,
          name: gradeName,
          gradeLevel,
          section: sec,
          capacity,
          departmentId,
          stream,
          roomNumber,
          status: "active",
        });

        createdClasses.push(newClass);
        createdCount++;
      }
    }

    return apiSuccess(
      {
        createdCount,
        skippedCount,
        totalRequested: classItems.length,
      },
      `Batch provisioned ${createdCount} class sections successfully (${skippedCount} already existed).`
    );
  } catch (error) {
    return apiError(error);
  }
}
