import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token && verifySession(token);
  if (!session) {
    return NextResponse.json({ session: null });
  }
  return NextResponse.json({ session });
}
