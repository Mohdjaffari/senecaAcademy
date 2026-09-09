"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  GraduationCap,
  Heart,
  Share2,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface FeedbackCardData {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  relationship?: string;
  studentGrade?: string;
  rating: number;
  category: string;
  title: string;
  comment: string;
  recommend?: boolean;
  avatarUrl?: string;
  status?: string;
  isFeatured?: boolean;
  likesCount?: number;
  createdAt?: string | Date;
}

interface FeedbackCardProps {
  data: FeedbackCardData;
}

export function FeedbackCard({ data }: FeedbackCardProps) {
  const [likes, setLikes] = useState(data.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const feedbackId = data._id || data.id;

  const handleLike = async () => {
    if (hasLiked || isLiking || !feedbackId) return;
    setIsLiking(true);
    setLikes((prev) => prev + 1);
    setHasLiked(true);

    try {
      const res = await fetch("/api/feedback/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedbackId }),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.success) {
          setLikes(resData.likesCount);
        }
      }
      toast.success("Thank you! Your appreciation has been recorded.");
    } catch {
      // Keep optimistic like
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/feedback#${feedbackId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Review link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formattedDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Verified Community";

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case "Parent":
        return {
          label: "Verified Parent",
          icon: <ShieldCheck className="h-3 w-3 text-emerald-500" />,
          classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "Alumni":
        return {
          label: "Seneca Alumnus",
          icon: <GraduationCap className="h-3 w-3 text-amber-500" />,
          classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
      case "Student":
        return {
          label: "Current Student",
          icon: <Sparkles className="h-3 w-3 text-sky-500" />,
          classes: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
      case "Teacher":
        return {
          label: "Faculty Member",
          icon: <ShieldCheck className="h-3 w-3 text-purple-500" />,
          classes: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
      default:
        return {
          label: roleStr || "Verified Community",
          icon: <CheckCircle2 className="h-3 w-3 text-seneca-crimson dark:text-seneca-amber" />,
          classes: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const roleMeta = getRoleBadge(data.role);

  return (
    <div
      id={feedbackId}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-7 transition-all duration-300 scroll-mt-28",
        "bg-card/95 hover:bg-card border border-border/80 hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/40",
        "shadow-xs hover:shadow-xl hover:-translate-y-1 backdrop-blur-md",
        data.isFeatured && "ring-1 ring-amber-400/40 bg-gradient-to-br from-amber-500/[0.04] via-card to-card"
      )}
    >
      {/* Background Ambient Glow on Hover */}
      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-seneca-amber/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="space-y-4 relative z-10">
        {/* Top Bar: Rating, Category & Copy Link */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < data.rating
                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_4px_rgba(251,191,36,0.4)]"
                      : "fill-muted text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground ml-1">
              {data.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {data.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                <Sparkles className="h-2.5 w-2.5" /> Featured
              </span>
            )}
            <Badge
              variant="outline"
              className="text-[11px] font-semibold text-muted-foreground border-border/80 bg-muted/30"
            >
              {data.category}
            </Badge>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy review link"
              className="h-7 w-7 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer opacity-70 hover:opacity-100"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Share2 className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Review Title */}
        <h4 className="font-heading font-extrabold text-base sm:text-lg text-foreground tracking-tight line-clamp-2 leading-snug group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
          &ldquo;{data.title}&rdquo;
        </h4>

        {/* Review Message Text */}
        <div className="relative">
          <p
            className={cn(
              "text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line",
              !isExpanded && "line-clamp-4"
            )}
          >
            {data.comment}
          </p>
          {data.comment.length > 220 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1.5 text-xs font-bold text-seneca-crimson dark:text-seneca-amber hover:underline inline-block focus:outline-none cursor-pointer"
            >
              {isExpanded ? "Show less" : "Read full review..."}
            </button>
          )}
        </div>

        {/* Recommend Tag */}
        {data.recommend && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Recommends Seneca Academy</span>
          </div>
        )}
      </div>

      {/* Footer: User Profile & Like / Helpful Action */}
      <div className="pt-5 mt-5 border-t border-border/60 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          {data.avatarUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-seneca-amber/30 shrink-0 shadow-xs">
              <Image
                src={data.avatarUrl}
                alt={data.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-seneca-crimson to-seneca-amber text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {getInitials(data.name)}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h5 className="font-heading font-bold text-xs sm:text-sm text-foreground truncate">
                {data.name}
              </h5>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {data.relationship || (data.studentGrade ? `Grade: ${data.studentGrade}` : roleMeta.label)}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground/70">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Helpful Count Button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={hasLiked}
          title={hasLiked ? "You found this helpful" : "Mark as helpful"}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer",
            hasLiked
              ? "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-amber/20 dark:text-seneca-amber border border-seneca-crimson/20 font-bold"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
          )}
        >
          <ThumbsUp className={cn("h-3.5 w-3.5", hasLiked && "fill-current scale-110")} />
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
}

export default FeedbackCard;
