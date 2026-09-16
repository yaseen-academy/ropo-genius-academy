"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("idle");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/teacher/login" className="mb-8 inline-block font-mono text-sm text-amber">
          ← Back to login
        </Link>
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-1 text-sm text-muted">
          Enter the email on your trainer account and we'll send you a reset link.
        </p>

        {status === "done" ? (
          <p className="mt-8 rounded-md border border-teal/40 bg-teal/10 p-4 text-sm text-teal">
            If that email is on an account, a reset link is on its way. Check your inbox (and spam folder).
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-amber py-2.5 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
            >
              {status === "loading" ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
