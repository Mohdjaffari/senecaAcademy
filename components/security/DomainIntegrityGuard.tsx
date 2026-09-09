"use client";

import { useEffect } from "react";

// Check if the current hostname is a local loopback, dev network, or private Wi-Fi/LAN IP
const isLocalOrPrivateNetwork = (hostname: string): boolean => {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".lan") ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
};

// Official production domains authorized to host Seneca Academy LMS
const DEFAULT_ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "::1",
  "seneca.edu.pk",
  "www.seneca.edu.pk",
  "seneca-academy.vercel.app",
  "seneca-school-lms.vercel.app",
];

const OFFICIAL_PRODUCTION_URL =
  process.env.NEXT_PUBLIC_CANONICAL_URL || "https://seneca.edu.pk";

export function DomainIntegrityGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const currentHost = window.location.hostname.toLowerCase();

      // ALWAYS allow all local development, Wi-Fi LAN testing (e.g. 192.168.1.45:3000), and dev server ports
      if (
        process.env.NODE_ENV !== "production" ||
        isLocalOrPrivateNetwork(currentHost) ||
        window.location.port !== ""
      ) {
        return;
      }

      const allowedEnvHosts = (process.env.NEXT_PUBLIC_ALLOWED_HOSTS || "")
        .split(",")
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean);

      const allAllowedHosts = [...DEFAULT_ALLOWED_HOSTS, ...allowedEnvHosts];

      // Check if current host is allowed (supports wildcard/subdomains)
      const isAllowed = allAllowedHosts.some((allowed) => {
        if (allowed.startsWith("*.")) {
          const rootDomain = allowed.slice(2);
          return currentHost === rootDomain || currentHost.endsWith("." + rootDomain);
        }
        return (
          currentHost === allowed ||
          currentHost.endsWith(".vercel.app") ||
          currentHost.endsWith(".localhost")
        );
      });

      // If running on an unauthorized production clone domain, redirect to official site
      if (!isAllowed && currentHost !== "") {
        console.warn(
          `[SECURITY NOTICE] Unauthorized domain execution detected (${currentHost}). Redirecting to official Seneca Academy portal.`
        );
        window.location.replace(OFFICIAL_PRODUCTION_URL);
      }
    } catch (_) {}
  }, []);

  return null;
}

export default DomainIntegrityGuard;
