// ──────────────────────────────────────────────────────────────────────────
// FORMATEO Y CONVERSIÓN DE UNIDADES
// Traduce un valor base (SI) al sistema activo (métrico/imperial) y da el
// símbolo de unidad correspondiente. Lógica pura: recibe el sistema, no lo lee
// de ningún estado global.
// ──────────────────────────────────────────────────────────────────────────

import { UNIDADES } from "./constants";
import type { Magnitud, SistemaUnidades, Unidad } from "./types";

/** Devuelve la unidad (símbolo + conversor) de una magnitud en el sistema dado. */
export function uni(mag: Magnitud, sistema: SistemaUnidades): Unidad {
  return UNIDADES[mag][sistema === "metrico" ? "m" : "i"];
}

/** Convierte un valor base (SI) al sistema dado. */
export function convertir(valor: number, mag: Magnitud, sistema: SistemaUnidades): number {
  return uni(mag, sistema).f(valor);
}

/** Formatea un número como moneda en dólares con separador de miles. */
export function dinero(n: number): string {
  return "$" + n.toLocaleString("es-ES");
}

/** Formatea un porcentaje 0..1 como entero con signo %. */
export function porcentaje(p: number): string {
  return Math.round(p * 100) + "%";
}
