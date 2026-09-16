import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_LENGTH = 2000;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const message = (body?.message || "").trim();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }
  if (message.length > MAX_LENGTH) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const submittedName = (body?.submittedName || "").trim().slice(0, 100) || null;

  const { error } = await supabaseAdmin.from("feedback").insert({ message, submitted_name: submittedName });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save your message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
