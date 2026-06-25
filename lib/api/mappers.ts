// ──────────────────────────────────────────────────────────────────────────
// MAPEADORES  ·  DTO (cable) → tipos de dominio NEXIA
// Aíslan el formato de red de los tipos internos. La hora legible se formatea
// aquí desde el timestamp (epoch ms), para que sea coherente con el idioma.
// ──────────────────────────────────────────────────────────────────────────

import { UMBRAL_CRITICO, tipoDe } from "../constants";
import type { Alerta, Evento, EventoHistorial, Maquina, MaquinaSeed } from "../types";
import type { AlertaDTO, EventoDTO, MaquinaDTO, SnapshotDTO } from "./contract";

function horaDe(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function fechaDe(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** DTO de máquina → estado vivo de dominio. Los campos internos de la FSM
 *  (cSube/cBaja/tick) no viajan: los calcula el backend. Aquí se rellenan. */
export function aMaquina(d: MaquinaDTO): Maquina {
  return {
    id: d.id,
    sensor: d.sensor,
    sector: d.sector,
    tipo: d.tipo ?? tipoDe(d.id),
    base: d.base,
    umbral: d.umbral ?? UMBRAL_CRITICO,
    esc: d.esc ?? "sano",
    estado: d.estado,
    prob: d.prob,
    expected: d.expected,
    ritmoDia: d.ritmoDia,
    horasOp: d.horasOp,
    hist: d.hist.map((l) => ({ t: l.t, v: l.v, exp: l.exp })),
    // Estado interno de la FSM: lo gobierna el servidor; placeholders locales.
    cSube: 0,
    cBaja: 0,
    tick: d.hist.length,
    calib: d.calib ?? 0,
    rpm: d.rpm,
    potenciaKw: d.potenciaKw,
    criticidad: d.criticidad,
    costoParadaHora: d.costoParadaHora,
    telemetria: d.telemetria,
    kpis: d.kpis,
  };
}

export function aAlerta(d: AlertaDTO): Alerta {
  return { id: d.id, maquina: d.maquina, sensor: d.sensor, tipo: d.tipo, causa: d.causa, prob: d.prob, hora: horaDe(d.ts), vib: d.vib, exp: d.exp, umbral: d.umbral, campo: d.campo, valor: d.valor, limite: d.limite };
}

export function aHistorial(d: AlertaDTO): EventoHistorial {
  return { ...aAlerta(d), fecha: fechaDe(d.ts), estado: d.estado ?? "Pendiente" };
}

export function aEvento(d: EventoDTO): Evento {
  return { id: d.id, ts: d.ts, hora: horaDe(d.ts), tipo: d.tipo, maquina: d.maquina, detalle: d.detalle, prob: d.prob };
}

/** Roster (definición fija) derivado de las máquinas vivas, para las vistas de
 *  gestión de activos y los límites de facturación. */
export function aRoster(maquinas: MaquinaDTO[]): MaquinaSeed[] {
  return maquinas.map((d) => ({
    id: d.id,
    sensor: d.sensor,
    sector: d.sector,
    base: d.base,
    esc: d.esc ?? "sano",
    tipo: d.tipo,
    umbral: d.umbral,
  }));
}

export interface SnapshotDominio {
  maquinas: Maquina[];
  alertas: Alerta[];
  historial: EventoHistorial[];
  eventos: Evento[];
  savings: { ahorroMes: number; paradasEvitadas: number };
  registro: { real: number; falsa: number; nc: number };
  roster: MaquinaSeed[];
}

export function aSnapshot(d: SnapshotDTO): SnapshotDominio {
  return {
    maquinas: d.maquinas.map(aMaquina),
    alertas: d.alertas.map(aAlerta),
    historial: d.historial.map(aHistorial),
    eventos: d.eventos.map(aEvento),
    savings: d.savings,
    registro: d.registro,
    roster: aRoster(d.maquinas),
  };
}
