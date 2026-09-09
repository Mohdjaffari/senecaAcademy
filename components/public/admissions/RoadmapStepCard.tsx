import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface RoadmapStepCardProps {
  num: string;
  badge: string;
  badgeVariant?: "crimson" | "amber" | "emerald" | "blue" | "neutral";
  title: string;
  desc: string;
  colorClass?: string;
  isHighlighted?: boolean;
}

const getBadgeStyles = (variant?: string, fallbackClass?: string) => {
  switch (variant) {
    case "amber":
      return "bg-amber-50 text-amber-700 border-amber-200/90 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60";
    case "emerald":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60";
    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-200/90 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/60";
    case "neutral":
      return "bg-muted/80 text-muted-foreground border-border/80";
    case "crimson":
    default:
      if (fallbackClass && fallbackClass.includes("bg-") && !variant) return fallbackClass;
      return "bg-rose-50 text-rose-700 border-rose-200/90 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60";
  }
};

export function RoadmapStepCard({
  num,
  badge,
  badgeVariant,
  title,
  desc,
  colorClass,
  isHighlighted = false,
}: RoadmapStepCardProps) {
  const badgeClasses = getBadgeStyles(badgeVariant, colorClass);

  return (
    <Card
      className={cn(
        "group relative p-6 backdrop-blur-sm transition-all duration-300 rounded-3xl flex flex-col justify-between space-y-4",
        isHighlighted
          ? "bg-card border-seneca-crimson/50 dark:border-seneca-crimson/60 shadow-lg shadow-seneca-crimson/5 ring-1 ring-seneca-crimson/30 dark:ring-seneca-crimson/40 hover:shadow-xl"
          : "bg-card/90 border-border/80 shadow-xs hover:shadow-xl hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40"
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-2xl font-black text-seneca-crimson dark:text-rose-400">
            {num}
          </span>
          {badge && (
            <span
              className={cn(
                "text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border shadow-xs transition-colors",
                badgeClasses
              )}
            >
              {badge}
            </span>
          )}
        </div>

        <h3
          className={cn(
            "text-lg font-bold font-heading transition-colors leading-snug",
            isHighlighted
              ? "text-seneca-crimson dark:text-rose-400"
              : "text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light"
          )}
        >
          {title}
        </h3>

        <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>
    </Card>
  );
}

export default RoadmapStepCard;
