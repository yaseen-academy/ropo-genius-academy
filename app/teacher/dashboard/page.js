import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "@/lib/getServerSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LogoutButton from "@/components/LogoutButton";
import AddCourseForm from "./AddCourseForm";
import CodeGenerator from "./CodeGenerator";
import StudentsList from "./StudentsList";
import AddTrainerForm from "./AddTrainerForm";
import DeviceLockCard from "./DeviceLockCard";
import FeedbackReportCard from "./FeedbackReportCard";

async function loadDashboardData(trainerId) {
  const { data: courses } = await supabaseAdmin
    .from("courses")
    .select("id, title, price, created_at")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  const courseIds = (courses || []).map((c) => c.id);

  let studentsWithCounts = [];
  if (courseIds.length > 0) {
    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select("student_id, course_id, students(id, name, created_at)")
      .in("course_id", courseIds);

    const byStudent = new Map();
    for (const row of enrollments || []) {
      const s = row.students;
      if (!s) continue;
      if (!byStudent.has(s.id)) {
        byStudent.set(s.id, { ...s, courseCount: 0 });
      }
      byStudent.get(s.id).courseCount += 1;
    }
    studentsWithCounts = Array.from(byStudent.values());
  }

  return { courses: courses || [], students: studentsWithCounts };
}

export default async function TeacherDashboard() {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    redirect("/teacher/login");
  }

  const { courses, students } = await loadDashboardData(session.trainerId);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-muted">trainer dashboard</p>
          <h1 className="text-2xl font-semibold">Welcome, {session.username.replace("trainer ", "")}</h1>
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

      <div className="grid gap-8">
        {/* Courses */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Your courses</h2>
            <AddCourseForm />
          </div>
          {courses.length === 0 ? (
            <p className="text-sm text-muted">You haven't added a course yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {courses.map((c) => (
                <div key={c.id} className="rounded-lg border border-line bg-panel p-4">
                  <p className="font-medium">{c.title}</p>
                  <p className="mt-1 font-mono text-sm text-amber">{c.price} EGP</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Access codes */}
        <section className="rounded-lg border border-line bg-panel p-5">
          <h2 className="mb-3 text-lg font-medium">Generate student access codes</h2>
          <CodeGenerator courses={courses} />
        </section>

        {/* Students */}
        <section>
          <h2 className="mb-3 text-lg font-medium">Enrolled students ({students.length})</h2>
          <StudentsList students={students} />
        </section>

        {/* Coaches (owner only) */}
        {session.isOwner && (
          <section>
            <h2 className="mb-3 text-lg font-medium">Coaches</h2>
            <AddTrainerForm />
          </section>
        )}

        <DeviceLockCard />

        <FeedbackReportCard />

        {/* Coming next */}
        <section className="rounded-lg border border-dashed border-line p-5 text-sm text-muted">
          Coming in the next build pass: uploading the 4 video parts per lesson, building
          exams per lesson, and the in-dashboard AI assistant for the curriculum.
        </section>
      </div>
    </main>
  );
}
