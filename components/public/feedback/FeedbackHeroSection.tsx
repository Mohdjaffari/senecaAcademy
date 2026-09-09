"use client";

import { motion } from "framer-motion";
import {
  Star,
  Sparkles,
  ShieldCheck,
  Heart,
  MessageSquarePlus,
  TrendingUp,
  CheckCircle2,
  Users,
  HeartHandshake,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IReviewsHero, IReviewsStats } from "@/lib/db/reviews-page-defaults";

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Sparkles,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  Lock,
  Heart,
};

interface DynamicStatsData {
  totalCount: number;
  averageRating: number;
  recommendRate: number;
  ratingDistribution: Record<number, number>;
}

interface FeedbackHeroSectionProps {
  heroData?: IReviewsHero;
  statsData?: IReviewsStats;
  liveStats?: DynamicStatsData;
  onOpenSubmitModal: () => void;
}

export function FeedbackHeroSection({
  heroData,
  statsData,
  liveStats,
  onOpenSubmitModal,
}: FeedbackHeroSectionProps) {
  const avg = liveStats?.averageRating ?? statsData?.score ?? 4.9;
  const total = liveStats?.totalCount ?? 340;
  const recommend = liveStats?.recommendRate ?? statsData?.recommendRate ?? 98;
  const distribution = liveStats?.ratingDistribution || { 5: 310, 4: 24, 3: 4, 2: 1, 1: 1 };

  const badge = heroData?.badge || "Voice of Our Seneca Community";
  const title = heroData?.title || "Real Stories & Authentic Reviews from";
  const titleGradient = heroData?.titleGradient || "Seneca Families";
  const subtitle =
    heroData?.subtitle ||
    "Discover unfiltered parent testimonials, alumni achievements, and student experiences from our campuses in Soldier Bazar, Karachi. We celebrate transparency, academic rigor, and moral excellence.";
  const primaryButtonText = heroData?.primaryButtonText || "Write Your Review";
  const secondaryButtonText = heroData?.secondaryButtonText || "Browse All Reviews";
  const trustBadges = heroData?.trustBadges || [
    { icon: "ShieldCheck", text: "100% Verified Community" },
    { icon: "CheckCircle2", text: "Direct Principal Oversight" },
  ];

  const getDynamicIcon = (name: string, className = "h-4 w-4") => {
    const IconComponent = ICON_MAP[name] || ShieldCheck;
    return <IconComponent className={className} />;
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-seneca-crimson/[0.04] via-background to-background border-b border-border/70">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 right-1/4 -mt-20 h-80 w-80 rounded-full bg-seneca-amber/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 -mt-20 h-72 w-72 rounded-full bg-seneca-crimson/10 blur-3xl pointer-events-none" />

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headings & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-seneca-crimson/10 dark:bg-seneca-amber/15 border border-seneca-crimson/20 dark:border-seneca-amber/30 text-seneca-crimson dark:text-seneca-amber-light text-xs font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-seneca-amber" />
              <span>{badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
              {title}{" "}
              <span className="bg-gradient-to-r from-seneca-crimson via-rose-700 to-seneca-amber dark:from-seneca-amber-light dark:via-amber-300 dark:to-seneca-amber bg-clip-text text-transparent">
                {titleGradient}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Button
                onClick={onOpenSubmitModal}
                size="lg"
                className="h-12 rounded-full px-8 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-extrabold shadow-lg shadow-seneca-crimson/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all gap-2 cursor-pointer"
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span>{primaryButtonText}</span>
              </Button>

              <a
                href="#reviews-wall"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-border bg-card/80 hover:bg-card text-foreground font-bold text-xs sm:text-sm shadow-xs transition-colors backdrop-blur-md"
              >
                <span>{secondaryButtonText}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </a>
            </div>

            {/* Trust Micro-Badges */}
            {trustBadges.length > 0 && (
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-muted-foreground font-medium">
                {trustBadges.map((badgeItem, bIdx) => (
                  <span key={bIdx} className="inline-flex items-center gap-1.5">
                    {getDynamicIcon(badgeItem.icon, "h-4 w-4 text-emerald-500")}
                    <span>{badgeItem.text}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Live Rating Scorecard */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl"
            >
              <div className="space-y-6">
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-border/70 pb-5">
                  <div className="space-y-1">
                    <div className="text-4xl sm:text-5xl font-black font-heading tracking-tight text-foreground flex items-baseline gap-1.5">
                      <span>{avg.toFixed(1)}</span>
                      <span className="text-base text-muted-foreground font-normal">/ 5.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                      <Heart className="h-3 w-3 fill-current" />
                      <span>{recommend}% Recommend</span>
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Based on <strong>{total}</strong> verified ratings
                    </p>
                  </div>
                </div>

                {/* Star Breakdown Bars */}
                <div className="space-y-2 text-xs">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] || 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2.5">
                        <span className="w-12 text-muted-foreground font-semibold flex items-center gap-1 shrink-0">
                          <span>{star}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-muted-foreground text-[11px] font-mono">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Scorecard Action Callout */}
                <div className="p-3.5 rounded-2xl bg-seneca-crimson/5 dark:bg-seneca-amber/10 border border-seneca-crimson/15 dark:border-seneca-amber/20 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    Have your child enrolled at Seneca? Share your thoughts.
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSubmitModal}
                    className="text-xs font-bold text-seneca-crimson dark:text-seneca-amber hover:underline shrink-0 cursor-pointer"
                  >
                    Add Review →
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeedbackHeroSection;
