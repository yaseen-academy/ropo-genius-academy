"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const STORAGE_KEY = "ca_visitor_registered";

export default function SignInGate({ skipForSession, children }) {
  const { t, lang } = useLang();
  const [checked, setChecked] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (skipForSession) {
      setRegistered(true);
      setChecked(true);
      return;
    }
    try {
      setRegistered(Boolean(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      // if storage is blocked, don't trap the visitor behind the gate forever
      setRegistered(true);
    }
    setChecked(true);
  }, [skipForSession]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error();
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore — worst case it asks again next time on this device
      }
      setRegistered(true);
    } catch {
      setError(lang === "ar" ? "حصل خطأ، جرب تاني." : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!checked) return null;
  if (registered) return children;

  return (
    <div className="welcome-overlay">
      <form onSubmit={handleSubmit} className="welcome-card">
        <h2 className="text-xl font-semibold" style={{ color: "var(--accent)" }}>
          {t("gatesTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted">{t("gatesBody")}</p>

        <div className="mt-5">
          <label className="mb-1 block text-xs text-muted">{t("yourName")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted">{t("yourEmail")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
          />
        </div>

        {error && <p className="mt-3 text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-md py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 focus-ring"
          style={{ background: "var(--accent)", color: "var(--c-ink)" }}
        >
          {loading ? "…" : t("continue")}
        </button>
      </form>
    </div>
  );
}
