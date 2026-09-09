"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  Clock,
  CalendarCheck2,
  Navigation,
  Building2,
} from "lucide-react";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { ISaturdayBookingData } from "@/lib/db/admissions-page-defaults";

interface SaturdayBookingCtaProps {
  saturdayBooking?: ISaturdayBookingData;
}

export function SaturdayBookingCta({ saturdayBooking }: SaturdayBookingCtaProps) {
  const { settings } = usePublicWebsite();

  if (saturdayBooking && saturdayBooking.isVisible === false) {
    return null;
  }

  const phone = saturdayBooking?.phone || settings?.contact?.phone || "+92 335 7413777";
  const rawPhone = phone.replace(/[^0-9+]/g, "");
  const address = saturdayBooking?.address || settings?.contact?.address || "Soldier Bazar, Garden East, Karachi, Pakistan";
  const badgeText = saturdayBooking?.badge || "Saturday Diagnostic Assessments & Campus Desk";
  const titleText = saturdayBooking?.title || "Visit Seneca Academy in";
  const highlightedLocation = saturdayBooking?.highlightedLocation || "Soldier Bazar";
  const descriptionText =
    saturdayBooking?.description ||
    "Our admissions office is open Monday to Saturday, 8:00 AM to 3:00 PM. Schedule your child's Saturday diagnostic assessment or speak one-on-one with our senior academic counselors.";
  const officeHours = saturdayBooking?.officeHours || "Mon – Sat: 8:00 AM – 3:00 PM";
  const scheduleBadge = saturdayBooking?.scheduleBadge || "Every Saturday • 9:00 AM – 1:00 PM";
  const directionsUrl = saturdayBooking?.directionsUrl || "/contact";

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl sm:rounded-[40px] border border-amber-500/30 bg-gradient-to-br from-[#420605] via-[#750C0A] to-[#1a0202] p-8 sm:p-14 lg:p-18 text-white shadow-[0_25px_70px_-15px_rgba(129,13,11,0.5)]"
        >
          {/* Ambient Lighting Glows & Radial Mesh */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-seneca-amber/25 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-rose-600/20 blur-[90px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

          {/* Decorative Corner Watermark Graphic */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none">
            <MapPin className="h-64 w-64 text-amber-300 transform -rotate-12" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7 sm:space-y-9">
            {/* Eyebrow Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-seneca-amber opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-seneca-amber" />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase text-amber-300">
                {badgeText}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.15] text-white">
              {titleText}{" "}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                {highlightedLocation}
              </span>
            </h2>

            {/* Subtitle Description */}
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
              {descriptionText}
            </p>

            {/* Action Buttons Hub */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <a
                href={`tel:${rawPhone}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-seneca-crimson font-extrabold text-sm sm:text-base shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-amber-50 hover:shadow-[0_15px_35px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 group"
              >
                <Phone className="h-4 w-4 text-seneca-crimson group-hover:scale-110 transition-transform" />
                <span>Call Admissions: {phone}</span>
              </a>

              <Link
                href={directionsUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full bg-black/35 hover:bg-black/55 text-white border-2 border-white/30 hover:border-amber-300/60 font-bold text-sm sm:text-base backdrop-blur-md shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Navigation className="h-4 w-4 text-amber-300" />
                <span>Get Campus Directions</span>
              </Link>
            </div>

            {/* Campus Info & Timing Cards (3 Mini Glass Cards) */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-3xl mx-auto text-left">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Office Hours</div>
                  <div className="text-[11px] text-white/70">{officeHours}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Saturday Assessments</div>
                  <div className="text-[11px] text-white/70">{scheduleBadge}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Main Campus</div>
                  <div className="text-[11px] text-white/70">{address}</div>
                </div>
              </div>
            </div>

            {/* Campus Location Footnote */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
              <MapPin className="h-3.5 w-3.5 text-amber-300" />
              <span>Campus Address: {address}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default SaturdayBookingCta;
