"use client";

import { useState } from "react";
import { ICON_REGISTRY, POPULAR_ICONS, getDynamicIcon } from "@/lib/utils/icon-registry";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
  className?: string;
}

export function IconPicker({ value, onChange, label = "Select Icon", className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = POPULAR_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && <label className="text-xs font-bold text-foreground block">{label}</label>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-input bg-background hover:bg-muted/50 transition-colors w-full text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber flex items-center justify-center shrink-0 border border-seneca-crimson/20 group-hover:scale-110 transition-transform">
              {getDynamicIcon(value, "h-4 w-4")}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-foreground block truncate">
                {value || "Sparkles"}
              </span>
              <span className="text-[10px] text-muted-foreground block">Click to change icon</span>
            </div>
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-md rounded-2xl p-5 border border-border/80 bg-card/98 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading">Choose an Icon</DialogTitle>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons (e.g., Compass, Target, Award, Trophy)..."
              className="pl-9 text-xs rounded-xl"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1 no-scrollbar">
            {filteredIcons.map((iconName) => {
              const isSelected = value === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center gap-1 group",
                    isSelected
                      ? "border-seneca-crimson bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber font-bold shadow-xs scale-105"
                      : "border-border/60 bg-muted/20 hover:bg-muted/60 hover:border-border text-muted-foreground hover:text-foreground"
                  )}
                  title={iconName}
                >
                  <div className="h-6 w-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getDynamicIcon(iconName, "h-4 w-4")}
                  </div>
                  <span className="text-[9px] truncate w-full block">{iconName}</span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching icons found. Try another search term.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default IconPicker;
