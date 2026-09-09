import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import AboutPage from "@/models/AboutPage";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthenticationError("Authentication required.");
    }

    if (session.role !== "super_admin" && session.role !== "principal") {
      throw new AuthorizationError("Only administrators and principals can publish the About page.");
    }

    await connectToDatabase();

    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await AboutPage.findOne({ schoolId: school._id });
    if (!page) {
      throw new Error("About page document not found.");
    }

    const userSignature = {
      userId: session.userId,
      name: session.name,
      email: session.email,
    };

    // If there is a draft, apply it to live
    if (page.draft) {
      if (page.draft.pageTitle) page.pageTitle = page.draft.pageTitle;
      if (page.draft.pageDescription !== undefined) page.pageDescription = page.draft.pageDescription;
      if (page.draft.sectionsOrder) page.sectionsOrder = page.draft.sectionsOrder;
      if (page.draft.hero) page.hero = page.draft.hero as any;
      if (page.draft.principal) page.principal = page.draft.principal as any;
      if (page.draft.visionMission) page.visionMission = page.draft.visionMission as any;
      if (page.draft.coreValues) page.coreValues = page.draft.coreValues as any;
      if (page.draft.milestones) page.milestones = page.draft.milestones as any;
      if (page.draft.campusCta) page.campusCta = page.draft.campusCta as any;
      if (page.draft.seo) page.seo = page.draft.seo as any;
    }

    page.isPublished = true;
    page.publishedAt = new Date();
    page.publishedBy = userSignature;
    page.lastUpdated = new Date();
    page.updatedBy = userSignature;
    page.draft = undefined;
    page.draftUpdatedAt = undefined;

    await page.save();

    await AuditLog.create({
      schoolId: school._id,
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: "ABOUT_PAGE_PUBLISHED",
      resource: "AboutPage",
      details: { publishedAt: page.publishedAt },
    });

    return apiSuccess({
      message: "About page published successfully! Changes are now live on the public website.",
      page,
    });
  } catch (error: any) {
    console.error("POST /api/website/about/publish error:", error);
    return apiError(error);
  }
}
