// ──────────────────────────────────────────────────────────────────────────
// ORDEN DE LA FLOTA (estable)
// Ordena por criticidad de ESTADO (grueso) y luego por nombre. NO reordena por
// fluctuaciones de probabilidad: así las tarjetas no "saltan" cada 2s y la
// flota se mantiene estable y legible para el operador. Solo cambia el orden
// cuando una máquina cambia de estado (poco frecuente, por la histéresis).
// ──────────────────────────────────────────────────────────────────────────

import { CALIBRACION_TICKS, COSTO_HORA_PARADA, HORAS_PARADA_TIPICA, RANK_CRITICIDAD, RANK_ESTADO } from "../constants";
import { zonaDe, zonasISO, type ZonaISO } from "../engine/iso";
import type { Maquina, MaquinaSeed } from "../types";

/** Rango de criticidad de un activo (0 = más prioritaria). Sin definir = media. */
export const rankCriticidad = (m: Maquina): number => RANK_CRITICIDAD[m.criticidad ?? "media"];

/** Zona ISO 10816 actual de una máquina, o null si no declara potencia. */
export function zonaISOActiva(m: Maquina): ZonaISO | null {
  if (!m.potenciaKw || m.potenciaKw <= 0) return null;
  const last = m.hist[m.hist.length - 1];
  return zonaDe(last ? last.v : m.expected, zonasISO(m.potenciaKw));
}

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
    (a, b) =>
      RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] ||
      rankCriticidad(a) - rankCriticidad(b) ||
      a.id.localeCompare(b.id, "es")
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
  // Tras el grupo y el orden manual del usuario, la criticidad ordena lo que el
  // usuario no arrastró (ambos idx = MAX); el arrastre explícito siempre manda.
  return [...maquinas].sort(
    (a, b) =>
      grupo(a) - grupo(b) ||
      idx(a.id) - idx(b.id) ||
      rankCriticidad(a) - rankCriticidad(b) ||
      a.id.localeCompare(b.id, "es")
  );
}
