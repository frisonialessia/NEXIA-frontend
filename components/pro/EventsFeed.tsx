"use client";

// ──────────────────────────────────────────────────────────────────────────
// FEED DE EVENTOS EN VIVO (NEXIA Pro)
// Línea de tiempo de la actividad sobre el modelo de dominio `Evento`:
// detecciones y resoluciones, con datos precisos (probabilidad, detalle, hora).
// Altura natural con scroll propio.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { useT } from "@/lib/state/I18nProvider";
import type { Evento } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { SURFACE } from "./surface";

export function EventsFeed({ eventos }: { eventos: Evento[] }) {
  const t = useT();
  const lista = eventos.slice(0, 12);

  return (
    <div className={`${SURFACE} flex flex-col px-5 py-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: col("ok") }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: col("ok") }} />
          </span>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{t("events.liveActivity")}</h3>
        </div>
        {lista.length > 0 && <span className="font-mono text-[11px] text-neutral-400">{eventos.length}</span>}
      </div>

      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Icon name="check" className="h-7 w-7" style={{ color: col("ok") }} />
          <p className="mt-3 text-sm text-neutral-500">{t("events.none")}</p>
          <p className="mt-1 text-xs text-neutral-400">{t("events.willAppear")}</p>
        </div>
      ) : (
        <ol className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {lista.map((e) => {
            const esResolucion = e.tipo === "resolucion";
            const color = esResolucion ? col("ok") : col("crit");
            return (
              <li key={e.id} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{e.maquina}</span>
                    <span className="shrink-0 font-mono text-[11px] text-neutral-400">{e.hora}</span>
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color }}>
                    {esResolucion ? t("events.resolved") : `${t("events.anomaly")}${e.prob ? ` · ${t("events.probSuffix", { n: Math.round(e.prob * 100) })}` : ""}`}
                  </p>
                  <p className="truncate text-[11px] text-neutral-400">{e.detalle}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
