"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IFaqsHelpdeskData } from "@/lib/db/faqs-page-defaults";

interface FaqsHelpdeskCtaProps {
  helpdesk?: IFaqsHelpdeskData;
}

export function FaqsHelpdeskCta({ helpdesk }: FaqsHelpdeskCtaProps) {
  if (helpdesk && helpdesk.isVisible === false) {
    return null;
  }

  const badge = helpdesk?.badge || "Personalized Assistance";
  const heading = helpdesk?.heading || "Still Have Questions?";
  const description =
    helpdesk?.description ||
    "Our academic counselors and admissions officers are here to assist you with any inquiries regarding admissions, curriculum, or enrollment.";
  const phone = helpdesk?.phone || "+92 335 7413777";
  const phoneHours = helpdesk?.phoneHours || "Mon – Sat, 8:00 AM – 3:00 PM";
  const email = helpdesk?.email || "info@seneca.edu.pk";
  const emailResponseTime = helpdesk?.emailResponseTime || "Response within 24 business hours";
  const campusAddress = helpdesk?.campusAddress || "Soldier Bazar, Garden East, Karachi, Pakistan";
  const whatsappNumber = helpdesk?.whatsappNumber || "+92 335 7413777";

  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <section className="py-16 sm:py-20 bg-background border-t border-border/80">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="crimson">{badge}</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {heading}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Phone */}
          <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs text-center space-y-3 rounded-3xl hover:shadow-lg hover:border-seneca-crimson/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-seneca-crimson/10 text-seneca-crimson mx-auto">
                <Phone className="h-6 w-6" />
              </div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-foreground">Phone Helpline</h4>
              <p className="text-xs text-muted-foreground">{phoneHours}</p>
            </div>
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="text-xs font-bold text-seneca-crimson dark:text-seneca-amber block hover:underline pt-2"
            >
              {phone}
            </a>
          </Card>

          {/* Email */}
          <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs text-center space-y-3 rounded-3xl hover:shadow-lg hover:border-seneca-amber/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-seneca-amber/10 text-seneca-amber mx-auto">
                <Mail className="h-6 w-6" />
              </div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-foreground">Email Inquiries</h4>
              <p className="text-xs text-muted-foreground">{emailResponseTime}</p>
            </div>
            <a
              href={`mailto:${email}`}
              className="text-xs font-bold text-seneca-amber block hover:underline pt-2 truncate"
            >
              {email}
            </a>
          </Card>

          {/* Campus / WhatsApp */}
          <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs text-center space-y-3 rounded-3xl hover:shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h4 className="font-heading font-bold text-sm sm:text-base text-foreground">WhatsApp Counseling</h4>
              <p className="text-xs text-muted-foreground">{campusAddress}</p>
            </div>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=Hello%20Seneca%20Academy%20Admissions!`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block hover:underline pt-2"
            >
              Chat on WhatsApp →
            </a>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default FaqsHelpdeskCta;
