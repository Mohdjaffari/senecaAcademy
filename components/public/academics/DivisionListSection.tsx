import { IAcademicDivisionsData, DEFAULT_ACADEMICS_PAGE_DATA } from "@/lib/db/academics-page-defaults";
import DivisionCard from "./DivisionCard";

interface DivisionListSectionProps {
  data?: IAcademicDivisionsData;
}

export function DivisionListSection({ data }: DivisionListSectionProps) {
  const sectionData = data || DEFAULT_ACADEMICS_PAGE_DATA.academicDivisions;

  if (sectionData.isVisible === false) {
    return null;
  }

  const sortedItems = [...(sectionData.items || [])]
    .filter((item) => item.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="container space-y-20">
        {sortedItems.map((div, idx) => (
          <DivisionCard
            key={div.id || idx}
            id={div.id || `stage-${idx}`}
            badge={div.badge || "Academic Wing"}
            name={div.name}
            grades={div.gradeRange || div.name}
            description={div.description}
            image={
              div.image ||
              "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
            }
            imageAlt={div.imageAlt || div.name}
            subjects={
              div.subjects && div.subjects.length > 0
                ? div.subjects
                : ["Comprehensive Curriculum", "Interactive Pedagogy", "Practical Assessments"]
            }
            highlights={
              div.highlightStatement ||
              (div.badge ? `${div.badge} Educational Standard` : "Seneca Academic Standard")
            }
            isReversed={idx % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}

export default DivisionListSection;
