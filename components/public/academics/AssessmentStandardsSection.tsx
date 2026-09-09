"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import AssessmentTierCard from "./AssessmentTierCard";
import {
  IAssessmentStandardsData,
  DEFAULT_ACADEMICS_PAGE_DATA,
} from "@/lib/db/academics-page-defaults";

interface AssessmentStandardsSectionProps {
  data?: IAssessmentStandardsData;
}

export function AssessmentStandardsSection({ data }: AssessmentStandardsSectionProps) {
  const sectionData = data || DEFAULT_ACADEMICS_PAGE_DATA.assessmentStandards;

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
    <section className="py-16 sm:py-24 bg-background overflow-hidden">
      <div className="container max-w-4xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center space-y-3"
        >
          {sectionData.badge && <Badge variant="outline">{sectionData.badge}</Badge>}
          <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {sectionData.heading}
          </h2>
          {sectionData.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {sectionData.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {sortedItems.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1 }}
            >
              <AssessmentTierCard
                tag={t.tag}
                title={t.title}
                description={t.description}
                badgeColorClass={
                  t.badgeColorClass ||
                  (t.theme === "amber"
                    ? "text-seneca-amber"
                    : t.theme === "emerald"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-seneca-crimson dark:text-seneca-amber-light")
                }
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AssessmentStandardsSection;
