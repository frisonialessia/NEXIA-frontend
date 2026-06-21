"use client";

// ──────────────────────────────────────────────────────────────────────────
// HISTORIAL DE FALLOS (cuerpo) — sistema de diseño NEXIA
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { useT } from "@/lib/state/I18nProvider";
import { useHistorial } from "@/lib/state/useFleet";
import { SURFACE } from "../ui/Card";
import { Pill } from "../ui/Primitives";

export function HistoryList() {
  const historial = useHistorial();
  const t = useT();

  if (historial.length === 0) {
    return (
      <div className={`${SURFACE} px-8 py-16 text-center text-sm text-neutral-400`}>
        {t("hist.empty")}
      </div>
    );
  }

  return (
    <div className={`${SURFACE} overflow-hidden`}>
      {historial.map((a, i) => {
        const resuelto = a.estado === "Resuelto";
        return (
          <div
            key={a.id}
            className={`flex items-center gap-4 px-6 py-4 ${i === historial.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: col(resuelto ? "ok" : "crit") }} />
            <div className="min-w-0 flex-1">
              <span className="font-display text-base">{a.maquina}</span>
              <p className="mt-0.5 truncate text-sm text-neutral-500">{a.causa}</p>
            </div>
            <div className="hidden text-right sm:block">
              <div className="font-mono text-xs text-neutral-500">
                {a.fecha} · {a.hora}
              </div>
            </div>
            <Pill colorKey={resuelto ? "ok" : "crit"}>{resuelto ? t("hist.resolved") : t("hist.pending")}</Pill>
          </div>
        );
      })}
    </div>
  );
}
