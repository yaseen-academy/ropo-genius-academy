import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { generateCode } from "@/lib/generateCode";

export const maxDuration = 60;

export async function POST(request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token && verifySession(token);
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { courseId, quantity } = await request.json();
  const allowedQuantities = [100, 500, 1000, 5000];
  if (!courseId || !allowedQuantities.includes(quantity)) {
    return NextResponse.json({ error: "Invalid course or quantity." }, { status: 400 });
  }

  const batchLabel = `${quantity} codes — ${new Date().toISOString().slice(0, 10)}`;
  const rows = Array.from({ length: quantity }, () => ({
    code: generateCode(),
    course_id: courseId,
    trainer_id: session.trainerId,
    batch_label: batchLabel,
  }));

  // Insert in chunks to stay well under request size limits.
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabaseAdmin.from("access_codes").insert(chunk);
    if (error) {
      return NextResponse.json({ error: "Failed to generate codes." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, count: rows.length, batchLabel, codes: rows.map((r) => r.code) });
}
