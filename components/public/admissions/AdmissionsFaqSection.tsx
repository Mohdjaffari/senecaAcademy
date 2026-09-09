import { Badge } from "@/components/ui/badge";
import FaqAccordionCard from "./FaqAccordionCard";
import { DEFAULT_ADMISSIONS_PAGE_DATA, IAdmissionsFaqData } from "@/lib/db/admissions-page-defaults";

interface AdmissionsFaqSectionProps {
  faqs?: IAdmissionsFaqData;
}

export function AdmissionsFaqSection({ faqs }: AdmissionsFaqSectionProps) {
  if (faqs && faqs.isVisible === false) {
    return null;
  }

  const fallback = DEFAULT_ADMISSIONS_PAGE_DATA.faqs;
  const badgeText = faqs?.badge || fallback.badge;
  const headingText = faqs?.heading || fallback.heading;

  const rawItems = faqs?.items && faqs.items.length > 0
    ? faqs.items
    : fallback.items;

  const displayList = rawItems.filter((item) => item.isActive !== false);

  return (
    <section id="faq" className="py-20 bg-muted/30 border-t border-border scroll-mt-24">
      <div className="container max-w-4xl space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="outline">{badgeText}</Badge>
          <h3 className="text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {headingText}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayList.map((f, idx) => (
            <FaqAccordionCard key={idx} question={f.question} answer={f.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdmissionsFaqSection;
