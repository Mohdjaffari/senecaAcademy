import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SenecaDifferenceCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}

export function SenecaDifferenceCard({
  icon,
  iconBgClass,
  title,
  description,
  linkText,
  linkHref,
}: SenecaDifferenceCardProps) {
  return (
    <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-xs hover:shadow-xl hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all duration-300 p-8 space-y-4 group rounded-3xl flex flex-col justify-between">
      <div className="space-y-4">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105 shadow-xs",
            iconBgClass
          )}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold font-heading text-foreground group-hover:text-seneca-crimson dark:group-hover:text-seneca-amber-light transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-2">
        <Link
          href={linkHref}
          className="text-xs font-bold text-seneca-crimson dark:text-seneca-amber-light inline-flex items-center gap-1.5 group-hover:gap-2 transition-all"
        >
          <span>{linkText}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}

export default SenecaDifferenceCard;
