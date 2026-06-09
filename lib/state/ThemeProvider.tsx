"use client";

// ──────────────────────────────────────────────────────────────────────────
// TEMA CLARO / OSCURO
// Aplica la clase `dark` al <html> (estrategia de Tailwind darkMode:'class').
// Modo claro por defecto, con persistencia en localStorage. Expone {dark,toggle}
// para que el Nav, los Ajustes y los gráficos sepan en qué modo están.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface ThemeCtx {
  dark: boolean;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

const CLAVE = "nexia-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  // Al montar, lee la preferencia guardada y la aplica al documento.
  useEffect(() => {
    const guardado = localStorage.getItem(CLAVE);
    const inicial = guardado === "dark";
    setDark(inicial);
    document.documentElement.classList.toggle("dark", inicial);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const siguiente = !prev;
      document.documentElement.classList.toggle("dark", siguiente);
      localStorage.setItem(CLAVE, siguiente ? "dark" : "light");
      return siguiente;
    });
  }, []);

  return <Ctx.Provider value={{ dark, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
