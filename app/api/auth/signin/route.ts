import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  return NextResponse.redirect(loginUrl);
}
