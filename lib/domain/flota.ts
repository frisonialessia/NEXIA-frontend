// ──────────────────────────────────────────────────────────────────────────
// ORDEN DE LA FLOTA (estable)
// Ordena por criticidad de ESTADO (grueso) y luego por nombre. NO reordena por
// fluctuaciones de probabilidad: así las tarjetas no "saltan" cada 2s y la
// flota se mantiene estable y legible para el operador. Solo cambia el orden
// cuando una máquina cambia de estado (poco frecuente, por la histéresis).
// ──────────────────────────────────────────────────────────────────────────

import { RANK_ESTADO } from "../constants";
import type { Maquina } from "../types";

export function ordenarFlota(maquinas: Maquina[]): Maquina[] {
  return [...maquinas].sort(
    (a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || a.id.localeCompare(b.id, "es")
  );
}
