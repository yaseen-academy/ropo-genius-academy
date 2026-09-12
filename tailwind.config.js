/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--c-ink)",
        panel: "var(--c-panel)",
        panel2: "var(--c-panel2)",
        line: "var(--c-line)",
        amber: "var(--c-amber)",
        teal: "var(--c-teal)",
        text: "var(--c-text)",
        muted: "var(--c-muted)",
        danger: "var(--c-danger)",
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
