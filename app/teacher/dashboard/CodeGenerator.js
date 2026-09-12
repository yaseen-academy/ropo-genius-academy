"use client";

import { useState } from "react";

const QUANTITIES = [100, 500, 1000, 5000];

export default function CodeGenerator({ courses }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [batchLabel, setBatchLabel] = useState("");
  const [codes, setCodes] = useState([]);
  const [copied, setCopied] = useState(false);

  async function generate(quantity) {
    if (!courseId) return;
    setLoading(quantity);
    setError("");
    setCodes([]);
    setCopied(false);
    try {
      const res = await fetch("/api/trainer/generate-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate codes.");
        return;
      }
      setCodes(data.codes || []);
      setBatchLabel(data.batchLabel || "");
    } catch {
      setError("Something went wrong — check your connection and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — select the list below and copy manually.");
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

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {codes.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-teal">
              Generated {codes.length} codes {batchLabel ? `(${batchLabel})` : ""}
            </p>
            <button
              type="button"
              onClick={copyAll}
              className="rounded-md border border-line px-3 py-1 text-xs font-mono hover:border-teal hover:text-teal transition-colors focus-ring"
            >
              {copied ? "Copied ✓" : "Copy all"}
            </button>
          </div>
          <div className="codes-list max-h-40 overflow-y-auto rounded-md border border-line bg-panel2 p-3 font-mono text-xs text-muted">
            {codes.map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
