"use client";

// ──────────────────────────────────────────────────────────────────────────
// FEED DE EVENTOS EN VIVO (NEXIA Pro)
// Línea de tiempo de la actividad de la planta (detecciones / resoluciones),
// estilo "Cluster Events". Se alimenta del mismo flujo de historial.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import type { EventoHistorial } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { SURFACE } from "./surface";

export function EventsFeed({ historial }: { historial: EventoHistorial[] }) {
  const eventos = historial.slice(0, 9);

  return (
    <div className={`${SURFACE} flex h-full flex-col px-6 py-5`}>
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: col("ok") }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: col("ok") }} />
        </span>
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Actividad en vivo</h3>
      </div>

      {eventos.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Icon name="check" className="h-7 w-7" style={{ color: col("ok") }} />
          <p className="mt-3 text-sm text-neutral-500">Sin eventos recientes.</p>
          <p className="mt-1 text-xs text-neutral-400">La actividad aparecerá aquí.</p>
        </div>
      ) : (
        <ol className="relative space-y-4 before:absolute before:left-[5px] before:top-1 before:h-full before:w-px before:bg-neutral-100 dark:before:bg-neutral-800">
          {eventos.map((e) => {
            const resuelto = e.estado === "Resuelto";
            const color = resuelto ? col("ok") : col("crit");
            return (
              <li key={e.id} className="relative flex gap-3 pl-0.5">
                <span className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white dark:ring-neutral-900" style={{ background: color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium">{e.maquina}</span>
                    <span className="shrink-0 font-mono text-[11px] text-neutral-400">{e.hora}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {resuelto ? "Evento resuelto · " : "Anomalía detectada · "}
                    {e.causa}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
