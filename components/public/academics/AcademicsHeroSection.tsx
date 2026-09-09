"use client";

import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IAcademicsHeroData, DEFAULT_ACADEMICS_PAGE_DATA } from "@/lib/db/academics-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";

interface AcademicsHeroSectionProps {
  data?: IAcademicsHeroData;
}

export function AcademicsHeroSection({ data }: AcademicsHeroSectionProps) {
  const { admissionsOpen } = usePublicWebsite();
  const hero = data || DEFAULT_ACADEMICS_PAGE_DATA.hero;

  if (hero.isVisible === false) {
    return null;
  }

  const activeCtaGroup = admissionsOpen
    ? hero.admissionsOpenState
    : hero.admissionsClosedState;

  const primaryCta =
    activeCtaGroup?.primaryCta?.isVisible !== false
      ? {
          text: activeCtaGroup?.primaryCta?.text || (admissionsOpen ? "Apply for Admission" : "View Fee Schedule"),
          href: activeCtaGroup?.primaryCta?.href || (admissionsOpen ? "/admissions" : "/fees"),
        }
      : undefined;

  const secondaryCta =
    activeCtaGroup?.secondaryCta?.isVisible !== false
      ? {
          text: activeCtaGroup?.secondaryCta?.text || (admissionsOpen ? "View Fee Schedule" : "Contact Admissions"),
          href: activeCtaGroup?.secondaryCta?.href || (admissionsOpen ? "/fees" : "/contact"),
        }
      : undefined;

  return (
    <PageHero
      badge={hero.badge}
      badgeIcon={hero.showBadge !== false ? getDynamicIcon(hero.badgeIcon, "h-3.5 w-3.5") : undefined}
      title={hero.title}
      highlightedTitle={hero.highlightedTitle}
      description={hero.description}
      breadcrumbs={hero.breadcrumbs && hero.breadcrumbs.length > 0 ? hero.breadcrumbs : [{ label: "Academics" }]}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      variant={hero.variant || "amber"}
    />
  );
}

export default AcademicsHeroSection;
