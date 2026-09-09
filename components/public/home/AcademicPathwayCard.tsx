import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AcademicPathwayCardProps {
  ageRange: string;
  badgeColorClass?: string;
  title: string;
  description: string;
}

export function AcademicPathwayCard({
  ageRange,
  badgeColorClass = "text-seneca-crimson dark:text-seneca-amber-light",
  title,
  description,
}: AcademicPathwayCardProps) {
  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 hover:shadow-lg transition-all duration-300 space-y-3 rounded-2xl group">
      <span
        className={cn(
          "text-[10px] font-extrabold uppercase tracking-widest block",
          badgeColorClass
        )}
      >
        {ageRange}
      </span>
      <h4 className="text-lg font-bold font-heading text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
        {title}
      </h4>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

export default AcademicPathwayCard;
