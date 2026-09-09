import { Metadata } from "next";
import connectToDatabase from "@/lib/db/mongodb";
import AboutPage from "@/models/AboutPage";
import School from "@/models/School";
import { DEFAULT_ABOUT_PAGE_DATA, IAboutPageContent } from "@/lib/db/about-page-defaults";
import AboutHeroSection from "@/components/public/about/AboutHeroSection";
import PrincipalDeskSection from "@/components/public/about/PrincipalDeskSection";
import VisionMissionSection from "@/components/public/about/VisionMissionSection";
import CoreValuesSection from "@/components/public/about/CoreValuesSection";
import MilestonesTimelineSection from "@/components/public/about/MilestonesTimelineSection";
import CampusExperienceCta from "@/components/public/about/CampusExperienceCta";

async function getAboutPageData(): Promise<IAboutPageContent> {
  try {
    await connectToDatabase();
    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      return DEFAULT_ABOUT_PAGE_DATA;
    }

    let pageDoc = await AboutPage.findOne({ schoolId: school._id }).lean();
    if (!pageDoc) {
      pageDoc = (await AboutPage.create({
        schoolId: school._id,
        ...DEFAULT_ABOUT_PAGE_DATA,
      })) as any;
    }

    return (pageDoc as unknown as IAboutPageContent) || DEFAULT_ABOUT_PAGE_DATA;
  } catch (error) {
    console.error("Error loading About page data:", error);
    return DEFAULT_ABOUT_PAGE_DATA;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getAboutPageData();
  const seo = pageData.seo || DEFAULT_ABOUT_PAGE_DATA.seo;

  return {
    title: seo.title || "About Us — Seneca Academy Karachi",
    description:
      seo.description ||
      "Learn about Seneca Academy's 25-year heritage of academic excellence, leadership from Principal M. Zohaib Ali, vision, mission, and core values in Soldier Bazar, Karachi.",
    keywords: seo.keywords || "Seneca Academy, About Seneca, Soldier Bazar school, Karachi schools, Cambridge school",
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function AboutPublicPage() {
  const pageData = await getAboutPageData();

  const sectionsOrder =
    pageData.sectionsOrder && pageData.sectionsOrder.length > 0
      ? pageData.sectionsOrder
      : ["hero", "principal", "visionMission", "coreValues", "milestones", "campusCta"];

  // Component render mapping
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return <AboutHeroSection key="hero" data={pageData.hero} />;
      case "principal":
        return <PrincipalDeskSection key="principal" data={pageData.principal} />;
      case "visionMission":
        return <VisionMissionSection key="visionMission" data={pageData.visionMission} />;
      case "coreValues":
        return <CoreValuesSection key="coreValues" data={pageData.coreValues} />;
      case "milestones":
        return <MilestonesTimelineSection key="milestones" data={pageData.milestones} />;
      case "campusCta":
        return <CampusExperienceCta key="campusCta" data={pageData.campusCta} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      {sectionsOrder.map((sectionKey) => renderSection(sectionKey))}
    </main>
  );
}
