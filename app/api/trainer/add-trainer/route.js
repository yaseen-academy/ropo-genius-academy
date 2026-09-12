import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token && verifySession(token);
  if (!session || session.role !== "trainer" || !session.isOwner) {
    return NextResponse.json({ error: "Only the owner can add coaches." }, { status: 401 });
  }

  const { username, password, displayName } = await request.json();
  if (!username || !password || !displayName) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabaseAdmin.from("trainers").insert({
    username,
    password_hash: passwordHash,
    display_name: displayName,
    is_owner: false,
  });

  if (error) {
    return NextResponse.json({ error: "Could not create coach account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
