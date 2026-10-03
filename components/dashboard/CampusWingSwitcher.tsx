"use client";

import { useCampusPortal } from "@/lib/hooks/useCampusPortal";
import { CampusWing, CAMPUS_WINGS } from "@/lib/constants/campus-wing";
import { Sparkles, GraduationCap, Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CampusWingSwitcherProps {
  variant?: "pills" | "dropdown" | "hero";
  className?: string;
  onWingChange?: (wing: CampusWing) => void;
}

export function CampusWingSwitcher({
  variant = "pills",
  className,
  onWingChange,
}: CampusWingSwitcherProps) {
  const { activeWing, setCampusWing, wingConfig } = useCampusPortal();

  const handleSelect = (wing: CampusWing) => {
    setCampusWing(wing);
    if (onWingChange) onWingChange(wing);
  };

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs",
              activeWing === "junior"
                ? "bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25"
                : activeWing === "senior"
                ? "bg-seneca-crimson/15 border-seneca-crimson/40 text-seneca-crimson dark:text-rose-400 hover:bg-seneca-crimson/25"
                : "bg-muted/70 border-border text-foreground hover:bg-muted",
              className
            )}
            title="Switch Principal Campus Portal"
          >
            {activeWing === "junior" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
            {activeWing === "senior" && <GraduationCap className="h-3.5 w-3.5 text-seneca-crimson" />}
            {activeWing === "all" && <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
            <span>{wingConfig.shortName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border border-border/80 bg-card/98 backdrop-blur-xl">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1">
            Principal Campus Portals
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleSelect("junior")}
            className={cn(
              "rounded-xl p-2.5 cursor-pointer flex items-center justify-between",
              activeWing === "junior" ? "bg-amber-500/10 font-bold" : ""
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Junior Campus Portal</span>
                <span className="text-[10px] text-muted-foreground">Playgroup – Grade 2 (≤ Gr 2)</span>
              </div>
            </div>
            {activeWing === "junior" && <Check className="h-4 w-4 text-amber-600" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("senior")}
            className={cn(
              "rounded-xl p-2.5 cursor-pointer flex items-center justify-between",
              activeWing === "senior" ? "bg-seneca-crimson/10 font-bold" : ""
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-seneca-crimson/20 text-seneca-crimson flex items-center justify-center">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">Senior Campus Portal</span>
                <span className="text-[10px] text-muted-foreground">Grade 3 – 12 / College (&gt; Gr 2)</span>
              </div>
            </div>
            {activeWing === "senior" && <Check className="h-4 w-4 text-seneca-crimson" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("all")}
            className={cn(
              "rounded-xl p-2.5 cursor-pointer flex items-center justify-between",
              activeWing === "all" ? "bg-muted font-bold" : ""
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">All Campuses (Master)</span>
                <span className="text-[10px] text-muted-foreground">Consolidated Dual-Campus View</span>
              </div>
            </div>
            {activeWing === "all" && <Check className="h-4 w-4 text-foreground" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Pills variant (default for in-page tabs)
  return (
    <div
      className={cn(
        "inline-flex p-1 rounded-2xl bg-muted/60 border border-border/80 backdrop-blur-md shadow-xs gap-1",
        className
      )}
    >
      {/* 1. All Campuses */}
      <button
        type="button"
        onClick={() => handleSelect("all")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none",
          activeWing === "all"
            ? "bg-background text-foreground shadow-sm border border-border/60"
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        )}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span>All Campuses</span>
      </button>

      {/* 2. Junior Campus (<= Grade 2) */}
      <button
        type="button"
        onClick={() => handleSelect("junior")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none",
          activeWing === "junior"
            ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
            : "text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Junior Portal (≤ Gr 2)</span>
      </button>

      {/* 3. Senior Campus (> Grade 2) */}
      <button
        type="button"
        onClick={() => handleSelect("senior")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all select-none",
          activeWing === "senior"
            ? "bg-seneca-crimson text-white shadow-md shadow-seneca-crimson/20"
            : "text-muted-foreground hover:text-seneca-crimson hover:bg-seneca-crimson/10"
        )}
      >
        <GraduationCap className="h-3.5 w-3.5" />
        <span>Senior Portal (&gt; Gr 2)</span>
      </button>
    </div>
  );
}

export default CampusWingSwitcher;
