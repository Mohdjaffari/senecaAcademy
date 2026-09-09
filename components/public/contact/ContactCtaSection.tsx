"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IContactCtaData } from "@/lib/db/contact-page-defaults";

interface ContactCtaSectionProps {
  cta?: IContactCtaData;
}

export function ContactCtaSection({ cta }: ContactCtaSectionProps) {
  if (cta && cta.isVisible === false) {
    return null;
  }

  const heading = cta?.heading || "Experience the Seneca Difference in Person";
  const description =
    cta?.description ||
    "Visit our campus, meet our educators, and explore our world-class learning facilities today.";
  const primaryCta = cta?.primaryCta || {
    isVisible: true,
    text: "Apply for Admission",
    href: "/admissions",
  };
  const secondaryCta = cta?.secondaryCta || {
    isVisible: true,
    text: "Chat on WhatsApp",
    href: "https://wa.me/923357413777",
  };

  return (
    <section className="py-16 sm:py-20 bg-card/60 border-t border-border">
      <div className="container max-w-2xl mx-auto px-4 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          {heading}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
          {primaryCta.isVisible && (
            <Button asChild variant="glow" className="rounded-full px-8 font-bold">
              <Link href={primaryCta.href || "/admissions"}>
                {primaryCta.text || "Apply for Admission"}
              </Link>
            </Button>
          )}
          {secondaryCta.isVisible && (
            <Button asChild variant="outline" className="rounded-full px-7 font-semibold">
              <a
                href={secondaryCta.href || "https://wa.me/923357413777"}
                target={secondaryCta.href?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                {secondaryCta.text || "Chat on WhatsApp"}
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactCtaSection;
