"use client";

// ──────────────────────────────────────────────────────────────────────────
// I18N · proveedor de idioma + función de traducción
// `t(clave, vars?)` busca en el idioma activo, cae a inglés (fuente) y, si no
// existe, devuelve la propia clave. Idioma persistido en el navegador.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { IDIOMAS_ACTIVOS, IDIOMA_POR_DEFECTO, type Idioma } from "../i18n/config";
import { MESSAGES } from "../i18n/messages";

const CLAVE = "nexia-idioma";

type Vars = Record<string, string | number>;

interface I18nCtx {
  idioma: Idioma;
  setIdioma: (i: Idioma) => void;
  t: (clave: string, vars?: Vars) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [idioma, setIdiomaState] = useState<Idioma>(IDIOMA_POR_DEFECTO);

  useEffect(() => {
    const v = localStorage.getItem(CLAVE);
    if (v && IDIOMAS_ACTIVOS.includes(v as Idioma)) setIdiomaState(v as Idioma);
  }, []);

  const setIdioma = useCallback((i: Idioma) => {
    setIdiomaState(i);
    localStorage.setItem(CLAVE, i);
  }, []);

  const t = useCallback(
    (clave: string, vars?: Vars) => {
      const dict = MESSAGES[idioma] ?? MESSAGES.en ?? {};
      let s = dict[clave] ?? MESSAGES.en?.[clave] ?? clave;
      if (vars) for (const [k, val] of Object.entries(vars)) s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(val));
      return s;
    },
    [idioma]
  );

  const value = useMemo<I18nCtx>(() => ({ idioma, setIdioma, t }), [idioma, setIdioma, t]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  return ctx;
}

/** Atajo: solo la función de traducción. */
export function useT() {
  return useI18n().t;
}
