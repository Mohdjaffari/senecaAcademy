import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "seneca_lms_session";
const OFFICIAL_CANONICAL_URL =
  process.env.NEXT_PUBLIC_CANONICAL_URL || "https://seneca.edu.pk";

const DEFAULT_ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "::1",
  "seneca.edu.pk",
  "www.seneca.edu.pk",
  "seneca-academy.vercel.app",
  "seneca-school-lms.vercel.app",
];

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

function getEncodedKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "default_super_secret_auth_token_key_change_in_production_2026";
  return new TextEncoder().encode(secret);
}

interface DecodedSession {
  userId: string;
  email: string;
  name: string;
  role: "super_admin" | "principal" | "teacher" | "student" | "user";
  schoolId: string;
}

async function verifyToken(token: string): Promise<DecodedSession | null> {
  try {
    const key = getEncodedKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as DecodedSession;
  } catch (_err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();

  // 1. Anti-Clone & Unauthorized Host Integrity Verification (Production Only, Never on local LAN/Wi-Fi)
  if (
    host &&
    process.env.NODE_ENV === "production" &&
    !isLocalOrPrivateNetwork(host)
  ) {
    const allowedEnvHosts = (process.env.ALLOWED_HOSTS || "")
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);

    const allAllowedHosts = [...DEFAULT_ALLOWED_HOSTS, ...allowedEnvHosts];

    const isHostAuthorized = allAllowedHosts.some((allowed) => {
      if (allowed.startsWith("*.")) {
        const rootDomain = allowed.slice(2);
        return host === rootDomain || host.endsWith("." + rootDomain);
      }
      return (
        host === allowed ||
        host.endsWith(".vercel.app") ||
        host.endsWith(".localhost")
      );
    });

    if (!isHostAuthorized) {
      return NextResponse.redirect(new URL(OFFICIAL_CANONICAL_URL));
    }
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // 2. Redirect authenticated users away from /login
  if (pathname === "/login" || pathname === "/login/") {
    if (!token) {
      return NextResponse.next();
    }
    const session = await verifyToken(token);
    if (session) {
      if (session.role === "super_admin" || session.role === "principal") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      if (session.role === "teacher") {
        return NextResponse.redirect(new URL("/teacher", request.url));
      }
      if (session.role === "student") {
        return NextResponse.redirect(new URL("/student", request.url));
      }
      if (session.role === "user") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  const session = token ? await verifyToken(token) : null;

  // 3. Strict Protected Routes Security Enforcement (No unauthenticated direct access)
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");
  const isProtectedAdmissionsRoute = pathname.startsWith("/admissions/status");

  if (isDashboardRoute || isTeacherRoute || isStudentRoute || isProtectedAdmissionsRoute) {
    // If no valid session token exists, strictly redirect to /login with return path
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific workspace boundaries
    if (isDashboardRoute && !["super_admin", "principal"].includes(session.role)) {
      const target =
        session.role === "teacher"
          ? "/teacher"
          : session.role === "student"
          ? "/student"
          : "/admissions/status";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (isTeacherRoute && session.role !== "teacher" && session.role !== "super_admin") {
      const target =
        session.role === "principal"
          ? "/dashboard"
          : session.role === "student"
          ? "/student"
          : "/admissions/status";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (
      isStudentRoute &&
      session.role !== "student" &&
      session.role !== "super_admin"
    ) {
      const target =
        session.role === "principal"
          ? "/dashboard"
          : session.role === "teacher"
          ? "/teacher"
          : "/admissions/status";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // 4. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/admissions/status/:path*",
    "/login",
  ],
};
