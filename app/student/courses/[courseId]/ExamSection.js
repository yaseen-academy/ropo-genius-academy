"use client";

import { useEffect, useState } from "react";

export default function ExamSection({ examId }) {
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/student/exam/${examId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError("Couldn't load the exam."));
  }, [examId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!data || Object.keys(answers).length < data.questions.length) {
      setError("Answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/student/exam/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json);
    } catch (err) {
      setError(err.message || "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) {
    return error ? <p className="text-sm text-danger">{error}</p> : <p className="text-sm text-muted">Loading exam…</p>;
  }

  if (data.questionCount === 0) return null; // no manual questions — trainer likely uses a Google Form instead

  return (
    <div className="mt-8 rounded-lg border border-line bg-panel p-5">
      <h2 className="mb-1 text-lg font-medium">{data.examTitle || "Exam"}</h2>
      <p className="mb-4 text-sm text-muted">
        {data.attemptsUsed}/{data.maxAttempts} attempts used
        {data.pastAttempts.length > 0 && (
          <>
            {" — "}
            best score: {Math.max(...data.pastAttempts.map((a) => a.score))}/{data.pastAttempts[0].total_questions}
          </>
        )}
      </p>

      {result && (
        <div className="mb-4 rounded-md border border-teal/40 bg-teal/10 p-4 text-sm text-teal">
          Scored {result.score}/{result.total} on attempt {result.attemptNumber}.
          {result.attemptsRemaining > 0
            ? ` You have ${result.attemptsRemaining} attempt left.`
            : " That was your last attempt."}
        </div>
      )}

      {!result && data.attemptsRemaining === 0 && (
        <p className="text-sm text-muted">You've used all your attempts for this exam.</p>
      )}

      {!result && data.attemptsRemaining > 0 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {data.questions.map((q, i) => (
            <div key={q.id}>
              <p className="mb-2 text-sm font-medium">
                {i + 1}. {q.question_text}
              </p>
              <div className="space-y-1">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
          >
            {submitting ? "Submitting…" : "Submit answers"}
          </button>
        </form>
      )}
    </div>
  );
}
