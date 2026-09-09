"use client";

import React from "react";
import { IDepartmentContactsData } from "@/lib/db/contact-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DepartmentContactsSectionProps {
  departments?: IDepartmentContactsData;
}

export function DepartmentContactsSection({ departments }: DepartmentContactsSectionProps) {
  if (departments && departments.isVisible === false) {
    return null;
  }

  const badge = departments?.badge || "Department Directory";
  const heading = departments?.heading || "Direct Department Contacts";
  const description =
    departments?.description ||
    "Connect directly with specific administrative wings for specialized counseling and support.";

  const items = (departments?.departments || [])
    .filter((d) => d.isVisible !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="departments" className="py-12 sm:py-20 bg-muted/20 border-t border-border/50 overflow-hidden">
      <div className="container max-w-6xl mx-auto px-3.5 sm:px-6 space-y-8 sm:space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-seneca-crimson/10 text-seneca-crimson border border-seneca-crimson/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {heading}
          </h2>

          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {/* Departments Grid - 2 cards in one row on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {items.map((dept, idx) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <Card className="h-full p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-card border border-border/70 hover:border-seneca-crimson/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-3 sm:space-y-4">
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center shrink-0 border border-seneca-crimson/20">
                      {getDynamicIcon(dept.icon || "GraduationCap", "h-4 w-4 sm:h-5 sm:w-5")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-sm font-heading text-foreground truncate">
                        {dept.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">{dept.leadTitle}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-border/40 text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0">
                      <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-seneca-crimson shrink-0" />
                      <a
                        href={`mailto:${dept.email}`}
                        className="text-foreground hover:underline truncate"
                        title={dept.email}
                      >
                        {dept.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground min-w-0">
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-seneca-amber shrink-0" />
                      <a
                        href={`tel:${dept.phone.replace(/[^0-9+]/g, "")}`}
                        className="text-foreground hover:underline truncate"
                      >
                        {dept.phone} {dept.extension ? `(${dept.extension})` : ""}
                      </a>
                    </div>

                    {dept.officeHours && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground text-[9px] sm:text-[11px] min-w-0">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{dept.officeHours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DepartmentContactsSection;
