import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface ScholarshipTierCardProps {
  title: string;
  discount: string;
  desc: string;
}

export function ScholarshipTierCard({
  title,
  discount,
  desc,
}: ScholarshipTierCardProps) {
  return (
    <Card className="p-3.5 sm:p-6 bg-card/95 backdrop-blur-sm border-border/80 shadow-xs space-y-2 sm:space-y-3 hover:shadow-lg hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 transition-all duration-300 rounded-2xl sm:rounded-3xl group flex flex-col justify-between h-full">
      <div className="space-y-1.5 sm:space-y-2.5">
        <Badge variant="secondary" className="text-[9.5px] sm:text-[10px] font-extrabold text-seneca-amber-dark dark:text-seneca-amber-light bg-seneca-amber/15 border border-seneca-amber/25 px-2 py-0.5">
          {discount}
        </Badge>
        <h4 className="font-heading font-bold text-xs sm:text-base text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors leading-tight">
          {title}
        </h4>
      </div>
      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
        {desc}
      </p>
    </Card>
  );
}

export default ScholarshipTierCard;
