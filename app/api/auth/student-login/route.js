import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { signSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(request) {
  const { name, code } = await request.json();

  if (!name || !code) {
    return NextResponse.json({ error: "Name and code are required." }, { status: 400 });
  }

  const cleanCode = code.trim().toUpperCase();

  const { data: accessCode, error: codeError } = await supabaseAdmin
    .from("access_codes")
    .select("id, course_id, used_by_student")
    .eq("code", cleanCode)
    .maybeSingle();

  if (codeError || !accessCode) {
    return NextResponse.json({ error: "This code is not valid." }, { status: 401 });
  }

  // Find or create the student record. The student is identified by name + this code
  // so the same person always lands on the same account when they log back in.
  let { data: student } = await supabaseAdmin
    .from("students")
    .select("id, name")
    .eq("access_code", cleanCode)
    .maybeSingle();

  if (!student) {
    const { data: created, error: createError } = await supabaseAdmin
      .from("students")
      .insert({ name, access_code: cleanCode })
      .select("id, name")
      .single();

    if (createError) {
      return NextResponse.json({ error: "Could not create student account." }, { status: 500 });
    }
    student = created;

    await supabaseAdmin
      .from("access_codes")
      .update({ used_by_student: student.id })
      .eq("id", accessCode.id);
  }

  // Make sure the enrollment for this code's course exists.
  await supabaseAdmin
    .from("enrollments")
    .upsert(
      {
        student_id: student.id,
        course_id: accessCode.course_id,
        access_code_id: accessCode.id,
      },
      { onConflict: "student_id,course_id" }
    );

  const token = signSession({ role: "student", studentId: student.id, name: student.name });

  const res = NextResponse.json({ ok: true, student: { id: student.id, name: student.name } });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
