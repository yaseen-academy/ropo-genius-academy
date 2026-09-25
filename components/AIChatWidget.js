"use client";

import { useRef, useState } from "react";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result; // "data:image/png;base64,AAAA..."
      const base64 = String(result).split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // { mimeType, data, previewUrl, name }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  async function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("You can attach an image or a PDF.");
      return;
    }
    const data = await fileToBase64(file);
    setPendingFile({
      mimeType: file.type,
      data,
      name: file.name,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    });
  }

  async function send() {
    if (!input.trim() && !pendingFile) return;
    setError("");

    const userMessage = {
      role: "user",
      text: input.trim(),
      file: pendingFile ? { mimeType: pendingFile.mimeType, data: pendingFile.data } : undefined,
    };
    const displayMessage = { ...userMessage, previewUrl: pendingFile?.previewUrl, fileName: pendingFile?.name };

    const nextMessages = [...messages, userMessage];
    setMessages((prev) => [...prev, displayMessage]);
    setInput("");
    setPendingFile(null);
    setLoading(true);

    try {
      const res = await fetch("/api/student/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Temporary: show the underlying debug detail too, so we can diagnose
        // the root cause from the browser. Remove once the assistant is fixed.
        const msg = data.debug ? `${data.error || "Failed to get a reply."} [${data.debug}]` : (data.error || "Failed to get a reply.");
        throw new Error(msg);
      }
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open assistant chat"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-2xl shadow-lg transition-transform hover:scale-105 focus-ring"
        style={{ background: "var(--accent)", color: "var(--c-ink)" }}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[90vw] flex-col rounded-lg border border-line bg-panel shadow-2xl">
          <div className="border-b border-line px-4 py-3">
            <p className="text-sm font-medium">Ask about your lesson</p>
            <p className="text-xs text-muted">Ask anything, or attach a photo of your code.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-muted">
                Stuck on something? Ask here — you can also attach a screenshot or photo.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-teal text-ink" : "bg-panel2 text-text"
                  }`}
                >
                  {m.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.previewUrl} alt={m.fileName || "attachment"} className="mb-2 max-h-32 rounded" />
                  )}
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-muted">Thinking…</p>}
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          {pendingFile && (
            <div className="flex items-center gap-2 border-t border-line px-3 py-2 text-xs text-muted">
              📎 {pendingFile.name}
              <button onClick={() => setPendingFile(null)} className="ml-auto text-danger">
                Remove
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 border-t border-line p-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach image or PDF"
              className="rounded-md border border-line px-2.5 py-2 text-sm hover:border-amber focus-ring"
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFilePick}
              className="hidden"
            />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your question…"
              className="flex-1 resize-none rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
            />
            <button
              onClick={send}
              disabled={loading}
              className="rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 focus-ring"
              style={{ background: "var(--accent)", color: "var(--c-ink)" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
  }
