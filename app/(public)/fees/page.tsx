import FeesHeroSection from "@/components/public/fees/FeesHeroSection";
import FeesCalculatorSection from "@/components/public/fees/FeesCalculatorSection";
import FeesScholarshipsSection from "@/components/public/fees/FeesScholarshipsSection";
import FeesBankingPolicySection from "@/components/public/fees/FeesBankingPolicySection";
import FeesCtaBanner from "@/components/public/fees/FeesCtaBanner";

export const metadata = {
  title: "Fee Structure & Cost Estimator — Seneca Academy Karachi",
  description:
    "Official approved 2026–2027 fee schedule for Seneca Academy Karachi. Itemized tuition breakdown, sibling discounts, merit scholarships, and payment methods.",
};

export default function FeesPage() {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
      {/* 1. Page Hero */}
      <FeesHeroSection />

      {/* 2. Interactive Fee Calculator */}
      <FeesCalculatorSection />

      {/* 3. Scholarships & Financial Aid */}
      <FeesScholarshipsSection />

      {/* 4. Payment Terms & Bank Guidelines */}
      <FeesBankingPolicySection />

      {/* 5. CTA Banner */}
      <FeesCtaBanner />
    </div>
  );
}
