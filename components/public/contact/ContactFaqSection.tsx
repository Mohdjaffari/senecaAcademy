"use client";

import React from "react";
import { IContactFaqData } from "@/lib/db/contact-page-defaults";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

interface ContactFaqSectionProps {
  faq?: IContactFaqData;
}

export function ContactFaqSection({ faq }: ContactFaqSectionProps) {
  if (faq && faq.isVisible === false) {
    return null;
  }

  const badge = faq?.badge || "Visit & Inquiry FAQs";
  const heading = faq?.heading || "Frequently Asked Questions About Visiting";
  const description =
    faq?.description ||
    "Quick answers to help you plan your campus visit and communication with Seneca Academy.";

  const items = (faq?.items || [])
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="contact-faq" className="py-16 sm:py-20 bg-muted/30 border-t border-border/50 scroll-mt-24">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline">{badge}</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {heading}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="p-5 sm:p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-2.5 rounded-3xl hover:shadow-md hover:border-seneca-crimson/30 transition-all"
            >
              <h4 className="font-heading font-bold text-sm sm:text-base text-foreground flex items-start gap-2.5 leading-snug">
                <HelpCircle className="h-4 w-4 text-seneca-crimson dark:text-seneca-amber shrink-0 mt-0.5" />
                <span>{item.question}</span>
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6.5">
                {item.answer}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ContactFaqSection;
