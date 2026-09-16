import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";

const MAX_VIEWS = 3;

export async function POST(request) {
  const session = getServerSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { lessonPartId } = body;
  if (!lessonPartId) {
    return NextResponse.json({ error: "Missing lessonPartId." }, { status: 400 });
  }

  // confirm this part belongs to a course the student is enrolled in
  const { data: part } = await supabaseAdmin
    .from("lesson_parts")
    .select("id, lessons(course_id)")
    .eq("id", lessonPartId)
    .maybeSingle();

  if (!part) return NextResponse.json({ error: "Video not found." }, { status: 404 });

  const courseId = part.lessons?.course_id;
  const { data: enrollment } = await supabaseAdmin
    .from("enrollments")
    .select("id")
    .eq("student_id", session.studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "You're not enrolled in this course." }, { status: 403 });
  }

  const { data: existing } = await supabaseAdmin
    .from("video_views")
    .select("id, view_count")
    .eq("student_id", session.studentId)
    .eq("lesson_part_id", lessonPartId)
    .maybeSingle();

  if (existing && existing.view_count >= MAX_VIEWS) {
    return NextResponse.json({ error: "limit_reached", viewCount: existing.view_count }, { status: 403 });
  }

  const nextCount = (existing?.view_count || 0) + 1;

  const { error } = await supabaseAdmin.from("video_views").upsert(
    {
      id: existing?.id,
      student_id: session.studentId,
      lesson_part_id: lessonPartId,
      view_count: nextCount,
      last_viewed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lesson_part_id" }
  );

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record view." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, viewCount: nextCount, maxViews: MAX_VIEWS });
}
