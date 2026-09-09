import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AssessmentTierCardProps {
  badgeColorClass: string;
  tag: string;
  title: string;
  description: string;
}

export function AssessmentTierCard({
  badgeColorClass,
  tag,
  title,
  description,
}: AssessmentTierCardProps) {
  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-2.5 rounded-2xl group hover:shadow-md transition-all">
      <span
        className={cn(
          "text-xs font-bold font-mono block",
          badgeColorClass
        )}
      >
        {tag}
      </span>
      <h4 className="font-bold text-base text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

export default AssessmentTierCard;
