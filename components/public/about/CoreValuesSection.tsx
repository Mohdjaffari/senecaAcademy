"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import CoreValueCard from "./CoreValueCard";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { DEFAULT_ABOUT_PAGE_DATA, ICoreValuesData } from "@/lib/db/about-page-defaults";

interface CoreValuesSectionProps {
  data?: ICoreValuesData;
}

export function CoreValuesSection({ data = DEFAULT_ABOUT_PAGE_DATA.coreValues }: CoreValuesSectionProps) {
  if (data?.isVisible === false) {
    return null;
  }

  const visibleItems = (data.items || [])
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-muted/30 border-y border-border overflow-hidden">
      <div className="container space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <Badge variant="crimson">{data.badge || "Ethos & Culture"}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {data.heading || "The Four Pillars of Seneca Academy"}
          </h2>
          {data.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{data.description}</p>
          )}
        </motion.div>

        {/* 2 Cards in One Row on Mobile, 4 on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {visibleItems.map((val, idx) => (
            <motion.div
              key={val.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <CoreValueCard
                title={val.title}
                desc={val.desc}
                icon={getDynamicIcon(val.icon, `h-5 w-5 sm:h-6 sm:w-6 ${val.iconColor || "text-seneca-crimson"}`)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CoreValuesSection;
