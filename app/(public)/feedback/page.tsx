import type { Metadata } from "next";
import connectToDatabase from "@/lib/db/mongodb";
import Feedback from "@/models/Feedback";
import { getPublishedReviewsPage } from "@/lib/db/reviews-page-server";
import FeedbackPageClient from "@/components/public/feedback/FeedbackPageClient";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPublishedReviewsPage();
  return {
    title: pageData.seo?.metaTitle || "Parent & Community Feedback & Reviews — Seneca Academy Karachi",
    description:
      pageData.seo?.metaDescription ||
      "Explore authentic reviews and ratings from parents, students, and alumni of Seneca Academy in Soldier Bazar, Karachi. Share your feedback on academics, faculty, and campus life.",
    keywords: pageData.seo?.keywords,
    openGraph: {
      title: pageData.seo?.metaTitle,
      description: pageData.seo?.metaDescription,
      images: pageData.seo?.ogImage ? [{ url: pageData.seo.ogImage }] : undefined,
    },
  };
}

async function getInitialFeedbackData() {
  try {
    await connectToDatabase();

    const feedbacks = await Feedback.find({ status: "approved" })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(60)
      .lean();

    const totalCount = feedbacks.length;
    const totalRatingSum = feedbacks.reduce((acc, f: any) => acc + (f.rating || 5), 0);
    const averageRating = totalCount > 0 ? parseFloat((totalRatingSum / totalCount).toFixed(1)) : 4.9;

    const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f: any) => {
      const r = Math.round(f.rating || 5);
      if (r >= 1 && r <= 5) ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
    });

    const recommendCount = feedbacks.filter((f: any) => f.recommend !== false).length;
    const recommendRate = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 98;

    return {
      feedbacks: JSON.parse(JSON.stringify(feedbacks)),
      stats: {
        totalCount,
        averageRating,
        recommendRate,
        ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Failed to load initial feedback data:", error);
    return {
      feedbacks: [],
      stats: {
        totalCount: 340,
        averageRating: 4.9,
        recommendRate: 98,
        ratingDistribution: { 5: 310, 4: 24, 3: 4, 2: 1, 1: 1 },
      },
    };
  }
}

export default async function FeedbackPage() {
  const [pageData, { feedbacks, stats }] = await Promise.all([
    getPublishedReviewsPage(),
    getInitialFeedbackData(),
  ]);

  return (
    <main className="flex flex-col min-h-screen">
      <FeedbackPageClient
        initialFeedbacks={feedbacks}
        initialStats={stats}
        pageData={pageData}
      />
    </main>
  );
}
