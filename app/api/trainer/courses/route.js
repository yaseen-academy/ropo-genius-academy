import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token && verifySession(token);
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { title, description, price, coverColor } = await request.json();
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("courses")
    .insert({
      trainer_id: session.trainerId,
      title,
      description: description || "",
      price: price || 750,
      cover_color: coverColor || "#F0A93C",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not create course." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, course: data });
}
