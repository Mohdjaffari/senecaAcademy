"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Check, Sparkles, Shield, ArrowRight, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePublicWebsite } from "@/context/PublicWebsiteContext";
import { IFeeStructureData, IFeeCalculatorTier, DEFAULT_ADMISSIONS_PAGE_DATA } from "@/lib/db/admissions-page-defaults";

export interface CalculatorTier {
  id?: string;
  name: string;
  badge: string;
  badgeColor?: string;
  gradeRange: string;
  admissionFee: number;
  securityDeposit: number;
  monthlyTuition: number;
  annualCharges: number;
  labFund?: number;
  features: string[];
}

function parseFee(val: any, fallback = 0): number {
  if (typeof val === "number") return val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? fallback : num;
}

export function FeeCalculator({
  feeStructure,
  initialTiers,
}: {
  feeStructure?: IFeeStructureData;
  initialTiers?: any[];
}) {
  const { admissionsOpen } = usePublicWebsite();
  const fallbackFee = DEFAULT_ADMISSIONS_PAGE_DATA.feeStructure;

  const badgeText = feeStructure?.badge ?? fallbackFee.badge;
  const headingText = feeStructure?.heading ?? fallbackFee.heading;
  const descriptionText = feeStructure?.description ?? fallbackFee.description;
  const siblingPercent = feeStructure?.siblingDiscountPercent ?? fallbackFee.siblingDiscountPercent ?? 15;
  const annualDiscountPercent = feeStructure?.annualAdvanceDiscountPercent ?? fallbackFee.annualAdvanceDiscountPercent ?? 5;
  const siblingLabel = feeStructure?.siblingDiscountLabel || `Apply Sibling Concession (${siblingPercent}% off monthly tuition)`;
  const annualLabel = feeStructure?.annualDiscountLabel || `Annual Advance (${annualDiscountPercent}% Extra Off)`;
  const disclaimerText = feeStructure?.disclaimerText || fallbackFee.disclaimerText;
  const applyButtonText = feeStructure?.applyButtonText || "Apply for this Grade";
  const applyButtonHref = feeStructure?.applyButtonHref || "#admissions";

  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [hasSibling, setHasSibling] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<"monthly" | "annual">("monthly");

  // Determine active list of tiers
  const rawTiers: (IFeeCalculatorTier | CalculatorTier)[] =
    feeStructure?.tiers && feeStructure.tiers.length > 0
      ? feeStructure.tiers.filter((t) => t.isActive !== false)
      : initialTiers && initialTiers.length > 0
      ? initialTiers
      : fallbackFee.tiers;

  const tiers: CalculatorTier[] = rawTiers.map((t) => ({
    id: t.id,
    name: t.name,
    badge: t.badge || "Standard",
    badgeColor: t.badgeColor || "emerald",
    gradeRange: t.gradeRange || "",
    admissionFee: parseFee(t.admissionFee, 15000),
    securityDeposit: parseFee(t.securityDeposit, 5000),
    monthlyTuition: parseFee(t.monthlyTuition, 6500),
    annualCharges: parseFee(t.annualCharges || (t as any).labFund, 4000),
    labFund: parseFee((t as any).labFund, 0),
    features: Array.isArray(t.features) && t.features.length > 0 ? t.features : ["Standard Curriculum Inclusions"],
  }));

  const activeIndex = Math.min(selectedTierIndex, Math.max(0, tiers.length - 1));
  const tier = tiers[activeIndex] || tiers[0] || fallbackFee.tiers[0];
  const siblingDiscount = hasSibling ? siblingPercent / 100 : 0;
  const effectiveMonthlyTuition = tier.monthlyTuition * (1 - siblingDiscount);
  const annualDiscountFactor = paymentPlan === "annual" ? 1 - annualDiscountPercent / 100 : 1;
  const annualTuitionWithDiscount = effectiveMonthlyTuition * 12 * annualDiscountFactor;

  const getBadgeColorClass = (color?: string) => {
    switch (color) {
      case "amber":
        return "text-amber-700 bg-amber-50 border-amber-200/90 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-900/60";
      case "sky":
      case "blue":
        return "text-sky-700 bg-sky-50 border-sky-200/90 dark:text-sky-300 dark:bg-sky-950/50 dark:border-sky-900/60";
      case "indigo":
      case "purple":
        return "text-indigo-700 bg-indigo-50 border-indigo-200/90 dark:text-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-900/60";
      case "crimson":
      case "rose":
        return "text-rose-700 bg-rose-50 border-rose-200/90 dark:text-rose-300 dark:bg-rose-950/50 dark:border-rose-900/60";
      case "emerald":
      case "green":
      default:
        return "text-emerald-700 bg-emerald-50 border-emerald-200/90 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-900/60";
    }
  };

  return (
    <section id="fees" className="py-10 sm:py-16 lg:py-24 bg-card/60 border-t border-border overflow-hidden">
      <div className="container space-y-8 sm:space-y-12 px-3 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3 px-2 sm:px-4">
          {badgeText && (
            <div className="flex justify-center">
              <Badge variant="crimson" className="rounded-full px-3.5 py-1 text-xs font-semibold shadow-xs">
                {badgeText}
              </Badge>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {headingText}
          </h2>
          {descriptionText && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {descriptionText}
            </p>
          )}
        </div>

        {/* Tier Selector Buttons (Adaptive 2-col on Mobile, Flex Wrap on Tablet/Desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch justify-center gap-2 sm:gap-3 max-w-5xl mx-auto px-1 sm:px-2">
          {tiers.map((t, idx) => (
            <button
              key={t.id || idx}
              type="button"
              onClick={() => setSelectedTierIndex(idx)}
              className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex-1 min-w-0 sm:min-w-[170px] max-w-full sm:max-w-[260px] cursor-pointer select-none ${
                activeIndex === idx
                  ? "border-seneca-crimson bg-seneca-crimson/10 shadow-md ring-2 ring-seneca-crimson/20"
                  : "border-border/80 bg-background hover:bg-muted/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1 gap-1">
                <span
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border truncate ${getBadgeColorClass(
                    t.badgeColor
                  )}`}
                >
                  {t.badge}
                </span>
                {activeIndex === idx && (
                  <span className="h-2 w-2 rounded-full bg-seneca-crimson shrink-0" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-bold text-foreground block truncate">
                {t.name}
              </span>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground block mt-0.5 truncate">
                {t.gradeRange}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive Fee Breakdown Card */}
        <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-8 lg:p-10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Breakdown Details Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div>
                <span className="text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                  Tuition Breakdown • {tier.gradeRange}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground mt-1">
                  {tier.name}
                </h3>
              </div>

              <div className="space-y-2.5 sm:space-y-3 divide-y divide-border/60 text-xs sm:text-sm">
                <div className="flex items-center justify-between pt-2 gap-2">
                  <span className="text-muted-foreground font-medium">Monthly Tuition Fee</span>
                  <span className="font-bold text-foreground text-right shrink-0">{formatCurrency(tier.monthlyTuition)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 gap-2">
                  <span className="text-muted-foreground font-medium">One-Time Admission Fee</span>
                  <span className="font-bold text-foreground text-right shrink-0">{formatCurrency(tier.admissionFee)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 gap-2">
                  <span className="text-muted-foreground font-medium">Refundable Security Deposit</span>
                  <span className="font-bold text-foreground text-right shrink-0">{formatCurrency(tier.securityDeposit)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 gap-2">
                  <span className="text-muted-foreground font-medium">Annual Resource & Lab Fund</span>
                  <span className="font-bold text-foreground text-right shrink-0">{formatCurrency(tier.annualCharges)}</span>
                </div>
              </div>

              {/* Concession & Payment Plan Options */}
              <div className="pt-3 space-y-3 border-t border-border/60">
                <label className="flex items-start sm:items-center gap-2.5 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasSibling}
                    onChange={(e) => setHasSibling(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-seneca-crimson focus:ring-seneca-crimson mt-0.5 sm:mt-0 shrink-0"
                  />
                  <span className="text-foreground leading-snug">{siblingLabel}</span>
                </label>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold pt-1">
                  <span className="text-muted-foreground text-[11px] sm:text-xs mr-1 w-full xs:w-auto">Billing Frequency:</span>
                  <button
                    type="button"
                    onClick={() => setPaymentPlan("monthly")}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                      paymentPlan === "monthly"
                        ? "bg-seneca-crimson text-white shadow-xs"
                        : "bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly Voucher
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentPlan("annual")}
                    className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                      paymentPlan === "annual"
                        ? "bg-seneca-crimson text-white shadow-xs"
                        : "bg-muted/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {annualLabel}
                  </button>
                </div>

                {disclaimerText && (
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-1">
                    * {disclaimerText}
                  </p>
                )}
              </div>
            </div>

            {/* Estimated Total Calculation Summary Card */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-seneca-crimson/10 via-seneca-amber/5 to-muted/40 p-4 sm:p-6 border border-seneca-crimson/20 text-center space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                <Calculator className="h-4 w-4" />
                <span>Calculated Tuition</span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-foreground break-words">
                  {paymentPlan === "monthly"
                    ? formatCurrency(effectiveMonthlyTuition)
                    : formatCurrency(annualTuitionWithDiscount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {paymentPlan === "monthly" ? "per calendar month" : "total annual payment"}
                </div>
              </div>

              <div className="pt-2 border-t border-seneca-crimson/10">
                <div className="text-[11px] font-bold text-foreground mb-2 text-left">
                  Included Academic Benefits:
                </div>
                <ul className="text-left space-y-1.5 text-xs text-muted-foreground">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild size="sm" className="w-full rounded-xl gap-1.5 mt-2 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-md font-bold">
                {admissionsOpen ? (
                  <a href={applyButtonHref}>
                    <span>{applyButtonText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <a href="/contact">
                    <span>Inquire for Upcoming Session</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeeCalculator;
