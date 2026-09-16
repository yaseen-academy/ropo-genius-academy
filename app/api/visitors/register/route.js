import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const name = (body?.name || "").trim().slice(0, 100);
  const email = (body?.email || "").trim().slice(0, 200);

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("visitors").insert({ name, email });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
