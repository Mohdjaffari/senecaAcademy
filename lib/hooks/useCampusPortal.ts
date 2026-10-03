"use client";

import { useState, useEffect, useCallback } from "react";
import { CampusWing, CAMPUS_WINGS } from "@/lib/constants/campus-wing";

const STORAGE_KEY = "seneca_principal_campus_wing";
const EVENT_NAME = "seneca_campus_mode_changed";

export function useCampusPortal(initialWing?: CampusWing) {
  const [activeWing, setActiveWingState] = useState<CampusWing>(() => {
    if (initialWing) return initialWing;
    return "all";
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 0. Explicit prop has top priority
    if (initialWing && (initialWing === "junior" || initialWing === "senior" || initialWing === "all")) {
      setActiveWingState(initialWing);
      setIsLoaded(true);
      return;
    }

    // 1. Check dedicated path
    if (window.location.pathname.startsWith("/junior-portal")) {
      setActiveWingState("junior");
      localStorage.setItem(STORAGE_KEY, "junior");
      setIsLoaded(true);
      return;
    }
    if (window.location.pathname.startsWith("/senior-portal")) {
      setActiveWingState("senior");
      localStorage.setItem(STORAGE_KEY, "senior");
      setIsLoaded(true);
      return;
    }

    // 2. Check URL query params
    const params = new URLSearchParams(window.location.search);
    const wingParam = params.get("wing") as CampusWing;
    if (wingParam && (wingParam === "all" || wingParam === "junior" || wingParam === "senior")) {
      setActiveWingState(wingParam);
      localStorage.setItem(STORAGE_KEY, wingParam);
      setIsLoaded(true);
      return;
    }

    // 3. Check cookie set on login
    const cookieMatch = document.cookie.match(/(?:^|;\s*)seneca_campus_wing=([^;]+)/);
    const cookieWing = cookieMatch ? (decodeURIComponent(cookieMatch[1]) as CampusWing) : null;
    if (cookieWing && (cookieWing === "junior" || cookieWing === "senior" || cookieWing === "all")) {
      setActiveWingState(cookieWing);
      localStorage.setItem(STORAGE_KEY, cookieWing);
      setIsLoaded(true);
      return;
    }

    // 4. Check localStorage fallback
    const stored = localStorage.getItem(STORAGE_KEY) as CampusWing;
    if (stored && (stored === "all" || stored === "junior" || stored === "senior")) {
      setActiveWingState(stored);
    }

    setIsLoaded(true);
  }, [initialWing]);

  // Sync across tabs & components
  useEffect(() => {
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ wing: CampusWing }>;
      if (customEvent.detail && customEvent.detail.wing) {
        setActiveWingState(customEvent.detail.wing);
      }
    };

    window.addEventListener(EVENT_NAME, handleModeChange);
    return () => {
      window.removeEventListener(EVENT_NAME, handleModeChange);
    };
  }, []);

  const setCampusWing = useCallback((wing: CampusWing) => {
    setActiveWingState(wing);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, wing);
      document.cookie = `seneca_campus_wing=${wing}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { wing },
        })
      );
    }
  }, []);

  return {
    activeWing,
    setCampusWing,
    isLoaded,
    wingConfig: CAMPUS_WINGS[activeWing],
  };
}
