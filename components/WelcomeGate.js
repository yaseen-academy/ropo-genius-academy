"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const COLORS = ["#F0A93C", "#3ECFB2", "#E5626B", "#6C8AE4", "#C77DFF", "#4CD07D"];

function launchConfetti() {
  const pieces = 60;
  for (let i = 0; i < pieces; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = `${Math.random() * 100}vw`;
    el.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

export default function WelcomeGate() {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("student");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    try {
      const done = window.localStorage.getItem("ca_welcome_done");
      if (!done) setVisible(true);
    } catch {
      // if storage is blocked, just skip the gate quietly
    }
  }, []);

  function finish() {
    try {
      window.localStorage.setItem("ca_welcome_done", "1");
      if (name) window.localStorage.setItem("ca_welcome_name", name);
    } catch {
      // ignore storage errors — not critical
    }
    document.documentElement.style.setProperty("--accent", color);
    setVisible(false);
    launchConfetti();
  }

  function handleSubmit(e) {
    e.preventDefault();
    finish();
  }

  if (!visible) return null;

  return (
    <div className="welcome-overlay">
      <form onSubmit={handleSubmit} className="welcome-card">
        <h2 className="text-xl font-semibold" style={{ color: "var(--accent)" }}>
          {t("welcomeTitle")}
        </h2>

        <div className="mt-5">
          <label className="mb-1 block text-xs text-muted">{t("welcomeName")}</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted">{t("welcomeAge")}</label>
          <input
            type="number"
            min="1"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm outline-none focus-ring"
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted">{t("welcomeRole")}</label>
          <div className="flex gap-2">
            {["student", "trainer"].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 rounded-md border py-2 text-sm transition-colors focus-ring"
                style={
                  role === r
                    ? { background: "var(--accent)", borderColor: "var(--accent)", color: "var(--c-ink)" }
                    : { borderColor: "var(--c-line)" }
                }
              >
                {r === "trainer" ? t("trainer") : t("student")}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted">{t("welcomeColor")}</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                aria-label={c}
                className={`color-swatch ${color === c ? "picked" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-md py-2.5 text-sm font-medium transition-opacity hover:opacity-90 focus-ring"
            style={{ background: "var(--accent)", color: "var(--c-ink)" }}
          >
            {t("continue")}
          </button>
          <button
            type="button"
            onClick={finish}
            className="rounded-md border border-line px-4 py-2.5 text-sm text-muted hover:text-text focus-ring"
          >
            {t("skip")}
          </button>
        </div>
      </form>
    </div>
  );
}
