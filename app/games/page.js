"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import SiteToggles from "@/components/SiteToggles";

const RESOURCES = [
  {
    href: "https://monkeytype.com/",
    title: { en: "Monkeytype", ar: "Monkeytype" },
    desc: {
      en: "A clean, fast typing test — great for building keyboard speed and accuracy.",
      ar: "اختبار كتابة سريع وبسيط — ممتاز عشان تزوّد سرعتك ودقتك على الكيبورد.",
    },
    tag: { en: "Typing speed", ar: "سرعة الكتابة" },
  },
  {
    href: "https://www.typing.com/",
    title: { en: "Typing.com", ar: "Typing.com" },
    desc: {
      en: "Structured typing lessons for beginners, from letter keys to full sentences.",
      ar: "دروس كتابة متدرجة للمبتدئين، من الحروف لحد الجمل الكاملة.",
    },
    tag: { en: "Typing lessons", ar: "دروس كتابة" },
  },
  {
    href: "https://scratch.mit.edu/",
    title: { en: "Scratch", ar: "Scratch" },
    desc: {
      en: "Drag-and-drop programming by MIT — build games and animations while learning logic.",
      ar: "برمجة بالسحب والإفلات من MIT — اعمل ألعاب ورسوم متحركة وانت بتتعلم أساسيات المنطق البرمجي.",
    },
    tag: { en: "Coding for beginners", ar: "برمجة للمبتدئين" },
  },
  {
    href: "https://codecombat.com/",
    title: { en: "CodeCombat", ar: "CodeCombat" },
    desc: {
      en: "Learn real code (Python/JavaScript) by playing through game levels.",
      ar: "اتعلم كود حقيقي (Python/JavaScript) وانت بتلعب مراحل لعبة.",
    },
    tag: { en: "Coding game", ar: "لعبة برمجة" },
  },
];

export default function GamesPage() {
  const { t, lang } = useLang();

  return (
    <main>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-mono text-sm" style={{ color: "var(--accent)" }}>
            code_academy
          </Link>
          <SiteToggles />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold">{t("gamesTitle")}</h1>
        <p className="mt-3 max-w-xl text-muted">{t("gamesBody")}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {RESOURCES.map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col rounded-lg border border-line bg-panel p-5 transition-colors hover:border-teal"
            >
              <span className="mb-2 inline-block w-fit rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                {r.tag[lang] || r.tag.en}
              </span>
              <h3 className="text-lg font-medium">{r.title[lang] || r.title.en}</h3>
              <p className="mt-2 text-sm text-muted">{r.desc[lang] || r.desc.en}</p>
              <span className="mt-4 text-sm text-teal">
                {lang === "ar" ? "افتح الموقع ←" : "Open site →"}
              </span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
