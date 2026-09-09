import { Metadata } from "next";
import { getPublishedContactPage } from "@/lib/db/contact-page-server";
import { DEFAULT_CONTACT_PAGE_DATA } from "@/lib/db/contact-page-defaults";
import ContactHeroSection from "@/components/public/contact/ContactHeroSection";
import ContactSection from "@/components/public/ContactSection";
import DepartmentContactsSection from "@/components/public/contact/DepartmentContactsSection";
import ContactFaqSection from "@/components/public/contact/ContactFaqSection";
import ContactCtaSection from "@/components/public/contact/ContactCtaSection";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPublishedContactPage();
  const seo = pageData.seo || DEFAULT_CONTACT_PAGE_DATA.seo;

  return {
    title: seo.metaTitle || "Contact & Campus Guided Tour — Seneca Academy Karachi",
    description:
      seo.metaDescription ||
      "Get in touch with Seneca Academy Karachi in Soldier Bazar. Book a guided campus visit, call our admissions helpline at +92 335 7413777, or send an inquiry online.",
    keywords:
      seo.keywords && seo.keywords.length > 0
        ? seo.keywords
        : ["Contact Seneca Academy", "Soldier Bazar school", "Karachi school contact"],
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function ContactPublicPage() {
  const pageData = await getPublishedContactPage();

  const sectionsOrder =
    pageData.sectionsOrder && pageData.sectionsOrder.length > 0
      ? pageData.sectionsOrder
      : ["hero", "coordinates", "departments", "officeHours", "faq", "cta"];

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return <ContactHeroSection key="hero" hero={pageData.hero} />;
      case "coordinates":
      case "inquiryForm":
      case "officeHours":
        return (
          <ContactSection
            key="contact-main"
            coordinates={pageData.coordinates}
            inquiryForm={pageData.inquiryForm}
            officeHours={pageData.officeHours}
          />
        );
      case "departments":
        return <DepartmentContactsSection key="departments" departments={pageData.departments} />;
      case "faq":
        return <ContactFaqSection key="faq" faq={pageData.faq} />;
      case "cta":
        return <ContactCtaSection key="cta" cta={pageData.cta} />;
      default:
        return null;
    }
  };

  // Avoid duplicate rendering of the ContactSection if multiple keys ("coordinates", "inquiryForm", "officeHours") are present in sectionsOrder
  const renderedSections: string[] = [];
  const sectionsToRender = sectionsOrder.filter((key) => {
    if (key === "coordinates" || key === "inquiryForm" || key === "officeHours") {
      if (renderedSections.includes("contact-main")) {
        return false;
      }
      renderedSections.push("contact-main");
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
