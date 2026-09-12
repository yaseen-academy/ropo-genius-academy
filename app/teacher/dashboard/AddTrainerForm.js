"use client";

import { useState } from "react";

export default function AddTrainerForm() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/trainer/add-trainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, displayName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not add coach.");
        return;
      }
      setMessage(`Coach "${displayName}" added.`);
      setUsername("");
      setDisplayName("");
      setPassword("");
      setOpen(false);
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-line px-4 py-2 text-sm hover:border-teal transition-colors focus-ring"
      >
        + Add coach
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-line bg-panel2 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none"
        />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Login username"
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none"
        />
      </div>
      {message && <p className="mt-2 text-sm text-teal">{message}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
        >
          {loading ? "Adding…" : "Add coach"}
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
