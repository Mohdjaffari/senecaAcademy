import connectToDatabase from "@/lib/db/mongodb";
import ContactPage from "@/models/ContactPage";
import School from "@/models/School";
import { DEFAULT_CONTACT_PAGE_DATA, IContactPageData } from "@/lib/db/contact-page-defaults";

/**
 * Server-side data fetching service to retrieve published Contact page content from MongoDB.
 * Strictly used in Server Components, Server Actions, and API route handlers.
 */
export async function getPublishedContactPage(): Promise<IContactPageData> {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const query = school ? { schoolId: school._id } : {};

    let pageDoc = await ContactPage.findOne(query).lean();

    if (!pageDoc) {
      if (school) {
        pageDoc = (await ContactPage.create({
          schoolId: school._id,
          ...DEFAULT_CONTACT_PAGE_DATA,
        })) as any;
      }
    }

    if (!pageDoc) {
      return DEFAULT_CONTACT_PAGE_DATA;
    }

    const parsedPage: IContactPageData = JSON.parse(JSON.stringify(pageDoc));

    return {
      ...DEFAULT_CONTACT_PAGE_DATA,
      ...parsedPage,
      sectionsOrder: parsedPage.sectionsOrder || DEFAULT_CONTACT_PAGE_DATA.sectionsOrder,
      hero: {
        ...DEFAULT_CONTACT_PAGE_DATA.hero,
        ...(parsedPage.hero || {}),
      },
      coordinates: {
        ...DEFAULT_CONTACT_PAGE_DATA.coordinates,
        ...(parsedPage.coordinates || {}),
      },
      inquiryForm: {
        ...DEFAULT_CONTACT_PAGE_DATA.inquiryForm,
        ...(parsedPage.inquiryForm || {}),
        subjectsList:
          parsedPage.inquiryForm?.subjectsList && parsedPage.inquiryForm.subjectsList.length > 0
            ? parsedPage.inquiryForm.subjectsList
            : DEFAULT_CONTACT_PAGE_DATA.inquiryForm.subjectsList,
      },
      departments: {
        ...DEFAULT_CONTACT_PAGE_DATA.departments,
        ...(parsedPage.departments || {}),
        departments:
          parsedPage.departments?.departments && parsedPage.departments.departments.length > 0
            ? parsedPage.departments.departments
            : DEFAULT_CONTACT_PAGE_DATA.departments.departments,
      },
      officeHours: {
        ...DEFAULT_CONTACT_PAGE_DATA.officeHours,
        ...(parsedPage.officeHours || {}),
      },
      faq: {
        ...DEFAULT_CONTACT_PAGE_DATA.faq,
        ...(parsedPage.faq || {}),
        items:
          parsedPage.faq?.items && parsedPage.faq.items.length > 0
            ? parsedPage.faq.items
            : DEFAULT_CONTACT_PAGE_DATA.faq.items,
      },
      cta: {
        ...DEFAULT_CONTACT_PAGE_DATA.cta,
        ...(parsedPage.cta || {}),
      },
      seo: {
        ...DEFAULT_CONTACT_PAGE_DATA.seo,
        ...(parsedPage.seo || {}),
      },
    };
  } catch (error) {
    console.error("Failed to fetch published Contact page data from DB:", error);
    return DEFAULT_CONTACT_PAGE_DATA;
  }
}
