import { CheckCircle2 } from "lucide-react";

export interface DocumentCheckItemProps {
  documentName: string;
}

export function DocumentCheckItem({ documentName }: DocumentCheckItemProps) {
  return (
    <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-card/90 border border-border/80 shadow-xs hover:border-seneca-crimson/30 dark:hover:border-seneca-amber/30 transition-all">
      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
      <span className="text-xs sm:text-sm font-semibold text-foreground leading-relaxed">
        {documentName}
      </span>
    </div>
  );
}

export default DocumentCheckItem;
