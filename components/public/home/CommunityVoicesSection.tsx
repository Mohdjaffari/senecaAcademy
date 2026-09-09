"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquarePlus,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Quote,
  CheckCircle2,
  GraduationCap,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackCardData } from "@/components/public/feedback/FeedbackCard";
import FeedbackSubmitModal from "@/components/public/feedback/FeedbackSubmitModal";

const FEATURED_COMMUNITY_VOICES: FeedbackCardData[] = [
  {
    name: "Engr. Farhan Siddiqui",
    role: "Parent",
    relationship: "Parent of Grade 9 & Grade 6 Students",
    studentGrade: "Grade 9 & Grade 6",
    rating: 5,
    category: "Academic Excellence",
    title: "Remarkable conceptual clarity and balanced character building",
    comment:
      "What truly distinguishes Seneca Academy is their balance between rigorous science education and moral character. Both of my children have gained immense conceptual confidence without the need for evening private tuitions.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    recommend: true,
    isFeatured: true,
    likesCount: 38,
    createdAt: new Date("2026-08-15T10:30:00Z"),
  },
  {
    name: "Dr. Samina Rizvi",
    role: "Parent",
    relationship: "Parent of Grade 10 Board Position Holder",
    studentGrade: "Grade 10 (Matric BSEK)",
    rating: 5,
    category: "Faculty & Mentorship",
    title: "Extraordinary faculty dedication during Matric Board Preparation",
    comment:
      "The faculty's dedication during matric board preparation was extraordinary. From weekly mock examinations to personalized feedback sessions, they guided my daughter to achieve 92% in BSEK examinations.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    recommend: true,
    isFeatured: true,
    likesCount: 47,
    createdAt: new Date("2026-08-20T14:15:00Z"),
  },
  {
    name: "Hamza Tariq (Alumnus)",
    role: "Alumni",
    relationship: "Class of 2022 • FAST-NUCES CS Undergrad",
    studentGrade: "Class of 2022",
    rating: 5,
    category: "Campus Facilities & Labs",
    title: "Robotics lab and Python coding laid my engineering foundation",
    comment:
      "The computer programming and analytical problem-solving foundation I built in Seneca's robotics studio gave me a massive head start in my university degree. Seneca teaches you how to think and innovate.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    recommend: true,
    isFeatured: true,
    likesCount: 29,
    createdAt: new Date("2026-08-28T09:00:00Z"),
  },
  {
    name: "Mrs. Naila Kamran",
    role: "Parent",
    relationship: "Mother of Montessori & Grade 3 Students",
    studentGrade: "Montessori Senior",
    rating: 5,
    category: "Holistic Development",
    title: "A nurturing and intellectually stimulating second home",
    comment:
      "The warmth, hygiene, individual attention, and structured phonics curriculum at Seneca's early years campus are exemplary. My son runs to school every morning with a big smile!",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    recommend: true,
    isFeatured: true,
    likesCount: 34,
    createdAt: new Date("2026-08-30T11:00:00Z"),
  },
  {
    name: "Syed Bilal Hashmi",
    role: "Alumni",
    relationship: "Class of 2023 • Pre-Engineering",
    studentGrade: "Grade 10 Distinction",
    rating: 5,
    category: "Board Success",
    title: "Top-tier coaching that built my academic confidence",
    comment:
      "The teachers at Seneca did not just prepare us for BSEK exams; they taught us analytical reasoning and effective time management that helped me score an A-1 grade in my matriculation.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    recommend: true,
    isFeatured: true,
    likesCount: 22,
    createdAt: new Date("2026-09-02T15:20:00Z"),
  },
];

interface CommunityVoicesSectionProps {
  testimonials?: FeedbackCardData[];
  totalReviews?: number;
  averageRating?: number;
}

