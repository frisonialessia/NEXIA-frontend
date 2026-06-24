// ──────────────────────────────────────────────────────────────────────────
// MOTOR DE DATOS SIMULADOS
// Crea la flota inicial y la hace avanzar en el tiempo (un "tick" = un paso de
// simulación, equivalente a los 2s de la demo). Genera vibración real vs.
// esperada, la pasa por la FSM y emite alertas cuando una máquina entra en
// crítico.
//
// ⚠️  ESTA ES LA CAPA INTERCAMBIABLE. El día que exista backend real, se
//    sustituye este archivo (o el FleetProvider que lo consume) por llamadas
//    de red. Las vistas NO importan nada de aquí: hablan con useFleet().
// ──────────────────────────────────────────────────────────────────────────

import { FLOTA, UMBRAL_CRITICO, tipoDe } from "../constants";
import { causaPrincipal, esAlta, probabilidadFallo, transicion } from "../engine/fsm";
import type { Alerta, EventoHistorial, Maquina, MaquinaSeed, Telemetria } from "../types";

/** Tamaño máximo de la ventana móvil de lecturas que guarda cada máquina. */
const VENTANA_HIST = 40;

/**
 * Genera la telemetría multi-variable (valores base SI), escalada por la
 * severidad del estado: bajo fallo sube temperatura/presión/corriente y cae la
 * velocidad/caudal. Estable por tick (se llama una vez por paso, no por render).
 * Con backend real, estos valores llegan del PLC y esta función desaparece.
 */
function generarTelemetria(m: Maquina): Telemetria {
  const f = m.estado === "CRITICAL_ALERT" ? 1.4 : m.estado === "WARNING_PROBATION" ? 1.15 : 1;
  const ruido = (amp: number) => (Math.random() - 0.5) * amp;
  const rpmNominal = m.rpm ?? 1450;
  const corrNominal = (m.potenciaKw ?? 30) * 1.8; // ≈ A por kW (motor trifásico típico)
  return {
    temp: +(55 * f + ruido(3)).toFixed(1),
    pres: +(4.2 * f + ruido(0.2)).toFixed(2),
    rpm: Math.round(rpmNominal / f + ruido(40)),
    caudal: +(42 / f + ruido(4)).toFixed(1),
    corriente: +(corrNominal * f + ruido(2)).toFixed(1),
  };
}

/** Construye una máquina viva a partir de su semilla. */
export function crearMaquina(d: MaquinaSeed): Maquina {
  return {
    ...d,
    tipo: d.tipo ?? tipoDe(d.id),
    estado: "STABLE",
    cSube: 0,
    cBaja: 0,
    hist: [],
    expected: d.base,
    prob: 0.05,
    tick: 0,
    ritmoDia: d.esc === "degradando" ? 0.7 : 0,
    horasOp: (2000 + Math.random() * 3000) | 0,
    umbral: d.umbral ?? UMBRAL_CRITICO,
    // La flota inicial ya está calibrada (0). Las máquinas que el usuario añade
    // arrancan calibrando: ver agregarMaquina() en el store.
    calib: 0,
  };
}

/** Construye la flota a partir de un conjunto de semillas (por defecto, la inicial). */
export function crearFlota(seeds: MaquinaSeed[] = FLOTA): Maquina[] {
  return seeds.map(crearMaquina);
}

/**
 * Avanza UNA máquina un paso. Muta la máquina en sitio (el provider crea una
 * nueva referencia del array para disparar el render). Devuelve una Alerta
 * nueva si la máquina ACABA de entrar en estado crítico; si no, null.
 */
export function tickMaquina(m: Maquina): Alerta | null {
  m.tick += 1;
  m.horasOp += 0.01;

  // Componente cíclica diaria sobre la baseline
  const ahora = new Date();
  const hora = ahora.getHours() + ahora.getMinutes() / 60;
  const ritmo = 0.3 * Math.sin(((hora - 9) / 24) * 2 * Math.PI);
  m.expected = +(m.base + ritmo).toFixed(3);

  // Vibración real según el escenario
  let v: number;
  if (m.esc === "sano") {
    v = m.expected + (Math.random() - 0.5) * 0.4;
  } else if (m.esc === "degradando") {
    v = m.expected + Math.min(m.tick * 0.05, 4.5) + (Math.random() - 0.5) * 0.5;
  } else {
    v = m.expected + 4 + Math.random() * 2;
  }
  v = Math.max(0, +v.toFixed(3));

  // ── Calibración: aprendiendo baseline ──────────────────────────────────
  // Mientras calibra, la máquina recopila lecturas pero NO juzga: sin alertas,
  // estado neutro y probabilidad baja. Así no inventa fallos antes de conocer
  // su comportamiento normal (decisión de confianza).
  if (m.calib > 0) {
    m.calib -= 1;
    m.prob = 0.05;
    m.estado = "STABLE";
    m.cSube = 0;
    m.cBaja = 0;
    m.hist.push({ t: Date.now(), v, exp: m.expected });
    if (m.hist.length > VENTANA_HIST) m.hist.shift();
    m.telemetria = generarTelemetria(m);
    return null;
  }

  // Probabilidad de fallo y transición de la FSM
  m.prob = probabilidadFallo(v, m.expected);
  const alto = esAlta(m.prob);
  const prev = m.estado;
  const t = transicion(m.estado, m.cSube, m.cBaja, alto);
  m.estado = t.estado;
  m.cSube = t.cSube;
  m.cBaja = t.cBaja;

  // ¿Acaba de entrar en crítico? → nueva alerta
  let alerta: Alerta | null = null;
  if (m.estado === "CRITICAL_ALERT" && prev !== "CRITICAL_ALERT") {
    alerta = {
      id: "al-" + m.id + "-" + Date.now(),
      maquina: m.id,
      sensor: m.sensor,
      tipo: m.tipo,
      causa: "Vibración fuera del rango esperado: posible " + causaPrincipal(m.tipo).toLowerCase(),
      prob: m.prob,
      hora: ahora.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      vib: v,
      exp: m.expected,
      umbral: m.umbral,
    };
  }

  // Guarda la lectura en la ventana móvil
  m.hist.push({ t: Date.now(), v, exp: m.expected });
  if (m.hist.length > VENTANA_HIST) m.hist.shift();

  m.telemetria = generarTelemetria(m);
  return alerta;
}

/** Convierte una alerta en una entrada de historial (estado Pendiente). */
export function aEventoHistorial(a: Alerta): EventoHistorial {
  return {
    ...a,
    fecha: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    estado: "Pendiente",
  };
}

/**
 * Genera la serie de "replay" que reconstruye cómo se detectó el fallo
 * (usada por el botón "Ver cómo se detectó" en el detalle del activo).
 */
export function serieReplay(m: Maquina) {
  const serie = [];
  for (let i = 0; i < 40; i++) {
    const exp = m.base + 0.2;
    const v = exp + Math.min(i * 0.18, 5) + (Math.random() - 0.5) * 0.3;
    serie.push({ t: i, v: +v.toFixed(2), exp: +exp.toFixed(2) });
  }
  return serie;
}
