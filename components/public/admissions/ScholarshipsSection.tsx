import { Badge } from "@/components/ui/badge";
import ScholarshipCard from "./ScholarshipCard";
import { DEFAULT_ADMISSIONS_PAGE_DATA, IScholarshipsData } from "@/lib/db/admissions-page-defaults";

interface ScholarshipsSectionProps {
  scholarships?: IScholarshipsData;
}

export function ScholarshipsSection({ scholarships }: ScholarshipsSectionProps) {
  if (scholarships && scholarships.isVisible === false) {
    return null;
  }

  const fallback = DEFAULT_ADMISSIONS_PAGE_DATA.scholarships;
  const badgeText = scholarships?.badge || fallback.badge;
  const headingText = scholarships?.heading || fallback.heading;
  const descriptionText = scholarships?.description || fallback.description;

  const rawItems = scholarships?.scholarships && scholarships.scholarships.length > 0
    ? scholarships.scholarships
    : fallback.scholarships;

  const displayList = rawItems.filter((s) => s.isActive !== false);

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="crimson">{badgeText}</Badge>
          <h2 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {headingText}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {descriptionText}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayList.map((s, idx) => (
            <ScholarshipCard key={idx} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScholarshipsSection;
