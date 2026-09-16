import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";

const MAX_ATTEMPTS = 2;

export async function GET(request, { params }) {
  const session = getServerSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { examId } = params;

  const { data: exam } = await supabaseAdmin
    .from("exams")
    .select("id, title, lessons(course_id)")
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

  const { data: attempts } = await supabaseAdmin
    .from("exam_attempts")
    .select("attempt_number, score, total_questions")
    .eq("student_id", session.studentId)
    .eq("exam_id", examId)
    .order("attempt_number", { ascending: true });

  const attemptsUsed = attempts?.length || 0;
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attemptsUsed);

  const { data: questions } = await supabaseAdmin
    .from("exam_questions")
    .select("id, question_text, options, sort_order")
    .eq("exam_id", examId)
    .order("sort_order", { ascending: true });

  return NextResponse.json({
    ok: true,
    examTitle: exam.title,
    questionCount: questions?.length || 0,
    attemptsUsed,
    attemptsRemaining,
    maxAttempts: MAX_ATTEMPTS,
    pastAttempts: attempts || [],
    // only hand over the questions (no correct answers) if there's an attempt left
    questions: attemptsRemaining > 0 ? (questions || []).map((q) => ({ id: q.id, question_text: q.question_text, options: q.options })) : [],
  });
}
