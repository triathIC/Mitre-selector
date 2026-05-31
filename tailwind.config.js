/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Archivo", "DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      colors: {
        surface: {
          DEFAULT: "#1a1a1e",
          elevated: "#242428",
          overlay: "#2c2c32",
        },
        accent: {
          critical: "#dc2626",
          high: "#ea580c",
          medium: "#ca8a04",
          low: "#2563eb",
          info: "#6b7280",
        },
        // scenario / shared design system (canonical)
        scn: {
          bg: "var(--bg)",
          "bg-2": "var(--bg-2)",
          "bg-3": "var(--bg-3)",
          raised: "var(--raised)",
          border: "var(--border)",
          "border-2": "var(--border-2)",
          text: "var(--text)",
          dim: "var(--dim)",
          faint: "var(--faint)",
          accent: "var(--accent)",
          "accent-soft": "var(--accent-soft)",
          "accent-line": "var(--accent-line)",
          tactic: "var(--tactic)",
          "m-theorized": "var(--m-theorized)",
          "m-static": "var(--m-static)",
          "m-lab": "var(--m-lab)",
          "m-field": "var(--m-field)",
        },
      },
    },
  },
  plugins: [],
};
