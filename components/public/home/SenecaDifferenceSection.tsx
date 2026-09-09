"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Users, Sparkles, BookOpen, Compass, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SenecaDifferenceCard from "./SenecaDifferenceCard";

export interface PillarItem {
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
}

interface SenecaDifferenceSectionProps {
  pillars?: PillarItem[];
  badge?: string;
  heading?: string;
  description?: string;
}

const DEFAULT_PILLARS: PillarItem[] = [
  {
    title: "Inquiry & Board Rigor",
    badge: "Curriculum Rigor",
    description:
      "Combining 21st-century conceptual thinking with structured matriculation board coaching. Our students master concepts without rote dependency.",
  },
  {
    title: "Master-Level Faculty",
    badge: "Distinguished Mentors",
    description:
      "Over 50 experienced educators holding post-graduate degrees who mentor each child individually with small 35-student classroom caps.",
  },
  {
    title: "STEM & Robotics Lab",
    badge: "Next-Gen Tech",
    description:
      "Dedicated computer labs, Python coding modules, experimental science apparatus, and interactive digital smart boards.",
  },
];

const ICONS = [
  {
    icon: <GraduationCap className="h-7 w-7" />,
    bgClass: "bg-seneca-crimson/10 text-seneca-crimson group-hover:bg-seneca-crimson group-hover:text-white",
  },
  {
    icon: <Users className="h-7 w-7" />,
    bgClass: "bg-seneca-amber/10 text-seneca-amber group-hover:bg-seneca-amber group-hover:text-white",
  },
  {
    icon: <Sparkles className="h-7 w-7" />,
    bgClass: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
  },
  {
    icon: <BookOpen className="h-7 w-7" />,
    bgClass: "bg-sky-500/10 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
  },
  {
    icon: <Compass className="h-7 w-7" />,
    bgClass: "bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  },
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    bgClass: "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
  },
];

export function SenecaDifferenceSection({
  pillars,
  badge = "The Seneca Difference",
  heading = "Why Families Choose Seneca Academy",
  description = "We cultivate a vibrant intellectual environment where children are valued as unique individuals and guided toward exemplary achievements.",
}: SenecaDifferenceSectionProps) {
  const [data, setData] = useState<PillarItem[]>(pillars && pillars.length > 0 ? pillars : DEFAULT_PILLARS);
  const [sectionBadge, setSectionBadge] = useState(badge);
  const [sectionHeading, setSectionHeading] = useState(heading);
  const [sectionDesc, setSectionDesc] = useState(description);

  useEffect(() => {
    if (pillars && pillars.length > 0) setData(pillars);
    if (badge) setSectionBadge(badge);
    if (heading) setSectionHeading(heading);
    if (description) setSectionDesc(description);
  }, [pillars, badge, heading, description]);

  useEffect(() => {
    async function loadDynamic() {
      try {
        const res = await fetch("/api/website/academics");
        const json = await res.json();
        if (json.success && json.data?.page?.senecaDifference) {
          const diff = json.data.page.senecaDifference;
          if (diff.badge) setSectionBadge(diff.badge);
          if (diff.heading) setSectionHeading(diff.heading);
          if (diff.description) setSectionDesc(diff.description);
          if (Array.isArray(diff.items) && diff.items.length > 0) {
            const activePillars = diff.items.filter((p: any) => p.isVisible !== false);
            if (activePillars.length > 0) setData(activePillars);
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
      const index = Math.round(scrollLeft / (clientWidth * 0.85));
      setActiveIndex(Math.min(index, data.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="why-seneca" className="py-20 lg:py-28 bg-background scroll-mt-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-seneca-crimson/5 dark:bg-seneca-amber/5 blur-3xl pointer-events-none -z-10" />

      <div className="container space-y-12 sm:space-y-16">
        {/* Header Block with Scroll Animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <Badge variant="crimson">{sectionBadge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {sectionHeading}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {sectionDesc}
          </p>

          {/* Mobile Navigation Arrows */}
          <div className="flex md:hidden items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll cards left"
              className="h-8 w-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              {activeIndex + 1} of {data.length}
            </span>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll cards right"
              className="h-8 w-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Cards: Mobile Horizontal Swipe Carousel & Desktop Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-6 sm:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0 snap-x snap-mandatory scrollbar-none"
        >
          {data.map((item, idx) => {
            const iconConfig = ICONS[idx % ICONS.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="w-[85vw] sm:w-[360px] md:w-auto shrink-0 md:shrink snap-center md:snap-align-none flex"
              >
                <div className="w-full flex">
                  <SenecaDifferenceCard
                    icon={iconConfig.icon}
                    iconBgClass={iconConfig.bgClass}
                    title={item.title}
                    description={item.description}
                    linkText={item.badge ? `Explore ${item.badge}` : "Explore Curriculum"}
                    linkHref="/academics"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Carousel Indicators Dots */}
        <div className="flex md:hidden items-center justify-center gap-1.5 pt-1">
          {data.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  const scrollAmount = scrollRef.current.clientWidth * 0.85;
                  scrollRef.current.scrollTo({
                    left: dotIdx * scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              aria-label={`Go to slide ${dotIdx + 1}`}
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

export default SenecaDifferenceSection;
