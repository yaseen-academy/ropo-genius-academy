import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getServerSession } from "@/lib/getServerSession";

export async function POST() {
  const session = getServerSession();
  if (!session || session.role !== "trainer") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await supabaseAdmin.from("trainers").update({ locked_device_id: null }).eq("id", session.trainerId);

  return NextResponse.json({ ok: true });
}
