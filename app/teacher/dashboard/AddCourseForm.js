"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCourseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(750);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/trainer/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price: Number(price) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create course.");
        return;
      }
      setTitle("");
      setDescription("");
      setPrice(750);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-ink hover:opacity-90 transition-opacity focus-ring"
      >
        + New course
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-panel2 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title (e.g. Robotics Basics)"
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none sm:col-span-2"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description"
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none sm:col-span-2"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price (EGP)"
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none"
        />
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-amber px-4 py-2 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
        >
          {loading ? "Saving…" : "Save course"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-line px-4 py-2 text-sm hover:border-teal focus-ring"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
