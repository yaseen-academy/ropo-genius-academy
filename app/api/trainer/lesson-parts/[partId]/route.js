import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";
import { assertOwnsPart } from "@/lib/trainerOwnership";

export async function PATCH(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const check = await assertOwnsPart(session, params.partId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json().catch(() => ({}));
  const update = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.videoUrl === "string") update.video_url = body.videoUrl.trim() || null;
  if (typeof body.durationMinutes === "number") {
    update.duration_minutes = Math.min(45, Math.max(1, Math.round(body.durationMinutes)));
  }

  const { data, error } = await supabaseAdmin
    .from("lesson_parts")
    .update(update)
    .eq("id", params.partId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update video part." }, { status: 500 });
  return NextResponse.json({ ok: true, part: data });
}
