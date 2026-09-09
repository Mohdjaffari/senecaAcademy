"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, ArrowRight, GraduationCap, BookOpen, Users } from "lucide-react";

interface AdmissionsCtaBannerProps {
  admissionsOpen?: boolean;
  admissionsData?: {
    admissionsSession?: string;
    admissionsNotice?: string;
    admissionsClosedNotice?: string;
  };
}

export function AdmissionsCtaBanner({
  admissionsOpen = true,
  admissionsData,
}: AdmissionsCtaBannerProps) {
  const sessionName = admissionsData?.admissionsSession || "Session 2026–2027";

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* ── Background ── */}
      {admissionsOpen ? (
        <div className="absolute inset-0 bg-gradient-to-br from-seneca-crimson-dark via-seneca-crimson to-[hsl(28,85%,48%)] dark:from-[hsl(348,70%,28%)] dark:via-[hsl(348,68%,36%)] dark:to-[hsl(28,75%,40%)]" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800" />
      )}

      {/* ── Decorative dot-grid overlay ── */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] pointer-events-none" />

      {/* ── Ambient glow orbs ── */}
      <div
        className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl opacity-30 pointer-events-none ${
          admissionsOpen ? "bg-white/20" : "bg-seneca-crimson/20"
        }`}
      />
      <div
        className={`absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-25 pointer-events-none ${
          admissionsOpen ? "bg-seneca-amber/40" : "bg-indigo-600/25"
        }`}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none bg-white" />

      {/* ── Decorative accent shapes ── */}
      <div className="absolute top-8 right-[10%] h-20 w-20 rounded-full border border-white/10 pointer-events-none hidden lg:block" />
      <div className="absolute top-16 right-[12%] h-10 w-10 rounded-full border border-white/10 pointer-events-none hidden lg:block" />
      <div className="absolute bottom-12 left-[8%] h-16 w-16 rounded-2xl border border-white/10 rotate-12 pointer-events-none hidden lg:block" />

      {/* ── Floating Icon Chips ── */}
      <div className="absolute top-10 left-[6%] hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 text-white/70 pointer-events-none">
        <GraduationCap className="h-4 w-4" />
        <span className="text-[11px] font-semibold">Board Results 100%</span>
      </div>
      <div className="absolute bottom-10 right-[6%] hidden xl:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 text-white/70 pointer-events-none">
        <Users className="h-4 w-4" />
        <span className="text-[11px] font-semibold">1,200+ Alumni Leaders</span>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 left-[4%] hidden 2xl:flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2 text-white/70 pointer-events-none">
        <BookOpen className="h-4 w-4" />
        <span className="text-[11px] font-semibold">25+ Years of Heritage</span>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center space-y-7"
        >

          {/* Session Badge */}
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-xs py-1.5 px-4 font-bold uppercase tracking-wider rounded-full border shadow-lg ${
                admissionsOpen
                  ? "text-white border-white/30 bg-white/10 backdrop-blur-md"
                  : "text-rose-300 border-rose-500/40 bg-rose-500/15 backdrop-blur-md"
              }`}
            >
              {admissionsOpen
                ? `✦ ${sessionName} Admissions Open ✦`
                : `Admissions Closed • ${sessionName}`}
            </Badge>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight text-white leading-[1.1]">
            {admissionsOpen ? (
              <>
                Invest in an Education That{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Prepares Your Child</span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-white/15 rounded-sm -z-0" />
                </span>{" "}
                for Life.
              </>
            ) : (
              "Planning for the Upcoming Academic Session?"
            )}
          </h2>

          {/* Description */}
          <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {admissionsOpen
              ? "Schedule a campus tour or begin your online application today. Our admissions counselors are ready to welcome your family at Soldier Bazar, Karachi."
              : admissionsData?.admissionsClosedNotice ||
                "Admissions for the current academic session are closed. Contact our counseling team in Soldier Bazar, Karachi to register for the next enrollment intake."}
          </p>

          {/* Trust Row */}
          {admissionsOpen && (
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/60 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-seneca-amber-light inline-block" />
                No application fee
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-seneca-amber-light inline-block" />
                Quick 48-hour response
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-seneca-amber-light inline-block" />
                Campus tour available
              </span>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-4">
            {admissionsOpen ? (
              <>
                <Button
                  size="lg"
                  asChild
                  className="rounded-full bg-white text-seneca-crimson hover:bg-white/95 font-bold px-8 shadow-2xl hover:shadow-white/30 hover:scale-105 active:scale-95 transition-all duration-200 gap-2"
                >
                  <Link href="/admissions">
                    <span>Submit Admission Application</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="rounded-full bg-white/10 hover:bg-white text-white hover:text-seneca-crimson border-2 border-white/50 hover:border-white transition-all duration-200 font-bold px-8 backdrop-blur-sm shadow-md"
                >
                  <Link href="/fees">Calculate Fee Structure</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  asChild
                  className="rounded-full bg-white text-foreground hover:bg-white/95 font-bold px-8 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 gap-2"
                >
                  <Link href="/contact">
                    <PhoneCall className="h-4 w-4 text-seneca-crimson" />
                    <span>Contact Admissions Desk</span>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="rounded-full bg-white/10 hover:bg-white text-white hover:text-foreground border-2 border-white/50 hover:border-white transition-all duration-200 font-bold px-8 backdrop-blur-sm shadow-md"
                >
                  <Link href="/academics">Explore Curriculum</Link>
                </Button>
              </>
            )}
          </div>

          {/* Bottom micro-caption */}
          <p className="text-white/40 text-[11px]">
            {admissionsOpen
              ? "Enrollment for limited seats. Early registration advised."
              : "Next session admissions will be announced soon. Stay connected."}
          </p>
        </motion.div>
      </div>

      {/* ── Bottom wave shape ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="w-full h-12 sm:h-16 fill-background"
        >
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  );
}

export default AdmissionsCtaBanner;
