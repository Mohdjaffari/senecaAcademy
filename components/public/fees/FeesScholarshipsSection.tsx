"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import ScholarshipTierCard from "./ScholarshipTierCard";

export function FeesScholarshipsSection() {
  const scholarships = [
    {
      title: "Board Merit Scholarship",
      discount: "100% Tuition Waiver",
      desc: "Awarded to students scoring in the top 10 positions across the Karachi Board matriculation examinations.",
    },
    {
      title: "Sibling Concession",
      discount: "15% Monthly Discount",
      desc: "Applied automatically to the monthly tuition of the second and every subsequent sibling enrolled simultaneously.",
    },
    {
      title: "Hafiz-e-Quran Concession",
      discount: "20% Tuition Waiver",
      desc: "Special academic scholarship granted to certified Huffaz upon successful verification.",
    },
    {
      title: "Need-Based Financial Assistance",
      discount: "Up to 50% Concession",
      desc: "Evaluated by the Seneca Academy Welfare Committee for deserving students facing financial hardships.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background border-t border-border overflow-hidden">
      <div className="container space-y-10 sm:space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <Badge variant="crimson">Merit &amp; Aid</Badge>
          <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">
            Scholarships &amp; Fee Concessions
          </h2>
          <p className="text-xs sm:text-sm sm:text-base text-muted-foreground leading-relaxed">
            Seneca Academy is committed to rewarding exceptional academic talent and supporting deserving families.
          </p>
        </motion.div>

        {/* 2 Cards in One Row on Mobile, 4 on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {scholarships.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.08 }}
            >
              <ScholarshipTierCard {...s} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeesScholarshipsSection;
