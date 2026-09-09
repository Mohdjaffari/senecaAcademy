import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import School, { IBankAccount } from "@/models/School";
import AcademicYear from "@/models/AcademicYear";
import WebsiteSettings from "@/models/WebsiteSettings";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";

export async function GET(_req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" }).lean()) || (await School.findOne({}).lean());
    const academicYear = await AcademicYear.findOne({ isCurrent: true }).lean();

    let websiteSettings = school ? await WebsiteSettings.findOne({ schoolId: school._id }).lean() : null;
    if (!websiteSettings) {
      websiteSettings = await WebsiteSettings.findOne({}).lean();
    }

    return apiSuccess(
      {
        school: school || null,
        academicYear: academicYear || null,
        admissions: websiteSettings
          ? {
              admissionsOpen: Boolean(websiteSettings.admissionsOpen),
              admissionsDeadline: websiteSettings.admissionsDeadline || "",
              admissionsSession: websiteSettings.admissionsSession || "",
              admissionsNotice: websiteSettings.admissionsNotice || "",
              admissionsClosedNotice: websiteSettings.admissionsClosedNotice || "",
              admissionsAnnouncement: websiteSettings.admissionsAnnouncement || "",
            }
          : null,
      },
      "School and admission settings retrieved successfully."
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }
    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators can configure school and admission settings.");
    }

    const body = await req.json();

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) throw new Error("School missing.");

    // Update School Core Profile
    if (body.name) school.name = body.name.trim();
    if (body.email) school.email = body.email.toLowerCase().trim();
    if (body.phone) school.phone = body.phone.trim();
    if (body.address) school.address = body.address.trim();
    if (body.websiteUrl) school.websiteUrl = body.websiteUrl.trim();

    if (body.settings) {
      school.settings = {
        ...school.settings,
        ...body.settings,
      };
    }

    // Update Institutional Bank Accounts
    if (body.bankAccounts !== undefined && Array.isArray(body.bankAccounts)) {
      const sanitizedAccounts: IBankAccount[] = body.bankAccounts
        .filter((acc: Partial<IBankAccount>) => acc.bankName && acc.accountNumber && acc.accountTitle)
        .map((acc: Partial<IBankAccount>) => ({
          bankName: String(acc.bankName).trim(),
          accountTitle: String(acc.accountTitle).trim(),
          accountNumber: String(acc.accountNumber).trim(),
          iban: acc.iban ? String(acc.iban).trim().toUpperCase() : "",
          branchName: acc.branchName ? String(acc.branchName).trim() : "",
          branchCode: acc.branchCode ? String(acc.branchCode).trim() : "",
          routingCode: acc.routingCode ? String(acc.routingCode).trim() : "",
          instructions: acc.instructions ? String(acc.instructions).trim() : "",
          isPrimary: Boolean(acc.isPrimary),
          isActive: acc.isActive !== false,
        }));

      // Ensure at least one account is marked primary if accounts exist
      if (sanitizedAccounts.length > 0) {
        const hasPrimary = sanitizedAccounts.some((a) => a.isPrimary);
        if (!hasPrimary) {
          sanitizedAccounts[0].isPrimary = true;
        }
      }

      school.bankAccounts = sanitizedAccounts as any;
    }

    await school.save();

    // Update Admissions & Public Parameters in WebsiteSettings
    let websiteSettings = await WebsiteSettings.findOne({ schoolId: school._id });
    if (!websiteSettings) {
      websiteSettings = (await WebsiteSettings.findOne({})) || new WebsiteSettings({ schoolId: school._id });
    }

    if (body.admissions !== undefined) {
      const {
        admissionsOpen,
        admissionsDeadline,
        admissionsSession,
        admissionsNotice,
        admissionsClosedNotice,
        admissionsAnnouncement,
      } = body.admissions;

      if (admissionsOpen !== undefined) websiteSettings.admissionsOpen = Boolean(admissionsOpen);
      if (admissionsDeadline !== undefined) websiteSettings.admissionsDeadline = admissionsDeadline.trim();
      if (admissionsSession !== undefined) websiteSettings.admissionsSession = admissionsSession.trim();
      if (admissionsNotice !== undefined) websiteSettings.admissionsNotice = admissionsNotice.trim();
      if (admissionsClosedNotice !== undefined) websiteSettings.admissionsClosedNotice = admissionsClosedNotice.trim();
      if (admissionsAnnouncement !== undefined) websiteSettings.admissionsAnnouncement = admissionsAnnouncement.trim();

      // Automatically sync hero badge and CTA based on admission status
      if (websiteSettings.hero) {
        const sessionStr = websiteSettings.admissionsSession || "";
        if (websiteSettings.admissionsOpen) {
          const deadlineStr = websiteSettings.admissionsDeadline ? ` • DEADLINE: ${websiteSettings.admissionsDeadline}` : "";
          websiteSettings.hero.badge = sessionStr ? `ADMISSIONS OPEN • ${sessionStr}${deadlineStr}` : "ADMISSIONS OPEN";
          websiteSettings.hero.ctaText = "Apply for Admission";
          websiteSettings.hero.ctaLink = "/admissions";
        } else {
          websiteSettings.hero.badge = sessionStr ? `ADMISSIONS CLOSED • ${sessionStr}` : "ADMISSIONS CLOSED";
          websiteSettings.hero.ctaText = "Inquire for Next Cycle";
          websiteSettings.hero.ctaLink = "/contact";
        }
      }

      await websiteSettings.save();
    }

    return apiSuccess(
      {
        school,
        admissions: websiteSettings
          ? {
              admissionsOpen: Boolean(websiteSettings.admissionsOpen),
              admissionsDeadline: websiteSettings.admissionsDeadline || "",
              admissionsSession: websiteSettings.admissionsSession || "",
              admissionsNotice: websiteSettings.admissionsNotice || "",
              admissionsClosedNotice: websiteSettings.admissionsClosedNotice || "",
              admissionsAnnouncement: websiteSettings.admissionsAnnouncement || "",
            }
          : null,
      },
      "School settings, bank accounts, and admission parameters updated successfully!"
    );
  } catch (error) {
    return apiError(error);
  }
}
