"use client";

import { useEffect, useState } from "react";

function formatDate(iso) {
  return new Date(iso).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

export default function FeedbackReportCard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [note, setNote] = useState("");
  const [empty, setEmpty] = useState(false);

  async function load(force = false) {
    if (force) setRefreshing(true);
    try {
      const res = await fetch(`/api/trainer/feedback-report${force ? "?force=true" : ""}`);
      const data = await res.json();
      if (data.report) setReport(data.report);
      setEmpty(Boolean(data.empty));
      setNote(data.generationError || "");
    } catch {
      setNote("تعذر تحميل التقرير الآن.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(false);
  }, []);

  return (
    <section className="rounded-lg border border-line bg-panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium">تقرير المشاكل والاقتراحات</h2>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="rounded-md border border-line px-3 py-1 text-xs hover:border-teal hover:text-teal transition-colors disabled:opacity-50 focus-ring"
        >
          {refreshing ? "جاري التحديث…" : "تحديث الآن"}
        </button>
      </div>

      {loading && <p className="text-sm text-muted">جاري التحميل…</p>}

      {!loading && empty && !report && (
        <p className="text-sm text-muted">لسه مفيش أي شكاوى أو اقتراحات وصلت.</p>
      )}

      {note && <p className="mb-3 text-xs text-danger">{note}</p>}

      {report && (
        <>
          <p className="mb-4 text-xs text-muted">
            آخر تحديث: {formatDate(report.generated_at)} — بناءً على {report.items_count} رسالة
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-line bg-panel2 p-3 text-sm whitespace-pre-wrap">
              {report.top_problems}
            </div>
            <div className="rounded-md border border-line bg-panel2 p-3 text-sm whitespace-pre-wrap">
              {report.top_suggestions}
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">التقرير بيتحدث تلقائيًا كل 3 أيام.</p>
        </>
      )}
    </section>
  );
}
