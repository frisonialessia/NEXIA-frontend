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
        // Paleta semántica de marca (los 4 estados base). Para color dinámico
        // por estado se usa la función col() con estilos en línea; estas clases
        // están disponibles para usos estáticos.
        brand: "#3b82f6",
        ok: "#10b981",
        warn: "#eab308",
        crit: "#ef4444",
      },
    },
  },
  plugins: [],
};
export default config;
