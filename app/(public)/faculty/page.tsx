import { Metadata } from "next";
import { getPublishedFacultyPage } from "@/lib/db/faculty-page-server";
import { DEFAULT_FACULTY_PAGE_DATA } from "@/lib/db/faculty-page-defaults";
import FacultyHeroSection from "@/components/public/faculty/FacultyHeroSection";
import FacultySection from "@/components/public/FacultySection";
import FacultyStandardsSection from "@/components/public/faculty/FacultyStandardsSection";
import CampusFacilitiesSection from "@/components/public/faculty/CampusFacilitiesSection";
import FacultyExperienceCta from "@/components/public/faculty/FacultyExperienceCta";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPublishedFacultyPage();
  const seo = pageData.seo || DEFAULT_FACULTY_PAGE_DATA.seo;

  return {
    title: seo.metaTitle || "Faculty Educators & Campus — Seneca Academy Karachi",
    description:
      seo.metaDescription ||
      "Meet our distinguished master-level faculty educators and explore modern campus facilities at Seneca Academy Karachi.",
    keywords:
      seo.keywords && seo.keywords.length > 0
        ? seo.keywords
        : ["Seneca Academy faculty", "Karachi school teachers", "campus facilities", "careers"],
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function FacultyPublicPage() {
  const pageData = await getPublishedFacultyPage();

  const sectionsOrder =
    pageData.sectionsOrder && pageData.sectionsOrder.length > 0
      ? pageData.sectionsOrder
      : ["hero", "faculty", "careers", "standards", "facilities", "experienceCta"];

  // Component render mapping
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return <FacultyHeroSection key="hero" hero={pageData.hero} />;
      case "faculty":
      case "careers":
        // FacultySection includes both Faculty grid and the Careers section
        // We render it once if either key is encountered (using unique key 'faculty-section')
        return (
          <div key="faculty-and-careers" id="faculty-team" className="scroll-mt-24">
            <FacultySection facultySection={pageData.facultySection} careers={pageData.careers} />
          </div>
        );
      case "standards":
        return <FacultyStandardsSection key="standards" standards={pageData.standards} />;
      case "facilities":
        return <CampusFacilitiesSection key="facilities" facilities={pageData.facilities} />;
      case "experienceCta":
        return <FacultyExperienceCta key="experienceCta" experienceCta={pageData.experienceCta} />;
      default:
        return null;
    }
  };

  // Filter out duplicate render if both "faculty" and "careers" are in sectionsOrder
  const renderedSections: string[] = [];
  const sectionsToRender = sectionsOrder.filter((key) => {
    if (key === "faculty" || key === "careers") {
      if (renderedSections.includes("faculty-and-careers")) {
        return false;
      }
      renderedSections.push("faculty-and-careers");
      return true;
    }
    return true;
  });

  return (
    <main className="flex flex-col min-h-screen">
      {sectionsToRender.map((sectionKey) => renderSection(sectionKey))}
    </main>
  );
}