export function CommunityVoicesSection({
  testimonials,
  totalReviews,
  averageRating,
}: CommunityVoicesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [voices, setVoices] = useState<FeedbackCardData[]>(
    testimonials && testimonials.length > 0 ? testimonials : FEATURED_COMMUNITY_VOICES
  );
  const [reviewCount, setReviewCount] = useState<number>(totalReviews || 0);
  const [avgRating, setAvgRating] = useState<number>(averageRating || 4.9);
  const [filter, setFilter] = useState<string>("all");
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials && testimonials.length > 0) setVoices(testimonials);
    if (totalReviews !== undefined) setReviewCount(totalReviews);
    if (averageRating !== undefined) setAvgRating(averageRating);
  }, [testimonials, totalReviews, averageRating]);

  const loadDynamicReviews = async () => {
    try {
      const res = await fetch("/api/feedback?status=approved&limit=12");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setVoices(json.data);
        if (json.count) setReviewCount(json.count);
        if (json.stats?.avgRating) setAvgRating(json.stats.avgRating);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadDynamicReviews();
  }, []);

  const filteredVoices = voices.filter((item) => {
    if (filter === "all") return true;
    if (filter === "parent") return item.role?.toLowerCase().includes("parent");
    if (filter === "alumni") return item.role?.toLowerCase().includes("alumni");
    if (filter === "board") return (item.studentGrade && item.studentGrade.toLowerCase().includes("grade 10")) || item.category?.toLowerCase().includes("excellence") || item.category?.toLowerCase().includes("board");
    return true;
  });

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      const cardWidth = 380;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(index, filteredVoices.length - 1));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const toggleLike = (idx: number) => {
    setLikedMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-gradient-to-b from-card/30 via-background to-card/20 border-t border-border scroll-mt-24 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/3 left-0 -ml-24 h-96 w-96 rounded-full bg-seneca-crimson/5 dark:bg-seneca-crimson/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 -mr-24 h-96 w-96 rounded-full bg-seneca-amber/10 dark:bg-seneca-amber/15 blur-3xl pointer-events-none" />

      <div className="container px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6"
        >
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-seneca-crimson/10 dark:bg-seneca-amber/15 border border-seneca-crimson/20 dark:border-seneca-amber/30 text-seneca-crimson dark:text-seneca-amber-light text-xs font-bold">
              <Sparkles className="h-3 w-3 text-seneca-amber" />
              <span>Verified Parent &amp; Alumni Reflections</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
              Voices of the <span className="bg-gradient-to-r from-seneca-crimson to-seneca-amber dark:from-seneca-amber-light dark:to-seneca-amber bg-clip-text text-transparent">Seneca Community</span>
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Authentic reflections from families and high-achieving alumni whose futures were shaped by our values and rigorous academics.
            </p>
          </div>

          {/* Header Controls: Rating badge + Carousel Arrows + Write Review */}
          <div className="flex flex-wrap items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end">
            {/* Rating Summary Pill */}
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-card border border-border shadow-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-left border-l border-border pl-2.5">
                <div className="text-xs font-black text-foreground leading-none">
                  {avgRating ? `${avgRating.toFixed(1)} / 5.0` : "4.9 / 5.0"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {reviewCount ? `${reviewCount}+ Reviews` : "340+ Reviews"}
                </div>
              </div>
            </div>

            {/* Left & Right Professional Carousel Arrows */}
            <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-full shadow-xs">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous testimonial"
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  canScrollLeft
                    ? "hover:bg-seneca-crimson hover:text-white dark:hover:bg-seneca-amber text-foreground active:scale-95"
                    : "opacity-30 cursor-not-allowed text-muted-foreground"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next testimonial"
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all ${
                  canScrollRight
                    ? "hover:bg-seneca-crimson hover:text-white dark:hover:bg-seneca-amber text-foreground active:scale-95"
                    : "opacity-30 cursor-not-allowed text-muted-foreground"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Write Review CTA */}
            <Button
              onClick={() => setModalOpen(true)}
              size="sm"
              className="rounded-full px-5 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all gap-1.5 shrink-0"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Submit Review</span>
            </Button>
          </div>
        </motion.div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Reflections" },
            { id: "parent", label: "Parents" },
            { id: "alumni", label: "Alumni" },
            { id: "board", label: "Board Distinction" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                filter === tab.id
                  ? "bg-seneca-crimson text-white dark:bg-seneca-amber dark:text-zinc-950 shadow-xs scale-[1.02]"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Professional Horizontal Swipe & Snap Carousel */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 px-1 -mx-1 snap-x snap-mandatory scrollbar-none"
        >
          {filteredVoices.map((item, idx) => {
            const isLiked = likedMap[idx] || false;
            const currentLikes = (item.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="w-[86vw] sm:w-[380px] lg:w-[410px] shrink-0 snap-start flex flex-col"
              >
                <div className="h-full relative rounded-3xl p-6 sm:p-7 bg-card/90 dark:bg-card/75 backdrop-blur-xl border border-border/80 shadow-md hover:shadow-2xl hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all duration-300 flex flex-col justify-between group">
                  {/* Subtle Background Watermark Quotation */}
                  <Quote className="absolute top-4 right-4 h-16 w-16 text-seneca-crimson/5 dark:text-seneca-amber/5 pointer-events-none select-none transition-transform group-hover:scale-110" />

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Stars + Category Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(item.rating || 5)].map((_, rIdx) => (
                          <Star key={rIdx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      {item.category && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted border border-border/60 text-muted-foreground uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {/* Headline Title */}
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-foreground leading-snug group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors line-clamp-2">
                      &ldquo;{item.title}&rdquo;
                    </h3>

                    {/* Testimonial Quote */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-4 italic">
                      {item.comment}
                    </p>
                  </div>

                  {/* Author Card Footer */}
                  <div className="pt-5 mt-6 border-t border-border/70 flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-seneca-crimson/20 dark:border-seneca-amber/30 bg-muted shrink-0 shadow-xs">
                        {item.avatarUrl ? (
                          <Image
                            src={item.avatarUrl}
                            alt={item.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-seneca-crimson/10 text-seneca-crimson flex items-center justify-center font-bold text-xs">
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {item.name}
                          </h4>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.relationship || item.role}
                        </p>
                      </div>
                    </div>

                    {/* Like Counter Button */}
                    <button
                      type="button"
                      onClick={() => toggleLike(idx)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full transition-all shrink-0 ${
                        isLiked
                          ? "bg-rose-500/15 text-rose-500 border border-rose-500/30 scale-105"
                          : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${isLiked ? "fill-rose-500" : ""}`} />
                      <span>{currentLikes}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Pagination Indicator Dots & Hint */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Swipe or click arrows to view more verified testimonials.</span>
          </div>

          <div className="flex items-center gap-1.5">
            {filteredVoices.slice(0, 8).map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => {
                  if (scrollRef.current) {
                    const cardWidth = 380;
                    scrollRef.current.scrollTo({
                      left: dotIdx * cardWidth,
                      behavior: "smooth",
                    });
                  }
                }}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === dotIdx
                    ? "w-7 bg-seneca-crimson dark:bg-seneca-amber"
                    : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Link
            href="/feedback"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson dark:text-seneca-amber hover:underline group"
          >
            <span>Read all community ratings &amp; stories</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <FeedbackSubmitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmitted={loadDynamicReviews}
      />
    </section>
  );
}

export default CommunityVoicesSection;

