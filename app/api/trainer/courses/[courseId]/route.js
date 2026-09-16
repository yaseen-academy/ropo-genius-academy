import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";

async function assertOwnsCourse(session, courseId) {
  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("id, trainer_id")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return { ok: false, status: 404, error: "Course not found." };
  if (!session.isOwner && course.trainer_id !== session.trainerId) {
    return { ok: false, status: 403, error: "Not your course." };
  }
  return { ok: true };
}

export async function PATCH(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const check = await assertOwnsCourse(session, params.courseId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json().catch(() => ({}));
  const update = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.description === "string") update.description = body.description;
  if (typeof body.price === "number") update.price = body.price;
  if (typeof body.published === "boolean") update.published = body.published;

  const { data, error } = await supabaseAdmin
    .from("courses")
    .update(update)
    .eq("id", params.courseId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update course." }, { status: 500 });
  return NextResponse.json({ ok: true, course: data });
}

export async function DELETE(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const check = await assertOwnsCourse(session, params.courseId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await supabaseAdmin.from("courses").delete().eq("id", params.courseId);
  if (error) return NextResponse.json({ error: "Failed to delete course." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
