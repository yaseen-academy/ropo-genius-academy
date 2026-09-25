// Try the newest model first, then fall back to older ones if Google retires a name.
// This list is deliberately redundant so the assistant keeps working even if one
// model id gets deprecated before we update this file again.
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const CHAT_SYSTEM_INSTRUCTION = `You are the built-in learning assistant inside "Ropo Genius Academy", a coding course platform.
You help students while they study: explain coding concepts, debug code they paste or photograph, and answer
questions about what they're learning. Be encouraging, clear, and concise — the audience includes beginners.
If a student asks what AI model or company powers you, just say you're the course's built-in assistant — never
name any underlying AI provider or model.`;

async function callGeminiModel(model, apiKey, { systemInstruction, contents }) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    const err = new Error(`AI request failed: ${res.status} ${errText}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
}

async function callGemini({ systemInstruction, contents }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("AI assistant is not configured yet.");
  }

  let lastError;
  for (const model of GEMINI_MODELS) {
    try {
      return await callGeminiModel(model, apiKey, { systemInstruction, contents });
    } catch (err) {
      lastError = err;
      // Only move on to the next model name for "model not found / not supported"
      // style failures (404). Any other error (bad key, quota, etc.) should surface
      // immediately instead of retrying uselessly against every model name.
      if (err.status !== 404) throw err;
    }
  }
  throw lastError;
}

// messages: [{ role: "user" | "assistant", text, file?: { mimeType, data (base64) } }]
export async function askCourseAssistant(messages) {
  const contents = messages.map((m) => {
    const parts = [];
    if (m.text) parts.push({ text: m.text });
    if (m.file) parts.push({ inline_data: { mime_type: m.file.mimeType, data: m.file.data } });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const reply = await callGemini({ systemInstruction: CHAT_SYSTEM_INSTRUCTION, contents });
  return reply || "Sorry, I couldn't come up with an answer for that — try rephrasing.";
}

const FEEDBACK_SYSTEM_INSTRUCTION = `You analyze raw student feedback (complaints and suggestions) submitted to a
coding course platform called "Ropo Genius Academy". You will be given a numbered list of feedback entries, each
possibly in Arabic or English. Produce a concise report with exactly two sections:

1. "Top problems" — up to 10 bullet points, the most frequently reported or most serious issues. Merge duplicates
   and near-duplicates into one bullet with an approximate count in parentheses, e.g. "Video won't load on iPhone (x4)".
2. "Top suggestions" — up to 10 bullet points, the best or most common suggestions, same merging approach.

Write the report in Arabic (Egyptian, simple and clear), since that's the trainer's language. If there isn't enough
feedback for 10 items in a section, list fewer — never invent items that weren't submitted. If a section has zero
relevant items, write "لا يوجد" under it. Output plain text with the two headings "أبرز المشاكل" and "أفضل الاقتراحات",
no markdown symbols like # or **.`;

export async function summarizeFeedback(feedbackItems) {
  const numbered = feedbackItems
    .map((f, i) => `${i + 1}. ${f.message}`)
    .join("\n");

  const contents = [
    {
      role: "user",
      parts: [{ text: `Here are ${feedbackItems.length} feedback entries:\n\n${numbered}` }],
    },
  ];

  const reply = await callGemini({ systemInstruction: FEEDBACK_SYSTEM_INSTRUCTION, contents });
  return reply || "مقدرش ألخص الملاحظات دلوقتي — جرب تاني بعدين.";
}
