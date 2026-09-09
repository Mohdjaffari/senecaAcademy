import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import TeacherApplication from "@/models/TeacherApplication";
import School from "@/models/School";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError, ValidationError } from "@/lib/utils/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Please log in to view faculty applications.");
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search");

    const query: any = {};
    if (status !== "all") query.status = status;

    const applications = await TeacherApplication.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    let formatted = applications.map((a: any) => ({
      id: a._id.toString(),
      applicationId: a.applicationId,
      name: a.name,
      email: a.email,
      phone: a.phone,
      subject: a.subject,
      experienceYears: a.experienceYears,
      qualification: a.qualification,
      coverLetter: a.coverLetter || "Experienced educator seeking to join Seneca Academy faculty.",
      cvUrl: a.cvUrl || "#",
      cvFileName: a.cvFileName || "Resume.pdf",
      status: a.status,
      createdAt: a.createdAt,
      formattedDate: new Date(a.createdAt).toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    if (search && search.trim()) {
      const s = search.toLowerCase().trim();
      formatted = formatted.filter(
        (a) =>
          a.applicationId.toLowerCase().includes(s) ||
          a.name.toLowerCase().includes(s) ||
          a.subject.toLowerCase().includes(s) ||
          a.qualification.toLowerCase().includes(s)
      );
    }

    return apiSuccess(
      {
        count: formatted.length,
        applications: formatted,
      },
      "Teacher applications retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, experienceYears, qualification, coverLetter } = body;

    if (!name || !email || !phone || !subject) {
      throw new ValidationError("Missing required applicant details.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const randomId = `FAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newApp = await TeacherApplication.create({
      schoolId: school._id,
      applicationId: randomId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      subject: subject.trim(),
      experienceYears: experienceYears || "3",
      qualification: qualification || "Master of Science",
      coverLetter: coverLetter || "Dedicated subject mentor.",
      cvUrl: "https://example.com/cv.pdf",
      cvFileName: `${name.replace(/\s+/g, "_")}_CV.pdf`,
      status: "pending",
    });

    return apiSuccess(
      { id: newApp._id.toString(), applicationId: newApp.applicationId },
      "Teacher application submitted successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
