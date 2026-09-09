"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import VisionMissionCard from "./VisionMissionCard";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { DEFAULT_ABOUT_PAGE_DATA, IVisionMissionData } from "@/lib/db/about-page-defaults";

interface VisionMissionSectionProps {
  data?: IVisionMissionData;
}

export function VisionMissionSection({ data = DEFAULT_ABOUT_PAGE_DATA.visionMission }: VisionMissionSectionProps) {
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
    <section id="vision" className="py-16 sm:py-24 bg-background overflow-hidden">
      <div className="container space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <Badge variant="outline">{data.badge || "Strategic Foundations"}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {data.heading || "Our Vision and Mission"}
          </h2>
          {data.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{data.description}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {visibleItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -28 : 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.55, delay: idx * 0.1 }}
            >
              <VisionMissionCard
                icon={getDynamicIcon(item.icon, "h-6 w-6")}
                iconBgClass={item.iconBgClass || "bg-seneca-crimson/10 text-seneca-crimson"}
                title={item.title}
                description={item.description}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VisionMissionSection;
