import { supabaseAdmin } from "@/lib/supabaseAdmin";
import LandingContent from "@/components/LandingContent";

async function getCourses() {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("id, title, description, price, cover_color, lessons(count)")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export default async function LandingPage() {
  const courses = await getCourses();
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201116675681";
  const vodafoneCash = process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || "01116675681";

  return <LandingContent courses={courses} whatsapp={whatsapp} vodafoneCash={vodafoneCash} />;
}
