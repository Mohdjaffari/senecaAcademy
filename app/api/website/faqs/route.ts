import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import FaqPage from "@/models/FaqPage";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { DEFAULT_FAQS_PAGE_DATA } from "@/lib/db/faqs-page-defaults";
import { FaqsPageFormValidation } from "@/lib/validations/faqs-page";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await FaqPage.findOne({ schoolId: school._id }).lean();

    if (!page) {
      page = (await FaqPage.create({
        schoolId: school._id,
        ...DEFAULT_FAQS_PAGE_DATA,
      })) as any;
    }

    const { searchParams } = new URL(req.url);
    const isPreview = searchParams.get("preview") === "true";
    const session = await getSession();

    // If authenticated admin/principal requested draft or preview, return draft overlay if present
    if (isPreview && session && (session.role === "super_admin" || session.role === "principal") && page?.draft) {
      const mergedData = {
        ...page,
        ...page.draft,
        isDraftMode: true,
      };
      return apiSuccess({ page: mergedData, isDraft: true });
    }

    return apiSuccess({ page });
  } catch (error: any) {
    console.error("GET /api/website/faqs error:", error);
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
      throw new AuthorizationError("Only administrators and principals can modify the FAQs page.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const body = await req.json();
    const validatedData = FaqsPageFormValidation.parse(body);

    let page = await FaqPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await FaqPage.create({
        schoolId: school._id,
        ...DEFAULT_FAQS_PAGE_DATA,
      });
    }

    const userSignature = {
      userId: session.userId,
      name: session.name,
      email: session.email,
    };

    if (validatedData.saveAsDraft) {
      // Save as draft overlay
      page.draft = {
        sectionsOrder: validatedData.sectionsOrder,
        hero: validatedData.hero,
        categories: validatedData.categories,
        questions: validatedData.questions,
        stats: validatedData.stats,
        helpdesk: validatedData.helpdesk,
        seo: validatedData.seo,
        updatedAt: new Date(),
      };
      page.draftUpdatedAt = new Date();
      page.updatedBy = userSignature;

      await page.save();

      // Log draft update
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        action: "UPDATE",
        resource: "FaqPageDraft",
        details: {
          savedBy: session.name,
          questionCount: validatedData.questions.length,
          categoriesCount: validatedData.categories.length,
        },
      });

      return apiSuccess(
        { page, isDraft: true },
        "FAQs draft saved successfully. Changes can be previewed in admin before publishing."
      );
    } else {
      // Publish live
      page.sectionsOrder = validatedData.sectionsOrder;
      page.hero = validatedData.hero;
      page.categories = validatedData.categories;
      page.questions = validatedData.questions;
      page.stats = validatedData.stats;
      page.helpdesk = validatedData.helpdesk;
      page.seo = validatedData.seo;
      page.isPublished = true;
      page.publishedAt = new Date();
      page.publishedBy = userSignature;
      page.lastUpdated = new Date();
      page.updatedBy = userSignature;
      page.draft = undefined; // clear staged draft on live publish

      await page.save();

      // Log published update
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        action: "PUBLISH",
        resource: "FaqPage",
        details: {
          publishedBy: session.name,
          questionCount: validatedData.questions.length,
          categoriesCount: validatedData.categories.length,
        },
      });

      return apiSuccess(
        { page, isPublished: true },
        "FAQs Knowledge Base published successfully! Changes are now live on the public website."
      );
    }
  } catch (error: any) {
    console.error("PUT /api/website/faqs error:", error);
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators and principals can reset page configurations.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await FaqPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await FaqPage.create({
        schoolId: school._id,
        ...DEFAULT_FAQS_PAGE_DATA,
      });
    } else {
      page.sectionsOrder = DEFAULT_FAQS_PAGE_DATA.sectionsOrder;
      page.hero = DEFAULT_FAQS_PAGE_DATA.hero;
      page.categories = DEFAULT_FAQS_PAGE_DATA.categories;
      page.questions = DEFAULT_FAQS_PAGE_DATA.questions;
      page.stats = DEFAULT_FAQS_PAGE_DATA.stats;
      page.helpdesk = DEFAULT_FAQS_PAGE_DATA.helpdesk;
      page.seo = DEFAULT_FAQS_PAGE_DATA.seo;
      page.draft = undefined;
      page.lastUpdated = new Date();
      page.updatedBy = {
        userId: session.userId,
        name: session.name,
        email: session.email,
      };

      await page.save();
    }

    return apiSuccess({ page }, "FAQs Knowledge Base has been reset to system defaults.");
  } catch (error: any) {
    console.error("POST /api/website/faqs error:", error);
    return apiError(error);
  }
}
