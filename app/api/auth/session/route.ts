import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }
    return NextResponse.json({
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        schoolId: session.schoolId,
      },
      authenticated: true,
    }, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
  }
}
