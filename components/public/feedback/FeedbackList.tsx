"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  Sparkles,
  Search,
  FilterX,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackCard, { FeedbackCardData } from "./FeedbackCard";
import FeedbackFilterBar from "./FeedbackFilterBar";
import FeedbackCtaBanner from "./FeedbackCtaBanner";
import { IReviewsCategory, IReviewsRole, IReviewsCtaBanner } from "@/lib/db/reviews-page-defaults";

interface FeedbackListProps {
  initialFeedbacks?: FeedbackCardData[];
  onOpenSubmitModal: () => void;
  refreshTrigger?: number;
  categories?: IReviewsCategory[];
  roles?: IReviewsRole[];
  ctaData?: IReviewsCtaBanner;
}

export function FeedbackList({
  initialFeedbacks = [],
  onOpenSubmitModal,
  refreshTrigger = 0,
  categories,
  roles,
  ctaData,
}: FeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackCardData[]>(initialFeedbacks);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedSort, setSelectedSort] = useState("featured");

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedRole !== "all") params.set("role", selectedRole);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedRating !== "all") params.set("minRating", selectedRating);
      if (selectedSort !== "featured") params.set("sort", selectedSort);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.feedbacks) {
          setFeedbacks(json.data.feedbacks);
        }
      }
    } catch (err) {
      console.error("Failed to load feedbacks:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedRole, selectedCategory, selectedRating, selectedSort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedbacks();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchFeedbacks, refreshTrigger]);

  return (
    <section className="py-12 sm:py-16 bg-background overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Filter Controls Bar */}
        <FeedbackFilterBar
          search={search}
          onSearchChange={setSearch}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedRating={selectedRating}
          onRatingChange={setSelectedRating}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          totalCount={feedbacks.length}
          categories={categories}
          roles={roles}
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-seneca-crimson dark:text-seneca-amber" />
            <p className="text-xs font-semibold">Loading verified reviews...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 max-w-md mx-auto p-8 rounded-3xl border border-dashed border-border bg-card/50">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FilterX className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-lg text-foreground">
                No matching reviews found
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Try adjusting your search criteria or be the first to share your experience for this category!
              </p>
            </div>
            <Button
              onClick={onOpenSubmitModal}
              className="rounded-full px-6 bg-seneca-crimson hover:bg-seneca-crimson-dark text-white font-bold text-xs gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              <span>Submit First Review</span>
            </Button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            <AnimatePresence mode="popLayout">
              {feedbacks.map((f, idx) => (
                <motion.div
                  key={f._id || f.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                >
                  <FeedbackCard data={f} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Callout Banner */}
        <FeedbackCtaBanner ctaData={ctaData} onOpenSubmitModal={onOpenSubmitModal} />
      </div>
    </section>
  );
}

export default FeedbackList;
