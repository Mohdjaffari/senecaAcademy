"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

export function PublicFooter() {
  const { admissionsOpen, admissionsSession, settings } = usePublicWebsite();

  const contactAddress = settings?.contact?.address || "Soldier Bazar, Garden East, Karachi, Pakistan";
  const contactPhone = settings?.contact?.phone || "+92 335 7413777";
  const contactEmail = settings?.contact?.email || "info@seneca.edu.pk";
  const copyrightText = settings?.footer?.copyrightText || "© 2026 Seneca Academy. All rights reserved.";

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      {/* Pre-Footer Action Banner (Displayed ONLY when Admissions are Open) */}
      {admissionsOpen && (
        <div className="border-b border-border/80 bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/5 to-background py-10 animate-in fade-in duration-300">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground">
                Ready to Give Your Child the Seneca Advantage?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Admissions open for Pre-School through Grade 10 for {admissionsSession}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admissions"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-seneca-crimson text-white text-xs font-bold shadow-md hover:bg-seneca-crimson-dark transition-colors"
              >
                <span>Apply Online</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-border bg-background text-foreground text-xs font-bold hover:bg-muted transition-colors"
              >
                <span>Book Campus Visit</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-seneca-amber/15 via-seneca-crimson/10 to-transparent p-1 border border-seneca-amber/30 dark:border-seneca-amber/40 shadow-sm group-hover:border-seneca-amber/50 group-hover:scale-105 transition-all">
                <Image
                  src="/logo-seal.png"
                  alt="Seneca Academy Logo"
                  width={44}
                  height={44}
                  className="object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-xl font-extrabold tracking-tight text-foreground leading-none">
                  Seneca <span className="text-seneca-crimson dark:text-seneca-amber-light">Academy</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                  Centre of Academic Excellence
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Empowering students through innovative curriculum, rigorous character building, and world-class faculty. Shaping tomorrow&apos;s ethical leaders in Karachi.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <ShieldCheck className="h-3 w-3" /> Govt. Registered
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-seneca-amber/10 text-seneca-amber font-semibold text-[11px]">
                <Sparkles className="h-3 w-3" /> BSEK Board Affiliated
              </span>
            </div>
          </div>

          {/* About & Academics */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider font-heading text-foreground">
              About & Studies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Heritage & Vision
                </Link>
              </li>
              <li>
                <Link href="/academics" className="text-muted-foreground hover:text-primary transition-colors">
                  Academic Spectrum
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="text-muted-foreground hover:text-primary transition-colors">
                  Faculty Educators
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                  Campus Life & Labs
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-muted-foreground hover:text-primary transition-colors">
                  News & Articles
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-amber-600 dark:text-amber-400 font-semibold hover:text-primary transition-colors flex items-center gap-1.5">
                  <span>Parent Reviews &amp; Feedback</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-[10px] font-bold">4.9 ★</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Admissions & LMS */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider font-heading text-foreground">
              Admissions & Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/admissions" className="text-muted-foreground hover:text-primary transition-colors">
                  {admissionsOpen ? `${admissionsSession} Admissions` : "Admissions & Inquiries"}
                </Link>
              </li>
              <li>
                <Link href="/fees" className="text-muted-foreground hover:text-primary transition-colors">
                  Fee Schedule & Calculator
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-muted-foreground hover:text-primary transition-colors">
                  Frequently Asked Questions (FAQs)
                </Link>
              </li>
              <li>
                <Link href="/faculty" className="text-muted-foreground hover:text-primary transition-colors">
                  Faculty Careers
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/login"
                  className="text-seneca-crimson dark:text-seneca-amber-light font-bold hover:underline inline-flex items-center gap-1 text-xs"
                >
                  Principal / Faculty LMS <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                >
                  Student Learning Portal <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Location */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider font-heading text-foreground">
              Campus Contact
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-seneca-crimson shrink-0 mt-0.5" />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-seneca-amber shrink-0" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{contactEmail}</span>
              </li>
              <li className="pt-2">
                <Link href="/contact" className="text-xs font-bold text-primary hover:underline">
                  View Map & Directions →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>{copyrightText} Developed by CoderZ (<a href="https://www.linkedin.com/in/muhammad-jaffari/">M Jaffari</a>)</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:text-foreground">
              Terms of Enrollment
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Campus Support
            </Link>
          </div>
        </div>
      </div>
    </footer >
  );
}

export default PublicFooter;
