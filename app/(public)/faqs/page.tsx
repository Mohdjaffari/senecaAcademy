import { Metadata } from "next";
import { getPublishedFaqsPage } from "@/lib/db/faqs-page-server";
import { DEFAULT_FAQS_PAGE_DATA } from "@/lib/db/faqs-page-defaults";
import FaqsInteractiveContainer from "@/components/public/faqs/FaqsInteractiveContainer";

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPublishedFaqsPage();
  const seo = pageData.seo || DEFAULT_FAQS_PAGE_DATA.seo;

  return {
    title: seo.metaTitle || "Frequently Asked Questions (FAQs) — Seneca Academy Karachi",
    description:
      seo.metaDescription ||
      "Find instant answers to common questions regarding admissions, fees, BSEK matriculation curriculum, Seneca LMS portal, and campus life in Soldier Bazar, Karachi.",
    keywords:
      seo.keywords && seo.keywords.length > 0
        ? seo.keywords
        : ["Seneca Academy FAQs", "Karachi school questions", "matric admissions Karachi"],
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function FAQsPublicPage() {
  const pageData = await getPublishedFaqsPage();

  return <FaqsInteractiveContainer initialData={pageData} />;
}
