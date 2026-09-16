import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";
import { assertOwnsQuestion } from "@/lib/trainerOwnership";

export async function PATCH(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const check = await assertOwnsQuestion(session, params.questionId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const body = await request.json().catch(() => ({}));
  const update = {};
  if (typeof body.questionText === "string") update.question_text = body.questionText.trim();
  if (Array.isArray(body.options) && body.options.length === 4) update.options = body.options;
  if (typeof body.correctIndex === "number") update.correct_index = body.correctIndex;

  const { data, error } = await supabaseAdmin
    .from("exam_questions")
    .update(update)
    .eq("id", params.questionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to update question." }, { status: 500 });
  return NextResponse.json({ ok: true, question: data });
}

export async function DELETE(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const check = await assertOwnsQuestion(session, params.questionId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { error } = await supabaseAdmin.from("exam_questions").delete().eq("id", params.questionId);
  if (error) return NextResponse.json({ error: "Failed to delete question." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
