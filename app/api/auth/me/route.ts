import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectToDatabase from "@/lib/db/mongodb";
import Admission from "@/models/Admission";
import { apiSuccess } from "@/lib/utils/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return apiSuccess({ session: null, hasSubmittedApplication: false, applicationCount: 0, latestApplication: null }, "No active session.");
    }

    let hasSubmittedApplication = false;
    let applicationCount = 0;
    let latestApplication: any = null;

    if (session.role === "user") {
      try {
        await connectToDatabase();
        const userAdmissions = await Admission.find({
          $or: [
            { applicantUserId: session.userId },
            { parentEmail: session.email.toLowerCase().trim() },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1)
          .lean();

        if (userAdmissions && userAdmissions.length > 0) {
          const adm = userAdmissions[0];
          hasSubmittedApplication = true;
          applicationCount = await Admission.countDocuments({
            $or: [
              { applicantUserId: session.userId },
              { parentEmail: session.email.toLowerCase().trim() },
            ],
          });
          latestApplication = {
            id: (adm._id as any).toString(),
            applicationNumber: adm.applicationNumber,
            studentName: adm.studentName,
            status: adm.status,
            applyingForClass: adm.applyingForClass,
            createdAt: adm.createdAt,
          };
        }
      } catch (dbErr) {
        console.error("Error querying user admissions in /api/auth/me:", dbErr);
      }
    }

    return apiSuccess(
      {
        session,
        hasSubmittedApplication,
        applicationCount,
        latestApplication,
      },
      "Session state checked."
    );
  } catch (error) {
    return apiSuccess({ session: null, hasSubmittedApplication: false, applicationCount: 0, latestApplication: null }, "No active session.");
  }
}

