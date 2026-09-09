"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NetworkProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const startProgress = () => {
    clearTimers();
    setActive(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(70), 80);
    const t2 = setTimeout(() => setProgress(90), 200);

    timersRef.current.push(t1, t2);
  };

  const completeProgress = () => {
    clearTimers();
    setProgress(100);

    const tEnd = setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 150);

    timersRef.current.push(tEnd);
  };

  // Complete loading whenever pathname or search params update
  useEffect(() => {
    if (active) {
      completeProgress();
    }
  }, [pathname, searchParams]);

  // Intercept internal navigation link clicks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      const download = anchor.getAttribute("download");

      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("/#") &&
        !href.startsWith("mailto:") &&
        !href.startsWith("tel:") &&
        target !== "_blank" &&
        download === null &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey &&
        e.button === 0
      ) {
        const currentUrl = window.location.pathname + window.location.search;
        const targetUrl = href.split("#")[0];

        if (targetUrl !== currentUrl && targetUrl !== "") {
          startProgress();
        }
      }
    };

    const handlePopState = () => {
      startProgress();
    };

    document.addEventListener("click", handleDocumentClick, { capture: true, passive: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTimers();
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  if (!active && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] h-[2.5px] pointer-events-none overflow-hidden bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-seneca-crimson via-seneca-amber to-seneca-crimson-light transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          boxShadow: "0 0 10px rgba(225, 29, 72, 0.7), 0 0 5px rgba(245, 158, 11, 0.5)",
        }}
      />
    </div>
  );
}

export default NetworkProgressBar;
