"use client";

import { useState } from "react";
import FeedbackHeroSection from "./FeedbackHeroSection";
import FeedbackList from "./FeedbackList";
import FeedbackSubmitModal from "./FeedbackSubmitModal";
import { FeedbackCardData } from "./FeedbackCard";
import { IReviewsPageData, DEFAULT_REVIEWS_PAGE_DATA } from "@/lib/db/reviews-page-defaults";

interface FeedbackPageClientProps {
  initialFeedbacks: FeedbackCardData[];
  initialStats: any;
  pageData?: IReviewsPageData;
}

export function FeedbackPageClient({
  initialFeedbacks,
  initialStats,
  pageData = DEFAULT_REVIEWS_PAGE_DATA,
}: FeedbackPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <FeedbackHeroSection
        heroData={pageData.hero}
        statsData={pageData.stats}
        liveStats={initialStats}
        onOpenSubmitModal={() => setModalOpen(true)}
      />

      <FeedbackList
        initialFeedbacks={initialFeedbacks}
        onOpenSubmitModal={() => setModalOpen(true)}
        refreshTrigger={refreshKey}
        categories={pageData.categories}
        roles={pageData.roles}
        ctaData={pageData.ctaBanner}
      />

      <FeedbackSubmitModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmitted={handleSubmitted}
        settings={pageData.submissionSettings}
        categories={pageData.categories}
        roles={pageData.roles}
      />
    </>
  );
}

export default FeedbackPageClient;
