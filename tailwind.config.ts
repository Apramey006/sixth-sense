import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15110f",
        "ink-soft": "#6b625a",
        "ink-mute": "#8b8278",
        paper: "#f7f1e3",
        "paper-raised": "#fdfaf2",
        rule: "#e4dcc8",
        "rule-soft": "#efe8d6",
        accent: "#c5462b",
        "accent-soft": "#e07a5f",
        "accent-2": "#5f7a52",
        "accent-2-soft": "#88a079",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        warm: "0 1px 2px rgba(60, 40, 20, 0.05), 0 4px 12px rgba(80, 50, 25, 0.06)",
        "warm-lg": "0 2px 4px rgba(60, 40, 20, 0.06), 0 12px 28px rgba(80, 50, 25, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
