import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db/mongodb";
import School from "@/models/School";
import TeacherApplication from "@/models/TeacherApplication";
import AuditLog from "@/models/AuditLog";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { ValidationError } from "@/lib/utils/errors";
import { REGEX_PATTERNS } from "@/lib/utils/validation";

const careerApplicationSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(60, "Full name cannot exceed 60 characters.")
    .regex(REGEX_PATTERNS.NAME, "Name can only contain alphabetic letters, spaces, dots, and hyphens.")
    .trim(),
  email: z
    .string()
    .email("A valid email address is required (e.g. teacher@example.com).")
    .regex(REGEX_PATTERNS.EMAIL, "Please provide a valid standard email format.")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .regex(REGEX_PATTERNS.PHONE, "Enter a valid phone number (e.g., 0300 1234567 or +92 300 1234567).")
    .trim(),
  subject: z.string().min(2, "Discipline or subject specialization is required.").trim(),
  experienceYears: z.string().min(1, "Experience duration is required.").trim(),
  qualification: z.string().min(2, "Highest degree or qualification is required.").trim(),
  coverLetter: z.string().max(3000, "Cover note cannot exceed 3000 characters.").optional(),
  cvUrl: z.string().min(1, "Resume / CV document is required."),
  cvFileName: z.string().min(1, "Resume file name is required.").default("resume.pdf"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = careerApplicationSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid career application details. Please resolve the highlighted fields.",
        parseResult.error.flatten().fieldErrors
      );
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("Active Seneca Academy configuration not found.");
    }

    const {
      name,
      email,
      phone,
      subject,
      experienceYears,
      qualification,
      coverLetter,
      cvUrl,
      cvFileName,
    } = parseResult.data;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `TCH-APP-${randomSuffix}`;

    const appRecord = await TeacherApplication.create({
      schoolId: school._id,
      applicationId,
      name,
      email,
      phone,
      subject,
      experienceYears,
      qualification,
      coverLetter: coverLetter || "",
      cvUrl,
      cvFileName,
      status: "pending",
    });

    await AuditLog.create({
      schoolId: school._id,
      action: "TEACHER_APPLICATION_SUBMITTED",
      resource: "TeacherApplication",
      resourceId: appRecord._id.toString(),
      details: {
        applicationId,
        name,
        subject,
        qualification,
        cvFileName,
      },
    });

    return apiSuccess(
      {
        applicationId,
        name,
        subject,
        status: "pending",
        cvFileName,
      },
      "Application and Resume submitted successfully to the Seneca Faculty Recruitment Board."
    );
  } catch (error) {
    return apiError(error);
  }
}
