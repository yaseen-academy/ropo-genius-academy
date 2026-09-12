"use client";

import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";

export default function SiteToggles() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle day/night theme"
        className="rounded-md border border-line px-2.5 py-2 text-sm hover:border-amber focus-ring"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <button
        type="button"
        onClick={() => setLang(lang === "ar" ? "en" : "ar")}
        aria-label="Toggle language"
        className="rounded-md border border-line px-2.5 py-2 text-sm hover:border-amber focus-ring"
      >
        🌐 {lang === "ar" ? "EN" : "AR"}
      </button>
    </div>
  );
}
