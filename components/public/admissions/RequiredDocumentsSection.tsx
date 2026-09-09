import { Badge } from "@/components/ui/badge";
import DocumentCheckItem from "./DocumentCheckItem";
import { DEFAULT_ADMISSIONS_PAGE_DATA, IRequiredDocumentsData } from "@/lib/db/admissions-page-defaults";

interface RequiredDocumentsSectionProps {
  documents?: IRequiredDocumentsData;
}

export function RequiredDocumentsSection({ documents }: RequiredDocumentsSectionProps) {
  if (documents && documents.isVisible === false) {
    return null;
  }

  const fallback = DEFAULT_ADMISSIONS_PAGE_DATA.documents;
  const badgeText = documents?.badge || fallback.badge;
  const headingText = documents?.heading || fallback.heading;
  const descriptionText = documents?.description || fallback.description;

  const rawDocs = documents?.documents && documents.documents.length > 0
    ? documents.documents
    : fallback.documents;

  const docList = rawDocs.map((d) => d.documentName);

  return (
    <section className="py-16 sm:py-20 bg-muted/30 border-t border-border">
      <div className="container max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="crimson">{badgeText}</Badge>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
            {headingText}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {descriptionText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docList.map((doc, idx) => (
            <DocumentCheckItem key={idx} documentName={doc} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default RequiredDocumentsSection;
