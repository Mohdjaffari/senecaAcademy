import { NextRequest } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import ContactPage from "@/models/ContactPage";
import School from "@/models/School";
import WebsiteSettings from "@/models/WebsiteSettings";
import AuditLog from "@/models/AuditLog";
import { getSession } from "@/lib/auth/session";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { DEFAULT_CONTACT_PAGE_DATA } from "@/lib/db/contact-page-defaults";
import { ContactPageFormValidation } from "@/lib/validations/contact-page";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    let page = await ContactPage.findOne({ schoolId: school._id }).lean();

    if (!page) {
      page = (await ContactPage.create({
        schoolId: school._id,
        ...DEFAULT_CONTACT_PAGE_DATA,
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
    console.error("GET /api/website/contact error:", error);
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
      throw new AuthorizationError("Only administrators and principals can modify the Contact page.");
    }

    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      throw new Error("School configuration missing.");
    }

    const body = await req.json();
    const validatedData = ContactPageFormValidation.parse(body);

    let page = await ContactPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await ContactPage.create({
        schoolId: school._id,
        ...DEFAULT_CONTACT_PAGE_DATA,
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
        coordinates: validatedData.coordinates,
        inquiryForm: validatedData.inquiryForm,
        departments: validatedData.departments,
        officeHours: validatedData.officeHours,
        faq: validatedData.faq,
        cta: validatedData.cta,
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
        resource: "ContactPageDraft",
        details: {
          savedBy: session.name,
          updatedSections: validatedData.sectionsOrder,
        },
      });

      return apiSuccess(
        { page, isDraft: true },
        "Contact page draft saved successfully. Changes can be previewed in admin before publishing."
      );
    } else {
      // Publish live
      page.sectionsOrder = validatedData.sectionsOrder;
      page.hero = validatedData.hero;
      page.coordinates = validatedData.coordinates;
      page.inquiryForm = validatedData.inquiryForm;
      page.departments = validatedData.departments;
      page.officeHours = validatedData.officeHours;
      page.faq = validatedData.faq;
      page.cta = validatedData.cta;
      page.seo = validatedData.seo;
      page.isPublished = true;
      page.publishedAt = new Date();
      page.publishedBy = userSignature;
      page.lastUpdated = new Date();
      page.updatedBy = userSignature;
      page.draft = undefined; // clear staged draft on live publish

      await page.save();

      // Sync global contact fields to WebsiteSettings
      try {
        await WebsiteSettings.findOneAndUpdate(
          { schoolId: school._id },
          {
            $set: {
              contactPhone: validatedData.coordinates.mainPhone,
              contactEmail: validatedData.coordinates.infoEmail,
              admissionsEmail: validatedData.coordinates.admissionsEmail,
              address: validatedData.coordinates.address,
              whatsappNumber: validatedData.coordinates.whatsappNumber,
            },
          },
          { upsert: true, new: true }
        );
      } catch (settingsErr) {
        console.warn("Could not sync contact coordinates to WebsiteSettings:", settingsErr);
      }

      // Log published update
      await AuditLog.create({
        schoolId: school._id,
        userId: session.userId,
        action: "PUBLISH",
        resource: "ContactPage",
        details: {
          publishedBy: session.name,
          updatedSections: validatedData.sectionsOrder,
          mainPhone: validatedData.coordinates.mainPhone,
          infoEmail: validatedData.coordinates.infoEmail,
        },
      });

      return apiSuccess(
        { page, isPublished: true },
        "Contact page published successfully! Changes are now live on the public website."
      );
    }
  } catch (error: any) {
    console.error("PUT /api/website/contact error:", error);
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

    let page = await ContactPage.findOne({ schoolId: school._id });

    if (!page) {
      page = await ContactPage.create({
        schoolId: school._id,
        ...DEFAULT_CONTACT_PAGE_DATA,
      });
    } else {
      page.sectionsOrder = DEFAULT_CONTACT_PAGE_DATA.sectionsOrder;
      page.hero = DEFAULT_CONTACT_PAGE_DATA.hero;
      page.coordinates = DEFAULT_CONTACT_PAGE_DATA.coordinates;
      page.inquiryForm = DEFAULT_CONTACT_PAGE_DATA.inquiryForm;
      page.departments = DEFAULT_CONTACT_PAGE_DATA.departments;
      page.officeHours = DEFAULT_CONTACT_PAGE_DATA.officeHours;
      page.faq = DEFAULT_CONTACT_PAGE_DATA.faq;
      page.cta = DEFAULT_CONTACT_PAGE_DATA.cta;
      page.seo = DEFAULT_CONTACT_PAGE_DATA.seo;
      page.draft = undefined;
      page.lastUpdated = new Date();
      page.updatedBy = {
        userId: session.userId,
        name: session.name,
        email: session.email,
      };

      await page.save();
    }

    return apiSuccess({ page }, "Contact page has been reset to system defaults.");
  } catch (error: any) {
    console.error("POST /api/website/contact error:", error);
    return apiError(error);
  }
}
