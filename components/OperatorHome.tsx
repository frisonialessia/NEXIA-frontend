"use client";

// ──────────────────────────────────────────────────────────────────────────
// INICIO · MODO OPERADOR
// Pantalla deliberadamente simple: responde "¿qué atiendo ahora?" de un
// vistazo. Sin ahorro, sin OEE, sin gráficas: estado claro y acción directa.
// Pensada para el operador en el taller, en el teléfono.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { ESTADOS, RANK_ESTADO, VERDES, col, estadoColor, mix } from "@/lib/constants";
import { ordenarFlota } from "@/lib/domain/flota";
import { SURFACE } from "./ui/Card";
import { useMaquinas } from "@/lib/state/useFleet";
import { useTheme } from "@/lib/state/ThemeProvider";
import { Icon } from "./ui/Icon";

export function OperatorHome() {
  const maquinas = useMaquinas();
  const { dark } = useTheme();

  const requierenAtencion = maquinas
    .filter((m) => m.estado !== "STABLE")
    .sort((a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob);
  const hayCriticas = requierenAtencion.some((m) => m.estado === "CRITICAL_ALERT");

  const orden = ordenarFlota(maquinas);

  // Banner principal: color y mensaje según la situación (verde/rojo).
  const sevC = hayCriticas ? col("crit") : requierenAtencion.length > 0 ? VERDES.oscuro : VERDES.medio;
  const banner = { bg: mix(sevC, 10), border: mix(sevC, 28), c: sevC };

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
            const ec = estadoColor(m.estado);
            const atender = m.estado !== "STABLE";
            return (
              <Link
                key={m.id}
                href={`/activo/${encodeURIComponent(m.id)}`}
                className={`${SURFACE} flex items-center gap-4 px-5 py-4 transition-shadow hover:shadow-md`}
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
            <div className={`${SURFACE} px-8 py-16 text-center text-sm text-neutral-400`}>
              Recopilando las primeras lecturas…
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
