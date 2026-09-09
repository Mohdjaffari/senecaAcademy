import { Card } from "@/components/ui/card";

export interface TeachingStandardCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function TeachingStandardCard({
  icon,
  title,
  desc,
}: TeachingStandardCardProps) {
  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-3 hover:shadow-lg hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all duration-300 rounded-3xl group">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h4 className="font-heading font-bold text-base text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </Card>
  );
}

export default TeachingStandardCard;
