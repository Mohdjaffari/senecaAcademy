"use client";

import Image from "next/image";
import { CheckCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface DivisionCardProps {
  id: string;
  badge: string;
  name: string;
  grades: string;
  description: string;
  image: string;
  imageAlt?: string;
  subjects: string[];
  highlights: string;
  isReversed?: boolean;
}

export function DivisionCard({
  id,
  badge,
  name,
  grades,
  description,
  image,
  imageAlt,
  subjects,
  highlights,
  isReversed = false,
}: DivisionCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center scroll-mt-24 p-4 sm:p-6 rounded-3xl bg-card/50 border border-border/60 shadow-xs hover:border-seneca-crimson/30 transition-all",
        isReversed && "lg:flex-row-reverse"
      )}
    >
      {/* Image Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn("lg:col-span-5", isReversed && "lg:order-last")}
      >
        <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 border-border bg-muted group">
          <Image
            src={image}
            alt={imageAlt || name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white space-y-1">
            <Badge variant="outline" className="text-white border-white/40 bg-white/15 text-[10px] backdrop-blur-xs">
              {badge}
            </Badge>
            <h4 className="text-base sm:text-lg font-bold font-heading">{grades}</h4>
          </div>
        </div>
      </motion.div>

      {/* Text Details Side */}
      <div className="lg:col-span-7 space-y-4 sm:space-y-6">
        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-seneca-crimson dark:text-seneca-amber-light">
            {grades}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {name}
          </h3>
        </div>

        <p className="text-xs sm:text-sm sm:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 space-y-2.5 sm:space-y-3 shadow-xs">
          <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
            Curriculum Subjects &amp; Key Modules:
          </h5>
          <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {subjects.map((sub, sIdx) => (
              <li key={sIdx} className="flex items-start gap-1.5 p-1.5 rounded-lg bg-muted/40">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="truncate text-[11px] sm:text-xs font-medium">{sub}</span>
              </li>
            ))}
          </ul>
        </div>

        {highlights && (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground bg-primary/5 dark:bg-primary/10 p-3 sm:p-3.5 rounded-xl border border-primary/15">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <span className="text-[11px] sm:text-xs">{highlights}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default DivisionCard;
