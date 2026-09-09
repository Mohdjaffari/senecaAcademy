"use client";

import { useState, useMemo } from "react";
import { IFaqsPageData, IFaqQuestionItem } from "@/lib/db/faqs-page-defaults";
import FaqsHeroSection from "./FaqsHeroSection";
import FaqsStatsSection from "./FaqsStatsSection";
import FaqsFilterBar from "./FaqsFilterBar";
import FaqsAccordionList from "./FaqsAccordionList";
import FaqsHelpdeskCta from "./FaqsHelpdeskCta";

interface FaqsInteractiveContainerProps {
  initialData: IFaqsPageData;
}

export function FaqsInteractiveContainer({ initialData }: FaqsInteractiveContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(
    initialData.questions?.[0]?.id || null
  );

  const activeQuestions = useMemo(() => {
    return (initialData.questions || [])
      .filter((q) => q.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [initialData.questions]);

  // Compute item counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: activeQuestions.length,
    };
    activeQuestions.forEach((q) => {
      counts[q.categoryId] = (counts[q.categoryId] || 0) + 1;
    });
    return counts;
  }, [activeQuestions]);

  // Filter questions based on category and search query
  const filteredFAQs = useMemo(() => {
    return activeQuestions.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [activeQuestions, searchQuery, selectedCategory]);

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSelectedCategory("all");
  };

  const sectionsOrder =
    initialData.sectionsOrder && initialData.sectionsOrder.length > 0
      ? initialData.sectionsOrder
      : ["hero", "stats", "questions", "helpdesk"];

  const renderSection = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return <FaqsHeroSection key="hero" hero={initialData.hero} />;
      case "stats":
        return <FaqsStatsSection key="stats" stats={initialData.stats} />;
      case "questions":
        return (
          <div key="questions-block" className="flex flex-col">
            <FaqsFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={initialData.categories}
              categoryCounts={categoryCounts}
            />
            <FaqsAccordionList
              filteredFAQs={filteredFAQs}
              expandedId={expandedId}
              toggleAccordion={toggleAccordion}
              searchQuery={searchQuery}
              onReset={handleReset}
              onTagClick={handleTagClick}
            />
          </div>
        );
      case "helpdesk":
        return <FaqsHelpdeskCta key="helpdesk" helpdesk={initialData.helpdesk} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col min-h-screen">
      {sectionsOrder.map((key) => renderSection(key))}
    </main>
  );
}

export default FaqsInteractiveContainer;
