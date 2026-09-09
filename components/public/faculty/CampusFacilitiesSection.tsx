"use client";

import React from "react";
import Image from "next/image";
import { ICampusFacilitiesData } from "@/lib/db/faculty-page-defaults";
import { motion } from "framer-motion";
import { Sparkles, Building2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampusFacilitiesSectionProps {
  facilities?: ICampusFacilitiesData;
}

export function CampusFacilitiesSection({ facilities }: CampusFacilitiesSectionProps) {
  if (facilities && facilities.isVisible === false) {
    return null;
  }

  const badge = facilities?.badge || "Campus Infrastructure";
  const heading = facilities?.heading || "Purpose-Built Learning Spaces & Facilities";
  const description = facilities?.description || "Our campus in Soldier Bazar, Garden East, provides modern academic and co-curricular infrastructure designed for experiential learning.";
  
  const facilityItems = (facilities?.facilities || [])
    .filter((f) => f.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (facilityItems.length === 0) {
    return null;
  }

  return (
    <section id="facilities" className="py-16 sm:py-24 bg-muted/30 border-t border-border/50 overflow-hidden">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {heading}
          </h2>

          {description && (
            <p className="text-muted-foreground text-xs sm:text-base leading-relaxed">
              {description}
            </p>
          )}

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <span>Swipe horizontally to view campus facilities</span>
            <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
          </div>
        </motion.div>

        {/* Facilities Mobile Horizontal Snap Row / Desktop 2-col Grid */}
        <div className="flex md:grid md:grid-cols-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none gap-4 sm:gap-8 pb-4 pt-1 -mx-4 md:mx-0 px-4 md:px-0">
          {facilityItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="w-[84vw] sm:w-[350px] md:w-auto shrink-0 snap-center md:shrink flex"
            >
              <div
                className="w-full group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border/70 hover:border-emerald-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
              {/* Image Container */}
              {item.imgUrl ? (
                <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-muted">
                  <Image
                    src={item.imgUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2 items-center">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80 font-medium text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  {item.status && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white shadow-sm">
                        {item.status}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-emerald-500/10 via-background to-muted flex items-center justify-center p-6 border-b border-border/40">
                  <Building2 className="w-12 h-12 text-emerald-500/40" />
                </div>
              )}

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}

export default CampusFacilitiesSection;
