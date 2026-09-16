"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import SiteToggles from "@/components/SiteToggles";

export default function SupportPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/support/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), submittedName: name.trim() || null }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setMessage("");
      setName("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-mono text-sm" style={{ color: "var(--accent)" }}>
            code_academy
          </Link>
          <SiteToggles />
        </div>
      </header>

      <section className="mx-auto max-w-lg px-6 py-16">
        <h1 className="text-2xl font-semibold">
          {isAr ? "شكوى أو اقتراح" : "Complaint or suggestion"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isAr
            ? "اكتب أي مشكلة واجهتك أو أي اقتراح لتحسين المنصة. بنراجع كل الرسايل بانتظام."
            : "Tell us about any problem you ran into, or an idea to improve the platform. We review these regularly."}
        </p>

        {status === "done" ? (
          <div className="mt-8 rounded-lg border border-teal/40 bg-teal/10 p-5 text-sm text-teal">
            {isAr ? "وصلت رسالتك، شكرًا لك! ✅" : "Got it — thank you! ✅"}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-muted">
                {isAr ? "اسمك (اختياري)" : "Your name (optional)"}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                {isAr ? "الرسالة" : "Message"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                required
                className="w-full resize-none rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
                placeholder={isAr ? "اكتب هنا..." : "Write here..."}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-danger">
                {isAr ? "حصل خطأ، جرب تاني." : "Something went wrong — try again."}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-amber py-2.5 text-sm font-medium text-ink transition-opacity hover:opacity-90 disabled:opacity-50 focus-ring"
            >
              {status === "loading" ? (isAr ? "جاري الإرسال…" : "Sending…") : isAr ? "إرسال" : "Send"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
