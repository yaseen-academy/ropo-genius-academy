import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/getServerSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LessonVideoPlayer from "./LessonVideoPlayer";

export default async function StudentCoursePage({ params }) {
  const session = getServerSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const { courseId } = params;

  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id, courses(id, title, description)")
    .eq("student_id", session.studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) notFound();
  const course = enrollment.courses;

  const { data: lesson } = await supabaseAdmin
    .from("lessons")
    .select("id, title, google_form_url")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: parts } = lesson
    ? await supabaseAdmin
        .from("lesson_parts")
        .select("id, part_number, title, video_url, duration_minutes")
        .eq("lesson_id", lesson.id)
        .order("part_number", { ascending: true })
    : { data: [] };

  const { data: views } = await supabaseAdmin
    .from("video_views")
    .select("lesson_part_id, view_count")
    .eq("student_id", session.studentId)
    .in("lesson_part_id", (parts || []).map((p) => p.id).length ? (parts || []).map((p) => p.id) : ["00000000-0000-0000-0000-000000000000"]);

  const viewCountByPart = new Map((views || []).map((v) => [v.lesson_part_id, v.view_count]));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/student/dashboard"
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

      <h1 className="text-2xl font-semibold">{course.title}</h1>
      <p className="mt-1 text-sm text-muted">{course.description}</p>

      <div className="mt-8 grid gap-4">
        {(parts || [])
          .filter((p) => p.video_url)
          .map((part) => (
            <LessonVideoPlayer
              key={part.id}
              part={part}
              initialViewCount={viewCountByPart.get(part.id) || 0}
            />
          ))}
        {(!parts || parts.filter((p) => p.video_url).length === 0) && (
          <p className="text-sm text-muted">No videos have been added to this course yet.</p>
        )}
      </div>

      {lesson?.google_form_url && (
        <div className="mt-8 rounded-lg border border-line bg-panel p-5">
          <h2 className="mb-2 text-lg font-medium">Exam</h2>
          <a
            href={lesson.google_form_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-md bg-teal px-4 py-2 text-sm font-medium text-ink hover:opacity-90 focus-ring"
          >
            Open the exam →
          </a>
        </div>
      )}
    </main>
  );
}
