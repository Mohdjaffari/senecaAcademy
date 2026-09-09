"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, ArrowRight, BookOpen, Clock, Eye, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: string;
  authorName: string;
  publishedAt: string;
  views?: string;
}

interface BlogSectionProps {
  blogs: BlogPost[];
}

export function BlogSection({ blogs }: BlogSectionProps) {
  const fallbackBlogs: BlogPost[] = [
    {
      _id: "fb-1",
      title: "Cultivating Critical Thinking in the Digital Age",
      slug: "cultivating-critical-thinking-in-digital-age",
      excerpt:
        "How modern educational pedagogy balances screen time with hands-on inquiry, scientific experimentation, and analytical reasoning.",
      content:
        "In an era saturated with immediate digital answers, learning how to ask the right questions has never been more vital. At Seneca Academy, our STEM and Humanities curricula are purposefully structured to encourage debate, scientific method experimentation, and original hypothesis formulation.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      category: "Pedagogy",
      authorName: "M. Zohaib Ali (Principal)",
      publishedAt: new Date().toISOString(),
      views: "2.8k",
    },
    {
      _id: "fb-2",
      title: "Celebrating 100% Board Distinction in Matriculation Examinations",
      slug: "celebrating-100-percent-board-distinction",
      excerpt:
        "Our 2025-2026 batch achieved top ranks across Karachi with exceptional performance in Computer Science and Bio-Science.",
      content:
        "We are immensely proud to announce that 100% of our matriculation cohort passed with A-One and A grades in the annual board examinations. Our dedicated faculty conducted rigorous diagnostic review sessions and laboratory simulations.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      category: "Achievements",
      authorName: "Dr. Ayesha Siddiqui",
      publishedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      views: "3.5k",
    },
    {
      _id: "fb-3",
      title: "The Importance of Character Building Alongside Academic Rigor",
      slug: "character-building-alongside-academic-rigor",
      excerpt:
        "Why high grades alone are not enough for 21st-century leadership without empathy, moral discipline, and ethical integrity.",
      content:
        "Academic excellence without moral character produces intellect without compass. At Seneca Academy, character coaching is woven directly into daily school routines through community outreach and leadership workshops.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      category: "School Life",
      authorName: "Sir Tariq Mehmood",
      publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      views: "1.9k",
    },
    {
      _id: "fb-4",
      title: "Empowering Young Minds Through Modern STEM & Robotics Labs",
      slug: "empowering-young-minds-through-stem-robotics",
      excerpt:
        "A look inside our newly upgraded robotics workshop, Python programming studio, and hands-on science apparatus.",
      content:
        "In the 21st-century economy, foundational literacy must include computational thinking and experimental science. Seneca Academy has invested heavily in upgrading its STEM laboratories in Soldier Bazar, Karachi.",
      coverImageUrl:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
      category: "STEM & Labs",
      authorName: "Engr. Farhan Qureshi",
      publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      views: "2.1k",
    },
  ];

  const displayBlogs = blogs && blogs.length > 0 ? blogs : fallbackBlogs;

  return (
    <section id="blogs" className="py-16 sm:py-24 lg:py-28 bg-muted/30 border-t border-border overflow-hidden">
      <div className="container space-y-8 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2 max-w-xl">
            <Badge variant="crimson">Knowledge & Insights</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
              News, Articles & Academic Insights
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Read the latest perspectives from our faculty, student achievements, pedagogical methodologies, and school events.
            </p>
          </div>

          {/* Mobile Swipe Hint */}
          <div className="md:hidden flex items-center gap-1 text-[11px] font-semibold text-seneca-crimson dark:text-seneca-amber-light">
            <span>Swipe horizontally to read articles</span>
            <ChevronRight className="h-3.5 w-3.5 animate-pulse" />
          </div>
        </motion.div>

        {/* Mobile Horizontal Snap Row / Desktop 3-col Grid */}
        <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 md:gap-8 pb-4 pt-1 -mx-4 md:mx-0 px-4 md:px-0">
          {displayBlogs.map((post, idx) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="w-[84vw] sm:w-[340px] md:w-auto shrink-0 snap-center md:shrink flex"
            >
              <Link
                href={`/blogs/${post.slug}`}
                className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card shadow-sm hover:shadow-xl hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 sm:h-52 w-full bg-muted overflow-hidden">
                    <Image
                      src={
                        post.coverImageUrl ||
                        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 85vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-card/95 text-foreground backdrop-blur-md shadow-md border border-border/80">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        3 min read
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </div>

                <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                  <span className="text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light group-hover:underline inline-flex items-center gap-1">
                    <span>Read Full Article</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogSection;
