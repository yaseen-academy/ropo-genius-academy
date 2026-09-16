import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signSession, SESSION_COOKIE } from "@/lib/session";
import { getOrCreateDeviceId, setDeviceCookie } from "@/lib/deviceId";

export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const { data: trainer, error } = await supabaseAdmin
    .from("trainers")
    .select("id, username, password_hash, display_name, is_owner, locked_device_id")
    .eq("username", username)
    .maybeSingle();

  if (error || !trainer) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, trainer.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const { deviceId } = getOrCreateDeviceId(request);

  if (trainer.locked_device_id && trainer.locked_device_id !== deviceId) {
    return NextResponse.json(
      {
        error:
          "This account is locked to another device. If this is your new device, ask whoever manages the site to reset the device lock.",
      },
      { status: 403 }
    );
  }

  if (!trainer.locked_device_id) {
    await supabaseAdmin.from("trainers").update({ locked_device_id: deviceId }).eq("id", trainer.id);
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
  setDeviceCookie(res, deviceId);

  return res;
}

