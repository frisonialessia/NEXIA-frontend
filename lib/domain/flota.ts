// ──────────────────────────────────────────────────────────────────────────
// ORDEN DE LA FLOTA (estable)
// Ordena por criticidad de ESTADO (grueso) y luego por nombre. NO reordena por
// fluctuaciones de probabilidad: así las tarjetas no "saltan" cada 2s y la
// flota se mantiene estable y legible para el operador. Solo cambia el orden
// cuando una máquina cambia de estado (poco frecuente, por la histéresis).
// ──────────────────────────────────────────────────────────────────────────

import { CALIBRACION_TICKS, COSTO_HORA_PARADA, HORAS_PARADA_TIPICA, RANK_ESTADO } from "../constants";
import type { Maquina, MaquinaSeed } from "../types";

/** Ahorro de evitar una parada de ESTA máquina (costo/hora propio o global). */
export function ahorroDe(m: Maquina | MaquinaSeed): number {
  return (m.costoParadaHora ?? COSTO_HORA_PARADA) * HORAS_PARADA_TIPICA;
}

/** ¿La máquina aún está aprendiendo su baseline (no juzga todavía)? */
export const estaCalibrando = (m: Maquina): boolean => m.calib > 0;

/** Progreso de calibración 0..1 (1 = lista para monitorear). */
export const progresoCalibracion = (m: Maquina): number =>
  Math.min(1, Math.max(0, 1 - m.calib / CALIBRACION_TICKS));

export function ordenarFlota(maquinas: Maquina[]): Maquina[] {
  return [...maquinas].sort(
    (a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || a.id.localeCompare(b.id, "es")
  );
}

/**
 * Orden con preferencias del usuario (arrastre + fijar). Precedencia:
 *  1. Críticas (siempre arriba — lo urgente nunca se esconde)
 *  2. Fijadas (pin del usuario)
 *  3. El resto, en el orden que el usuario armó arrastrando (`orden`)
 */
export function ordenarConPreferencias(maquinas: Maquina[], orden: string[], pins: string[]): Maquina[] {
  const pinSet = new Set(pins);
  const idx = (id: string) => {
    const i = orden.indexOf(id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const grupo = (m: Maquina) => (m.estado === "CRITICAL_ALERT" ? 0 : pinSet.has(m.id) ? 1 : 2);
  return [...maquinas].sort(
    (a, b) => grupo(a) - grupo(b) || idx(a.id) - idx(b.id) || a.id.localeCompare(b.id, "es")
  );
}
