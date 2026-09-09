import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, destroySession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  await destroySession();

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function GET(req: NextRequest) {
  await destroySession();

  const loginUrl = new URL("/login", req.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
