import { NextRequest } from "next/server";
import { GET as adminGet, PUT as adminPut } from "@/app/api/admin/admissions/route";

export async function GET(req: NextRequest) {
  return adminGet(req);
}

export async function PUT(req: NextRequest) {
  return adminPut(req);
}
