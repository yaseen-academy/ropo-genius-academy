"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("done");
      setTimeout(() => router.push("/teacher/login"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setStatus("idle");
    }
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-danger">Missing or invalid reset link.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/teacher/login" className="mb-8 inline-block font-mono text-sm text-amber">
          ← Back to login
        </Link>
        <h1 className="text-2xl font-semibold">Set a new password</h1>

        {status === "done" ? (
          <p className="mt-8 rounded-md border border-teal/40 bg-teal/10 p-4 text-sm text-teal">
            Password updated! Taking you to login…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
            />
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-amber py-2.5 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
            >
              {status === "loading" ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
