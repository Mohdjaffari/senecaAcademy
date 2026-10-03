import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { UserRole, Permission, ROLE_PERMISSIONS } from "./permissions";

export const SESSION_COOKIE_NAME = "seneca_lms_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId: string;
  avatarUrl?: string;
  profileId?: string;
  classId?: string;
  section?: string;
  campusWing?: "junior" | "senior" | "all";
  permissions: Permission[];
}

function getEncodedKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: AUTH_SECRET must be configured in environment variables for production security.");
    }
    return new TextEncoder().encode("default_super_secret_auth_token_key_change_in_production_2026");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: Omit<SessionPayload, "permissions">): Promise<string> {
  const permissions = ROLE_PERMISSIONS[payload.role] || [];
  const fullPayload: SessionPayload = {
    ...payload,
    permissions,
  };

  const key = getEncodedKey();
  const token = await new SignJWT({ ...fullPayload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });

  return token;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const key = getEncodedKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (_err) {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete(SESSION_COOKIE_NAME);
}
