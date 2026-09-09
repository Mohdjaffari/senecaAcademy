import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import AdmissionsPage from "@/models/AdmissionsPage";
import WebsiteSettings from "@/models/WebsiteSettings";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { DEFAULT_ADMISSIONS_PAGE_DATA } from "@/lib/db/admissions-page-defaults";
import { AdmissionsPageFormValidation } from "@/lib/validations/admissions-page";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await AdmissionsPage.findOne({ schoolId: school._id }).lean();

    if (!page) {
      page = (await AdmissionsPage.create({
        schoolId: school._id,
        ...DEFAULT_ADMISSIONS_PAGE_DATA,
      })) as any;
    }

    const { searchParams } = new URL(req.url);
    const isPreview = searchParams.get("preview") === "true";
    const session = await getSession();

    // If authenticated admin/principal requested draft or preview, return draft overlay if present
    if (
      isPreview &&
      session &&
      (session.role === "super_admin" || session.role === "principal") &&
      page?.draft
    ) {
      const mergedData = {
        ...page,
        ...page.draft,
        isDraftMode: true,
      };
      return apiSuccess({ page: mergedData, isDraft: true });
    }

    return apiSuccess({ page });
  } catch (error: any) {
    console.error("GET /api/admin/admissions error:", error);
    return apiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError(
        "Only administrators and principals can modify the Admissions page."
      );
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const body = await req.json();
    const validatedData = AdmissionsPageFormValidation.parse(body);

    let page = await AdmissionsPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await AdmissionsPage.create({
        schoolId: school._id,
        ...DEFAULT_ADMISSIONS_PAGE_DATA,
      });
    }

    const userSignature = {
      userId: session.userId,
      name: session.name,
      email: session.email,
    };

    if (validatedData.saveAsDraft) {
      // Save as draft without touching public view
      page.draft = {
        pageTitle: validatedData.pageTitle,
        pageDescription: validatedData.pageDescription,
        sectionsOrder: validatedData.sectionsOrder,
        globalSettings: validatedData.globalSettings,
        hero: validatedData.hero,
        roadmap: validatedData.roadmap,
        eligibility: validatedData.eligibility,
        documents: validatedData.documents,
        scholarships: validatedData.scholarships,
        faqs: validatedData.faqs,
        saturdayBooking: validatedData.saturdayBooking,
        seo: validatedData.seo,
        updatedAt: new Date(),
      };
      page.draftUpdatedAt = new Date();
      page.updatedBy = userSignature;
      await page.save();

      // Audit Log
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: "UPDATE",
        entity: "AdmissionsPage",
        entityId: page._id.toString(),
        details: "Staged new draft for Admissions & Fees page",
      });

      return apiSuccess({
        message: "Admissions page draft saved successfully.",
        page,
        isDraft: true,
      });
    }

    // Publish Live
    page.pageTitle = validatedData.pageTitle;
    page.pageDescription = validatedData.pageDescription || "";
    page.sectionsOrder = validatedData.sectionsOrder;
    page.globalSettings = validatedData.globalSettings;
    page.hero = validatedData.hero;
    page.roadmap = validatedData.roadmap;
    page.eligibility = validatedData.eligibility;
    page.documents = validatedData.documents;
    page.scholarships = validatedData.scholarships;
    page.faqs = validatedData.faqs;
    page.saturdayBooking = validatedData.saturdayBooking;
    page.seo = validatedData.seo;
    page.isPublished = true;
    page.publishedAt = new Date();
    page.publishedBy = userSignature;
    page.lastUpdated = new Date();
    page.updatedBy = userSignature;
    page.draft = null as any; // Clear draft once published

    await page.save();

    // Synchronize global settings in WebsiteSettings
    await WebsiteSettings.findOneAndUpdate(
      { schoolId: school._id },
      {
        $set: {
          admissionsOpen: validatedData.globalSettings.admissionsOpen,
          admissionsSession: validatedData.globalSettings.admissionsSession,
          admissionsDeadline: validatedData.globalSettings.admissionsDeadline,
          admissionsNotice: validatedData.globalSettings.admissionsNotice,
          admissionsClosedNotice: validatedData.globalSettings.admissionsClosedNotice,
          admissionsAnnouncement: validatedData.globalSettings.admissionsAnnouncement,
        },
      },
      { upsert: true }
    );

    // Audit Log
    await AuditLog.create({
      schoolId: school._id,
      userId: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "UPDATE",
      entity: "AdmissionsPage",
      entityId: page._id.toString(),
      details: "Published live updates for Admissions & Fees page",
    });

    return apiSuccess({
      message: "Admissions page published live successfully.",
      page,
      isDraft: false,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/admissions error:", error);
    return apiError(error);
  }
}
