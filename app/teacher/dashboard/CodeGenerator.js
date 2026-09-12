"use client";

import { useState } from "react";

const QUANTITIES = [100, 500, 1000, 5000];

export default function CodeGenerator({ courses }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState("");

  async function generate(quantity) {
    if (!courseId) return;
    setLoading(quantity);
    setResult("");
    try {
      const res = await fetch("/api/trainer/generate-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult(data.error || "Failed to generate codes.");
        return;
      }
      setResult(`Generated ${data.count} codes for this course.`);
    } catch {
      setResult("Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  if (courses.length === 0) {
    return <p className="text-sm text-muted">Add a course first, then generate codes for it.</p>;
  }

  return (
    <div>
      <label className="mb-1 block text-xs text-muted">Course</label>
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="mb-4 w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm focus-ring outline-none"
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {QUANTITIES.map((q) => (
          <button
            key={q}
            onClick={() => generate(q)}
            disabled={loading !== null}
            className="rounded-md border border-line px-4 py-2 text-sm font-mono hover:border-amber hover:text-amber transition-colors disabled:opacity-50 focus-ring"
          >
            {loading === q ? "Generating…" : `+${q} codes`}
          </button>
        ))}
      </div>

      {result && <p className="mt-3 text-sm text-teal">{result}</p>}
    </div>
  );
}
