import { Card } from "@/components/ui/card";

export interface BankDetailCardProps {
  title: string;
  items: string[];
}

export function BankDetailCard({ title, items }: BankDetailCardProps) {
  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-3 rounded-2xl">
      <h5 className="font-bold text-sm sm:text-base text-foreground font-heading">{title}</h5>
      <ul className="space-y-2 leading-relaxed text-xs sm:text-sm text-muted-foreground">
        {items.map((item, idx) => (
          <li key={idx}>• {item}</li>
        ))}
      </ul>
    </Card>
  );
}

export default BankDetailCard;
