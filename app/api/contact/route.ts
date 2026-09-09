import { NextRequest } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db/mongodb";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import ContactSubmission from "@/models/ContactSubmission";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { ValidationError, AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { REGEX_PATTERNS } from "@/lib/utils/validation";

const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(60, "Full name cannot exceed 60 characters.")
    .regex(REGEX_PATTERNS.NAME, "Name can only contain alphabetic letters, spaces, dots, and hyphens.")
    .trim(),
  email: z
    .string()
    .email("A valid email address is required (e.g. name@domain.com).")
    .regex(REGEX_PATTERNS.EMAIL, "Please provide a valid standard email format.")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .regex(REGEX_PATTERNS.PHONE, "Enter a valid phone number (e.g., 0300 1234567 or +92 300 1234567).")
    .trim(),
  subject: z
    .string()
    .min(2, "Subject is required.")
    .max(120, "Subject cannot exceed 120 characters.")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(3000, "Message cannot exceed 3000 characters.")
    .trim(),
});

/**
 * POST /api/contact
 * Public submission of contact inquiries
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      throw new ValidationError(
        "Invalid contact form fields. Please correct the highlighted errors.",
        parseResult.error.flatten().fieldErrors
      );
    }

    await connectToDatabase();

    const school = await School.findOne({ status: "active" });
    const { fullName, email, phone, subject, message } = parseResult.data;

    // Generate unique inquiry reference
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const submissionId = `INQ-${new Date().getFullYear()}-${randomSuffix}`;

    const submission = await ContactSubmission.create({
      schoolId: school ? school._id : undefined,
      submissionId,
      fullName,
      email,
      phone,
      subject,
      message,
      status: "new",
    });

    if (school) {
      await AuditLog.create({
        schoolId: school._id,
        action: "PUBLIC_CONTACT_INQUIRY",
        resource: "ContactSubmission",
        resourceId: submission._id.toString(),
        details: {
          submissionId,
          fullName,
          email,
          phone,
          subject,
          messagePreview: message.substring(0, 100),
        },
      });
    }

    return apiSuccess(
      {
        submissionId,
        fullName,
        email,
        subject,
        sentAt: submission.createdAt,
      },
      "Thank you! Your message has been received. Our administration will contact you within 24 hours."
    );
  } catch (error) {
    return apiError(error);
  }
}

/**
 * GET /api/contact
 * Admin endpoint to list and search contact inquiries
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required to view contact inquiries.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can view contact submissions.");
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const search = url.searchParams.get("search") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "25", 10);

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { submissionId: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    const total = await ContactSubmission.countDocuments(query);
    const submissions = await ContactSubmission.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Summary counts for dashboard metrics
    const [newCount, inProgressCount, repliedCount, archivedCount] = await Promise.all([
      ContactSubmission.countDocuments({ status: "new" }),
      ContactSubmission.countDocuments({ status: "in_progress" }),
      ContactSubmission.countDocuments({ status: "replied" }),
      ContactSubmission.countDocuments({ status: "archived" }),
    ]);

    const formatted = submissions.map((sub: any) => ({
      id: sub._id.toString(),
      submissionId: sub.submissionId,
      fullName: sub.fullName,
      email: sub.email,
      phone: sub.phone,
      subject: sub.subject,
      message: sub.message,
      status: sub.status,
      notes: sub.notes || "",
      repliedAt: sub.repliedAt ? new Date(sub.repliedAt).toISOString() : null,
      createdAt: sub.createdAt ? new Date(sub.createdAt).toISOString() : new Date().toISOString(),
    }));

    return apiSuccess({
      submissions: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        total: newCount + inProgressCount + repliedCount + archivedCount,
        new: newCount,
        inProgress: inProgressCount,
        replied: repliedCount,
        archived: archivedCount,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
