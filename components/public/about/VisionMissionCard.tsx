import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface VisionMissionCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
}

export function VisionMissionCard({
  icon,
  iconBgClass,
  title,
  description,
}: VisionMissionCardProps) {
  return (
    <Card className="border-border/80 bg-card/90 backdrop-blur-sm p-8 shadow-sm space-y-4 hover:shadow-xl hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all duration-300 rounded-3xl group">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105",
          iconBgClass
        )}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-bold font-heading text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

export default VisionMissionCard;
