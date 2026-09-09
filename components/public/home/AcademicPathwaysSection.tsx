"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AcademicPathwayCard from "./AcademicPathwayCard";

export interface AcademicPathwayItem {
  ageRange: string;
  badgeColorClass?: string;
  title: string;
  description: string;
}

interface AcademicPathwaysSectionProps {
  stages?: any[];
}

const DEFAULT_PATHWAYS: AcademicPathwayItem[] = [
  {
    ageRange: "Ages 3–5",
    badgeColorClass: "text-seneca-crimson dark:text-seneca-amber-light",
    title: "Montessori & Early Years",
    description:
      "Sensory motor development, Jolly Phonics, tactile numeracy, and joyful social exploration in themed classrooms.",
  },
  {
    ageRange: "Grades 1–5",
    badgeColorClass: "text-seneca-amber",
    title: "Primary School",
    description:
      "Conceptual math, hands-on general sciences, bilingual fluency, and character foundation without rote memorization.",
  },
  {
    ageRange: "Grades 6–8",
    badgeColorClass: "text-emerald-600 dark:text-emerald-400",
    title: "Middle School",
    description:
      "Separate Physics/Chem/Bio labs, Python coding, debate society, and analytical inquiry preparing for senior exams.",
  },
  {
    ageRange: "Grades 9–10",
    badgeColorClass: "text-seneca-crimson dark:text-seneca-amber-light",
    title: "Senior Matriculation",
    description:
      "Board preparation in CS & Bio groups with intensive mock exams, practical assessments, and college counseling.",
  },
];

const COLOR_CLASSES = [
  "text-emerald-600 dark:text-emerald-400",
  "text-sky-600 dark:text-sky-400",
  "text-indigo-600 dark:text-indigo-400",
  "text-seneca-crimson dark:text-seneca-amber-light",
  "text-amber-600 dark:text-amber-400",
  "text-purple-600 dark:text-purple-400",
];

export function AcademicPathwaysSection({ stages }: AcademicPathwaysSectionProps) {
  const [pathways, setPathways] = useState<AcademicPathwayItem[]>(() => {
    if (stages && stages.length > 0) {
      return stages.map((s, i) => ({
        ageRange: s.badge || s.gradeRange || `Stage ${i + 1}`,
        badgeColorClass: COLOR_CLASSES[i % COLOR_CLASSES.length],
        title: s.name || s.title,
        description: s.description,
      }));
    }
    return DEFAULT_PATHWAYS;
  });

  useEffect(() => {
    if (stages && stages.length > 0) {
      setPathways(
        stages.map((s, i) => ({
          ageRange: s.badge || s.gradeRange || `Stage ${i + 1}`,
          badgeColorClass: COLOR_CLASSES[i % COLOR_CLASSES.length],
          title: s.name || s.title,
          description: s.description,
        }))
      );
    }
  }, [stages]);

  useEffect(() => {
    async function loadDynamic() {
      try {
        const res = await fetch("/api/website/academics");
        const json = await res.json();
        if (json.success && json.data?.page?.academicDivisions?.items?.length > 0) {
          const activeDivisions = json.data.page.academicDivisions.items.filter(
            (s: any) => s.isActive !== false
          );
          if (activeDivisions.length > 0) {
            setPathways(
              activeDivisions.map((s: any, i: number) => ({
                ageRange: s.gradeRange || s.badge || `Stage ${i + 1}`,
                badgeColorClass: COLOR_CLASSES[i % COLOR_CLASSES.length],
                title: s.name || s.title,
                description: s.description,
              }))
            );
          }
        }
      } catch (_) {}
    }
    loadDynamic();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / (clientWidth * 0.82));
      setActiveIndex(Math.min(index, pathways.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.82;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-20 bg-muted/30 border-y border-border relative overflow-hidden">
      <div className="container space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <Badge variant="outline">Academic Pathways</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
              Excellence from Early Years to Matric
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover how our age-tailored divisions build cognitive skills, character, and discipline at every developmental stage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Navigation Arrows */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll pathways left"
                className="h-8 w-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll pathways right"
                className="h-8 w-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-90"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-full shrink-0">
              <Link href="/academics" className="gap-1.5 font-bold text-xs">
                <span>View Full Program</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Mobile Horizontal Snap Carousel & Desktop Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 px-4 -mx-4 sm:px-0 sm:mx-0 snap-x snap-mandatory scrollbar-none"
        >
          {pathways.map((pathway, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
              className="w-[82vw] sm:w-auto shrink-0 sm:shrink snap-center sm:snap-align-none flex"
            >
              <div className="w-full flex">
                <AcademicPathwayCard {...pathway} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Indicator Dots */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 pt-1">
          {pathways.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  const scrollAmount = scrollRef.current.clientWidth * 0.82;
                  scrollRef.current.scrollTo({
                    left: dotIdx * scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              aria-label={`Go to pathway ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === dotIdx
                  ? "w-6 bg-seneca-crimson dark:bg-seneca-amber"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AcademicPathwaysSection;
