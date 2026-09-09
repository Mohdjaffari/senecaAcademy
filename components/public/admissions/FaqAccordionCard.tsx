import { HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface FaqAccordionCardProps {
  question: string;
  answer: string;
}

export function FaqAccordionCard({ question, answer }: FaqAccordionCardProps) {
  return (
    <Card className="p-6 bg-card/90 backdrop-blur-sm border-border/80 shadow-xs space-y-2.5 rounded-2xl hover:shadow-md transition-all">
      <h4 className="font-heading font-bold text-sm sm:text-base text-foreground flex items-start gap-2.5 leading-snug">
        <HelpCircle className="h-4 w-4 text-seneca-crimson dark:text-seneca-amber shrink-0 mt-0.5" />
        <span>{question}</span>
      </h4>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6.5">
        {answer}
      </p>
    </Card>
  );
}

export default FaqAccordionCard;
