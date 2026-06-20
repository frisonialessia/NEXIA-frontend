// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · DETALLE DE ACTIVO
// Lecturas de sensores/actuadores y especificaciones de los velocímetros.
// Hoy se derivan del estado (simulado); el día del backend, llegan del sensor.
// ──────────────────────────────────────────────────────────────────────────

import { uni } from "../format";
import type { Estado, SistemaUnidades } from "../types";

export const MTBF = "182 h";
export const MTTR = "3.2 h";
export const PROX_MANTENIMIENTO = "próx. mantenimiento en 240h";

/** Factor de severidad según el estado (afecta temperatura, presión y RPM). */
export function factorEstado(estado: Estado): number {
  return estado === "CRITICAL_ALERT" ? 1.4 : estado === "WARNING_PROBATION" ? 1.15 : 1;
}

/** Estado de sensores y actuadores (algunos caen en alerta crítica). */
export function sensoresDe(estado: Estado): { n: string; ok: boolean }[] {
  const critico = estado === "CRITICAL_ALERT";
  return [
    { n: "Sensor vibración", ok: true },
    { n: "Sensor temp.", ok: true },
    { n: "Válvula entrada", ok: !critico },
    { n: "Motor principal", ok: true },
    { n: "Final de carrera", ok: true },
    { n: "Sensor presión", ok: !critico },
    { n: "Bomba lubricación", ok: true },
    { n: "Variador", ok: true },
  ];
}

export interface GaugeSpec {
  v: number;
  min: number;
  max: number;
  u: string;
}

/** Lecturas de los velocímetros (temperatura, presión, RPM) en el sistema dado. */
export function lecturasGauges(
  estado: Estado,
  sistema: SistemaUnidades
): { temp: GaugeSpec; pres: GaugeSpec; rpm: GaugeSpec } {
  const factor = factorEstado(estado);
  const t = uni("temp", sistema);
  const tBase = 58 * factor + Math.random() * 4;
  const p = uni("pres", sistema);
  const pBase = 4.2 * factor + Math.random() * 0.3;
  const rpm = 1450 / factor + Math.random() * 50;
  return {
    temp: { v: t.f(tBase), min: t.f(20), max: t.f(120), u: t.u },
    pres: { v: p.f(pBase), min: p.f(0), max: p.f(10), u: p.u },
    rpm: { v: rpm, min: 0, max: 3000, u: "rpm" },
  };
}
