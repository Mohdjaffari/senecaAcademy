"use client";

import { CreditCard } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

export function FeesHeroSection() {
  const { admissionsOpen, admissionsSession } = usePublicWebsite();

  return (
    <PageHero
      badge={admissionsOpen ? `Approved ${admissionsSession}` : "Approved Tuition Schedule"}
      badgeIcon={<CreditCard className="h-3.5 w-3.5" />}
      title="Transparent Fee Structure &"
      highlightedTitle="Cost Calculator."
      description="We believe in complete financial transparency. Our approved fee schedule ensures top-tier educators, low student-teacher ratios, and modern STEM laboratories with zero hidden surcharges."
      breadcrumbs={[{ label: "Fee Structure" }]}
      primaryCta={
        admissionsOpen
          ? { text: "Apply for Admission", href: "/admissions" }
          : { text: "Calculate Tuition", href: "#fee-calculator" }
      }
      secondaryCta={
        admissionsOpen
          ? { text: "Calculate Tuition", href: "#fee-calculator" }
          : { text: "Contact Campus Desk", href: "/contact" }
      }
      variant="amber"
    />
  );
}

export default FeesHeroSection;

