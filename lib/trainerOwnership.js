import { supabaseAdmin } from "@/lib/supabaseAdmin";

function checkTrainerId(session, courseTrainerId) {
  if (!session.isOwner && courseTrainerId !== session.trainerId) {
    return { ok: false, status: 403, error: "Not your course." };
  }
  return { ok: true };
}

export async function assertOwnsLesson(session, lessonId) {
  const { data } = await supabaseAdmin
    .from("lessons")
    .select("id, courses(trainer_id)")
    .eq("id", lessonId)
    .maybeSingle();
  if (!data) return { ok: false, status: 404, error: "Lesson not found." };
  return checkTrainerId(session, data.courses?.trainer_id);
}

export async function assertOwnsPart(session, partId) {
  const { data } = await supabaseAdmin
    .from("lesson_parts")
    .select("id, lessons(courses(trainer_id))")
    .eq("id", partId)
    .maybeSingle();
  if (!data) return { ok: false, status: 404, error: "Part not found." };
  return checkTrainerId(session, data.lessons?.courses?.trainer_id);
}

export async function assertOwnsExam(session, examId) {
  const { data } = await supabaseAdmin
    .from("exams")
    .select("id, lessons(courses(trainer_id))")
    .eq("id", examId)
    .maybeSingle();
  if (!data) return { ok: false, status: 404, error: "Exam not found." };
  return checkTrainerId(session, data.lessons?.courses?.trainer_id);
}

export async function assertOwnsQuestion(session, questionId) {
  const { data } = await supabaseAdmin
    .from("exam_questions")
    .select("id, exams(lessons(courses(trainer_id)))")
    .eq("id", questionId)
    .maybeSingle();
  if (!data) return { ok: false, status: 404, error: "Question not found." };
  return checkTrainerId(session, data.exams?.lessons?.courses?.trainer_id);
}
