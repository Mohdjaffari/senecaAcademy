"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ArticlePreviewCard from "./ArticlePreviewCard";

interface KnowledgePerspectivesSectionProps {
  blogs?: any[];
}

const DEFAULT_BLOGS = [
  {
    _id: "fb-1",
    title: "Cultivating Critical Thinking in the Digital Age",
    slug: "cultivating-critical-thinking-in-digital-age",
    excerpt:
      "How modern educational pedagogy balances screen time with hands-on inquiry and analytical reasoning.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    category: "Pedagogy",
    authorName: "M. Zohaib Ali (Principal)",
    publishedAt: new Date().toISOString(),
  },
  {
    _id: "fb-2",
    title: "Celebrating 100% Board Distinction in Matriculation Examinations",
    slug: "celebrating-100-percent-board-distinction",
    excerpt:
      "Our 2025-2026 batch achieved top ranks across Karachi with exceptional performance in Computer Science and Bio-Science.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    category: "Achievements",
    authorName: "Dr. Ayesha Siddiqui",
    publishedAt: new Date().toISOString(),
  },
  {
    _id: "fb-3",
    title: "The Importance of Character Building Alongside Academic Rigor",
    slug: "character-building-alongside-academic-rigor",
    excerpt:
      "Why high grades alone are not enough for 21st-century leadership without empathy, discipline, and integrity.",
    coverImageUrl:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
    category: "School Life",
    authorName: "Sir Tariq Mehmood",
    publishedAt: new Date().toISOString(),
  },
];

export function KnowledgePerspectivesSection({
  blogs,
}: KnowledgePerspectivesSectionProps) {
  const [items, setItems] = useState<any[]>(
    blogs && blogs.length > 0 ? blogs.slice(0, 3) : DEFAULT_BLOGS
  );

  useEffect(() => {
    if (blogs && blogs.length > 0) {
      setItems(blogs.slice(0, 3));
    }
  }, [blogs]);

  useEffect(() => {
    async function loadDynamicBlogs() {
      try {
        const res = await fetch("/api/website/blogs?status=published");
        const json = await res.json();
        if (json.success && Array.isArray(json.data?.blogs) && json.data.blogs.length > 0) {
          setItems(json.data.blogs.slice(0, 3));
        }
      } catch (_) {}
    }
    loadDynamicBlogs();
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / (clientWidth * 0.84));
      setActiveIndex(Math.min(index, items.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.84;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      id="announcements"
      className="py-20 lg:py-28 bg-gradient-to-b from-background via-muted/20 to-background border-t border-border scroll-mt-24 relative overflow-hidden"
    >
      <div className="container space-y-12">
        {/* Header with entrance animation */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <Badge variant="crimson">Knowledge & Perspectives</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
              Latest from the Academy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore articles, board distinction announcements, pedagogical methodologies, and student milestones from Seneca educators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Navigation Arrows */}
            <div className="flex md:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                aria-label="Scroll articles left"
                className="h-8 w-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-90"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                aria-label="Scroll articles right"
                className="h-8 w-8 rounded-full border border-border/80 bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all active:scale-90"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full hover:border-seneca-crimson hover:text-seneca-crimson dark:hover:border-seneca-amber dark:hover:text-seneca-amber-light shrink-0"
            >
              <Link href="/blogs" className="gap-1.5 text-xs font-bold">
                <span>View All Articles</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Mobile Horizontal Snap Carousel & Desktop Grid */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 px-4 -mx-4 md:px-0 md:mx-0 snap-x snap-mandatory scrollbar-none"
        >
          {items.map((b, idx) => (
            <motion.div
              key={b._id || b.id || b.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="w-[84vw] sm:w-[350px] md:w-auto shrink-0 md:shrink snap-center md:snap-align-none flex"
            >
              <div className="w-full flex">
                <ArticlePreviewCard {...b} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Indicator Dots */}
        <div className="flex md:hidden items-center justify-center gap-1.5 pt-1">
          {items.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  const scrollAmount = scrollRef.current.clientWidth * 0.84;
                  scrollRef.current.scrollTo({
                    left: dotIdx * scrollAmount,
                    behavior: "smooth",
                  });
                }
              }}
              aria-label={`Go to article ${dotIdx + 1}`}
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

export default KnowledgePerspectivesSection;
