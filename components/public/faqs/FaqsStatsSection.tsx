"use client";

import React from "react";
import { IFaqsStatsData } from "@/lib/db/faqs-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FaqsStatsSectionProps {
  stats?: IFaqsStatsData;
}

export function FaqsStatsSection({ stats }: FaqsStatsSectionProps) {
  if (stats && stats.isVisible === false) {
    return null;
  }

  const items = stats?.items && stats.items.length > 0 ? stats.items : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-12 bg-muted/40 border-b border-border/60 overflow-hidden">
      <div className="container max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          {items.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <Card className="h-full p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs hover:border-seneca-amber/40 hover:shadow-md transition-all text-center space-y-1 sm:space-y-1.5">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-2xl bg-seneca-amber/10 text-seneca-amber dark:text-seneca-amber-light mx-auto">
                  {getDynamicIcon(stat.icon || "Award", "h-4 w-4")}
                </div>
                <div className="text-lg sm:text-2xl font-black font-heading text-foreground tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-bold text-foreground truncate">
                  {stat.label}
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                  {stat.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqsStatsSection;
