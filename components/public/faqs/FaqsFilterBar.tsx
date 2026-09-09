"use client";

import React, { useRef, useEffect } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IFaqCategory } from "@/lib/db/faqs-page-defaults";
import { getDynamicIcon } from "@/lib/utils/icon-registry";

interface FaqsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: IFaqCategory[];
  categoryCounts?: Record<string, number>;
}

export function FaqsFilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  categoryCounts = {},
}: FaqsFilterBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleCategories = categories.filter((c) => c.isVisible !== false);

  return (
    <section className="py-6 sm:py-8 bg-background/95 border-b border-border/80 sticky top-[68px] sm:top-20 z-30 backdrop-blur-xl shadow-xs overflow-x-clip">
      <div className="container max-w-4xl mx-auto px-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search by keyword (e.g. 'entrance test', 'sibling discount', 'bsek', 'lms login')... Press '/' to search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-12 h-11 sm:h-12 rounded-2xl bg-card border-border/90 text-xs sm:text-sm shadow-xs focus:ring-2 focus:ring-seneca-amber/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground hover:text-foreground bg-muted p-1 sm:px-2 rounded-lg flex items-center gap-1 transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Category Tabs Pill Bar with horizontal mobile scrolling */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {visibleCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id];

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 snap-start border cursor-pointer",
                  isSelected
                    ? "bg-seneca-amber text-zinc-950 border-seneca-amber shadow-md shadow-seneca-amber/20 dark:bg-seneca-amber dark:text-zinc-950 scale-[1.02]"
                    : "bg-card text-muted-foreground border-border/80 hover:border-seneca-amber/40 hover:text-foreground"
                )}
              >
                {getDynamicIcon(cat.icon || "HelpCircle", "h-3.5 w-3.5")}
                <span>{cat.label}</span>
                {count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.2 rounded-full font-extrabold",
                      isSelected
                        ? "bg-zinc-950/15 text-zinc-950"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqsFilterBar;
