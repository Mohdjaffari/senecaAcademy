"use client";

import React from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import FaqItemCard from "./FaqItemCard";
import { IFaqQuestionItem } from "@/lib/db/faqs-page-defaults";
import { motion } from "framer-motion";

interface FaqsAccordionListProps {
  filteredFAQs: IFaqQuestionItem[];
  expandedId: string | null;
  toggleAccordion: (id: string) => void;
  searchQuery: string;
  onReset: () => void;
  onTagClick?: (tag: string) => void;
}

export function FaqsAccordionList({
  filteredFAQs,
  expandedId,
  toggleAccordion,
  searchQuery,
  onReset,
  onTagClick,
}: FaqsAccordionListProps) {
  return (
    <section className="py-12 sm:py-16 bg-card/30">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-seneca-amber" />
            Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? "Verified Answer" : "Verified Answers"}
          </span>
          {searchQuery && (
            <span className="text-xs text-seneca-amber font-bold">
              Filtered by &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {filteredFAQs.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4 rounded-3xl border border-dashed border-border bg-card">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-seneca-amber/10 text-seneca-amber mx-auto">
              <HelpCircle className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold font-heading text-foreground">
              No matching answers found
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any questions matching &ldquo;{searchQuery}&rdquo;. Try another search keyword or contact our admissions counseling team directly.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="rounded-full font-semibold"
            >
              Reset Search Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFAQs.map((faq, idx) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
              >
                <FaqItemCard
                  faq={faq}
                  isOpen={expandedId === faq.id}
                  onToggle={() => toggleAccordion(faq.id)}
                  searchQuery={searchQuery}
                  onTagClick={onTagClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default FaqsAccordionList;
