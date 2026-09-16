"use client";

import { useState } from "react";

export default function VideoPartCard({ part }) {
  const [title, setTitle] = useState(part.title || "");
  const [videoUrl, setVideoUrl] = useState(part.video_url || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function save(overrides = {}) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/trainer/lesson-parts/${part.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, videoUrl, ...overrides }),
      });
      if (!res.ok) throw new Error();
      setStatus("Saved ✓");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setError("Failed to save — try again.");
    } finally {
      setSaving(false);
    }
  }

  function removeVideo() {
    setVideoUrl("");
    save({ videoUrl: "" });
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-muted">Part {part.part_number}</span>
        {videoUrl && (
          <button onClick={removeVideo} className="text-xs text-danger hover:underline">
            Remove video
          </button>
        )}
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Part ${part.part_number} title`}
        className="mb-2 w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
      />

      <input
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Paste YouTube (unlisted) / Drive / Vimeo link"
        className="mb-2 w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-mono outline-none focus-ring"
      />

      {videoUrl && (
        <p className="mb-2 truncate text-xs text-teal">
          <a href={videoUrl} target="_blank" rel="noreferrer" className="hover:underline">
            {videoUrl}
          </a>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => save()}
          disabled={saving}
          className="rounded-md bg-amber px-3 py-1.5 text-xs font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {status && <span className="text-xs text-teal">{status}</span>}
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
