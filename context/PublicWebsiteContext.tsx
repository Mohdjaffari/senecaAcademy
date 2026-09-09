"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface WebsiteSettingsContextType {
  settings: any;
  admissionsOpen: boolean;
  admissionsSession: string;
  admissionsNotice: string;
  admissionsClosedNotice: string;
  admissionsAnnouncement: string;
  loading: boolean;
}

const defaultContext: WebsiteSettingsContextType = {
  settings: null,
  admissionsOpen: true,
  admissionsSession: "Session 2026–2027",
  admissionsNotice: "ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)",
  admissionsClosedNotice: "Admissions for the current academic session are closed. Contact our counseling team to register for the next enrollment intake.",
  admissionsAnnouncement: "",
  loading: true,
};

const PublicWebsiteContext = createContext<WebsiteSettingsContextType>(defaultContext);

export function PublicWebsiteProvider({
  children,
  initialSettings,
}: {
  children: ReactNode;
  initialSettings?: any;
}) {
  const [settings, setSettings] = useState<any>(initialSettings || null);
  const [loading, setLoading] = useState(!initialSettings);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/website", { next: { revalidate: 120 } });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.settings && isMounted) {
            setSettings(data.data.settings);
          }
        }
      } catch (_) {
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const admissionsOpen = settings ? settings.admissionsOpen !== false : true;
  const admissionsSession = settings?.admissionsSession || "Session 2026–2027";
  const admissionsNotice =
    settings?.admissionsNotice || "ADMISSIONS OPEN FOR SESSION 2026–27 (LIMITED SEATS)";
  const admissionsClosedNotice =
    settings?.admissionsClosedNotice ||
    "Admissions for the current academic session are closed. Contact our counseling team to register for the next enrollment intake.";
  const admissionsAnnouncement = settings?.admissionsAnnouncement || "";

  return (
    <PublicWebsiteContext.Provider
      value={{
        settings,
        admissionsOpen,
        admissionsSession,
        admissionsNotice,
        admissionsClosedNotice,
        admissionsAnnouncement,
        loading,
      }}
    >
      {children}
    </PublicWebsiteContext.Provider>
  );
}

export function usePublicWebsite() {
  return useContext(PublicWebsiteContext);
}
