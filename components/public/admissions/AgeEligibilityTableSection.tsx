import { Badge } from "@/components/ui/badge";
import EligibilityRow from "./EligibilityRow";
import { DEFAULT_ADMISSIONS_PAGE_DATA, IAgeEligibilityData } from "@/lib/db/admissions-page-defaults";

interface AgeEligibilityTableSectionProps {
  eligibility?: IAgeEligibilityData;
}

export function AgeEligibilityTableSection({ eligibility }: AgeEligibilityTableSectionProps) {
  if (eligibility && eligibility.isVisible === false) {
    return null;
  }

  const fallback = DEFAULT_ADMISSIONS_PAGE_DATA.eligibility;
  const badgeText = eligibility?.badge || fallback.badge;
  const headingText = eligibility?.heading || fallback.heading;
  const descriptionText = eligibility?.description || fallback.description;

  const rawItems = eligibility?.items && eligibility.items.length > 0
    ? eligibility.items
    : fallback.items;

  const displayList = rawItems.filter((item) => item.isActive !== false);

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="outline">{badgeText}</Badge>
          <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {headingText}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {descriptionText}
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card/90 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/80 text-foreground uppercase text-[11px] font-extrabold tracking-wider border-b border-border">
              <tr>
                <th className="p-4 sm:px-6">Academic Division</th>
                <th className="p-4 sm:px-6">Age Bracket (as of Session)</th>
                <th className="p-4 sm:px-6">Classroom Cap</th>
                <th className="p-4 sm:px-6">Curriculum Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
              {displayList.map((row, idx) => (
                <EligibilityRow key={idx} {...row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AgeEligibilityTableSection;
