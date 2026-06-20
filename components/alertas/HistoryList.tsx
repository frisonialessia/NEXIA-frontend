"use client";

// ──────────────────────────────────────────────────────────────────────────
// HISTORIAL DE FALLOS (cuerpo, sin cabecera de página)
// Registro de eventos con estado Pendiente/Resuelto. Comparte el flujo de
// alertas con la cola de auditoría.
// ──────────────────────────────────────────────────────────────────────────

import { col, soft } from "@/lib/constants";
import { useHistorial } from "@/lib/state/useFleet";
import { useTheme } from "@/lib/state/ThemeProvider";

export function HistoryList() {
  const historial = useHistorial();
  const { dark } = useTheme();

  if (historial.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
        Aún no hay eventos registrados. Aparecerán conforme el sistema detecte fallos.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {historial.map((a, i) => {
        const resuelto = a.estado === "Resuelto";
        const color = resuelto ? col("ok", dark) : col("crit", dark);
        const pill = resuelto
          ? { background: soft("ok"), color: col("ok", dark) }
          : { background: soft("warn"), color: col("warn", dark) };
        return (
          <div
            key={a.id}
            className={`flex items-center gap-4 px-6 py-4 ${i === historial.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
            <div className="min-w-0 flex-1">
              <span className="font-serif text-base">{a.maquina}</span>
              <p className="mt-0.5 truncate text-sm text-neutral-500">{a.causa}</p>
            </div>
            <div className="hidden text-right sm:block">
              <div className="font-mono text-xs text-neutral-500">
                {a.fecha} · {a.hora}
              </div>
            </div>
            <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide" style={pill}>
              {a.estado}
            </span>
          </div>
        );
      })}
    </div>
  );
}
