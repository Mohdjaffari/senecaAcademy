"use client";

import { Camera } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

export function GalleryHeroSection() {
  const { admissionsOpen } = usePublicWebsite();

  return (
    <PageHero
      badge="Campus Life & Visual Tour"
      badgeIcon={<Camera className="h-3.5 w-3.5" />}
      title="Explore Our Campus"
      highlightedTitle="Facilities & Life."
      description="Take a visual tour through our state-of-the-art STEM laboratories, well-stocked library, digital smart classrooms, sports grounds, and vibrant student community events in Soldier Bazar."
      breadcrumbs={[{ label: "Campus Gallery" }]}
      primaryCta={{ text: "Book a Campus Tour", href: "/contact" }}
      secondaryCta={
        admissionsOpen
          ? { text: "Apply for Admission", href: "/admissions" }
          : { text: "View Academics", href: "/academics" }
      }
      variant="crimson"
    />
  );
}

export default GalleryHeroSection;

