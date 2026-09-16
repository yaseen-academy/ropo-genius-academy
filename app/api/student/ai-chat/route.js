import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/getServerSession";
import { askCourseAssistant } from "@/lib/gemini";

const MAX_FILE_BYTES = 6 * 1024 * 1024; // ~6MB, generous for a photo of code/notes

export async function POST(request) {
  const session = getServerSession();
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const last = body.messages[body.messages.length - 1];
  if (last.file) {
    const approxBytes = (last.file.data?.length || 0) * 0.75;
    if (approxBytes > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "That file is too large. Try a smaller image." }, { status: 400 });
    }
  }

  try {
    const reply = await askCourseAssistant(body.messages);
    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "The assistant is unavailable right now — try again in a bit." },
      { status: 502 }
    );
  }
}
