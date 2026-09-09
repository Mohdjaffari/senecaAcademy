import connectToDatabase from "@/lib/db/mongodb";
import FacultyPage from "@/models/FacultyPage";
import School from "@/models/School";
import { DEFAULT_FACULTY_PAGE_DATA, IFacultyPageData } from "@/lib/db/faculty-page-defaults";

/**
 * Server-side data fetching service to retrieve published Faculty & Campus page content from MongoDB.
 * Strictly used in Server Components, Server Actions, and API route handlers.
 */
export async function getPublishedFacultyPage(): Promise<IFacultyPageData> {
  try {
    await connectToDatabase();

    const school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    const query = school ? { schoolId: school._id } : {};

    let pageDoc = await FacultyPage.findOne(query).lean();

    if (!pageDoc) {
      if (school) {
        pageDoc = (await FacultyPage.create({
          schoolId: school._id,
          ...DEFAULT_FACULTY_PAGE_DATA,
        })) as any;
      }
    }

    if (!pageDoc) {
      return DEFAULT_FACULTY_PAGE_DATA;
    }

    const parsedPage: IFacultyPageData = JSON.parse(JSON.stringify(pageDoc));

    return {
      ...DEFAULT_FACULTY_PAGE_DATA,
      ...parsedPage,
      sectionsOrder: parsedPage.sectionsOrder || DEFAULT_FACULTY_PAGE_DATA.sectionsOrder,
      hero: {
        ...DEFAULT_FACULTY_PAGE_DATA.hero,
        ...(parsedPage.hero || {}),
      },
      facultySection: {
        ...DEFAULT_FACULTY_PAGE_DATA.facultySection,
        ...(parsedPage.facultySection || {}),
        members:
          parsedPage.facultySection?.members && parsedPage.facultySection.members.length > 0
            ? parsedPage.facultySection.members
            : DEFAULT_FACULTY_PAGE_DATA.facultySection.members,
      },
      careers: {
        ...DEFAULT_FACULTY_PAGE_DATA.careers,
        ...(parsedPage.careers || {}),
        benefits:
          parsedPage.careers?.benefits && parsedPage.careers.benefits.length > 0
            ? parsedPage.careers.benefits
            : DEFAULT_FACULTY_PAGE_DATA.careers.benefits,
      },
      standards: {
        ...DEFAULT_FACULTY_PAGE_DATA.standards,
        ...(parsedPage.standards || {}),
        items:
          parsedPage.standards?.items && parsedPage.standards.items.length > 0
            ? parsedPage.standards.items
            : DEFAULT_FACULTY_PAGE_DATA.standards.items,
      },
      facilities: {
        ...DEFAULT_FACULTY_PAGE_DATA.facilities,
        ...(parsedPage.facilities || {}),
        facilities:
          parsedPage.facilities?.facilities && parsedPage.facilities.facilities.length > 0
            ? parsedPage.facilities.facilities
            : DEFAULT_FACULTY_PAGE_DATA.facilities.facilities,
      },
      experienceCta: {
        ...DEFAULT_FACULTY_PAGE_DATA.experienceCta,
        ...(parsedPage.experienceCta || {}),
      },
      seo: {
        ...DEFAULT_FACULTY_PAGE_DATA.seo,
        ...(parsedPage.seo || {}),
      },
    };
  } catch (error) {
    console.error("Failed to fetch published Faculty & Campus page data from DB:", error);
    return DEFAULT_FACULTY_PAGE_DATA;
  }
}
