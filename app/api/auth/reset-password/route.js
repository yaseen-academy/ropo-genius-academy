import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashResetToken } from "@/lib/passwordReset";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { token, newPassword } = body;

  if (!token || !newPassword || newPassword.length < 6) {
    return NextResponse.json(
      { error: "Enter a new password with at least 6 characters." },
      { status: 400 }
    );
  }

  const tokenHash = hashResetToken(token);

  const { data: reset } = await supabaseAdmin
    .from("password_resets")
    .select("id, trainer_id, expires_at, used")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!reset || reset.used || new Date(reset.expires_at) < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabaseAdmin
    .from("trainers")
    .update({ password_hash: passwordHash })
    .eq("id", reset.trainer_id);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }

  await supabaseAdmin.from("password_resets").update({ used: true }).eq("id", reset.id);

  return NextResponse.json({ ok: true });
}
