import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getCourses() {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("id, title, description, price, cover_color, lessons(count)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export default async function LandingPage() {
  const courses = await getCourses();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201116675681";
  const vodafoneCash = process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || "01116675681";

  return (
    <main>
      {/* Top nav */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-mono text-sm text-amber">code_academy</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/student/login"
              className="rounded-md border border-line px-4 py-2 text-sm text-text hover:border-teal hover:text-teal transition-colors focus-ring"
            >
              Student login
            </Link>
            <Link
              href="/teacher/login"
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-ink hover:opacity-90 transition-opacity focus-ring"
            >
              Trainer login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Learn to code, lesson by lesson, with someone checking your work.
            </h1>
            <p className="mt-5 max-w-md text-muted">
              Every course is split into short, focused lessons — four 30-to-45-minute
              parts each — followed by an exam that shows you exactly where you stand.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#courses"
                className="rounded-md bg-teal px-5 py-3 text-sm font-medium text-ink hover:opacity-90 transition-opacity focus-ring"
              >
                Browse courses
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line px-5 py-3 text-sm text-text hover:border-teal transition-colors focus-ring"
              >
                Ask a question on WhatsApp
              </a>
            </div>
          </div>

          {/* Terminal-style visual */}
          <div className="rounded-lg border border-line bg-panel shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal/70" />
              <span className="ml-2 font-mono text-xs text-muted">lesson_01.py</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-muted">
              <code>
                <span className="text-muted/60">1</span>{"  "}
                <span className="text-teal">def</span> greet(name):{"\n"}
                <span className="text-muted/60">2</span>{"      "}
                <span className="text-amber">return</span> f<span className="text-text">"Welcome, {"{"}name{"}"}"</span>
                {"\n"}
                <span className="text-muted/60">3</span>{"\n"}
                <span className="text-muted/60">4</span>{"  "}print(greet(<span className="text-text">"student"</span>)){"\n"}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Available courses</h2>
          <span className="font-mono text-xs text-muted">{courses.length} course(s)</span>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-10 text-center text-muted">
            No courses published yet. Once a trainer adds one from the dashboard, it will
            show up here automatically.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex flex-col rounded-lg border border-line bg-panel p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className="inline-block h-1.5 w-10 rounded-full"
                    style={{ backgroundColor: course.cover_color || "#F0A93C" }}
                  />
                  <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                    {course.lessons?.[0]?.count ?? 0} lessons · 4 parts each
                  </span>
                </div>
                <h3 className="text-lg font-medium">{course.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{course.description}</p>
                <div className="mt-4 flex items-baseline gap-1 font-mono">
                  <span className="text-xl text-amber">{course.price}</span>
                  <span className="text-xs text-muted">EGP</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Vodafone Cash: <span className="text-text">{vodafoneCash}</span>
                </p>
                <div className="mt-4 flex gap-2">
                  <a
                    href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                      `Hi, I'd like to enroll in "${course.title}"`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-md border border-line py-2 text-center text-sm hover:border-teal transition-colors focus-ring"
                  >
                    Enroll via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-muted">
        Questions? Chat with us on{" "}
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="text-teal hover:underline"
        >
          WhatsApp
        </a>
        .
      </footer>
    </main>
  );
}
