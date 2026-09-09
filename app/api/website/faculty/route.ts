import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import FacultyPage from "@/models/FacultyPage";
import School from "@/models/School";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { DEFAULT_FACULTY_PAGE_DATA } from "@/lib/db/faculty-page-defaults";
import { FacultyPageFormValidation } from "@/lib/validations/faculty-page";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await FacultyPage.findOne({ schoolId: school._id }).lean();

    if (!page) {
      page = (await FacultyPage.create({
        schoolId: school._id,
        ...DEFAULT_FACULTY_PAGE_DATA,
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
    console.error("GET /api/website/faculty error:", error);
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
      throw new AuthorizationError("Only administrators and principals can modify the Faculty & Campus page.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const body = await req.json();
    const validatedData = FacultyPageFormValidation.parse(body);

    let page = await FacultyPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await FacultyPage.create({
        schoolId: school._id,
        ...DEFAULT_FACULTY_PAGE_DATA,
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
        facultySection: validatedData.facultySection,
        careers: validatedData.careers,
        standards: validatedData.standards,
        facilities: validatedData.facilities,
        experienceCta: validatedData.experienceCta,
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
        action: "FACULTY_PAGE_DRAFT_UPDATED",
        resource: "FacultyPage",
        details: { sectionsOrder: validatedData.sectionsOrder },
      });

      return apiSuccess({
        message: "Campus & Faculty draft staged successfully.",
        page,
      });
    } else {
      // Direct Publish
      page.sectionsOrder = validatedData.sectionsOrder;
      page.hero = validatedData.hero;
      page.facultySection = validatedData.facultySection;
      page.careers = validatedData.careers;
      page.standards = validatedData.standards;
      page.facilities = validatedData.facilities;
      page.experienceCta = validatedData.experienceCta;
      page.seo = validatedData.seo;
      page.isPublished = true;
      page.publishedAt = new Date();
      page.publishedBy = userSignature;
      page.lastUpdated = new Date();
      page.updatedBy = userSignature;
      page.draft = undefined; // Clear draft overlay
      page.draftUpdatedAt = undefined;

      await page.save();

      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        userEmail: session.email,
        userRole: session.role,
        action: "FACULTY_PAGE_PUBLISHED",
        resource: "FacultyPage",
        details: { sectionsOrder: validatedData.sectionsOrder },
      });

      return apiSuccess({
        message: "Campus & Faculty page published successfully to the live public website.",
        page,
      });
    }
  } catch (error: any) {
    console.error("PUT /api/website/faculty error:", error);
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
      throw new AuthorizationError("Only administrators and principals can reset the Faculty & Campus page.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await FacultyPage.findOne({ schoolId: school._id });
    if (!page) {
      page = await FacultyPage.create({
        schoolId: school._id,
        ...DEFAULT_FACULTY_PAGE_DATA,
      });
    } else {
      page.sectionsOrder = DEFAULT_FACULTY_PAGE_DATA.sectionsOrder;
      page.hero = DEFAULT_FACULTY_PAGE_DATA.hero;
      page.facultySection = DEFAULT_FACULTY_PAGE_DATA.facultySection;
      page.careers = DEFAULT_FACULTY_PAGE_DATA.careers;
      page.standards = DEFAULT_FACULTY_PAGE_DATA.standards;
      page.facilities = DEFAULT_FACULTY_PAGE_DATA.facilities;
      page.experienceCta = DEFAULT_FACULTY_PAGE_DATA.experienceCta;
      page.seo = DEFAULT_FACULTY_PAGE_DATA.seo;
      page.draft = undefined;
      page.draftUpdatedAt = undefined;
      page.lastUpdated = new Date();
      page.updatedBy = {
        userId: session.userId,
        name: session.name,
        email: session.email,
      };
      await page.save();
    }

    await AuditLog.create({
      schoolId: school._id,
      userId: session.userId,
      userEmail: session.email,
      userRole: session.role,
      action: "FACULTY_PAGE_RESET_DEFAULTS",
      resource: "FacultyPage",
      details: { resetBy: session.email },
    });

    return apiSuccess({
      message: "Campus & Faculty page reset to factory defaults successfully.",
      page,
    });
  } catch (error: any) {
    console.error("POST /api/website/faculty error:", error);
    return apiError(error);
  }
}
