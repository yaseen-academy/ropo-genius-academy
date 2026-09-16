"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => setRows(data.leaderboard || []))
      .catch(() => setError(true));
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold">{isAr ? "لوحة الأوائل" : "Top students"}</h2>
        <p className="mt-2 text-sm text-muted">
          {isAr
            ? "بتتحسب من الالتزام بحل أسئلة الحصة والمشاهدة بسرعة بعد نزول الفيديو."
            : "Based on staying on top of lesson quizzes and watching videos soon after they're posted."}
        </p>
      </div>

      {error && (
        <p className="text-center text-sm text-muted">
          {isAr ? "التعذر تحميل اللوحة دلوقتي." : "Couldn't load the leaderboard right now."}
        </p>
      )}

      {!error && rows === null && (
        <p className="text-center text-sm text-muted">{isAr ? "جاري التحميل…" : "Loading…"}</p>
      )}

      {rows && rows.length === 0 && (
        <p className="text-center text-sm text-muted">
          {isAr
            ? "لسه مفيش نتايج كفاية — أول طلاب يحلوا امتحانات ويتفرجوا على الفيديوهات هيظهروا هنا."
            : "Not enough activity yet — the first students to take quizzes and watch lessons will show up here."}
        </p>
      )}

      {rows && rows.length > 0 && (
        <ol className="space-y-2">
          {rows.map((row, i) => (
            <li
              key={row.studentId}
              className="flex items-center gap-4 rounded-lg border border-line bg-panel px-4 py-3"
            >
              <span className="w-8 text-center text-lg">{MEDALS[i] || i + 1}</span>
              <span className="flex-1 font-medium">{row.name}</span>
              <span className="font-mono text-xs text-muted">
                {isAr ? `متوسط الامتحانات ${row.avgExamPercent}%` : `avg ${row.avgExamPercent}%`}
              </span>
              <span className="font-mono text-xs text-teal">{row.points} {isAr ? "نقطة" : "pts"}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
