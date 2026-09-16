import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from "@/lib/passwordReset";

const GENERIC_MESSAGE = "If that email is on an account, we've sent a reset link to it.";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: "Enter your email." }, { status: 400 });
  }

  const { data: trainer } = await supabaseAdmin
    .from("trainers")
    .select("id, display_name, email")
    .ilike("email", email)
    .maybeSingle();

  // Always respond the same way whether or not the email matched, so this
  // can't be used to check which emails have accounts.
  if (!trainer) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();

  const { error } = await supabaseAdmin.from("password_resets").insert({
    trainer_id: trainer.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  const resetUrl = `${origin}/teacher/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: trainer.email,
      subject: "Reset your Ropo Genius Academy password",
      html: `
        <p>Hi ${trainer.display_name || ""},</p>
        <p>Click the link below to set a new password. It expires in 30 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't ask for this, you can ignore this email.</p>
      `,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Couldn't send the email right now — try again shortly." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
