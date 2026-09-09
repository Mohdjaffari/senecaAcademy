"use client";

import Link from "next/link";
import { MessageSquarePlus, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IReviewsCtaBanner } from "@/lib/db/reviews-page-defaults";

interface FeedbackCtaBannerProps {
  ctaData?: IReviewsCtaBanner;
  onOpenSubmitModal: () => void;
}

export function FeedbackCtaBanner({
  ctaData,
  onOpenSubmitModal,
}: FeedbackCtaBannerProps) {
  const badge = ctaData?.badge || "We Value Every Voice";
  const headline = ctaData?.headline || "Are you a current parent, alumnus, or student?";
  const description =
    ctaData?.description ||
    "Help prospective families make informed choices. Your honest review only takes 2 minutes and strengthens our educational community.";
  const primaryText = ctaData?.primaryButtonText || "Submit Your Review";
  const secondaryText = ctaData?.secondaryButtonText || "Schedule Campus Visit";
  const secondaryLink = ctaData?.secondaryButtonLink || "/contact";

  return (
    <div className="rounded-3xl p-8 sm:p-12 border border-amber-500/30 bg-gradient-to-br from-seneca-crimson/10 via-seneca-amber/10 to-card flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
      <div className="space-y-3 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-seneca-amber/20 text-seneca-amber dark:text-seneca-amber-light text-xs font-bold">
          <Sparkles className="h-3 w-3" />
          <span>{badge}</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
          {headline}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3.5 shrink-0">
        <Button
          onClick={onOpenSubmitModal}
          size="lg"
          className="h-12 rounded-full px-8 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all gap-2 cursor-pointer"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>{primaryText}</span>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 rounded-full px-6 border-border/90 bg-card hover:bg-muted font-bold text-xs sm:text-sm gap-2"
        >
          <Link href={secondaryLink}>
            <Calendar className="h-4 w-4 text-seneca-amber" />
            <span>{secondaryText}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-70" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default FeedbackCtaBanner;
