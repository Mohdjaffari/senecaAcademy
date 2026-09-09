import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="flex flex-col space-y-12 animate-in fade-in-50 duration-200 w-full">
      {/* 1. Page Hero Skeleton */}
      <div className="py-16 sm:py-24 bg-gradient-to-b from-muted/50 via-background to-background border-b border-border">
        <div className="container max-w-4xl mx-auto text-center space-y-4 px-4">
          <Skeleton className="h-6 w-36 mx-auto rounded-full" />
          <Skeleton className="h-10 sm:h-12 w-3/4 mx-auto rounded-2xl" />
          <Skeleton className="h-4 w-full sm:w-2/3 mx-auto rounded-lg" />
          <div className="flex justify-center gap-3 pt-2">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* 2. Content Cards Skeleton Grid */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md space-y-4"
            >
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-5/6 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
