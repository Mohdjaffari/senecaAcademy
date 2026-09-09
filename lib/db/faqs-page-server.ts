import connectToDatabase from "@/lib/db/mongodb";
import FaqPage from "@/models/FaqPage";
import School from "@/models/School";
import { DEFAULT_FAQS_PAGE_DATA, IFaqsPageData } from "@/lib/db/faqs-page-defaults";

/**
 * Server-side data fetching service to retrieve published FAQs page content from MongoDB.
 * Strictly used in Server Components, Server Actions, and API route handlers.
 */
export async function getPublishedFaqsPage(): Promise<IFaqsPageData> {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const query = school ? { schoolId: school._id } : {};

    let pageDoc = await FaqPage.findOne(query).lean();

    if (!pageDoc) {
      if (school) {
        pageDoc = (await FaqPage.create({
          schoolId: school._id,
          ...DEFAULT_FAQS_PAGE_DATA,
        })) as any;
      }
    }

    if (!pageDoc) {
      return DEFAULT_FAQS_PAGE_DATA;
    }

    const parsedPage: IFaqsPageData = JSON.parse(JSON.stringify(pageDoc));

    return {
      ...DEFAULT_FAQS_PAGE_DATA,
      ...parsedPage,
      sectionsOrder: parsedPage.sectionsOrder || DEFAULT_FAQS_PAGE_DATA.sectionsOrder,
      hero: {
        ...DEFAULT_FAQS_PAGE_DATA.hero,
        ...(parsedPage.hero || {}),
      },
      categories:
        parsedPage.categories && parsedPage.categories.length > 0
          ? parsedPage.categories
          : DEFAULT_FAQS_PAGE_DATA.categories,
      questions:
        parsedPage.questions && parsedPage.questions.length > 0
          ? parsedPage.questions
          : DEFAULT_FAQS_PAGE_DATA.questions,
      stats: {
        ...DEFAULT_FAQS_PAGE_DATA.stats,
        ...(parsedPage.stats || {}),
        items:
          parsedPage.stats?.items && parsedPage.stats.items.length > 0
            ? parsedPage.stats.items
            : DEFAULT_FAQS_PAGE_DATA.stats.items,
      },
      helpdesk: {
        ...DEFAULT_FAQS_PAGE_DATA.helpdesk,
        ...(parsedPage.helpdesk || {}),
      },
      seo: {
        ...DEFAULT_FAQS_PAGE_DATA.seo,
        ...(parsedPage.seo || {}),
      },
    };
  } catch (error) {
    console.error("Failed to fetch published FAQs page data from DB:", error);
    return DEFAULT_FAQS_PAGE_DATA;
  }
}
