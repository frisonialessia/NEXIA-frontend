// ──────────────────────────────────────────────────────────────────────────
// STORE DE LA FLOTA — LA CAPA DE DATOS (el "seam" inviolable)
// Motor simulado expuesto como un store con snapshot dividido en SLICES. Cada
// slice (maquinas / alertas / historial / eventos / ahorro / notif) mantiene
// una referencia estable y solo cambia cuando cambia su dato. Los componentes
// se suscriben a su slice vía useSyncExternalStore y NO se re-renderizan cada
// 2s si su parte no cambió.
//
// 🔌  BACKEND REAL: si se define NEXT_PUBLIC_API_URL, este store se conecta al
//    backend (snapshot REST + WebSocket en vivo) en lugar de simular, con
//    respaldo automático a la simulación si la conexión falla. Ver lib/api/.
//    Las firmas de los hooks NO cambian → cero cambios en las vistas.
// ──────────────────────────────────────────────────────────────────────────

import { apiConfigurada } from "../api/contract";
import { comandos, conectarRemoto, type OrigenRemoto, type ParcheRemoto } from "../api/remoteSource";
import { AHORRO_POR_PARADA, CALIBRACION_TICKS, FLOTA } from "../constants";
import { aEventoHistorial, crearFlota, crearMaquina, tickMaquina } from "../data/simulated";
import { causaPrincipal } from "../engine/fsm";
import type { Alerta, Evento, EventoHistorial, Maquina, MaquinaSeed, Veredicto } from "../types";

export interface NotifMovil {
  maquina: string;
  causa: string;
}

export interface Savings {
  ahorroMes: number;
  paradasEvitadas: number;
}

interface Snapshot {
  maquinas: Maquina[];
  alertas: Alerta[];
  historial: EventoHistorial[];
  eventos: Evento[];
  savings: Savings;
  notif: NotifMovil | null;
  roster: MaquinaSeed[];
}

const TICKS_CALENTAMIENTO = 8;
const INTERVALO_MS = 2000;
const MAX_EVENTOS = 50;
const K_ROSTER = "nexia-activos";

let flota: Maquina[] = [];
let rosterSeeds: MaquinaSeed[] = [];
const notificadas: Record<string, boolean> = {};

let snapshot: Snapshot = {
  maquinas: [],
  alertas: [],
  historial: [],
  eventos: [],
  savings: { ahorroMes: 2 * AHORRO_POR_PARADA, paradasEvitadas: 2 },
  notif: null,
  roster: [],
};

