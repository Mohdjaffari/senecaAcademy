"use client";

import { GraduationCap } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IAdmissionsHeroData, IAdmissionsGlobalSettings } from "@/lib/db/admissions-page-defaults";

interface AdmissionsHeroSectionProps {
  hero?: IAdmissionsHeroData;
  globalSettings?: IAdmissionsGlobalSettings;
}

export function AdmissionsHeroSection({ hero, globalSettings }: AdmissionsHeroSectionProps) {
  const context = usePublicWebsite();

  const admissionsOpen =
    globalSettings?.admissionsOpen !== undefined
      ? globalSettings.admissionsOpen
      : context.admissionsOpen;

  const admissionsSession =
    globalSettings?.admissionsSession || context.admissionsSession || "Session 2026–2027";

  if (hero && hero.isVisible === false) {
    return null;
  }

  const badgeText =
    hero?.badge ||
    (admissionsOpen
      ? `Admissions & Fees ${admissionsSession}`
      : "Admissions & Inquiries");

  const title = hero?.title || "Transparent Fee Structure &";
  const highlightedTitle = hero?.highlightedTitle || "Admission Process.";
  const description =
    hero?.description ||
    "Explore our transparent tuition breakdown, interactive cost calculator, Saturday assessment roadmap, and age eligibility criteria for Seneca Academy, Karachi.";

  const primaryCta = hero?.primaryCta?.isVisible !== false
    ? {
        text: hero?.primaryCta?.text || "Tuition Cost Calculator",
        href: hero?.primaryCta?.href || "#fee-calculator",
      }
    : undefined;

  const secondaryCta = hero?.secondaryCta?.isVisible !== false
    ? {
        text:
          hero?.secondaryCta?.text ||
          (admissionsOpen ? "Admission Roadmap" : "Contact Campus Desk"),
        href:
          hero?.secondaryCta?.href ||
          (admissionsOpen ? "#admission-process" : "/contact"),
      }
    : undefined;

  return (
    <PageHero
      badge={badgeText}
      badgeIcon={<GraduationCap className="h-3.5 w-3.5" />}
      title={title}
      highlightedTitle={highlightedTitle}
      description={description}
      breadcrumbs={hero?.breadcrumbs || [{ label: "Admissions & Fees" }]}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      variant={hero?.variant || "crimson"}
    />
  );
}

export default AdmissionsHeroSection;
