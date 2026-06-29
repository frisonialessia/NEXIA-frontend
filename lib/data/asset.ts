// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · DETALLE DE ACTIVO
// Lecturas de sensores/actuadores y especificaciones de los velocímetros.
// Hoy se derivan del estado (simulado); el día del backend, llegan del sensor.
// ──────────────────────────────────────────────────────────────────────────

import { PERFIL_TELEMETRIA } from "../constants";
import { uni } from "../format";
import type { Estado, Maquina, SistemaUnidades, Telemetria } from "../types";

// ── Salud del enlace (gateway + sensor) ─────────────────────────────────────
// Que el comprador vea que el dato es REAL y FRESCO: cuándo llegó la última
// lectura, fuerza de señal, batería del sensor, frecuencia de muestreo y
// latencia. Hoy se derivan del estado (señal/batería estables por máquina vía
// hash; frescura desde la última lectura). Con backend real → telemetría del
// gateway.

export interface SaludEnlace {
  online: boolean;
  /** segundos desde la última lectura recibida */
  ultimaLecturaSeg: number;
  /** fuerza de señal 0..100 (RSSI) */
  senalPct: number;
  /** batería del sensor 0..100 */
  bateriaPct: number;
  /** frecuencia de muestreo en Hz */
  muestreoHz: number;
  /** latencia de extremo a extremo en ms */
  latenciaMs: number;
}

/** Hash determinista 0..1 a partir de una cadena (estable entre renders). */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Salud del enlace de una máquina (telemetría del pipeline de datos). */
export function saludEnlace(m: Maquina): SaludEnlace {
  const last = m.hist[m.hist.length - 1];
  const ultimaLecturaSeg = last ? Math.max(0, Math.round((Date.now() - last.t) / 1000)) : 0;
  return {
    online: ultimaLecturaSeg < 10,
    ultimaLecturaSeg,
    senalPct: 80 + Math.round(hash01(m.id) * 19), // 80..99, estable por máquina
    bateriaPct: 55 + Math.round(hash01(m.id + "·bat") * 44), // 55..99
    muestreoHz: [1, 2, 5][Math.floor(hash01(m.id + "·hz") * 3)],
    latenciaMs: 20 + Math.round(hash01(m.id + "·lat") * 90), // 20..110 ms
  };
}

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

/** Telemetría de respaldo (base SI, perfil real por tipo) si la máquina aún no
 *  tiene lecturas. */
function telemetriaRespaldo(m: Maquina): Telemetria {
  const f = factorEstado(m.estado);
  const p = PERFIL_TELEMETRIA[m.tipo];
  return {
    temp: p.temp * f,
    pres: p.pres,
    rpm: (m.rpm ?? 1450) / f,
    caudal: p.caudal / f,
    corriente: (m.potenciaKw ?? 30) * 1.8 * f,
  };
}

/**
 * Velocímetros del activo a partir de su telemetría multi-variable real,
 * convertidos al sistema de unidades activo. Si la máquina no trae telemetría
 * todavía, usa un respaldo derivado del estado.
 */
export function lecturasGauges(
  m: Maquina,
  sistema: SistemaUnidades
): { temp: GaugeSpec; pres: GaugeSpec; rpm: GaugeSpec; caudal: GaugeSpec; corriente: GaugeSpec } {
  const tel = m.telemetria ?? telemetriaRespaldo(m);
  const t = uni("temp", sistema);
  const p = uni("pres", sistema);
  const c = uni("caudal", sistema);
  return {
    temp: { v: t.f(tel.temp), min: t.f(20), max: t.f(120), u: t.u },
    pres: { v: p.f(tel.pres), min: p.f(0), max: p.f(10), u: p.u },
    rpm: { v: tel.rpm, min: 0, max: 3000, u: "rpm" },
    caudal: { v: c.f(tel.caudal), min: c.f(0), max: c.f(100), u: c.u },
    corriente: { v: tel.corriente, min: 0, max: Math.max(120, tel.corriente * 1.4), u: "A" },
  };
}
