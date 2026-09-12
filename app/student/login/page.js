"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.push("/student/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block font-mono text-sm text-amber">
          ← code_academy
        </Link>
        <h1 className="text-2xl font-semibold">Student login</h1>
        <p className="mt-1 text-sm text-muted">
          Enter your name and the access code your trainer gave you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm focus-ring outline-none"
              placeholder="Any name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Access code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm font-mono focus-ring outline-none"
              placeholder="CA-XXXX-XXXX"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-teal py-2.5 text-sm font-medium text-ink hover:opacity-90 transition-opacity disabled:opacity-50 focus-ring"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
