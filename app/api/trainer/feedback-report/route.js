import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";
import { summarizeFeedback } from "@/lib/gemini";

const REFRESH_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const MAX_ITEMS = 400; // keep the prompt a sane size

export async function GET(request) {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "true";

  const { data: latest } = await supabaseAdmin
    .from("feedback_reports")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isStale = !latest || Date.now() - new Date(latest.generated_at).getTime() > REFRESH_MS;

  if (!isStale && !force) {
    return NextResponse.json({ ok: true, report: latest, freshlyGenerated: false });
  }

  const { data: feedbackItems, error } = await supabaseAdmin
    .from("feedback")
    .select("id, message, created_at")
    .order("created_at", { ascending: false })
    .limit(MAX_ITEMS);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load feedback." }, { status: 500 });
  }

  if (!feedbackItems || feedbackItems.length === 0) {
    return NextResponse.json({ ok: true, report: latest || null, freshlyGenerated: false, empty: true });
  }

  try {
    const summary = await summarizeFeedback(feedbackItems);
    const [topProblems, topSuggestions] = splitReport(summary);

    const { data: saved, error: saveError } = await supabaseAdmin
      .from("feedback_reports")
      .insert({
        top_problems: topProblems,
        top_suggestions: topSuggestions,
        items_count: feedbackItems.length,
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return NextResponse.json({ ok: true, report: saved, freshlyGenerated: true });
  } catch (err) {
    console.error(err);
    // fall back to the last good report if generation fails
    return NextResponse.json({
      ok: true,
      report: latest || null,
      freshlyGenerated: false,
      generationError: "Couldn't refresh the report right now — showing the last one.",
    });
  }
}

function splitReport(text) {
  const marker = "أفضل الاقتراحات";
  const idx = text.indexOf(marker);
  if (idx === -1) return [text.trim(), ""];
  return [text.slice(0, idx).trim(), text.slice(idx).trim()];
}
