import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/getServerSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toWhatsAppNumber } from "@/lib/phone";
import LogoutButton from "@/components/LogoutButton";
import AIChatWidget from "@/components/AIChatWidget";

async function loadEnrollments(studentId) {
  const { data } = await supabaseAdmin
    .from("enrollments")
    .select("course_id, courses(id, title, description, cover_color)")
    .eq("student_id", studentId);
  return (data || []).map((row) => row.courses).filter(Boolean);
}

export default async function StudentDashboard() {
  const session = getServerSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const courses = await loadEnrollments(session.studentId);
  const whatsapp = toWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) || "201116675681";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-muted">student dashboard</p>
          <h1 className="text-2xl font-semibold">Hey, {session.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Home"
            className="rounded-md border border-line px-3 py-2 text-sm hover:border-amber hover:text-amber transition-colors focus-ring"
          >
            🏠
          </Link>
          <LogoutButton />
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">Your courses ({courses.length})</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-muted">
            No courses on your account yet. Ask your trainer for an access code.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/student/courses/${c.id}`}
                className="rounded-lg border border-line bg-panel p-4 transition-colors hover:border-teal"
              >
                <span
                  className="mb-3 inline-block h-1.5 w-8 rounded-full"
                  style={{ backgroundColor: c.cover_color || "#3ECFB2" }}
                />
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 text-sm text-muted">{c.description}</p>
                <p className="mt-2 text-xs text-teal">Watch lessons →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-line px-4 py-2 text-sm hover:border-teal transition-colors focus-ring"
        >
          Ask a question on WhatsApp
        </a>
        <a
          href="/games"
          className="rounded-md border border-line px-4 py-2 text-sm hover:border-amber transition-colors focus-ring"
        >
          Practice & games
        </a>
        <a
          href="/support"
          className="rounded-md border border-line px-4 py-2 text-sm hover:border-amber transition-colors focus-ring"
        >
          Report a problem / suggestion
        </a>
        <span className="rounded-md border border-line px-4 py-2 text-sm text-muted">
          Use the 💬 button for AI help anytime
        </span>
      </section>

      <section className="mt-8 rounded-lg border border-dashed border-line p-5 text-sm text-muted">
        Coming in the next build pass: per-lesson exams built into the site (max 2 attempts) with scores —
        for now, use the exam link on each course's page if your trainer added one.
      </section>

      <AIChatWidget />
    </main>
  );
}
