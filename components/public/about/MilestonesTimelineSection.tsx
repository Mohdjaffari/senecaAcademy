"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { DEFAULT_ABOUT_PAGE_DATA, IMilestonesData } from "@/lib/db/about-page-defaults";

interface MilestonesTimelineSectionProps {
  data?: IMilestonesData;
}

export function MilestonesTimelineSection({ data = DEFAULT_ABOUT_PAGE_DATA.milestones }: MilestonesTimelineSectionProps) {
  if (data?.isVisible === false) {
    return null;
  }

  const visibleMilestones = (data.items || [])
    .filter((m) => m.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (visibleMilestones.length === 0) {
    return null;
  }

  return (
    <section id="milestones" className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-[800px] bg-gradient-to-r from-seneca-crimson/5 via-seneca-amber/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-0 right-10 h-72 w-72 rounded-full bg-seneca-amber/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 h-72 w-72 rounded-full bg-seneca-crimson/10 blur-3xl pointer-events-none -z-10" />

      <div className="container max-w-6xl mx-auto px-4 space-y-14 sm:space-y-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-seneca-crimson/25 bg-seneca-crimson/10 px-3.5 py-1 text-xs font-extrabold text-seneca-crimson dark:text-seneca-amber-light shadow-xs backdrop-blur-md">
            {getDynamicIcon(data.badgeIcon || "Compass", "h-3.5 w-3.5")}
            <span>{data.badge || "Our Heritage & Evolution"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
            {data.heading || "Twenty-Five Years of"}{" "}
            {data.highlightedHeading && (
              <span className="bg-gradient-to-r from-seneca-crimson via-seneca-crimson-light to-seneca-amber dark:from-seneca-amber-light dark:via-orange-400 dark:to-seneca-amber bg-clip-text text-transparent">
                {data.highlightedHeading}
              </span>
            )}
          </h2>

          {data.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
        </motion.div>

        {/* Interactive Timeline Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Vertical Connector Line (Desktop) / Left Line (Mobile) */}
          <div className="absolute top-4 bottom-8 left-6 md:left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-seneca-crimson via-seneca-amber to-emerald-500/80 rounded-full" />

          {/* Timeline Nodes & Cards */}
          <div className="space-y-10 sm:space-y-14">
            {visibleMilestones.map((milestone, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={milestone.id || milestone.year}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-70px" }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  className="relative flex flex-col md:flex-row items-start md:items-center group"
                >
                  {/* Left Side (Even on Desktop) */}
                  <div
                    className={cn(
                      "w-full md:w-1/2 pl-14 sm:pl-16 md:pl-0",
                      isEven ? "md:pr-12 md:text-right" : "md:order-last md:pl-12 md:text-left"
                    )}
                  >
                    <div
                      className={cn(
                        "p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl shadow-black/5 hover:shadow-2xl hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 transition-all duration-300 space-y-3 group-hover:-translate-y-1 relative overflow-hidden"
                      )}
                    >
                      {/* Subtle Card Gradient Tint */}
                      <div className="absolute top-0 right-0 h-28 w-28 bg-gradient-to-bl from-seneca-crimson/5 via-seneca-amber/5 to-transparent rounded-bl-full pointer-events-none" />

                      {/* Header Row: Year Badge & Category */}
                      <div
                        className={cn(
                          "flex flex-wrap items-center gap-2",
                          isEven ? "md:justify-end" : "md:justify-start"
                        )}
                      >
                        <span className="font-mono text-xl sm:text-2xl font-black tracking-tight text-seneca-crimson dark:text-seneca-amber-light">
                          {milestone.year}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full", milestone.badgeVariant)}
                        >
                          {milestone.category}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold font-heading text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
                        {milestone.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {milestone.desc}
                      </p>

                      {/* Bullet Highlights */}
                      {milestone.highlights && milestone.highlights.length > 0 && (
                        <div
                          className={cn(
                            "flex flex-wrap gap-1.5 pt-1",
                            isEven ? "md:justify-end" : "md:justify-start"
                          )}
                        >
                          {milestone.highlights.map((h, hIdx) => (
                            <span
                              key={hIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted/60 text-foreground/80 border border-border/60"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{h}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Node / Icon Beacon */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-5 md:top-auto flex items-center justify-center">
                    <div className="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-card border-2 border-seneca-crimson dark:border-seneca-amber text-seneca-crimson dark:text-seneca-amber shadow-lg group-hover:scale-110 group-hover:shadow-seneca-crimson/25 transition-all duration-300 z-10">
                      {getDynamicIcon(milestone.icon, "h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-6")}
                      <div className="absolute inset-0 rounded-2xl bg-seneca-crimson/10 dark:bg-seneca-amber/15 animate-ping opacity-25 pointer-events-none" />
                    </div>
                  </div>

                  {/* Opposite Spacer (Desktop) */}
                  <div className={cn("hidden md:block w-1/2", isEven ? "pl-12" : "pr-12")} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Achievement Ribbon */}
        {data.ribbonTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-seneca-crimson/20 bg-gradient-to-r from-seneca-crimson/10 via-seneca-amber/10 to-seneca-crimson/5 max-w-2xl mx-auto text-center space-y-1.5 shadow-lg shadow-seneca-crimson/5"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson dark:text-seneca-amber uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-seneca-amber" />
              <span>{data.ribbonTitle}</span>
            </div>
            {data.ribbonDescription && (
              <p className="text-xs sm:text-sm text-foreground/90 font-medium">
                {data.ribbonDescription}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default MilestonesTimelineSection;
