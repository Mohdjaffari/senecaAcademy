"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WifiOff, Wifi, AlertTriangle } from "lucide-react";

export function NetworkStatusListener() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("Connection Restored", {
        description: "Back online. Reconnected to Seneca LMS network.",
        icon: <Wifi className="h-4 w-4 text-emerald-500" />,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error("Network Offline", {
        description: "Internet connection lost. Please check your network.",
        duration: 8000,
        icon: <WifiOff className="h-4 w-4 text-rose-500" />,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] p-3.5 rounded-2xl bg-rose-600 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
      <WifiOff className="h-5 w-5 shrink-0 animate-pulse" />
      <div className="text-xs">
        <div className="font-bold">No Internet Connection</div>
        <div className="text-[11px] text-white/90">Pages may take longer to load or fail to sync.</div>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="ml-auto px-2.5 py-1 rounded-lg bg-white text-rose-700 font-bold text-[11px] shrink-0 hover:bg-white/90"
      >
        Retry
      </button>
    </div>
  );
}

export default NetworkStatusListener;
