import RoadmapStepCard from "./RoadmapStepCard";
import { DEFAULT_ADMISSIONS_PAGE_DATA, IAdmissionRoadmapData } from "@/lib/db/admissions-page-defaults";

interface AdmissionRoadmapSectionProps {
  roadmap?: IAdmissionRoadmapData;
}

export function AdmissionRoadmapSection({ roadmap }: AdmissionRoadmapSectionProps) {
  if (roadmap && roadmap.isVisible === false) {
    return null;
  }

  const fallback = DEFAULT_ADMISSIONS_PAGE_DATA.roadmap;
  const badgeText = roadmap?.badge ?? fallback.badge;
  const headingText = roadmap?.heading ?? fallback.heading;
  const descriptionText = roadmap?.description ?? fallback.description;

  const rawSteps = roadmap?.steps && roadmap.steps.length > 0
    ? roadmap.steps
    : fallback.steps;

  const activeSteps = rawSteps.filter((s) => s.isActive !== false);

  const steps = activeSteps.map((s, idx) => ({
    num: s.stepNumber || `0${idx + 1}`,
    title: s.title,
    desc: s.description,
    badge: s.badge || "",
    badgeVariant: s.badgeVariant || (s.badge?.toUpperCase().includes("SATURDAY") ? "amber" : s.badge?.toUpperCase().includes("SEAT") || s.badge?.toUpperCase().includes("OFFER") ? "emerald" : "crimson"),
    isHighlighted: s.isHighlighted ?? (s.stepNumber === "03" || s.order === 3),
    colorClass: s.colorClass,
  }));

  return (
    <section id="admission-process" className="py-20 bg-background scroll-mt-24">
      <div className="container space-y-12 sm:space-y-14">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          {badgeText && (
            <div className="flex justify-center">
              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50 shadow-xs">
                {badgeText}
              </span>
            </div>
          )}
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {headingText}
          </h2>
          {descriptionText && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {descriptionText}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <RoadmapStepCard key={idx} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdmissionRoadmapSection;
