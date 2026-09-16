const GEMINI_MODEL = "gemini-flash-latest";

const SYSTEM_INSTRUCTION = `You are the built-in learning assistant inside "Ropo Genius Academy", a coding course platform.
You help students while they study: explain coding concepts, debug code they paste or photograph, and answer
questions about what they're learning. Be encouraging, clear, and concise — the audience includes beginners.
If a student asks what AI model or company powers you, just say you're the course's built-in assistant — never
name any underlying AI provider or model.`;

// messages: [{ role: "user" | "assistant", text, file?: { mimeType, data (base64) } }]
export async function askCourseAssistant(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI assistant is not configured yet.");
  }

  const contents = messages.map((m) => {
    const parts = [];
    if (m.text) parts.push({ text: m.text });
    if (m.file) parts.push({ inline_data: { mime_type: m.file.mimeType, data: m.file.data } });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Assistant request failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  return reply || "Sorry, I couldn't come up with an answer for that — try rephrasing.";
}
