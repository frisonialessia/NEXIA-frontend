"use client";

// ──────────────────────────────────────────────────────────────────────────
// MAPA DE SALUD DE LA FLOTA (NEXIA Pro)
// Cuadrícula heat: una fila por máquina, una celda por lectura reciente.
// Color por severidad: TONOS DE VERDE cuando está sano (más claro = más sano,
// más oscuro = más cerca de la alerta) y ROJO solo cuando es crítico.
// ──────────────────────────────────────────────────────────────────────────

import { VERDES, col } from "@/lib/constants";
import { ordenarFlota } from "@/lib/domain/flota";
import { DESV_ESTANDAR } from "@/lib/engine/fsm";
import type { Maquina } from "@/lib/types";
import { SURFACE } from "./surface";

const COLUMNAS = 24;
const ROJO = col("crit");

/** Severidad de una lectura → color (verdes graduados + rojo si es crítico). */
function sevColor(v: number, exp: number): string {
  const d = (v - exp) / DESV_ESTANDAR;
  if (d >= 3) return ROJO; // crítico
  if (d >= 1.5) return VERDES.oscuro; // cerca de alerta
  if (d >= 0.5) return VERDES.medio; // normal
  return VERDES.claro; // muy sano
}

export function FleetHealthMap({ maquinas }: { maquinas: Maquina[] }) {
  const orden = ordenarFlota(maquinas);

  return (
    <div className={`${SURFACE} px-6 py-5`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Mapa de salud de la flota</h3>
          <p className="mt-1 text-[11px] text-neutral-400">Cada celda es una lectura de vibración; el color indica cuánto se desvía de lo esperado.</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <Leyenda color={VERDES.claro} label="Muy sano" />
          <Leyenda color={VERDES.medio} label="Normal" />
          <Leyenda color={VERDES.oscuro} label="Vigilar" />
          <Leyenda color={ROJO} label="Crítico" />
        </div>
      </div>

      <div className="space-y-1.5">
        {orden.map((m) => {
          const lecturas = m.hist.slice(-COLUMNAS);
          const faltan = COLUMNAS - lecturas.length;
          return (
            <div key={m.id} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-300" title={m.id}>
                {m.id}
              </span>
              <div className="flex h-5 flex-1 gap-0.5">
                {Array.from({ length: faltan }).map((_, i) => (
                  <span key={`e${i}`} className="flex-1 rounded-sm bg-neutral-100 dark:bg-neutral-800/60" />
                ))}
                {lecturas.map((l, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-sm transition-colors"
                    style={{ background: sevColor(l.v, l.exp) }}
                    title={`${l.v.toFixed(2)} (esperado ${l.exp.toFixed(2)})`}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {orden.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Recopilando lecturas…</p>}
      </div>
    </div>
  );
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
