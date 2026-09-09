import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import School from "@/models/School";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const revalidate = 60;

/**
 * GET /api/website/stats
 * Returns live counts of:
 *  - currentStudents  → Student.status = "active"
 *  - alumniStudents   → Student.status = "graduated"
 *  - totalFaculty     → Teacher.status in ["active", "on_leave"]
 *
 * Public route — no auth required (only counts, no PII).
 */
export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const school =
      (await School.findOne({ status: "active" }).lean()) ||
      (await School.findOne({}).lean());

    if (!school) {
      // Gracefully return zeros if no school exists yet
      return apiSuccess(
        { currentStudents: 0, alumniStudents: 0, totalFaculty: 0 },
        "Live stats returned with defaults (no school found)."
      );
    }

    const schoolId = school._id;

    const [currentStudents, alumniStudents, totalFaculty] = await Promise.all([
      Student.countDocuments({ schoolId, status: "active" }),
      Student.countDocuments({ schoolId, status: "graduated" }),
      Teacher.countDocuments({ schoolId, status: { $in: ["active", "on_leave"] } }),
    ]);

    const response = apiSuccess(
      { currentStudents, alumniStudents, totalFaculty },
      "Live website stats fetched successfully."
    );

    // Cache for 1 minute, serve stale for 5 minutes
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    return apiError(error);
  }
}
