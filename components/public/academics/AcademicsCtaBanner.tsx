"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  GraduationCap,
  PhoneCall,
} from "lucide-react";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IAcademicsCtaData, DEFAULT_ACADEMICS_PAGE_DATA } from "@/lib/db/academics-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { cn } from "@/lib/utils";

interface AcademicsCtaBannerProps {
  data?: IAcademicsCtaData;
}

export function AcademicsCtaBanner({ data }: AcademicsCtaBannerProps) {
  const { admissionsOpen, admissionsSession, settings } = usePublicWebsite();
  const banner = data || DEFAULT_ACADEMICS_PAGE_DATA.ctaBanner;

  if (banner.isVisible === false) {
    return null;
  }

  const phone = settings?.contact?.phone || "+92 335 7413777";

  const rawEyebrow = admissionsOpen
    ? banner.eyebrowActiveTemplate || "{admissionsSession} Admissions Active"
    : banner.eyebrowInactiveTemplate || "Academic Excellence Track";
  const eyebrowText = rawEyebrow.replace("{admissionsSession}", admissionsSession || "Current Year");

  const rawDescription = admissionsOpen
    ? banner.descriptionOpenTemplate ||
      "Apply online for Session {admissionsSession} admissions or schedule a personalized diagnostic assessment for your child in Soldier Bazar, Karachi."
    : banner.descriptionClosedTemplate ||
      "Schedule a one-on-one diagnostic assessment with our academic advisors and discover our comprehensive Cambridge and BSEK pathways.";
  const descriptionText = rawDescription.replace("{admissionsSession}", admissionsSession || "Current Year");

  const activeCtas = admissionsOpen
    ? banner.admissionsOpenCtas || DEFAULT_ACADEMICS_PAGE_DATA.ctaBanner.admissionsOpenCtas
    : banner.admissionsClosedCtas || DEFAULT_ACADEMICS_PAGE_DATA.ctaBanner.admissionsClosedCtas;

  const helplineLinkText = (banner.helpline?.linkTextTemplate || "Call Admissions: {phone}").replace(
    "{phone}",
    phone
  );

  const sortedTrustCards = [...(banner.trustCards || [])]
    .filter((card) => card.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const getThemeClass = () => {
    switch (banner.backgroundTheme) {
      case "amberLuxury":
        return "bg-gradient-to-br from-[#4d3200] via-[#855306] to-[#241700] border-amber-400/40 shadow-[0_25px_70px_-15px_rgba(202,138,4,0.4)]";
      case "dark":
        return "bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-zinc-800 shadow-2xl";
      case "crimsonLuxury":
      default:
        return "bg-gradient-to-br from-[#400504] via-[#750C0A] to-[#1c0303] border-amber-500/30 shadow-[0_25px_70px_-15px_rgba(129,13,11,0.5)]";
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative overflow-hidden rounded-3xl sm:rounded-[40px] border p-8 sm:p-14 lg:p-18 text-white",
            getThemeClass()
          )}
        >
          {/* Ambient Lighting & Luxury Grid Glows */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-seneca-amber/25 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-rose-600/20 blur-[90px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

          {/* Decorative Corner Watermark Graphic */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none select-none">
            <GraduationCap className="h-64 w-64 text-amber-300 transform -rotate-12" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7 sm:space-y-9">
            {/* Eyebrow Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-seneca-amber opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-seneca-amber" />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase text-amber-300">
                {eyebrowText}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.15] text-white">
              {banner.mainHeading}{" "}
              {banner.highlightedHeading && (
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  {banner.highlightedHeading}
                </span>
              )}
            </h2>

            {/* Subtitle */}
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              {descriptionText}
            </p>

            {/* Call to Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              {activeCtas?.primary?.isVisible !== false && (
                <Link
                  href={activeCtas.primary.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-seneca-crimson font-extrabold text-sm sm:text-base shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-amber-50 hover:shadow-[0_15px_35px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 group"
                >
                  <span>{activeCtas.primary.text}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}

              {activeCtas?.secondary?.isVisible !== false && (
                <Link
                  href={activeCtas.secondary.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-black/35 hover:bg-black/55 text-white border-2 border-white/30 hover:border-amber-300/60 font-bold text-sm sm:text-base backdrop-blur-md shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>{activeCtas.secondary.text}</span>
                </Link>
              )}
            </div>

            {/* Trust Matrix Pillars */}
            {sortedTrustCards.length > 0 && (
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-3xl mx-auto text-left">
                {sortedTrustCards.map((card) => {
                  const iconBg =
                    card.theme === "emerald"
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-amber-400/20 text-amber-300";

                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          iconBg
                        )}
                      >
                        {getDynamicIcon(card.icon, "h-5 w-5")}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{card.title}</div>
                        <div className="text-[11px] text-white/70">{card.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Helpline Footer Strip */}
            {banner.helpline?.isVisible !== false && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
                <span>{banner.helpline?.prefixText || "Need guidance with admission criteria?"}</span>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1.5 font-bold text-amber-300 hover:text-amber-200 underline underline-offset-4 transition-colors"
                >
                  <PhoneCall className="h-3 w-3" />
                  <span>{helplineLinkText}</span>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AcademicsCtaBanner;
