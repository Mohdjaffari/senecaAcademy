import { Metadata } from "next";
import connectToDatabase from "@/lib/db/mongodb";
import AcademicsPage from "@/models/AcademicsPage";
import School from "@/models/School";
import {
  DEFAULT_ACADEMICS_PAGE_DATA,
  IAcademicsPageContent,
} from "@/lib/db/academics-page-defaults";
import AcademicsHeroSection from "@/components/public/academics/AcademicsHeroSection";
import DivisionListSection from "@/components/public/academics/DivisionListSection";
import StemInnovationSection from "@/components/public/academics/StemInnovationSection";
import AssessmentStandardsSection from "@/components/public/academics/AssessmentStandardsSection";
import AcademicsCtaBanner from "@/components/public/academics/AcademicsCtaBanner";

async function getAcademicsPageData(): Promise<IAcademicsPageContent> {
  try {
    await connectToDatabase();
    let school = (await School.findOne({ status: "active" })) || (await School.findOne({}));
    if (!school) {
      return DEFAULT_ACADEMICS_PAGE_DATA;
    }

    let pageDoc = await AcademicsPage.findOne({ schoolId: school._id }).lean();
    if (!pageDoc) {
      pageDoc = (await AcademicsPage.create({
        schoolId: school._id,
        ...DEFAULT_ACADEMICS_PAGE_DATA,
      })) as any;
    }

    return (pageDoc as unknown as IAcademicsPageContent) || DEFAULT_ACADEMICS_PAGE_DATA;
  } catch (error) {
    console.error("Error loading Academics page data:", error);
    return DEFAULT_ACADEMICS_PAGE_DATA;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getAcademicsPageData();
  const seo = pageData.seo || DEFAULT_ACADEMICS_PAGE_DATA.seo;

  return {
    title: seo.title || "Academics & Curriculum — Seneca Academy Karachi",
    description:
      seo.description ||
      "Explore Seneca Academy's structured academic divisions from Early Years Montessori to Senior Matriculation (BSEK). Discover our STEM labs, sciences, and humanities curriculum.",
    keywords:
      seo.keywords ||
      "Seneca Academics, Montessori, Primary School, Middle School, BSEK Matriculation, STEM Robotics, Karachi Cambridge curriculum",
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function AcademicsPublicPage() {
  const pageData = await getAcademicsPageData();

  const sectionsOrder =
    pageData.sectionsOrder && pageData.sectionsOrder.length > 0
      ? pageData.sectionsOrder
      : [
          "hero",
          "academicDivisions",
          "stemInnovation",
          "assessmentStandards",
          "ctaBanner",
        ];

  // Component render mapping
  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return <AcademicsHeroSection key="hero" data={pageData.hero} />;
      case "academicDivisions":
        return (
          <DivisionListSection
            key="academicDivisions"
            data={pageData.academicDivisions}
          />
        );
      case "stemInnovation":
        return (
          <StemInnovationSection
            key="stemInnovation"
            data={pageData.stemInnovation}
          />
        );
      case "assessmentStandards":
        return (
          <AssessmentStandardsSection
            key="assessmentStandards"
            data={pageData.assessmentStandards}
          />
        );
      case "ctaBanner":
        return <AcademicsCtaBanner key="ctaBanner" data={pageData.ctaBanner} />;
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
