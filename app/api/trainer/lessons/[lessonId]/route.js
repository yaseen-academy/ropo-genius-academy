import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";
import { assertOwnsLesson } from "@/lib/trainerOwnership";

export async function PATCH(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const check = await assertOwnsLesson(session, params.lessonId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json().catch(() => ({}));
  const update = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.googleFormUrl === "string") update.google_form_url = body.googleFormUrl.trim() || null;

  const { data, error } = await supabaseAdmin
    .from("lessons")
    .update(update)
    .eq("id", params.lessonId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update lesson." }, { status: 500 });
  return NextResponse.json({ ok: true, lesson: data });
}
