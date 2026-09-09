import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface ScholarshipCardProps {
  title: string;
  discount: string;
  desc: string;
}

export function ScholarshipCard({
  title,
  discount,
  desc,
}: ScholarshipCardProps) {
  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-3 hover:shadow-lg hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all duration-300 rounded-3xl group">
      <Badge variant="secondary" className="text-[10px] font-bold text-seneca-amber dark:text-seneca-amber-light">
        {discount}
      </Badge>
      <h4 className="font-heading font-bold text-base text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </Card>
  );
}

export default ScholarshipCard;
