import { Card } from "@/components/ui/card";

export interface StemFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function StemFeatureCard({ icon, title, desc }: StemFeatureCardProps) {
  return (
    <Card className="p-8 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-4 hover:shadow-lg hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all duration-300 rounded-3xl group">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h4 className="font-heading font-bold text-lg text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </Card>
  );
}

export default StemFeatureCard;
