/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0D1117",
        panel: "#141B26",
        panel2: "#1B2330",
        line: "#2A3444",
        amber: "#F0A93C",
        teal: "#3ECFB2",
        text: "#E9EAEC",
        muted: "#8B96A8",
        danger: "#E5626B",
      },
      fontFamily: {
        sans: ["Sora", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
