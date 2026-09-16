import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";
import { assertOwnsExam } from "@/lib/trainerOwnership";

export async function POST(request) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { examId, questionText, options, correctIndex, sortOrder } = body;

  if (!examId || !questionText || !Array.isArray(options) || options.length !== 4) {
    return NextResponse.json({ error: "A question needs text and exactly 4 options." }, { status: 400 });
  }
  if (typeof correctIndex !== "number" || correctIndex < 0 || correctIndex > 3) {
    return NextResponse.json({ error: "Pick which option is correct." }, { status: 400 });
  }

  const check = await assertOwnsExam(session, examId);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { data, error } = await supabaseAdmin
    .from("exam_questions")
    .insert({
      exam_id: examId,
      question_text: questionText.trim(),
      options,
      correct_index: correctIndex,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to add question." }, { status: 500 });
  return NextResponse.json({ ok: true, question: data });
}
