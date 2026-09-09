"use client";

import React from "react";
import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IContactHeroData } from "@/lib/db/contact-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";

interface ContactHeroSectionProps {
  hero?: IContactHeroData;
}

export function ContactHeroSection({ hero }: ContactHeroSectionProps) {
  const { admissionsOpen } = usePublicWebsite();

  if (hero && hero.isVisible === false) {
    return null;
  }

  const badge = hero?.badge || "Karachi Main Campus";
  const badgeIconName = hero?.badgeIcon || "MapPin";
  const title = hero?.title || "Get in Touch & Book a";
  const highlightedTitle = hero?.highlightedTitle || "Campus Guided Tour.";
  const description =
    hero?.description ||
    "We invite you to visit our Soldier Bazar campus in Karachi for a personalized tour, or connect directly with our admissions and academic counseling team.";

  const primaryCta = hero?.primaryCta?.isVisible !== false
    ? {
        text: hero?.primaryCta?.text || "Send Message Below",
        href: hero?.primaryCta?.href || "#contact",
      }
    : undefined;

  const secondaryCta = hero?.secondaryCta?.isVisible !== false
    ? {
        text:
          hero?.secondaryCta?.text ||
          (admissionsOpen ? "Apply for Admission" : "Explore Academics"),
        href:
          hero?.secondaryCta?.href ||
          (admissionsOpen ? "/admissions" : "/academics"),
      }
    : undefined;

  return (
    <PageHero
      badge={badge}
      badgeIcon={getDynamicIcon(badgeIconName, "h-3.5 w-3.5")}
      title={title}
      highlightedTitle={highlightedTitle}
      description={description}
      breadcrumbs={[{ label: "Contact & Visit" }]}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      variant={hero?.variant || "crimson"}
    />
  );
}

export default ContactHeroSection;
