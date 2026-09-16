import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";

const MAX_ATTEMPTS = 2;

export async function POST(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { examId } = params;
  const body = await request.json().catch(() => ({}));
  const answers = body.answers || {}; // { [questionId]: selectedIndex }

  const { data: exam } = await supabaseAdmin
    .from("exams")
    .select("id, lessons(course_id)")
    .eq("id", examId)
    .maybeSingle();
  if (!exam) return NextResponse.json({ error: "Exam not found." }, { status: 404 });

  const courseId = exam.lessons?.course_id;
  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("student_id", session.studentId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!enrollment) {
    return NextResponse.json({ error: "You're not enrolled in this course." }, { status: 403 });
  }

  const { data: pastAttempts } = await supabaseAdmin
    .from("exam_attempts")
    .select("id")
    .eq("student_id", session.studentId)
    .eq("exam_id", examId);

  const attemptsUsed = pastAttempts?.length || 0;
  if (attemptsUsed >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "You've used both attempts for this exam." }, { status: 403 });
  }

  const { data: questions } = await supabaseAdmin
    .from("exam_questions")
    .select("id, correct_index")
    .eq("exam_id", examId);

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "This exam has no questions yet." }, { status: 400 });
  }

  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correct_index) score += 1;
  }

  const attemptNumber = attemptsUsed + 1;

  const { error } = await supabaseAdmin.from("exam_attempts").insert({
    student_id: session.studentId,
    exam_id: examId,
    attempt_number: attemptNumber,
    score,
    total_questions: questions.length,
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save your attempt." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    score,
    total: questions.length,
    attemptNumber,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attemptNumber),
  });
}
