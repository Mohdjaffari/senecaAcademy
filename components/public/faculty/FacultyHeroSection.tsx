"use client";

import Link from "next/link";
import {
  Users,
  ChevronRight,
  Home,
  GraduationCap,
  Award,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Sparkles,
  BookOpen,
  School,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IFacultyHeroData, DEFAULT_FACULTY_PAGE_DATA } from "@/lib/db/faculty-page-defaults";

export function FacultyHeroSection({ hero }: { hero?: IFacultyHeroData }) {
  const heroData = hero || DEFAULT_FACULTY_PAGE_DATA.hero;

  if (heroData.isVisible === false) {
    return null;
  }

  const renderIcon = (name?: string, fallback: any = GraduationCap) => {
    switch (name) {
      case "Users":
        return <Users className="h-4 w-4" />;
      case "Award":
        return <Award className="h-5 w-5" />;
      case "BookOpen":
        return <BookOpen className="h-5 w-5" />;
      case "School":
        return <School className="h-5 w-5" />;
      case "Landmark":
        return <Landmark className="h-5 w-5" />;
      case "GraduationCap":
      default:
        return <GraduationCap className="h-5 w-5" />;
    }
  };

  return (
    <section className="relative overflow-hidden h-[420px] min-h-[400px] max-h-[460px] flex items-center justify-center border-b border-border/80 bg-gradient-to-b from-card/90 via-background to-background select-none">
      {/* 1. Dynamic Animated Radial Mesh & Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.08)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none -z-10" />

      {/* 2. Floating Luminous Ambient Lighting Orbs */}
      <div className="absolute -top-12 left-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-seneca-crimson/20 to-seneca-amber/10 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-gradient-to-tl from-seneca-amber/20 to-emerald-500/10 blur-3xl pointer-events-none -z-10 animate-pulse [animation-delay:1.5s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-[600px] bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/15 to-transparent blur-2xl pointer-events-none -z-10" />

      {/* 3. Floating Left Spec Chip (Desktop) */}
      {heroData.leftSpecChip && (
        <div className="hidden xl:flex items-center gap-3 absolute left-6 2xl:left-14 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-card/85 backdrop-blur-xl border border-border/80 shadow-xl shadow-black/5 max-w-[220px] animate-in fade-in slide-in-from-left duration-700 pointer-events-none">
          <div className="h-10 w-10 rounded-xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center shrink-0 border border-seneca-crimson/20">
            {renderIcon(heroData.leftSpecChip.icon, GraduationCap)}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-extrabold text-foreground">{heroData.leftSpecChip.badgeText}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">{heroData.leftSpecChip.description}</p>
          </div>
        </div>
      )}

      {/* 4. Floating Right Spec Chip (Desktop) */}
      {heroData.rightSpecChip && (
        <div className="hidden xl:flex items-center gap-3 absolute right-6 2xl:right-14 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-card/85 backdrop-blur-xl border border-border/80 shadow-xl shadow-black/5 max-w-[220px] animate-in fade-in slide-in-from-right duration-700 pointer-events-none">
          <div className="h-10 w-10 rounded-xl bg-seneca-amber/15 text-seneca-amber-dark dark:text-seneca-amber-light flex items-center justify-center shrink-0 border border-seneca-amber/30">
            {renderIcon(heroData.rightSpecChip.icon, Award)}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span className="text-[11px] font-extrabold text-foreground">{heroData.rightSpecChip.badgeText}</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">{heroData.rightSpecChip.description}</p>
          </div>
        </div>
      )}

      {/* 5. Main Center Content */}
      <div className="container relative z-10 max-w-3xl mx-auto px-4 text-center flex flex-col items-center justify-center space-y-3.5 sm:space-y-4">
        {/* Breadcrumb Pill */}
        <nav
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-background/80 dark:bg-card/80 border border-border/80 shadow-xs backdrop-blur-md text-[11px] text-muted-foreground font-medium transition-all hover:border-seneca-crimson/30 animate-in fade-in duration-300"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <Home className="h-3 w-3" />
            <span>Home</span>
          </Link>
          <ChevronRight className="h-2.5 w-2.5 opacity-50" />
          <span className="text-foreground font-bold">Faculty &amp; Careers</span>
        </nav>

        {/* Master Badge */}
        {heroData.badge && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-seneca-crimson/25 dark:border-seneca-amber/30 bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/10 to-seneca-crimson/5 px-3.5 py-1 text-[11px] font-extrabold text-seneca-crimson dark:text-seneca-amber-light shadow-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-400">
            <Users className="h-3.5 w-3.5 shrink-0 text-seneca-crimson dark:text-seneca-amber" />
            <span>{heroData.badge}</span>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="font-heading text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-foreground leading-[1.18] max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          {heroData.title}{" "}
          {heroData.highlightedTitle && (
            <span className="bg-gradient-to-r from-seneca-crimson via-seneca-crimson-light to-seneca-amber dark:from-seneca-amber-light dark:via-orange-400 dark:to-seneca-amber bg-clip-text text-transparent">
              {heroData.highlightedTitle}
            </span>
          )}
        </h1>

        {/* Description */}
        {heroData.description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto line-clamp-2 sm:line-clamp-none animate-in fade-in slide-in-from-bottom-3 duration-600">
            {heroData.description}
          </p>
        )}

        {/* Action Buttons */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {heroData.primaryCta?.isVisible !== false && (
            <Button
              asChild
              variant="glow"
              size="sm"
              className="h-9 sm:h-10 rounded-full px-5 sm:px-6 text-xs font-bold gap-1.5 shadow-lg shadow-seneca-crimson/20 hover:shadow-xl hover:shadow-seneca-crimson/30 transition-all"
            >
              <Link href={heroData.primaryCta.href || "#faculty-team"}>
                <span>{heroData.primaryCta.text}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}

          {heroData.secondaryCta?.isVisible !== false && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-9 sm:h-10 rounded-full px-5 sm:px-6 text-xs font-bold gap-1.5 border-border/90 bg-background/60 backdrop-blur-md hover:border-seneca-crimson/40 hover:bg-muted/60 transition-all"
            >
              <Link href={heroData.secondaryCta.href || "#careers"}>
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{heroData.secondaryCta.text}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export default FacultyHeroSection;
