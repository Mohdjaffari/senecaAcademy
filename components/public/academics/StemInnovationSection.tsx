"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import StemFeatureCard from "./StemFeatureCard";
import { IStemInnovationData, DEFAULT_ACADEMICS_PAGE_DATA } from "@/lib/db/academics-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { ChevronRight } from "lucide-react";

interface StemInnovationSectionProps {
  data?: IStemInnovationData;
}

export function StemInnovationSection({ data }: StemInnovationSectionProps) {
  const sectionData = data || DEFAULT_ACADEMICS_PAGE_DATA.stemInnovation;

  if (sectionData.isVisible === false) {
    return null;
  }

  const sortedItems = [...(sectionData.items || [])]
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <section id="stem" className="py-16 sm:py-24 bg-muted/30 border-y border-border scroll-mt-24 overflow-hidden">
      <div className="container space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          {sectionData.badge && <Badge variant="crimson">{sectionData.badge}</Badge>}
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {sectionData.heading}
          </h2>
          {sectionData.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {sectionData.description}
            </p>
          )}

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-center gap-1 text-[11px] font-semibold text-seneca-crimson dark:text-seneca-amber-light pt-1">
            <span>Swipe horizontally to explore laboratories</span>
            <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
          </div>
        </motion.div>

        {/* Mobile Horizontal Snap Row / Desktop 3-col Grid */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 md:gap-8 pb-4 pt-1 -mx-4 md:mx-0 px-4 md:px-0">
          {sortedItems.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="w-[82vw] sm:w-[320px] md:w-auto shrink-0 snap-center md:shrink"
            >
              <StemFeatureCard
                icon={getDynamicIcon(s.icon, `h-6 w-6 ${s.iconColor || "text-seneca-crimson dark:text-seneca-amber-light"}`)}
                title={s.title}
                desc={s.desc}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StemInnovationSection;
