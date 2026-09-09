import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";

export default function TeacherLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200 w-full overflow-x-hidden">
      {/* 1. Hero Header Skeleton */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-r from-muted/60 via-muted/40 to-muted/20 p-5 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <Skeleton className="h-9 w-64 sm:w-80 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg max-w-full" />
      </div>

      {/* 2. Key Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* 3. Schedule & Review Queue Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="p-3.5 rounded-2xl bg-muted/40 flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((k) => (
              <div key={k} className="p-3.5 rounded-2xl bg-muted/40 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
