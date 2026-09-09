"use client";

import { useEffect, useRef } from "react";
import { Search, SlidersHorizontal, Star, X, Layers, Users, BookOpen, GraduationCap, Building2, ShieldCheck, CreditCard, Sparkles, HeartHandshake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IReviewsCategory, IReviewsRole } from "@/lib/db/reviews-page-defaults";

const ICON_MAP: Record<string, any> = {
  Layers,
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  HeartHandshake,
};

interface FeedbackFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedRole: string;
  onRoleChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedRating: string;
  onRatingChange: (val: string) => void;
  selectedSort: string;
  onSortChange: (val: string) => void;
  totalCount: number;
  categories?: IReviewsCategory[];
  roles?: IReviewsRole[];
}

const DEFAULT_CATEGORIES: IReviewsCategory[] = [
  { id: "all", label: "All Categories", icon: "Layers", description: "", isActive: true },
  { id: "Academic Excellence", label: "Academics", icon: "BookOpen", description: "", isActive: true },
  { id: "Faculty & Mentorship", label: "Faculty & Mentors", icon: "GraduationCap", description: "", isActive: true },
  { id: "Campus Facilities & Labs", label: "Campus & Labs", icon: "Building2", description: "", isActive: true },
  { id: "Discipline & Moral Values", label: "Values & Ethics", icon: "ShieldCheck", description: "", isActive: true },
  { id: "Admissions & Administration", label: "Admissions Desk", icon: "CreditCard", description: "", isActive: true },
  { id: "Sports & Extracurriculars", label: "Sports & Arts", icon: "Sparkles", description: "", isActive: true },
];

const DEFAULT_ROLES: IReviewsRole[] = [
  { id: "all", label: "All Roles", icon: "Users", isActive: true },
  { id: "Parent", label: "Parents", icon: "ShieldCheck", isActive: true },
  { id: "Student", label: "Students", icon: "Sparkles", isActive: true },
  { id: "Alumni", label: "Alumni", icon: "GraduationCap", isActive: true },
  { id: "Prospective Parent", label: "Prospective Families", icon: "HeartHandshake", isActive: true },
  { id: "Teacher", label: "Faculty", icon: "BookOpen", isActive: true },
];

export function FeedbackFilterBar({
  search,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedCategory,
  onCategoryChange,
  selectedRating,
  onRatingChange,
  selectedSort,
  onSortChange,
  totalCount,
  categories = DEFAULT_CATEGORIES,
  roles = DEFAULT_ROLES,
}: FeedbackFilterBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeCategories = categories.filter((c) => c.isActive);
  const activeRoles = roles.filter((r) => r.isActive);

  // Keyboard shortcut '/' to search
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

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedRole !== "all" ||
    selectedCategory !== "all" ||
    selectedRating !== "all" ||
    selectedSort !== "featured";

  const clearAllFilters = () => {
    onSearchChange("");
    onRoleChange("all");
    onCategoryChange("all");
    onRatingChange("all");
    onSortChange("featured");
  };

  const getDynamicIcon = (name: string, className = "h-3.5 w-3.5") => {
    const IconComponent = ICON_MAP[name] || Layers;
    return <IconComponent className={className} />;
  };

  return (
    <div id="reviews-wall" className="space-y-4 scroll-mt-24">
      {/* Top Search, Rating & Sort Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search reviews (press '/' to focus)..."
            className="pl-10 pr-9 rounded-2xl bg-card border-border/80 h-11 text-xs sm:text-sm shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Star Rating Select */}
          <select
            value={selectedRating}
            onChange={(e) => onRatingChange(e.target.value)}
            className="h-11 px-3.5 rounded-2xl bg-card border border-border/80 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-seneca-amber/20 shadow-xs cursor-pointer"
          >
            <option value="all">⭐ All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars Only</option>
            <option value="4">⭐⭐⭐⭐ 4+ Stars</option>
          </select>

          {/* Sort Select */}
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 px-3.5 rounded-2xl bg-card border border-border/80 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-seneca-amber/20 shadow-xs cursor-pointer"
          >
            <option value="featured">✨ Featured First</option>
            <option value="newest">🕒 Latest Reviews</option>
            <option value="rating_desc">⭐ Highest Rated</option>
            <option value="likes">👍 Most Helpful</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs font-bold text-seneca-crimson dark:text-seneca-amber hover:underline px-2 cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Role:</span>
        {activeRoles.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onRoleChange(r.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 inline-flex items-center gap-1.5 cursor-pointer",
              selectedRole === r.id
                ? "bg-seneca-crimson text-white dark:bg-seneca-amber dark:text-zinc-950 shadow-xs font-bold"
                : "bg-card border border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {getDynamicIcon(r.icon, "h-3 w-3")}
            <span>{r.label}</span>
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <span className="text-xs font-bold text-muted-foreground mr-1 shrink-0">Focus:</span>
        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={cn(
              "px-3 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 inline-flex items-center gap-1.5 cursor-pointer",
              selectedCategory === cat.id
                ? "bg-seneca-crimson/15 text-seneca-crimson dark:bg-seneca-amber/20 dark:text-seneca-amber-light border border-seneca-crimson/30 font-bold"
                : "bg-muted/40 border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {getDynamicIcon(cat.icon, "h-3 w-3")}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Results Count Line */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>
          Showing <strong>{totalCount}</strong> verified community reviews
        </span>
      </div>
    </div>
  );
}

export default FeedbackFilterBar;
