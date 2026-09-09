"use client";

import React from "react";
import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IFaqsHeroData } from "@/lib/db/faqs-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";

interface FaqsHeroSectionProps {
  hero?: IFaqsHeroData;
}

export function FaqsHeroSection({ hero }: FaqsHeroSectionProps) {
  const { admissionsOpen } = usePublicWebsite();

  if (hero && hero.isVisible === false) {
    return null;
  }

  const badge = hero?.badge || "Institutional Knowledge Base";
  const badgeIconName = hero?.badgeIcon || "HelpCircle";
  const title = hero?.title || "Frequently Asked Questions &";
  const highlightedTitle =
    hero?.highlightedTitle ||
    (admissionsOpen ? "Admissions Helpdesk." : "Academic Helpdesk.");
  const description =
    hero?.description ||
    "Find instant, verified answers regarding our admission roadmaps, Cambridge & BSEK matriculation streams, fee structures, faculty standards, and Seneca LMS portal.";

  const primaryCta =
    hero?.primaryCta?.isVisible !== false
      ? {
          text: hero?.primaryCta?.text || "Explore Admissions & Fees",
          href: hero?.primaryCta?.href || "/admissions",
        }
      : undefined;

  const secondaryCta =
    hero?.secondaryCta?.isVisible !== false
      ? {
          text: hero?.secondaryCta?.text || "Contact Helpdesk",
          href: hero?.secondaryCta?.href || "/contact",
        }
      : undefined;

  return (
    <PageHero
      badge={badge}
      badgeIcon={getDynamicIcon(badgeIconName, "h-3.5 w-3.5")}
      title={title}
      highlightedTitle={highlightedTitle}
      description={description}
      breadcrumbs={[{ label: "FAQs & Helpdesk" }]}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      variant={hero?.variant || "amber"}
    />
  );
}

export default FaqsHeroSection;
