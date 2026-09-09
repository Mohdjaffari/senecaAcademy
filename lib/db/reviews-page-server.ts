import connectToDatabase from "@/lib/db/mongodb";
import ReviewsPage from "@/models/ReviewsPage";
import School from "@/models/School";
import { DEFAULT_REVIEWS_PAGE_DATA, IReviewsPageData } from "@/lib/db/reviews-page-defaults";

/**
 * Server-side data fetching service to retrieve published Community Reviews & Feedback page content from MongoDB.
 * Strictly used in Server Components, Server Actions, and API route handlers.
 */
export async function getPublishedReviewsPage(): Promise<IReviewsPageData> {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const query = school ? { schoolId: school._id } : {};

    let pageDoc = await ReviewsPage.findOne(query).lean();

    if (!pageDoc) {
      if (school) {
        pageDoc = (await ReviewsPage.create({
          schoolId: school._id,
          ...DEFAULT_REVIEWS_PAGE_DATA,
        })) as any;
      }
    }

    if (!pageDoc) {
      return DEFAULT_REVIEWS_PAGE_DATA;
    }

    const parsedPage: IReviewsPageData = JSON.parse(JSON.stringify(pageDoc));

    return {
      ...DEFAULT_REVIEWS_PAGE_DATA,
      ...parsedPage,
      sectionsOrder: parsedPage.sectionsOrder || DEFAULT_REVIEWS_PAGE_DATA.sectionsOrder,
      hero: {
        ...DEFAULT_REVIEWS_PAGE_DATA.hero,
        ...(parsedPage.hero || {}),
        trustBadges:
          parsedPage.hero?.trustBadges && parsedPage.hero.trustBadges.length > 0
            ? parsedPage.hero.trustBadges
            : DEFAULT_REVIEWS_PAGE_DATA.hero.trustBadges,
      },
      stats: {
        ...DEFAULT_REVIEWS_PAGE_DATA.stats,
        ...(parsedPage.stats || {}),
        metricCards:
          parsedPage.stats?.metricCards && parsedPage.stats.metricCards.length > 0
            ? parsedPage.stats.metricCards
            : DEFAULT_REVIEWS_PAGE_DATA.stats.metricCards,
      },
      categories:
        parsedPage.categories && parsedPage.categories.length > 0
          ? parsedPage.categories
          : DEFAULT_REVIEWS_PAGE_DATA.categories,
      roles:
        parsedPage.roles && parsedPage.roles.length > 0
          ? parsedPage.roles
          : DEFAULT_REVIEWS_PAGE_DATA.roles,
      submissionSettings: {
        ...DEFAULT_REVIEWS_PAGE_DATA.submissionSettings,
        ...(parsedPage.submissionSettings || {}),
      },
      ctaBanner: {
        ...DEFAULT_REVIEWS_PAGE_DATA.ctaBanner,
        ...(parsedPage.ctaBanner || {}),
      },
      seo: {
        ...DEFAULT_REVIEWS_PAGE_DATA.seo,
        ...(parsedPage.seo || {}),
        keywords:
          parsedPage.seo?.keywords && parsedPage.seo.keywords.length > 0
            ? parsedPage.seo.keywords
            : DEFAULT_REVIEWS_PAGE_DATA.seo.keywords,
      },
    };
  } catch (error) {
    console.error("Failed to fetch published Reviews page data from DB:", error);
    return DEFAULT_REVIEWS_PAGE_DATA;
  }
}
