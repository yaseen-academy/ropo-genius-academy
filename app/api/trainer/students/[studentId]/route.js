import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

export async function DELETE(request, { params }) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token && verifySession(token);
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { error } = await supabaseAdmin.from("students").delete().eq("id", params.studentId);
  if (error) {
    return NextResponse.json({ error: "Could not remove student." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
