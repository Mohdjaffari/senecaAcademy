import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300 w-full">
      {/* 1. Header Skeleton */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-muted/60 via-muted/40 to-muted/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg max-w-full" />
      </div>

      {/* 2. Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-md" />
          </div>
        ))}
      </div>

      {/* 3. Charts Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-3xl border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-seneca-crimson" />
              <span className="text-xs font-semibold">Loading institutional metrics...</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-3xl border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <div className="h-36 w-36 rounded-full border-4 border-muted border-t-purple-600 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
