// ──────────────────────────────────────────────────────────────────────────
// EXPLICABILIDAD DE ALERTAS
// Traduce la lectura que disparó una alerta a una explicación entendible: cuánto
// se desvió de lo normal, si superó el umbral de fallo y por qué confiamos en
// ella (histéresis anti-falsa-alarma). El "porqué", nunca una caja negra.
// ──────────────────────────────────────────────────────────────────────────

import { DESV_ESTANDAR } from "../engine/fsm";
import type { Alerta } from "../types";

/** Nº de lecturas altas consecutivas que confirman una alerta (ver FSM). */
export const LECTURAS_CONFIRMACION = 3;

export interface ExplicacionAlerta {
  /** vibración real (valor base) */
  vib: number;
  /** vibración esperada (valor base) */
  exp: number;
  /** umbral crítico (valor base) */
  umbral: number;
  /** % por encima de lo esperado */
  desviacionPct: number;
  /** desviación en número de sigmas (banda esperada) */
  sigmas: number;
  /** ¿superó el umbral de fallo? */
  sobreUmbral: boolean;
}

export function explicarAlerta(a: Alerta): ExplicacionAlerta {
  const delta = a.vib - a.exp;
  return {
    vib: a.vib,
    exp: a.exp,
    umbral: a.umbral,
    desviacionPct: a.exp > 0 ? Math.round((delta / a.exp) * 100) : 0,
    sigmas: +(delta / DESV_ESTANDAR).toFixed(1),
    sobreUmbral: a.vib >= a.umbral,
  };
}
