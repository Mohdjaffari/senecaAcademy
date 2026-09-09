import { Metadata } from "next";
import AdmissionsHeroSection from "@/components/public/admissions/AdmissionsHeroSection";
import AdmissionsStatusBanner from "@/components/public/admissions/AdmissionsStatusBanner";
import AdmissionRoadmapSection from "@/components/public/admissions/AdmissionRoadmapSection";
import FeeEstimatorSection from "@/components/public/admissions/FeeEstimatorSection";
import AgeEligibilityTableSection from "@/components/public/admissions/AgeEligibilityTableSection";
import RequiredDocumentsSection from "@/components/public/admissions/RequiredDocumentsSection";
import ScholarshipsSection from "@/components/public/admissions/ScholarshipsSection";
import AdmissionsFaqSection from "@/components/public/admissions/AdmissionsFaqSection";
import SaturdayBookingCta from "@/components/public/admissions/SaturdayBookingCta";
import { DEFAULT_ADMISSIONS_PAGE_DATA } from "@/lib/db/admissions-page-defaults";
import { getPublishedAdmissionsPage } from "@/lib/db/admissions-page-server";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPublishedAdmissionsPage();
  return {
    title: pageData.seo?.metaTitle || "Admissions & Fee Structure 2026–2027 — Seneca Academy Karachi",
    description:
      pageData.seo?.metaDescription ||
      "Official admission guidelines, transparent tuition fee calculator, Saturday diagnostic assessments, age criteria, and document requirements for Seneca Academy in Soldier Bazar, Karachi.",
    keywords: pageData.seo?.keywords || [],
    openGraph: pageData.seo?.ogImage
      ? {
          images: [{ url: pageData.seo.ogImage }],
        }
      : undefined,
  };
}

export default async function AdmissionsAndFeesPage() {
  const pageData = await getPublishedAdmissionsPage();

  const {
    globalSettings,
    hero,
    statusBanner,
    roadmap,
    feeStructure,
    eligibility,
    documents,
    scholarships,
    faqs,
    saturdayBooking,
    sectionsOrder,
  } = pageData;

  const order = sectionsOrder || DEFAULT_ADMISSIONS_PAGE_DATA.sectionsOrder;

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return <AdmissionsHeroSection key="hero" hero={hero} globalSettings={globalSettings} />;
      case "statusBanner":
        return (
          <AdmissionsStatusBanner
            key="statusBanner"
            admissionsOpen={globalSettings.admissionsOpen}
            admissionsSession={globalSettings.admissionsSession}
            admissionsDeadline={globalSettings.admissionsDeadline}
            admissionsNotice={globalSettings.admissionsNotice}
            admissionsClosedNotice={globalSettings.admissionsClosedNotice}
            admissionsAnnouncement={globalSettings.admissionsAnnouncement}
            statusBanner={statusBanner}
          />
        );
      case "roadmap":
        return <AdmissionRoadmapSection key="roadmap" roadmap={roadmap} />;
      case "feeEstimator":
        return <FeeEstimatorSection key="feeEstimator" feeStructure={feeStructure} />;
      case "eligibility":
        return <AgeEligibilityTableSection key="eligibility" eligibility={eligibility} />;
      case "documents":
        return <RequiredDocumentsSection key="documents" documents={documents} />;
      case "scholarships":
        return <ScholarshipsSection key="scholarships" scholarships={scholarships} />;
      case "faqs":
        return <AdmissionsFaqSection key="faqs" faqs={faqs} />;
      case "saturdayBooking":
        return <SaturdayBookingCta key="saturdayBooking" saturdayBooking={saturdayBooking} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      {order.map((sectionKey) => renderSection(sectionKey))}
    </main>
  );
}
