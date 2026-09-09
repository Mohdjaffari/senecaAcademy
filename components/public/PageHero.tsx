"use client";

import Link from "next/link";
import { Sparkles, ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  badge: string;
  badgeIcon?: React.ReactNode;
  title: string;
  highlightedTitle?: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  variant?: "crimson" | "amber" | "emerald" | "default";
  height?: "default" | "compact" | "400px";
}

export function PageHero({
  badge,
  badgeIcon,
  title,
  highlightedTitle,
  description,
  breadcrumbs,
  primaryCta,
  secondaryCta,
  variant = "crimson",
  height = "400px",
}: PageHeroProps) {
  const glowGradients: Record<string, string> = {
    crimson: "from-seneca-crimson/15 via-seneca-amber/10 to-transparent",
    amber: "from-seneca-amber/15 via-seneca-crimson/10 to-transparent",
    emerald: "from-emerald-500/15 via-seneca-amber/10 to-transparent",
    default: "from-seneca-crimson/15 via-seneca-amber/10 to-transparent",
  };

  const is400px = height === "400px" || height === "compact";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-card/90 via-background to-background flex items-center justify-center select-none",
        is400px
          ? "h-[400px] min-h-[400px] max-h-[400px]"
          : "pt-12 pb-16 lg:pt-20 lg:pb-24 min-h-[440px]"
      )}
    >
      {/* Background Decorative Subtle Radial Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.08)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none -z-10" />

      {/* Ambient Lighting Orbs */}
      <div className={cn("absolute inset-0 bg-gradient-to-b pointer-events-none -z-10", glowGradients[variant])} />
      <div className="absolute -top-10 left-1/4 h-64 w-64 rounded-full bg-seneca-crimson/20 dark:bg-seneca-crimson/30 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute -bottom-10 right-1/4 h-64 w-64 rounded-full bg-seneca-amber/20 dark:bg-seneca-amber/25 blur-3xl pointer-events-none -z-10 animate-pulse [animation-delay:1.5s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-[550px] bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/15 to-transparent blur-2xl pointer-events-none -z-10" />

      <div
        className={cn(
          "container relative z-10 text-center max-w-3xl mx-auto px-4 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-500",
          is400px ? "space-y-3.5 sm:space-y-4" : "space-y-6"
        )}
      >
        {/* Breadcrumb Trail */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div>
            <nav
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-background/80 dark:bg-card/80 border border-border/80 shadow-xs backdrop-blur-md text-[11px] text-muted-foreground font-medium mx-auto transition-all hover:border-seneca-crimson/30"
              aria-label="Breadcrumb"
            >
              <Link
                href="/"
                className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
              >
                <Home className="h-3 w-3" />
                <span>Home</span>
              </Link>
              {breadcrumbs.map((b, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <ChevronRight className="h-2.5 w-2.5 opacity-50" />
                  {b.href ? (
                    <Link href={b.href} className="hover:text-foreground transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-bold">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}

        {/* Floating Badge */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-seneca-crimson/30 dark:border-seneca-amber/40 bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/10 to-seneca-crimson/5 px-3.5 py-1 text-[11px] font-extrabold text-seneca-crimson dark:text-seneca-amber-light shadow-xs backdrop-blur-md">
            {badgeIcon || <Sparkles className="h-3.5 w-3.5" />}
            <span>{badge}</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className={cn(
            "font-heading font-extrabold tracking-tight text-foreground leading-[1.18]",
            is400px
              ? "text-2xl sm:text-4xl lg:text-[42px] max-w-2xl"
              : "text-4xl sm:text-5xl lg:text-6xl"
          )}
        >
          {title}{" "}
          {highlightedTitle && (
            <span className="bg-gradient-to-r from-seneca-crimson via-seneca-crimson-light to-seneca-amber dark:from-seneca-amber-light dark:via-orange-400 dark:to-seneca-amber bg-clip-text text-transparent">
              {highlightedTitle}
            </span>
          )}
        </h1>

        {/* Description */}
        <p
          className={cn(
            "text-muted-foreground leading-relaxed mx-auto",
            is400px
              ? "text-xs sm:text-sm max-w-xl line-clamp-2 sm:line-clamp-none"
              : "text-base sm:text-lg max-w-2xl"
          )}
        >
          {description}
        </p>

        {/* Call to Actions */}
        {(primaryCta || secondaryCta) && (
          <div className="pt-1 flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {primaryCta && (
              <Button
                asChild
                variant="glow"
                size="sm"
                className="h-9 sm:h-10 rounded-full px-5 sm:px-6 text-xs font-bold shadow-lg shadow-seneca-crimson/20 hover:shadow-xl hover:shadow-seneca-crimson/30 transition-all"
              >
                <Link href={primaryCta.href}>{primaryCta.text}</Link>
              </Button>
            )}
            {secondaryCta && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-9 sm:h-10 rounded-full px-5 sm:px-6 text-xs font-bold border-border/90 bg-background/60 backdrop-blur-md hover:border-seneca-crimson/40 hover:bg-muted/60 transition-all"
              >
                <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default PageHero;

