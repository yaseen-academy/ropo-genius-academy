"use client";

import { ThemeProvider } from "@/lib/theme";
import { LangProvider } from "@/lib/i18n";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
