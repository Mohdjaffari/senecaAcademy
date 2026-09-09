import Image from "next/image";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface TestimonialCardProps {
  name: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  quote,
  avatar,
  rating,
}: TestimonialCardProps) {
  return (
    <Card className="p-8 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6 rounded-3xl">
      <div className="space-y-4">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(rating)].map((_, rIdx) => (
            <Star key={rIdx} className="h-4 w-4 fill-amber-500 text-amber-500" />
          ))}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3.5 pt-4 border-t border-border/60">
        <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border/80 bg-muted shrink-0 shadow-xs">
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div>
          <h5 className="font-heading font-bold text-xs sm:text-sm text-foreground">
            {name}
          </h5>
          <p className="text-[11px] text-muted-foreground">{role}</p>
        </div>
      </div>
    </Card>
  );
}

export default TestimonialCard;
