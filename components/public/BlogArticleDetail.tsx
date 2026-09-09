"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ThumbsUp,
  Heart,
  Smile,
  Copy,
  MessageCircle,
  Type,
  ArrowUp,
  Share,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";

interface ArticleProps {
  article: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl?: string;
    category: string;
    authorName: string;
    authorRole?: string;
    publishedAt: string;
    views?: string;
    readTime?: string;
    shares?: string;
    tags?: string[];
  };
  related: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImageUrl?: string;
    category: string;
    views?: string;
  }>;
}

export function BlogArticleDetail({ article, related }: ArticleProps) {
  const { admissionsOpen, admissionsSession } = usePublicWebsite();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xl">("normal");
  const [reactions, setReactions] = useState<{ helpful: number; inspired: number; loved: number }>({
    helpful: 42,
    inspired: 28,
    loved: 35,
  });
  const [reactedType, setReactedType] = useState<string | null>(null);

  // Check saved bookmark in local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`seneca_bookmark_${article.slug}`);
      if (saved === "true") setIsBookmarked(true);
    } catch {
      // ignore
    }
  }, [article.slug]);

  // Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleBookmark = () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      localStorage.setItem(`seneca_bookmark_${article.slug}`, String(nextState));
    } catch {
      // ignore
    }

    if (nextState) {
      toast.success("Article saved to reading list", {
        description: "You can easily revisit this article anytime.",
      });
    } else {
      toast.info("Article removed from reading list");
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Thank you for sharing!");
        return;
      } catch {
        // User cancelled or fallback to copy
      }
    }

    // Fallback to clipboard copy
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!", {
        description: "You can now paste and share it with parents or colleagues.",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`*${article.title}*\n${article.excerpt}\n\nRead more at Seneca Academy: ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleReaction = (type: "helpful" | "inspired" | "loved") => {
    if (reactedType === type) {
      setReactions((prev) => ({ ...prev, [type]: prev[type] - 1 }));
      setReactedType(null);
    } else {
      setReactions((prev) => ({
        ...prev,
        [type]: prev[type] + 1,
        ...(reactedType ? { [reactedType]: prev[reactedType as keyof typeof prev] - 1 } : {}),
      }));
      setReactedType(type);
      toast.success("Thank you for your feedback!");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fontClasses = {
    normal: "text-sm sm:text-base leading-relaxed",
    large: "text-base sm:text-lg leading-relaxed",
    xl: "text-lg sm:text-xl leading-relaxed",
  };

  return (
    <div className="bg-background min-h-screen pb-24 relative">
      {/* 1. Dynamic Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[120] bg-muted">
        <div
          className="h-full bg-gradient-to-r from-seneca-crimson via-seneca-crimson-light to-seneca-amber transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Breadcrumb Navigation Bar */}
      <div className="border-b border-border/80 bg-muted/40 py-3 px-4">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium overflow-hidden">
            <Link href="/" className="hover:text-foreground transition-colors shrink-0">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />
            <Link href="/blogs" className="hover:text-foreground transition-colors shrink-0">
              Blogs & News
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />
            <span className="text-foreground font-bold truncate max-w-[140px] sm:max-w-xs">
              {article.category}
            </span>
          </div>

          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light hover:underline shrink-0 ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back to All Articles</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* 3. Main Editorial Content */}
      <div className="container pt-6 sm:pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Main Article (col-span-8) */}
          <article className="lg:col-span-8 space-y-6">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg sm:text-2xl font-extrabold text-foreground tracking-tight">
                {article.category}
              </h2>

              {/* Font Size Adjuster for Readers */}
              <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 text-xs">
                <span className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 flex items-center gap-1">
                  <Type className="h-3 w-3" /> Text:
                </span>
                <button
                  onClick={() => setFontSize("normal")}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-bold transition-colors",
                    fontSize === "normal" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-bold transition-colors",
                    fontSize === "large" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSize("xl")}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-bold transition-colors",
                    fontSize === "xl" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  A++
                </button>
              </div>
            </div>

            {/* Hero Cover Image */}
            <div className="relative h-[220px] sm:h-[380px] lg:h-[460px] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-border/80 bg-muted">
              <Image
                src={
                  article.coverImageUrl ||
                  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80"
                }
                alt={article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                className="object-cover"
              />
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-border/60 pb-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-muted-foreground">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/15 dark:text-seneca-amber-light border border-seneca-crimson/20 dark:border-seneca-amber/30">
                  {article.category}
                </span>

                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{article.views || "2.8k"} views</span>
                </span>

                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{article.readTime || "4 min"}</span>
                </span>
              </div>

              {/* Desktop Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleBookmark}
                  className={cn(
                    "rounded-xl h-8 px-3 text-xs font-bold gap-1.5 transition-all",
                    isBookmarked
                      ? "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30 dark:bg-seneca-amber/15 dark:text-seneca-amber-light"
                      : "border-border/80 hover:bg-muted"
                  )}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-3.5 w-3.5 text-seneca-crimson dark:text-seneca-amber-light" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-xl h-8 px-3 text-xs font-bold gap-1.5 border-border/80 hover:bg-muted text-foreground"
                >
                  <Share2 className="h-3.5 w-3.5 text-seneca-crimson dark:text-seneca-amber-light" />
                  <span>Share</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppShare}
                  className="hidden sm:inline-flex rounded-xl h-8 px-3 text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </Button>
              </div>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-[1.25]">
              {article.title}
            </h1>

            {/* Author Byline */}
            <div className="space-y-1 text-xs text-muted-foreground pb-2">
              <div>
                By <strong className="text-foreground uppercase tracking-wide">{article.authorName}</strong>
                {article.authorRole && (
                  <span className="text-muted-foreground"> — {article.authorRole}</span>
                )}
              </div>
              <div>
                Published on {formatDate(article.publishedAt)} • Seneca Academy Institutional Research
              </div>
            </div>

            {/* Excerpt Lead Quote */}
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border-l-4 border-seneca-crimson dark:border-seneca-amber text-foreground text-sm sm:text-base font-medium leading-relaxed italic">
              &ldquo;{article.excerpt}&rdquo;
            </div>

            {/* Body Content */}
            <div className={cn("text-foreground/90 leading-relaxed whitespace-pre-line pt-2 space-y-5", fontClasses[fontSize])}>
              {article.content}
            </div>

            {/* Topic Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-border/80 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Topics:</span>
                {article.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-muted text-foreground border border-border/60 hover:bg-accent transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reader Reaction Feedback Bar */}
            <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-foreground block">Was this article helpful to you?</span>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleReaction("helpful")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all",
                    reactedType === "helpful"
                      ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs dark:bg-seneca-amber dark:text-zinc-950 dark:border-seneca-amber"
                      : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>Helpful ({reactions.helpful})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReaction("inspired")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all",
                    reactedType === "inspired"
                      ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs dark:bg-seneca-amber dark:text-zinc-950 dark:border-seneca-amber"
                      : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Inspiring ({reactions.inspired})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReaction("loved")}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all",
                    reactedType === "loved"
                      ? "bg-seneca-crimson text-white border-seneca-crimson shadow-xs dark:bg-seneca-amber dark:text-zinc-950 dark:border-seneca-amber"
                      : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Heart className="h-3.5 w-3.5" />
                  <span>Loved ({reactions.loved})</span>
                </button>
              </div>
            </div>

            {/* Author Attribution Card */}
            <Card className="p-6 rounded-2xl bg-card border-border/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-seneca-crimson text-white font-heading font-black text-xl shrink-0 shadow-md">
                {article.authorName.charAt(0)}
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-foreground">
                  Written by {article.authorName}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Faculty Educator & Academic Contributor at Seneca Academy, Karachi. Dedicated to elevating instructional pedagogy and student character.
                </p>
              </div>
            </Card>
          </article>

          {/* RIGHT COLUMN: Related Articles (col-span-4) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/80">
              <h3 className="font-heading text-xl font-extrabold text-foreground">
                Related <span className="text-seneca-crimson dark:text-seneca-amber-light">Articles</span>
              </h3>
              <Link
                href="/blogs"
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                See all
              </Link>
            </div>

            {/* Stack of Compact Related Article Cards */}
            <div className="space-y-4">
              {related.map((item) => (
                <Link
                  key={item._id || item.slug}
                  href={`/blogs/${item.slug}`}
                  className="group block p-3.5 rounded-2xl bg-card border border-border/80 hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 shadow-2xs hover:shadow-md transition-all duration-200"
                >
                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-muted mb-3">
                    <Image
                      src={
                        item.coverImageUrl ||
                        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="uppercase text-seneca-crimson dark:text-seneca-amber-light px-2 py-0.5 rounded-md bg-seneca-crimson/10 dark:bg-seneca-amber/15">
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{item.views || "2.1k"}</span>
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Admissions Widget */}
            <div className="rounded-2xl p-5 text-white bg-gradient-to-br from-seneca-crimson via-seneca-crimson to-seneca-amber shadow-lg space-y-3">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 inline-block">
                {admissionsOpen ? admissionsSession : "Campus Inquiries"}
              </span>
              <h4 className="font-heading font-extrabold text-base leading-tight">
                {admissionsOpen ? "Join Seneca Academy Today" : "Connect With Seneca Academy"}
              </h4>
              <p className="text-xs text-white/85 leading-relaxed">
                {admissionsOpen
                  ? "Saturday diagnostic entrance assessments are currently ongoing at our Soldier Bazar campus."
                  : "Admissions for the current cycle are closed. Contact our counseling team for future enrollment sessions."}
              </p>
              <Button asChild size="sm" className="w-full rounded-xl bg-white text-seneca-crimson font-bold hover:bg-white/90 shadow-sm mt-2">
                {admissionsOpen ? (
                  <Link href="/admissions">
                    <span>Admissions & Fees</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                ) : (
                  <Link href="/contact">
                    <span>Contact Helpdesk</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                )}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* 4. Mobile Sticky Bottom Action Bar (Only visible on small devices) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border p-3 flex items-center justify-between gap-2 shadow-xl">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBookmark}
          className={cn(
            "flex-1 rounded-xl h-10 text-xs font-bold gap-1.5",
            isBookmarked ? "bg-seneca-crimson/10 text-seneca-crimson border-seneca-crimson/30" : ""
          )}
        >
          {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          <span>{isBookmarked ? "Saved" : "Bookmark"}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex-1 rounded-xl h-10 text-xs font-bold gap-1.5"
        >
          <Share2 className="h-4 w-4 text-seneca-crimson" />
          <span>Share</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleWhatsAppShare}
          className="rounded-xl h-10 w-10 p-0 text-emerald-600 border-emerald-500/30 shrink-0"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={scrollToTop}
          className="rounded-xl h-10 w-10 p-0 shrink-0 bg-muted hover:bg-accent text-foreground border border-border"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default BlogArticleDetail;
