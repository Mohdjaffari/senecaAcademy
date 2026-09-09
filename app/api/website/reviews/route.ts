import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import ReviewsPage from "@/models/ReviewsPage";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { DEFAULT_REVIEWS_PAGE_DATA } from "@/lib/db/reviews-page-defaults";
import { ReviewsPageFormValidation } from "@/lib/validations/reviews-page";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await ReviewsPage.findOne({ schoolId: school._id }).lean();

    if (!page) {
      page = (await ReviewsPage.create({
        schoolId: school._id,
        ...DEFAULT_REVIEWS_PAGE_DATA,
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
    console.error("GET /api/website/reviews error:", error);
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
      throw new AuthorizationError("Only administrators and principals can modify the Reviews & Feedback page.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const body = await req.json();
    const saveAsDraft = body.saveAsDraft !== false;
    const validatedData = ReviewsPageFormValidation.parse(body);

    let page = await ReviewsPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await ReviewsPage.create({
        schoolId: school._id,
        ...DEFAULT_REVIEWS_PAGE_DATA,
      });
    }

    const userSignature = {
      userId: session.userId,
      name: session.name,
      email: session.email,
    };

    if (saveAsDraft) {
      // Save as draft overlay
      page.draft = {
        sectionsOrder: validatedData.sectionsOrder,
        hero: validatedData.hero,
        stats: validatedData.stats,
        categories: validatedData.categories,
        roles: validatedData.roles,
        submissionSettings: validatedData.submissionSettings,
        ctaBanner: validatedData.ctaBanner,
        seo: validatedData.seo,
        updatedAt: new Date(),
      };
      page.draftUpdatedAt = new Date();
      page.updatedBy = userSignature;
      await page.save();

      return apiSuccess({
        message: "Draft changes for Reviews & Feedback page saved successfully.",
        page,
        isDraft: true,
      });
    } else {
      // Direct overwrite / publish
      page.sectionsOrder = validatedData.sectionsOrder;
      page.hero = validatedData.hero;
      page.stats = validatedData.stats;
      page.categories = validatedData.categories;
      page.roles = validatedData.roles;
      page.submissionSettings = validatedData.submissionSettings;
      page.ctaBanner = validatedData.ctaBanner;
      page.seo = validatedData.seo;
      page.draft = null;
      page.isPublished = true;
      page.publishedAt = new Date();
      page.publishedBy = userSignature;
      page.lastUpdated = new Date();
      page.updatedBy = userSignature;
      await page.save();

      // Log Audit Event
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userName: session.name,
        userRole: session.role,
        action: "UPDATE_REVIEWS_PAGE",
        category: "WEBSITE_MANAGEMENT",
        description: `Published updates to the Community Reviews & Feedback page.`,
        details: {
          sectionsCount: validatedData.sectionsOrder?.length || 4,
          categoriesCount: validatedData.categories?.length || 0,
        },
      });

      return apiSuccess({
        message: "Community Reviews & Feedback page published to live website successfully.",
        page,
        isDraft: false,
      });
    }
  } catch (error: any) {
    console.error("PUT /api/website/reviews error:", error);
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
      throw new AuthorizationError("Only administrators and principals can publish the Reviews & Feedback page.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await ReviewsPage.findOne({ schoolId: school._id });
    if (!page) {
      page = await ReviewsPage.create({
        schoolId: school._id,
        ...DEFAULT_REVIEWS_PAGE_DATA,
      });
    }

    const userSignature = {
      userId: session.userId,
      name: session.name,
      email: session.email,
    };

    // Promote draft to live if draft exists
    if (page.draft) {
      if (page.draft.sectionsOrder) page.sectionsOrder = page.draft.sectionsOrder;
      if (page.draft.hero) page.hero = page.draft.hero;
      if (page.draft.stats) page.stats = page.draft.stats;
      if (page.draft.categories) page.categories = page.draft.categories;
      if (page.draft.roles) page.roles = page.draft.roles;
      if (page.draft.submissionSettings) page.submissionSettings = page.draft.submissionSettings;
      if (page.draft.ctaBanner) page.ctaBanner = page.draft.ctaBanner;
      if (page.draft.seo) page.seo = page.draft.seo;
      page.draft = null;
    }

    page.isPublished = true;
    page.publishedAt = new Date();
    page.publishedBy = userSignature;
    page.lastUpdated = new Date();
    page.updatedBy = userSignature;
    await page.save();

    // Log Audit
    await AuditLog.create({
      schoolId: school._id,
      userId: session.userId,
      userName: session.name,
      userRole: session.role,
      action: "PUBLISH_REVIEWS_PAGE",
      category: "WEBSITE_MANAGEMENT",
      description: `Published staged draft of Community Reviews & Feedback page to production.`,
    });

    return apiSuccess({
      message: "Community Reviews & Feedback page published to live site successfully!",
      page,
    });
  } catch (error: any) {
    console.error("POST /api/website/reviews error:", error);
    return apiError(error);
  }
}
