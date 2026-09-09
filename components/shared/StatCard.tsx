import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "crimson" | "amber" | "emerald";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const iconVariants = {
    default: "bg-primary/10 text-primary dark:bg-primary/20",
    crimson: "bg-seneca-crimson/10 text-seneca-crimson dark:bg-seneca-crimson/20 dark:text-seneca-amber-light",
    amber: "bg-seneca-amber/10 text-seneca-amber dark:bg-seneca-amber/20 dark:text-seneca-amber-light",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  };

  return (
    <Card className={cn("overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-all", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconVariants[variant])}>
            {icon}
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div className="text-3xl font-extrabold font-heading tracking-tight text-foreground">
            {value}
          </div>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.isPositive ? "↑ " : "↓ "}
              {trend.value}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
