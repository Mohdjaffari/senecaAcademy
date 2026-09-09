import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import AcademicsPage from "@/models/AcademicsPage";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { DEFAULT_ACADEMICS_PAGE_DATA } from "@/lib/db/academics-page-defaults";
import { AcademicsPageFormValidation } from "@/lib/validations/academics-page";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await AcademicsPage.findOne({ schoolId: school._id }).lean();

    if (!page) {
      page = (await AcademicsPage.create({
        schoolId: school._id,
        ...DEFAULT_ACADEMICS_PAGE_DATA,
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
    console.error("GET /api/website/academics error:", error);
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
        "Only administrators and principals can modify the Academics page."
      );
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const body = await req.json();
    const validatedData = AcademicsPageFormValidation.parse(body);

    let page = await AcademicsPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await AcademicsPage.create({
        schoolId: school._id,
        ...DEFAULT_ACADEMICS_PAGE_DATA,
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
        hero: validatedData.hero,
        academicDivisions: validatedData.academicDivisions,
        stemInnovation: validatedData.stemInnovation,
        assessmentStandards: validatedData.assessmentStandards,
        ctaBanner: validatedData.ctaBanner,
        senecaDifference: validatedData.senecaDifference,
        seo: validatedData.seo,
        updatedAt: new Date(),
      };
      page.draftUpdatedAt = new Date();
      page.updatedBy = userSignature;
      await page.save();

      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        action: "ACADEMICS_PAGE_DRAFT_UPDATED",
        resource: "AcademicsPage",
        details: { sectionsOrder: validatedData.sectionsOrder },
      });

      return apiSuccess({
        message: "Academics page draft saved successfully.",
        page,
      });
    } else {
      // Direct Publish
      page.pageTitle = validatedData.pageTitle;
      page.pageDescription = validatedData.pageDescription;
      page.slug = validatedData.slug;
      page.isPublished = validatedData.isPublished;
      page.sectionsOrder = validatedData.sectionsOrder;
      page.hero = validatedData.hero;
      page.academicDivisions = validatedData.academicDivisions;
      page.stemInnovation = validatedData.stemInnovation;
      page.assessmentStandards = validatedData.assessmentStandards;
      page.ctaBanner = validatedData.ctaBanner;
      page.senecaDifference = validatedData.senecaDifference;
      page.seo = validatedData.seo;
      page.publishedAt = new Date();
      page.publishedBy = userSignature;
      page.lastUpdated = new Date();
      page.updatedBy = userSignature;
      page.draft = undefined; // Clear draft
      page.draftUpdatedAt = undefined;

      await page.save();

      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        action: "ACADEMICS_PAGE_PUBLISHED",
        resource: "AcademicsPage",
        details: { sectionsOrder: validatedData.sectionsOrder },
      });

      return apiSuccess({
        message: "Academics page published successfully to the live public website.",
        page,
      });
    }
  } catch (error: any) {
    console.error("PUT /api/website/academics error:", error);
    return apiError(error);
  }
}
