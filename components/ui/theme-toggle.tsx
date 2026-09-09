"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function ThemeToggle({
  className,
}: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-full border border-border/80 bg-muted/60 dark:bg-card/80 flex items-center justify-center shrink-0",
          className
        )}
      >
        <span className="h-4 w-4 rounded-full bg-muted-foreground/20 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "relative h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
        // Solid integrated navbar-matched background & border
        "bg-muted/80 hover:bg-seneca-crimson/10 border border-border/80 hover:border-seneca-crimson/40 text-foreground",
        "dark:bg-card/90 dark:hover:bg-seneca-amber/15 dark:border-white/10 dark:hover:border-seneca-amber/40",
        // Shadow & micro-interactions
        "shadow-sm hover:shadow-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-seneca-crimson/20 dark:focus:ring-seneca-amber/30",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun Icon (for Light Mode) */}
      <Sun
        className={cn(
          "h-4 w-4 text-seneca-amber dark:text-amber-400 transition-all duration-500 transform",
          isDark
            ? "rotate-90 scale-0 opacity-0 absolute"
            : "rotate-0 scale-100 opacity-100"
        )}
      />

      {/* Moon Icon (for Dark Mode) */}
      <Moon
        className={cn(
          "h-4 w-4 text-seneca-amber-light dark:text-amber-300 transition-all duration-500 transform",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-0 opacity-0 absolute"
        )}
      />
    </button>
  );
}

export default ThemeToggle;
