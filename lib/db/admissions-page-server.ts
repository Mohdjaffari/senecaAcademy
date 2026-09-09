import connectToDatabase from "@/lib/db/mongodb";
import AdmissionsPage from "@/models/AdmissionsPage";
import WebsiteSettings from "@/models/WebsiteSettings";
import School from "@/models/School";
import { DEFAULT_ADMISSIONS_PAGE_DATA, IAdmissionsPageData } from "@/lib/db/admissions-page-defaults";

/**
 * Server-side data fetching service to retrieve published Admissions page content from MongoDB.
 * Strictly used in Server Components, Server Actions, and API route handlers.
 */
export async function getPublishedAdmissionsPage(): Promise<IAdmissionsPageData> {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const query = school ? { schoolId: school._id } : {};

    let pageDoc = await AdmissionsPage.findOne(query).lean();
    const settings = await WebsiteSettings.findOne(query).lean();

    if (!pageDoc) {
      if (school) {
        pageDoc = (await AdmissionsPage.create({
          schoolId: school._id,
          ...DEFAULT_ADMISSIONS_PAGE_DATA,
        })) as any;
      }
    }

    if (!pageDoc) {
      return DEFAULT_ADMISSIONS_PAGE_DATA;
    }

    const parsedPage: IAdmissionsPageData = JSON.parse(JSON.stringify(pageDoc));

    return {
      ...DEFAULT_ADMISSIONS_PAGE_DATA,
      ...parsedPage,
      globalSettings: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings,
        ...(parsedPage.globalSettings || {}),
        admissionsOpen:
          parsedPage.globalSettings?.admissionsOpen !== undefined
            ? parsedPage.globalSettings.admissionsOpen
            : settings?.admissionsOpen !== false,
        admissionsSession:
          parsedPage.globalSettings?.admissionsSession ||
          settings?.admissionsSession ||
          DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings.admissionsSession,
        admissionsDeadline:
          parsedPage.globalSettings?.admissionsDeadline ||
          settings?.admissionsDeadline ||
          DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings.admissionsDeadline,
        admissionsNotice:
          parsedPage.globalSettings?.admissionsNotice ||
          settings?.admissionsNotice ||
          DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings.admissionsNotice,
        admissionsClosedNotice:
          parsedPage.globalSettings?.admissionsClosedNotice ||
          settings?.admissionsClosedNotice ||
          DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings.admissionsClosedNotice,
        admissionsAnnouncement:
          parsedPage.globalSettings?.admissionsAnnouncement ||
          settings?.admissionsAnnouncement ||
          DEFAULT_ADMISSIONS_PAGE_DATA.globalSettings.admissionsAnnouncement,
      },
      hero: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.hero,
        ...(parsedPage.hero || {}),
      },
      statusBanner: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.statusBanner,
        ...(parsedPage.statusBanner || {}),
      },
      roadmap: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.roadmap,
        ...(parsedPage.roadmap || {}),
      },
      eligibility: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.eligibility,
        ...(parsedPage.eligibility || {}),
      },
      documents: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.documents,
        ...(parsedPage.documents || {}),
      },
      scholarships: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.scholarships,
        ...(parsedPage.scholarships || {}),
      },
      faqs: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.faqs,
        ...(parsedPage.faqs || {}),
      },
      saturdayBooking: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.saturdayBooking,
        ...(parsedPage.saturdayBooking || {}),
      },
      seo: {
        ...DEFAULT_ADMISSIONS_PAGE_DATA.seo,
        ...(parsedPage.seo || {}),
      },
    };
  } catch (error) {
    console.error("Error fetching published admissions page from database:", error);
    return DEFAULT_ADMISSIONS_PAGE_DATA;
  }
}
