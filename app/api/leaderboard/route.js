import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ON_TIME_WINDOW_MS = 72 * 60 * 60 * 1000; // watched within 3 days of the video becoming available

export async function GET() {
  const [{ data: attempts }, { data: views }, { data: students }] = await Promise.all([
    supabaseAdmin.from("exam_attempts").select("student_id, score, total_questions"),
    supabaseAdmin
      .from("video_views")
      .select("student_id, last_viewed_at, lesson_parts(created_at)")
      .not("last_viewed_at", "is", null),
    supabaseAdmin.from("students").select("id, name"),
  ]);

  const nameById = new Map((students || []).map((s) => [s.id, s.name]));
  const stats = new Map(); // student_id -> { examPercentSum, examCount, onTimeViews }

  function ensure(id) {
    if (!stats.has(id)) stats.set(id, { examPercentSum: 0, examCount: 0, onTimeViews: 0 });
    return stats.get(id);
  }

  for (const a of attempts || []) {
    if (!a.total_questions) continue;
    const s = ensure(a.student_id);
    s.examPercentSum += (a.score / a.total_questions) * 100;
    s.examCount += 1;
  }

  for (const v of views || []) {
    const partCreated = v.lesson_parts?.created_at;
    if (!partCreated || !v.last_viewed_at) continue;
    const delta = new Date(v.last_viewed_at).getTime() - new Date(partCreated).getTime();
    if (delta >= 0 && delta <= ON_TIME_WINDOW_MS) {
      ensure(v.student_id).onTimeViews += 1;
    }
  }

  const leaderboard = Array.from(stats.entries())
    .map(([studentId, s]) => {
      const avgExamPercent = s.examCount > 0 ? s.examPercentSum / s.examCount : 0;
      const points = Math.round(avgExamPercent + s.onTimeViews * 5);
      return {
        studentId,
        name: nameById.get(studentId) || "Student",
        avgExamPercent: Math.round(avgExamPercent),
        onTimeViews: s.onTimeViews,
        examCount: s.examCount,
        points,
      };
    })
    .filter((row) => row.examCount > 0 || row.onTimeViews > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  return NextResponse.json({ ok: true, leaderboard });
}
