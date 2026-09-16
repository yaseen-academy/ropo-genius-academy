"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoPartCard from "./VideoPartCard";
import ExamQuestionsEditor from "./ExamQuestionsEditor";

export default function CourseEditor({ course, lesson, parts, exam, questions }) {
  const router = useRouter();

  const [title, setTitle] = useState(course.title);
  const [price, setPrice] = useState(course.price);
  const [description, setDescription] = useState(course.description || "");
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseStatus, setCourseStatus] = useState("");
  const [courseError, setCourseError] = useState("");

  const [googleFormUrl, setGoogleFormUrl] = useState(lesson.google_form_url || "");
  const [savingForm, setSavingForm] = useState(false);
  const [formStatus, setFormStatus] = useState("");

  const [deleteStep, setDeleteStep] = useState("idle"); // idle | confirming | deleting
  const [deleteError, setDeleteError] = useState("");

  async function saveCourse(e) {
    e.preventDefault();
    setSavingCourse(true);
    setCourseError("");
    try {
      const res = await fetch(`/api/trainer/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price: Number(price) }),
      });
      if (!res.ok) throw new Error();
      setCourseStatus("Saved ✓");
      setTimeout(() => setCourseStatus(""), 2000);
    } catch {
      setCourseError("Failed to save course details.");
    } finally {
      setSavingCourse(false);
    }
  }

  async function saveGoogleForm() {
    setSavingForm(true);
    try {
      const res = await fetch(`/api/trainer/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleFormUrl }),
      });
      if (!res.ok) throw new Error();
      setFormStatus("Saved ✓");
      setTimeout(() => setFormStatus(""), 2000);
    } catch {
      setFormStatus("Failed to save.");
    } finally {
      setSavingForm(false);
    }
  }

  async function handleDelete() {
    setDeleteStep("deleting");
    setDeleteError("");
    try {
      const res = await fetch(`/api/trainer/courses/${course.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/teacher/dashboard");
    } catch {
      setDeleteError("Failed to delete the course — try again.");
      setDeleteStep("confirming");
    }
  }

  return (
    <div className="grid gap-8">
      {/* Course info */}
      <section className="rounded-lg border border-line bg-panel p-5">
        <h1 className="mb-4 text-lg font-medium">Course details</h1>
        <form onSubmit={saveCourse} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Price (EGP)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-mono outline-none focus-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
            />
          </div>
          {courseError && <p className="text-sm text-danger">{courseError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingCourse}
              className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
            >
              {savingCourse ? "Saving…" : "Save changes"}
            </button>
            {courseStatus && <span className="text-sm text-teal">{courseStatus}</span>}
          </div>
        </form>
      </section>

      {/* 4 video parts */}
      <section>
        <h2 className="mb-3 text-lg font-medium">Lesson videos (4 parts)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {parts.map((part) => (
            <VideoPartCard key={part.id} part={part} />
          ))}
        </div>
      </section>

      {/* Exam or Google Form */}
      <section className="rounded-lg border border-line bg-panel p-5">
        <h2 className="mb-1 text-lg font-medium">Exam</h2>
        <p className="mb-4 text-sm text-muted">
          Build questions below, or paste a Google Form link to use instead — whichever you fill in is what
          students will see.
        </p>

        <div className="mb-6">
          <label className="mb-1 block text-xs text-muted">Google Form link (optional)</label>
          <div className="flex gap-2">
            <input
              value={googleFormUrl}
              onChange={(e) => setGoogleFormUrl(e.target.value)}
              placeholder="https://forms.google.com/..."
              className="flex-1 rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-mono outline-none focus-ring"
            />
            <button
              onClick={saveGoogleForm}
              disabled={savingForm}
              className="rounded-md border border-line px-4 py-2 text-sm hover:border-teal hover:text-teal disabled:opacity-50 focus-ring"
            >
              {savingForm ? "…" : "Save"}
            </button>
          </div>
          {formStatus && <p className="mt-1 text-xs text-teal">{formStatus}</p>}
        </div>

        <ExamQuestionsEditor examId={exam.id} initialQuestions={questions} />
      </section>

      {/* Danger zone */}
      <section className="rounded-lg border border-danger/40 bg-danger/5 p-5">
        <h2 className="mb-1 text-lg font-medium text-danger">Delete this course</h2>
        <p className="mb-4 text-sm text-muted">
          This permanently deletes the course, its videos, exam, access codes, and enrollments. This can't be
          undone.
        </p>

        {deleteStep === "idle" && (
          <button
            onClick={() => setDeleteStep("confirming")}
            className="rounded-md border border-danger px-4 py-2 text-sm text-danger hover:bg-danger/10 focus-ring"
          >
            Delete course
          </button>
        )}

        {(deleteStep === "confirming" || deleteStep === "deleting") && (
          <div>
            <p className="mb-3 text-sm">Are you sure? Type the course title to confirm isn't required — just click below.</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteStep === "deleting"}
                className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 focus-ring"
              >
                {deleteStep === "deleting" ? "Deleting…" : "Yes, delete permanently"}
              </button>
              <button
                onClick={() => setDeleteStep("idle")}
                className="rounded-md border border-line px-4 py-2 text-sm text-muted hover:text-text focus-ring"
              >
                Cancel
              </button>
            </div>
            {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