function cargarRoster(): MaquinaSeed[] {
  try {
    const r = localStorage.getItem(K_ROSTER);
    if (r) {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignora roster corrupto */
  }
  return FLOTA.map((s) => ({ ...s }));
}

function persistirRoster() {
  localStorage.setItem(K_ROSTER, JSON.stringify(rosterSeeds));
}

const listeners = new Set<() => void>();
let intervalo: ReturnType<typeof setInterval> | null = null;
let suscriptores = 0;
let calentado = false;

// Modo remoto (backend real). Cuando hay conexión viva, las acciones se envían
// como comandos y el servidor reemite la verdad por el WebSocket.
let origenRemoto: OrigenRemoto | null = null;
let remotoActivo = false;

function emit() {
  listeners.forEach((l) => l());
}

function set(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function ahora(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function eventoDeteccion(a: Alerta): Evento {
  return { id: "ev-" + a.id, ts: Date.now(), hora: a.hora, tipo: "deteccion", maquina: a.maquina, detalle: a.causa, prob: a.prob };
}

function eventoResolucion(a: Alerta, veredicto: Veredicto): Evento {
  const detalle =
    veredicto === "real"
      ? "Confirmado como fallo real"
      : veredicto === "falsa"
        ? "Descartado como falsa alarma"
        : "Marcado como no concluyente";
  return { id: "ev-res-" + a.id + "-" + Date.now(), ts: Date.now(), hora: ahora(), tipo: "resolucion", maquina: a.maquina, detalle };
}

function calentar() {
  rosterSeeds = cargarRoster();
  flota = crearFlota(rosterSeeds);
  const iniciales: Alerta[] = [];
  for (let i = 0; i < TICKS_CALENTAMIENTO; i++) {
    flota.forEach((m) => {
      const a = tickMaquina(m);
      if (a) {
        iniciales.unshift(a);
        notificadas[a.maquina] = true;
      }
    });
  }
  snapshot = {
    ...snapshot,
    maquinas: [...flota],
    roster: [...rosterSeeds],
    alertas: iniciales,
    historial: iniciales.map(aEventoHistorial),
    eventos: iniciales.map(eventoDeteccion),
  };
}

function paso() {
  // Pausa cuando la pestaña no está visible: ahorra CPU/batería y evita
  // movimiento "fantasma" cuando el operador no está mirando.
  if (typeof document !== "undefined" && document.hidden) return;

  const nuevas: Alerta[] = [];
  flota.forEach((m) => {
    const a = tickMaquina(m);
    if (a) nuevas.push(a);
  });

  const patch: Partial<Snapshot> = { maquinas: [...flota] };
  if (nuevas.length) {
    patch.alertas = [...nuevas, ...snapshot.alertas];
    patch.historial = [...nuevas.map(aEventoHistorial), ...snapshot.historial];
    patch.eventos = [...nuevas.map(eventoDeteccion), ...snapshot.eventos].slice(0, MAX_EVENTOS);
    const aNotif = nuevas.find((a) => !notificadas[a.maquina]);
    if (aNotif) {
      notificadas[aNotif.maquina] = true;
      patch.notif = { maquina: aNotif.maquina, causa: causaPrincipal(aNotif.tipo) };
    }
  }
  set(patch);
}

/** Arranca la simulación local (motor en el navegador). Es también el respaldo
 *  cuando hay backend configurado pero la conexión falla. */
function arrancarSimulacion() {
  if (!calentado) {
    calentar();
    calentado = true;
  }
  if (!intervalo) intervalo = setInterval(paso, INTERVALO_MS);
}

/** Aplica un parche que llega del backend por el WebSocket (mismo merge que la
 *  simulación: reemplaza la flota y antepone alertas/eventos). */
function aplicarParche(p: ParcheRemoto) {
  const patch: Partial<Snapshot> = {};
  if (p.maquinas) {
    flota = p.maquinas;
    patch.maquinas = p.maquinas;
    patch.roster = p.maquinas.map((m) => ({ id: m.id, sensor: m.sensor, sector: m.sector, base: m.base, esc: m.esc, tipo: m.tipo, umbral: m.umbral }));
  }
  if (p.nuevasAlertas?.length) {
    patch.alertas = [...p.nuevasAlertas, ...snapshot.alertas];
    patch.historial = [...p.nuevasAlertas.map(aEventoHistorial), ...snapshot.historial];
    const aNotif = p.nuevasAlertas.find((a) => !notificadas[a.maquina]);
    if (aNotif) {
      notificadas[aNotif.maquina] = true;
      patch.notif = { maquina: aNotif.maquina, causa: aNotif.causa };
    }
  }
  if (p.nuevosEventos?.length) {
    patch.eventos = [...p.nuevosEventos, ...snapshot.eventos].slice(0, MAX_EVENTOS);
  }
  if (p.savings) patch.savings = p.savings;
  set(patch);
}

/** Conecta al backend real. Si la conexión es irrecuperable, cae a simulación. */
function arrancarRemoto() {
  origenRemoto = conectarRemoto({
    onSnapshot: (s) => {
      calentado = true;
      remotoActivo = true;
      flota = s.maquinas;
      s.alertas.forEach((a) => (notificadas[a.maquina] = true));
      set({ maquinas: s.maquinas, alertas: s.alertas, historial: s.historial, eventos: s.eventos, savings: s.savings, roster: s.roster });
    },
    onUpdate: aplicarParche,
    onConectado: () => {
      remotoActivo = true;
    },
    onCaida: () => {
      // El backend no responde: respaldo transparente a la simulación local.
      remotoActivo = false;
      origenRemoto = null;
      arrancarSimulacion();
    },
  });
}

/** Suscripción para useSyncExternalStore. Arranca la fuente de datos (backend o
 *  simulación) con el primer suscriptor y la detiene cuando no queda ninguno. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  suscriptores += 1;
  if (suscriptores === 1) {
    if (apiConfigurada()) arrancarRemoto();
    else arrancarSimulacion();
  }
  return () => {
    listeners.delete(listener);
    suscriptores -= 1;
    if (suscriptores === 0) {
      if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
      }
      if (origenRemoto) {
        origenRemoto.cerrar();
        origenRemoto = null;
        remotoActivo = false;
      }
    }
  };
}

// Selectores (referencia estable por slice)
export const getMaquinas = () => snapshot.maquinas;
export const getAlertas = () => snapshot.alertas;
export const getHistorial = () => snapshot.historial;
export const getEventos = () => snapshot.eventos;
export const getSavings = () => snapshot.savings;
export const getNotif = () => snapshot.notif;
export const getRoster = () => snapshot.roster;

// ── Gestión de activos (roster editable) ───────────────────────────────────

/** Agrega una máquina nueva al roster y la pone a vivir de inmediato. */
export function agregarMaquina(seed: MaquinaSeed) {
  if (remotoActivo) return comandos.crearMaquina(seed); // el backend reemite la verdad
  if (rosterSeeds.some((s) => s.id === seed.id)) return; // nombre duplicado
  rosterSeeds = [...rosterSeeds, seed];
  const nueva = crearMaquina(seed);
  nueva.calib = CALIBRACION_TICKS; // arranca aprendiendo su baseline
  flota.push(nueva);
  persistirRoster();
  set({ maquinas: [...flota], roster: [...rosterSeeds] });
}

/** Edita los campos configurables de una máquina (el nombre es su identidad). */
export function editarMaquina(id: string, parcial: Partial<MaquinaSeed>) {
  if (remotoActivo) return comandos.editarMaquina(id, parcial);
  rosterSeeds = rosterSeeds.map((s) => (s.id === id ? { ...s, ...parcial, id } : s));
  const m = flota.find((x) => x.id === id);
  if (m) {
    if (parcial.sector !== undefined) m.sector = parcial.sector;
    if (parcial.sensor !== undefined) m.sensor = parcial.sensor;
    if (parcial.base !== undefined) m.base = parcial.base;
    if (parcial.tipo !== undefined) m.tipo = parcial.tipo;
    if (parcial.umbral !== undefined) m.umbral = parcial.umbral;
    if (parcial.esc !== undefined) {
      m.esc = parcial.esc;
      m.ritmoDia = parcial.esc === "degradando" ? 0.7 : 0;
    }
  }
  persistirRoster();
  set({ maquinas: [...flota], roster: [...rosterSeeds] });
}

/** Quita una máquina del roster (y sus alertas abiertas). */
export function quitarMaquina(id: string) {
  if (remotoActivo) return comandos.quitarMaquina(id);
  rosterSeeds = rosterSeeds.filter((s) => s.id !== id);
  flota = flota.filter((m) => m.id !== id);
  persistirRoster();
  set({
    maquinas: [...flota],
    roster: [...rosterSeeds],
    alertas: snapshot.alertas.filter((a) => a.maquina !== id),
  });
}

// Acciones (estables, importables directamente)
export function etiquetarAlerta(id: string, veredicto: Veredicto) {
  if (remotoActivo) return comandos.etiquetar(id, veredicto);
  const alerta = snapshot.alertas.find((a) => a.id === id);
  const alertas = snapshot.alertas.filter((a) => a.id !== id);
  const historial = snapshot.historial.map((h) => (h.id === id ? { ...h, estado: "Resuelto" as const } : h));
  let savings = snapshot.savings;
  if (alerta && veredicto === "real") {
    savings = { ahorroMes: savings.ahorroMes + AHORRO_POR_PARADA, paradasEvitadas: savings.paradasEvitadas + 1 };
  }
  const eventos = alerta ? [eventoResolucion(alerta, veredicto), ...snapshot.eventos].slice(0, MAX_EVENTOS) : snapshot.eventos;
  set({ alertas, historial, savings, eventos });
}

export function cerrarNotif() {
  set({ notif: null });
}

/**
 * Repara una máquina (cierre del ciclo predecir→actuar): calma su vibración,
 * la pone en recuperación, resuelve sus alertas abiertas y registra el evento.
 * Lo llama el módulo de mantenimiento al completar una orden.
 */
export function repararMaquina(id: string) {
  if (remotoActivo) return comandos.reparar(id);
  const m = flota.find((x) => x.id === id);
  if (m) {
    m.esc = "sano";
    m.ritmoDia = 0;
    m.cSube = 0;
    m.cBaja = 0;
    m.estado = "RECOVERY_PROBATION";
    m.prob = 0.05;
  }
  notificadas[id] = false;
  const alertas = snapshot.alertas.filter((a) => a.maquina !== id);
  const historial = snapshot.historial.map((h) =>
    h.maquina === id && h.estado === "Pendiente" ? { ...h, estado: "Resuelto" as const } : h
  );
  const evento: Evento = {
    id: "ev-mant-" + id + "-" + Date.now(),
    ts: Date.now(),
    hora: ahora(),
    tipo: "resolucion",
    maquina: id,
    detalle: "Mantenimiento completado · máquina en recuperación",
  };
  set({ maquinas: [...flota], alertas, historial, eventos: [evento, ...snapshot.eventos].slice(0, MAX_EVENTOS) });
}
