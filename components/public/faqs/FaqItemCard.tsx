"use client";

import { useState } from "react";
import { ChevronDown, Share2, ThumbsUp, ThumbsDown, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { IFaqQuestionItem } from "@/lib/db/faqs-page-defaults";
import { toast } from "sonner";

interface FaqItemCardProps {
  faq: IFaqQuestionItem;
  isOpen: boolean;
  onToggle: () => void;
  searchQuery?: string;
  onTagClick?: (tag: string) => void;
}

export function FaqItemCard({
  faq,
  isOpen,
  onToggle,
  searchQuery = "",
  onTagClick,
}: FaqItemCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<"helpful" | "unhelpful" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/faqs#${faq.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Question link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeedback = (type: "helpful" | "unhelpful") => {
    setFeedbackGiven(type);
    toast.success(
      type === "helpful"
        ? "Thank you for your feedback!"
        : "Thank you! We will improve this answer."
    );
  };

  // Helper to highlight matching text
  const renderHighlighted = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-seneca-amber/30 text-foreground rounded-sm px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      id={faq.id}
      className={cn(
        "rounded-3xl border transition-all duration-300 overflow-hidden bg-card/90 backdrop-blur-sm shadow-xs scroll-mt-32",
        isOpen
          ? "border-seneca-amber/50 dark:border-seneca-amber/50 shadow-md ring-1 ring-seneca-amber/20"
          : "border-border/80 hover:border-seneca-amber/30 hover:shadow-xs"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="flex w-full items-center justify-between p-4 sm:p-5 text-left transition-colors gap-3 sm:gap-4 group cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-seneca-crimson dark:text-seneca-amber block">
              {faq.categoryLabel}
            </span>
            {faq.isHighlighted && (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.2 rounded-full bg-seneca-crimson/10 text-seneca-crimson border border-seneca-crimson/20">
                <Sparkles className="w-2.5 h-2.5" />
                Featured
              </span>
            )}
          </div>
          <h4 className="font-heading font-bold text-sm sm:text-base text-foreground leading-snug group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber transition-colors">
            {renderHighlighted(faq.question)}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="h-8 w-8 rounded-full border border-border/80 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 sm:opacity-70 cursor-pointer"
            title="Copy link to question"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
          </button>
          <div
            className={cn(
              "h-8 w-8 rounded-full border border-border/80 bg-muted/60 flex items-center justify-center shrink-0 transition-transform duration-300",
              isOpen
                ? "rotate-180 bg-seneca-amber text-zinc-950 border-transparent shadow-sm"
                : "text-muted-foreground"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/20 space-y-4 animate-in fade-in-50 duration-200">
          <p className="leading-relaxed text-foreground/90 whitespace-pre-line">
            {renderHighlighted(faq.answer)}
          </p>

          {/* Tags */}
          {faq.tags && faq.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {faq.tags.map((tag, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => onTagClick && onTagClick(tag)}
                  className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-seneca-amber/10 border border-border/60 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* Feedback rating */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40 text-[11px]">
            <span className="text-muted-foreground">Was this answer helpful?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={feedbackGiven !== null}
                onClick={() => handleFeedback("helpful")}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-medium",
                  feedbackGiven === "helpful"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                    : "bg-background hover:bg-muted text-muted-foreground border-border/70"
                )}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Yes</span>
              </button>
              <button
                type="button"
                disabled={feedbackGiven !== null}
                onClick={() => handleFeedback("unhelpful")}
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-medium",
                  feedbackGiven === "unhelpful"
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/30 font-bold"
                    : "bg-background hover:bg-muted text-muted-foreground border-border/70"
                )}
              >
                <ThumbsDown className="w-3 h-3" />
                <span>No</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaqItemCard;
