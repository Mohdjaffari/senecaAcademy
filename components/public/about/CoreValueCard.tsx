import { Card } from "@/components/ui/card";

export interface CoreValueCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export function CoreValueCard({ icon, title, desc }: CoreValueCardProps) {
  return (
    <Card className="p-3.5 sm:p-6 bg-card/95 backdrop-blur-sm border-border/80 shadow-xs space-y-2 sm:space-y-3 hover:shadow-lg hover:border-seneca-crimson/40 dark:hover:border-seneca-amber/40 transition-all duration-300 rounded-2xl group flex flex-col justify-between h-full">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-muted/70 group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <h4 className="font-heading font-bold text-xs sm:text-base text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors leading-tight">
          {title}
        </h4>
      </div>
      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-4 sm:line-clamp-none">
        {desc}
      </p>
    </Card>
  );
}

export default CoreValueCard;
