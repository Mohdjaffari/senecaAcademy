import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Admission from "@/models/Admission";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError } from "@/lib/utils/errors";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view your application status.");
    }

    await connectToDatabase();

    const admissions = await Admission.find({
      $or: [
        { applicantUserId: session.userId },
        { parentEmail: session.email.toLowerCase().trim() },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const activeApplication = admissions.find((a: any) => a.status !== "rejected") || null;

    return apiSuccess(
      {
        count: admissions.length,
        hasActiveApplication: Boolean(activeApplication),
        activeApplication: activeApplication
          ? {
              id: (activeApplication._id as any).toString(),
              applicationNumber: activeApplication.applicationNumber,
              studentName: activeApplication.studentName,
              applyingForClass: activeApplication.applyingForClass,
              status: activeApplication.status,
              createdAt: activeApplication.createdAt,
            }
          : null,
        applications: admissions.map((adm: any) => ({
          id: (adm._id as any).toString(),
          applicationNumber: adm.applicationNumber,
          studentName: adm.studentName,
          applyingForClass: adm.applyingForClass,
          fatherName: adm.fatherName,
          parentPhone: adm.parentPhone,
          status: adm.status,
          dateOfBirth: adm.dateOfBirth,
          gender: adm.gender,
          notes: adm.notes,
          createdAt: adm.createdAt,
          updatedAt: adm.updatedAt,
        })),
      },
      "Admission applications retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}
