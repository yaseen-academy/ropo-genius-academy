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
