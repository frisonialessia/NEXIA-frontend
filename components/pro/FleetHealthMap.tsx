"use client";

// ──────────────────────────────────────────────────────────────────────────
// MAPA DE SALUD DE LA FLOTA (NEXIA Pro)
// Cuadrícula heat: una fila por máquina, una celda por lectura reciente,
// coloreada por severidad (verde→ámbar→rojo). Estado de toda la planta de un
// vistazo, como los mapas hex/heat de las referencias. Datos reales del motor.
// ──────────────────────────────────────────────────────────────────────────

import { type ColorKey, RANK_ESTADO, mix, soft } from "@/lib/constants";
import { DESV_ESTANDAR } from "@/lib/engine/fsm";
import type { Maquina } from "@/lib/types";
import { SURFACE } from "./surface";

const COLUMNAS = 24;

/** Severidad de una lectura → token de color. */
function sevColor(v: number, exp: number): { key: ColorKey; intensidad: number } {
  const d = (v - exp) / DESV_ESTANDAR;
  if (d >= 3) return { key: "crit", intensidad: 90 };
  if (d >= 1.5) return { key: "warn", intensidad: 75 };
  return { key: "ok", intensidad: 38 };
}

export function FleetHealthMap({ maquinas }: { maquinas: Maquina[] }) {
  const orden = [...maquinas].sort((a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob);

  return (
    <div className={`${SURFACE} px-6 py-5`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Mapa de salud de la flota</h3>
        <div className="flex items-center gap-3 text-[11px] text-neutral-400">
          <Leyenda colorKey="ok" intensidad={38} label="Normal" />
          <Leyenda colorKey="warn" intensidad={75} label="Atención" />
          <Leyenda colorKey="crit" intensidad={90} label="Crítico" />
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
                {lecturas.map((l, i) => {
                  const { key, intensidad } = sevColor(l.v, l.exp);
                  return (
                    <span
                      key={i}
                      className="flex-1 rounded-sm transition-colors"
                      style={{ background: soft(key, intensidad) }}
                      title={`${l.v.toFixed(2)} (esperado ${l.exp.toFixed(2)})`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
        {orden.length === 0 && <p className="py-8 text-center text-sm text-neutral-400">Recopilando lecturas…</p>}
      </div>
    </div>
  );
}

function Leyenda({ colorKey, intensidad, label }: { colorKey: ColorKey; intensidad: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: mix(`var(--c-${colorKey})`, intensidad) }} />
      {label}
    </span>
  );
}
