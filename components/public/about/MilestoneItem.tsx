"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export interface MilestoneItemProps {
  year: string;
  title: string;
  desc: string;
  isEven: boolean;
  category?: string;
  highlights?: string[];
}

export function MilestoneItem({
  year,
  title,
  desc,
  isEven,
  category = "Milestone",
  highlights = [],
}: MilestoneItemProps) {
  return (
    <div className="relative flex flex-col md:flex-row items-start md:items-center group">
      {/* Content Container */}
      <div
        className={cn(
          "w-full md:w-1/2 pl-14 sm:pl-16 md:pl-0",
          isEven ? "md:pr-12 md:text-right" : "md:order-last md:pl-12 md:text-left"
        )}
      >
        <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 space-y-2.5 group-hover:-translate-y-0.5">
          <div className={cn("flex flex-wrap items-center gap-2", isEven ? "md:justify-end" : "md:justify-start")}>
            <span className="font-mono text-xl sm:text-2xl font-black text-seneca-crimson dark:text-seneca-amber-light">
              {year}
            </span>
            <Badge variant="outline" className="text-[10px] font-extrabold uppercase">
              {category}
            </Badge>
          </div>
          <h4 className="text-base font-bold text-foreground font-heading group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {desc}
          </p>
          {highlights.length > 0 && (
            <div className={cn("flex flex-wrap gap-1.5 pt-1", isEven ? "md:justify-end" : "md:justify-start")}>
              {highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted/60 text-foreground/80 border border-border/60">
                  <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                  <span>{h}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Beacon Icon */}
      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-5 md:top-auto flex items-center justify-center">
        <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-card border-2 border-seneca-crimson dark:border-seneca-amber text-seneca-crimson dark:text-seneca-amber flex items-center justify-center shadow-md group-hover:scale-110 transition-transform z-10 font-bold text-xs">
          {year.slice(2)}
        </div>
      </div>

      {/* Spacer for desktop */}
      <div className={cn("hidden md:block w-1/2", isEven ? "pl-12" : "pr-12")} />
    </div>
  );
}

export default MilestoneItem;
