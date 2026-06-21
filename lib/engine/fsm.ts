// ──────────────────────────────────────────────────────────────────────────
// MÁQUINA DE ESTADOS CON HISTÉRESIS (anti-flapping) + DETECCIÓN
// Lógica del dominio validada en la demo, portada a funciones puras y tipadas.
// No toca el DOM ni React: solo transforma datos. Esto la hace testeable y
// reutilizable el día que el motor viva en un backend.
//
// Detección: desviación de la vibración real respecto a la esperada → sigmoide
// que da la probabilidad de fallo. La FSM sube a crítico tras N=3 lecturas
// altas seguidas y baja a estable tras M=5 bajas, evitando el "parpadeo".
// ──────────────────────────────────────────────────────────────────────────

import { CAUSAS, UMBRAL_CRITICO } from "../constants";
import type { Estado, Maquina } from "../types";

/** Umbral de probabilidad a partir del cual una lectura se considera "alta". */
const PROB_ALTA = 0.6;
/** Desviación estándar asumida de la vibración (banda ±2σ). */
export const DESV_ESTANDAR = 0.5;

/**
 * Calcula la probabilidad de fallo (0.02..0.99) a partir de la desviación
 * entre el valor real y el esperado, vía sigmoide.
 */
export function probabilidadFallo(real: number, esperado: number): number {
  const desv = (real - esperado) / DESV_ESTANDAR;
  return Math.min(0.99, Math.max(0.02, 1 / (1 + Math.exp(-(desv - 3)))));
}

/**
 * Aplica una transición de la FSM dado el estado actual y si la lectura es alta.
 * Devuelve el nuevo estado y los contadores de histéresis actualizados.
 */
export function transicion(
  estado: Estado,
  cSube: number,
  cBaja: number,
  alto: boolean
): { estado: Estado; cSube: number; cBaja: number } {
  // Actualiza contadores de histéresis
  if (alto) {
    cSube += 1;
    cBaja = 0;
  } else {
    cBaja += 1;
    cSube = 0;
  }

  let siguiente: Estado = estado;
  switch (estado) {
    case "STABLE":
      if (alto) siguiente = "WARNING_PROBATION";
      break;
    case "WARNING_PROBATION":
      if (cSube >= 3) siguiente = "CRITICAL_ALERT";
      else if (cBaja >= 2) siguiente = "STABLE";
      break;
    case "CRITICAL_ALERT":
      if (!alto && cBaja >= 1) siguiente = "RECOVERY_PROBATION";
      break;
    case "RECOVERY_PROBATION":
      if (cBaja >= 5) siguiente = "STABLE";
      else if (alto) siguiente = "CRITICAL_ALERT";
      break;
  }

  return { estado: siguiente, cSube, cBaja };
}

/**
 * Proyección "días a fallo": (umbral − valor actual) / ritmo de degradación.
 * Devuelve Infinity si no degrada o no hay datos; 0 si ya superó el umbral.
 */
export function diasAFallo(m: Maquina): number {
  const last = m.hist[m.hist.length - 1];
  if (!last) return Infinity;
  const umbral = m.umbral ?? UMBRAL_CRITICO;
  if (last.v >= umbral) return 0;
  if (m.ritmoDia <= 0) return Infinity;
  return (umbral - last.v) / m.ritmoDia;
}

/** Indica si una lectura (por su probabilidad) cuenta como "alta". */
export function esAlta(prob: number): boolean {
  return prob >= PROB_ALTA;
}

/** Causa raíz por defecto (la más probable) para un tipo de máquina. */
export function causaPrincipal(tipo: Maquina["tipo"]): string {
  return (CAUSAS[tipo] || CAUSAS.bomba)[0];
}
