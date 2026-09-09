"use client";

import { BookOpen } from "lucide-react";
import PageHero from "@/components/public/PageHero";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

export function BlogsHeroSection() {
  const { admissionsOpen } = usePublicWebsite();

  return (
    <PageHero
      badge="Articles & Perspectives"
      badgeIcon={<BookOpen className="h-3.5 w-3.5" />}
      title="Academy News, Articles &"
      highlightedTitle="Academic Insights."
      description="Thought leadership, educational methodologies, student milestones, and board preparation strategies written by our distinguished educators."
      breadcrumbs={[{ label: "News & Blogs" }]}
      primaryCta={
        admissionsOpen
          ? { text: "Apply for Admission", href: "/admissions" }
          : { text: "Explore Academics", href: "/academics" }
      }
      secondaryCta={{ text: "About Seneca", href: "/about" }}
      variant="amber"
    />
  );
}

export default BlogsHeroSection;

