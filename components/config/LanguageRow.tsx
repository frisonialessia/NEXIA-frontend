"use client";

// ──────────────────────────────────────────────────────────────────────────
// FILA DE IDIOMA (reutilizable: Ajustes y Perfil)
// Cambia el idioma de la interfaz al instante. Solo muestra los idiomas activos.
// ──────────────────────────────────────────────────────────────────────────

import { IDIOMAS_ACTIVOS, IDIOMA_NOMBRE, type Idioma } from "@/lib/i18n/config";
import { useI18n, useT } from "@/lib/state/I18nProvider";

export function LanguageRow() {
  const { idioma, setIdioma } = useI18n();
  const t = useT();
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm">{t("lang.title")}</div>
        <div className="text-xs text-neutral-400">{t("lang.desc")}</div>
      </div>
      <select
        value={idioma}
        onChange={(e) => setIdioma(e.target.value as Idioma)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
      >
        {IDIOMAS_ACTIVOS.map((i) => (
          <option key={i} value={i}>
            {IDIOMA_NOMBRE[i]}
          </option>
        ))}
      </select>
    </div>
  );
}
