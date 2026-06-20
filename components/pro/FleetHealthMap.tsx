"use client";

// ──────────────────────────────────────────────────────────────────────────
// MAPA DE SALUD DE LA FLOTA (NEXIA Pro)
// Cuadrícula heat: una fila por máquina, una celda por lectura reciente,
// coloreada por severidad (verde→ámbar→rojo). Estado de toda la planta de un
// vistazo, como los mapas hex/heat de las referencias. Datos reales del motor.
// ──────────────────────────────────────────────────────────────────────────

import { type ColorKey, RANK_ESTADO, col } from "@/lib/constants";
import { DESV_ESTANDAR } from "@/lib/engine/fsm";
import type { Maquina } from "@/lib/types";
import { SURFACE } from "./surface";

const COLUMNAS = 24;

/** Severidad de una lectura → color sólido de la paleta. */
function sevKey(v: number, exp: number): ColorKey {
  const d = (v - exp) / DESV_ESTANDAR;
  if (d >= 3) return "crit";
  if (d >= 1.5) return "warn";
  return "ok";
}

export function FleetHealthMap({ maquinas }: { maquinas: Maquina[] }) {
  const orden = [...maquinas].sort((a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob);

  return (
    <div className={`${SURFACE} px-6 py-5`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Mapa de salud de la flota</h3>
          <p className="mt-1 text-[11px] text-neutral-400">Cada celda es una lectura de vibración; el color indica cuánto se desvía de lo esperado.</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <Leyenda colorKey="ok" label="Normal" />
          <Leyenda colorKey="warn" label="Atención" />
          <Leyenda colorKey="crit" label="Crítico" />
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
                    style={{ background: col(sevKey(l.v, l.exp)) }}
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

function Leyenda({ colorKey, label }: { colorKey: ColorKey; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: col(colorKey) }} />
      {label}
    </span>
  );
}
