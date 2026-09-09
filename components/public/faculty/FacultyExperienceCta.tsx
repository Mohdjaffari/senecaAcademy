"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IFacultyExperienceCtaData } from "@/lib/db/faculty-page-defaults";

interface FacultyExperienceCtaProps {
  experienceCta?: IFacultyExperienceCtaData;
}

export function FacultyExperienceCta({ experienceCta }: FacultyExperienceCtaProps) {
  const { admissionsOpen } = usePublicWebsite();

  if (experienceCta && experienceCta.isVisible === false) {
    return null;
  }

  const heading = experienceCta?.heading || "Experience Seneca Mentorship";
  const description = experienceCta?.description || "Join our dynamic student community and learn directly from Karachi's leading educators at Seneca Academy.";
  const primaryCta = experienceCta?.primaryCta || {
    isVisible: true,
    text: "Apply for Admission",
    href: "/admissions",
  };
  const secondaryCta = experienceCta?.secondaryCta || {
    isVisible: true,
    text: "Visit Campus",
    href: "/contact",
  };

  return (
    <section className="py-16 sm:py-20 bg-card/60 border-t border-border">
      <div className="container text-center max-w-2xl mx-auto px-4 space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          {heading}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
          {primaryCta.isVisible && (
            <Button asChild variant="glow" className="rounded-full px-8 font-bold">
              <Link href={primaryCta.href || (admissionsOpen ? "/admissions" : "/academics")}>
                {primaryCta.text || (admissionsOpen ? "Apply for Admission" : "Explore Academic Wings")}
              </Link>
            </Button>
          )}
          {secondaryCta.isVisible && (
            <Button asChild variant="outline" className="rounded-full px-7 font-semibold">
              <Link href={secondaryCta.href || "/contact"}>
                {secondaryCta.text || "Visit Campus"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default FacultyExperienceCta;
