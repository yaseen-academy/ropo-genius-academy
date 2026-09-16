"use client";

import { useState } from "react";

function emptyDraft() {
  return { questionText: "", options: ["", "", "", ""], correctIndex: 0 };
}

export default function ExamQuestionsEditor({ examId, initialQuestions }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState(emptyDraft());
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function addQuestion(e) {
    e.preventDefault();
    if (!draft.questionText.trim() || draft.options.some((o) => !o.trim())) {
      setError("Fill in the question and all 4 options.");
      return;
    }
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/trainer/exam-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          questionText: draft.questionText,
          options: draft.options,
          correctIndex: draft.correctIndex,
          sortOrder: questions.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions((prev) => [...prev, data.question]);
      setDraft(emptyDraft());
    } catch (err) {
      setError(err.message || "Failed to add question.");
    } finally {
      setAdding(false);
    }
  }

  async function deleteQuestion(id) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    await fetch(`/api/trainer/exam-questions/${id}`, { method: "DELETE" }).catch(() => {});
  }

  return (
    <div>
      {questions.length === 0 && (
        <p className="mb-4 text-sm text-muted">No questions yet — add some below, or use a Google Form instead.</p>
      )}

      <div className="mb-5 space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-md border border-line bg-panel2 p-3 text-sm">
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="font-medium">
                {i + 1}. {q.question_text}
              </p>
              <button onClick={() => deleteQuestion(q.id)} className="shrink-0 text-xs text-danger hover:underline">
                Delete
              </button>
            </div>
            <ul className="space-y-1 text-xs text-muted">
              {q.options.map((opt, idx) => (
                <li key={idx} className={idx === q.correct_index ? "text-teal" : ""}>
                  {idx === q.correct_index ? "✓ " : "• "}
                  {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form onSubmit={addQuestion} className="rounded-md border border-dashed border-line p-4">
        <p className="mb-3 text-sm font-medium">Add a question</p>
        <input
          value={draft.questionText}
          onChange={(e) => setDraft((d) => ({ ...d, questionText: e.target.value }))}
          placeholder="Question text"
          className="mb-2 w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
        />
        {draft.options.map((opt, idx) => (
          <div key={idx} className="mb-2 flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={draft.correctIndex === idx}
              onChange={() => setDraft((d) => ({ ...d, correctIndex: idx }))}
              aria-label={`Option ${idx + 1} is correct`}
            />
            <input
              value={opt}
              onChange={(e) => {
                const next = [...draft.options];
                next[idx] = e.target.value;
                setDraft((d) => ({ ...d, options: next }));
              }}
              placeholder={`Option ${idx + 1}`}
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm outline-none focus-ring"
            />
          </div>
        ))}
        {error && <p className="mb-2 text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={adding}
          className="rounded-md bg-teal px-4 py-2 text-sm font-medium text-ink hover:opacity-90 disabled:opacity-50 focus-ring"
        >
          {adding ? "Adding…" : "Add question"}
        </button>
      </form>
    </div>
  );
}
