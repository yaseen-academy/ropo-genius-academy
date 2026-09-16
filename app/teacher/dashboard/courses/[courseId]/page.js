import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/getServerSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CourseEditor from "./CourseEditor";

async function getOrCreateLesson(courseId) {
  const { data: existing } = await supabaseAdmin
    .from("lessons")
    .select("id, title, google_form_url")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("lessons")
    .insert({ course_id: courseId, title: "Lesson 1", sort_order: 0 })
    .select("id, title, google_form_url")
    .single();

  if (error) throw error;
  return created;
}

async function getOrCreateParts(lessonId) {
  const { data: existing } = await supabaseAdmin
    .from("lesson_parts")
    .select("id, part_number, title, video_url, duration_minutes")
    .eq("lesson_id", lessonId)
    .order("part_number", { ascending: true });

  const byNumber = new Map((existing || []).map((p) => [p.part_number, p]));
  const missing = [1, 2, 3, 4].filter((n) => !byNumber.has(n));

  if (missing.length > 0) {
    const rows = missing.map((n) => ({ lesson_id: lessonId, part_number: n, title: `Part ${n}` }));
    const { data: inserted, error } = await supabaseAdmin.from("lesson_parts").insert(rows).select();
    if (error) throw error;
    for (const p of inserted) byNumber.set(p.part_number, p);
  }

  return [1, 2, 3, 4].map((n) => byNumber.get(n));
}

async function getOrCreateExam(lessonId) {
  const { data: existing } = await supabaseAdmin
    .from("exams")
    .select("id, title")
    .eq("lesson_id", lessonId)
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("exams")
    .insert({ lesson_id: lessonId, title: "Lesson exam" })
    .select("id, title")
    .single();

  if (error) throw error;
  return created;
}

export default async function CourseDetailPage({ params }) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    redirect("/teacher/login");
  }

  const { courseId } = params;

  const { data: course } = await supabaseAdmin
    .from("courses")
    .select("id, title, description, price, trainer_id")
    .eq("id", courseId)
    .maybeSingle();

  if (!course) notFound();
  if (!session.isOwner && course.trainer_id !== session.trainerId) {
    redirect("/teacher/dashboard");
  }

  const lesson = await getOrCreateLesson(course.id);
  const parts = await getOrCreateParts(lesson.id);
  const exam = await getOrCreateExam(lesson.id);

  const { data: questions } = await supabaseAdmin
    .from("exam_questions")
    .select("id, question_text, options, correct_index, sort_order")
    .eq("exam_id", exam.id)
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/teacher/dashboard"
          className="rounded-md border border-line px-3 py-2 text-sm hover:border-amber hover:text-amber transition-colors focus-ring"
        >
          ← Dashboard
        </Link>
        <Link
          href="/"
          aria-label="Home"
          className="rounded-md border border-line px-3 py-2 text-sm hover:border-amber hover:text-amber transition-colors focus-ring"
        >
          🏠
        </Link>
      </div>

      <CourseEditor
        course={course}
        lesson={lesson}
        parts={parts}
        exam={exam}
        questions={questions || []}
      />
    </main>
  );
}
