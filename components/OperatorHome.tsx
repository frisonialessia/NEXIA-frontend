"use client";

// ──────────────────────────────────────────────────────────────────────────
// INICIO · MODO OPERADOR
// Pantalla deliberadamente simple: responde "¿qué atiendo ahora?" de un
// vistazo. Sin ahorro, sin OEE, sin gráficas: estado claro y acción directa.
// Pensada para el operador en el taller, en el teléfono.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { ESTADOS, RANK_ESTADO, col, estadoColorKey, mix, soft } from "@/lib/constants";
import type { ColorKey } from "@/lib/constants";
import { useFleet } from "@/lib/state/FleetProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { Icon } from "./ui/Icon";

export function OperatorHome() {
  const { maquinas } = useFleet();
  const { dark } = useTheme();

  const requierenAtencion = maquinas
    .filter((m) => m.estado !== "STABLE")
    .sort((a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob);
  const hayCriticas = requierenAtencion.some((m) => m.estado === "CRITICAL_ALERT");

  const orden = [...maquinas].sort((a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob);

  // Banner principal: color y mensaje según la situación.
  const sevKey: ColorKey = hayCriticas ? "crit" : requierenAtencion.length > 0 ? "warn" : "ok";
  const banner = { bg: soft(sevKey, 10), border: soft(sevKey, 28), c: col(sevKey, dark) };

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Tu turno · en vivo</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">¿Qué atender ahora?</h1>
        </header>

        {/* Banner de situación */}
        <div className="mb-6 rounded-2xl border px-7 py-6" style={{ background: banner.bg, borderColor: banner.border }}>
          {requierenAtencion.length === 0 ? (
            <div className="flex items-center gap-4">
              <Icon name="check" className="h-8 w-8" style={{ color: banner.c }} />
              <div>
                <p className="font-serif text-2xl tracking-tight" style={{ color: banner.c }}>
                  Todo en orden
                </p>
                <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300">Ninguna máquina requiere acción. Buen turno.</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <Icon name="alert" className="h-5 w-5" style={{ color: banner.c }} />
                <p className="font-serif text-2xl tracking-tight" style={{ color: banner.c }}>
                  {requierenAtencion.length} {requierenAtencion.length === 1 ? "máquina requiere" : "máquinas requieren"} revisión
                </p>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                Revisa la más urgente primero. Si confirmas un problema, regístralo en Alertas.
              </p>
            </div>
          )}
        </div>

        {/* Lista de máquinas — objetivos grandes, fáciles de tocar */}
        <div className="space-y-2.5">
          {orden.map((m) => {
            const ec = col(estadoColorKey(m.estado), dark);
            const atender = m.estado !== "STABLE";
            return (
              <Link
                key={m.id}
                href={`/activo/${encodeURIComponent(m.id)}`}
                className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <span className="relative flex h-3 w-3 shrink-0">
                  {atender && <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: ec, opacity: 0.6 }} />}
                  <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: ec }} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-lg tracking-tight">{m.id}</div>
                  <div className="text-xs text-neutral-400">{m.sector}</div>
                </div>
                <span className="shrink-0 rounded-full px-3 py-1 text-xs font-medium" style={{ background: mix(ec), color: ec }}>
                  {atender ? "Revisar" : ESTADOS[m.estado]}
                </span>
              </Link>
            );
          })}
          {orden.length === 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
              Recopilando las primeras lecturas…
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
