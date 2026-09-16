import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const { username, password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const { data: trainers, error } = await supabaseAdmin
    .from("trainers")
    .select("id, username, password_hash, display_name, is_owner");

  if (error || !trainers || trainers.length === 0) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  // Username is informational only — try it first if given, then fall back to
  // checking the password against every trainer account.
  let trainer = null;
  if (username) {
    const named = trainers.find((t) => t.username === username);
    if (named && (await bcrypt.compare(password, named.password_hash))) {
      trainer = named;
    }
  }
  if (!trainer) {
    for (const t of trainers) {
      if (await bcrypt.compare(password, t.password_hash)) {
        trainer = t;
        break;
      }
    }
  }

  if (!trainer) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = signSession({
    role: "trainer",
    trainerId: trainer.id,
    username: trainer.username,
    isOwner: trainer.is_owner,
  });

  const res = NextResponse.json({
    ok: true,
    trainer: { id: trainer.id, displayName: trainer.display_name, isOwner: trainer.is_owner },
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}

