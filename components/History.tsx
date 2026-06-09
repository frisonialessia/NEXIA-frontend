"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 5 · HISTORIAL DE FALLOS
// Registro de eventos con estado Pendiente/Resuelto y botón de exportar.
// Los eventos llegan del mismo flujo de alertas: al auditar uno como atendido,
// aquí pasa a "Resuelto". Portado de renderHistory() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { toast } from "sonner";
import { col } from "@/lib/constants";
import { useFleet } from "@/lib/state/FleetProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { Icon } from "./ui/Icon";

export function History() {
  const { historial } = useFleet();
  const { dark } = useTheme();

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Registro de eventos</span>
          <div className="mt-2 flex items-end justify-between">
            <h1 className="font-serif text-3xl tracking-tight">Historial de fallos</h1>
            <button
              onClick={() => toast("En la versión real: exporta un PDF para llevar a la reunión.")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-300 dark:border-neutral-700"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              Exportar reporte
            </button>
          </div>
        </header>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {historial.length === 0 ? (
            <div className="px-8 py-16 text-center text-sm text-neutral-400">
              Aún no hay eventos registrados. Aparecerán conforme el sistema detecte fallos.
            </div>
          ) : (
            historial.map((a, i) => {
              const resuelto = a.estado === "Resuelto";
              const color = resuelto ? col("ok", dark) : col("crit", dark);
              const pill = resuelto
                ? { background: dark ? "#052e16" : "#f0fdf4", color: col("ok", dark) }
                : { background: dark ? "#451a03" : "#fffbeb", color: col("warn", dark) };
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-4 px-6 py-4 ${
                    i === historial.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"
                  }`}
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
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
                    style={pill}
                  >
                    {a.estado}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
