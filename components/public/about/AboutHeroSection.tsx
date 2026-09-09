"use client";

import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import PageHero from "@/components/public/PageHero";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { DEFAULT_ABOUT_PAGE_DATA, IHeroData } from "@/lib/db/about-page-defaults";

interface AboutHeroSectionProps {
  data?: IHeroData;
}

export function AboutHeroSection({ data = DEFAULT_ABOUT_PAGE_DATA.hero }: AboutHeroSectionProps) {
  const { admissionsOpen } = usePublicWebsite();

  if (data?.isVisible === false) {
    return null;
  }

  // Dynamic primary CTA calculation if configured with dynamic admissions toggle
  let primaryCta = data.primaryCta?.isVisible
    ? {
        text: data.primaryCta.text,
        href: data.primaryCta.href,
      }
    : undefined;

  let secondaryCta = data.secondaryCta?.isVisible
    ? {
        text: data.secondaryCta.text,
        href: data.secondaryCta.href,
      }
    : undefined;

  if (data.primaryCta?.dynamicBehavior === "admissions_toggle") {
    primaryCta = admissionsOpen
      ? { text: "Apply for Admission", href: "/admissions" }
      : { text: "Explore Academics", href: "/academics" };

    secondaryCta = admissionsOpen
      ? { text: "View Academics", href: "/academics" }
      : { text: "Contact Campus", href: "/contact" };
  }

  return (
    <PageHero
      badge={data.badge || "Our Heritage & Purpose"}
      badgeIcon={data.showBadge ? getDynamicIcon(data.badgeIcon, "h-3.5 w-3.5") : undefined}
      title={data.title || "Nurturing Minds, Building Character"}
      highlightedTitle={data.highlightedTitle}
      description={data.description}
      breadcrumbs={data.breadcrumbs || [{ label: "About Us" }]}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      variant={data.variant || "crimson"}
    />
  );
}

export default AboutHeroSection;
