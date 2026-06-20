import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Tokens semánticos (variables CSS): las clases text-brand/bg-ok/… se
        // adaptan solas al tema. Fuente única en app/globals.css.
        brand: "var(--c-brand)",
        ok: "var(--c-ok)",
        warn: "var(--c-warn)",
        crit: "var(--c-crit)",
      },
    },
  },
  plugins: [],
};
export default config;
