// ──────────────────────────────────────────────────────────────────────────
// STORE DE LA FLOTA — LA CAPA DE DATOS (el "seam" inviolable)
// Motor simulado expuesto como un store con snapshot dividido en SLICES. Cada
// slice (maquinas / alertas / historial / ahorro / notif) mantiene una
// referencia estable y solo cambia cuando cambia su dato. Los componentes se
// suscriben a su slice vía useSyncExternalStore y NO se re-renderizan cada 2s
// si su parte no cambió.
//
// 🔌  PARA UN BACKEND REAL: reemplazar warmUp()/step() por consultas de red
//    (TanStack Query). Las firmas de los hooks no cambian → cero cambios en las
//    vistas.
// ──────────────────────────────────────────────────────────────────────────

import { AHORRO_POR_PARADA } from "../constants";
import { aEventoHistorial, crearFlota, tickMaquina } from "../data/simulated";
import { causaPrincipal } from "../engine/fsm";
import type { Alerta, EventoHistorial, Maquina, Veredicto } from "../types";

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
  savings: Savings;
  notif: NotifMovil | null;
}

const TICKS_CALENTAMIENTO = 8;
const INTERVALO_MS = 2000;

let flota: Maquina[] = [];
const notificadas: Record<string, boolean> = {};

let snapshot: Snapshot = {
  maquinas: [],
  alertas: [],
  historial: [],
  savings: { ahorroMes: 2 * AHORRO_POR_PARADA, paradasEvitadas: 2 },
  notif: null,
};

const listeners = new Set<() => void>();
let intervalo: ReturnType<typeof setInterval> | null = null;
let suscriptores = 0;
let calentado = false;

function emit() {
  listeners.forEach((l) => l());
}

function set(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

function calentar() {
  flota = crearFlota();
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
    alertas: iniciales,
    historial: iniciales.map(aEventoHistorial),
  };
}

function paso() {
  const nuevas: Alerta[] = [];
  flota.forEach((m) => {
    const a = tickMaquina(m);
    if (a) nuevas.push(a);
  });

  const patch: Partial<Snapshot> = { maquinas: [...flota] };
  if (nuevas.length) {
    patch.alertas = [...nuevas, ...snapshot.alertas];
    patch.historial = [...nuevas.map(aEventoHistorial), ...snapshot.historial];
    const aNotif = nuevas.find((a) => !notificadas[a.maquina]);
    if (aNotif) {
      notificadas[aNotif.maquina] = true;
      patch.notif = { maquina: aNotif.maquina, causa: causaPrincipal(aNotif.tipo) };
    }
  }
  set(patch);
}

/** Suscripción para useSyncExternalStore. Arranca el motor con el primer
 *  suscriptor (solo en cliente) y lo detiene cuando no queda ninguno. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  suscriptores += 1;
  if (suscriptores === 1) {
    if (!calentado) {
      calentar();
      calentado = true;
    }
    intervalo = setInterval(paso, INTERVALO_MS);
  }
  return () => {
    listeners.delete(listener);
    suscriptores -= 1;
    if (suscriptores === 0 && intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  };
}

// Selectores (referencia estable por slice)
export const getMaquinas = () => snapshot.maquinas;
export const getAlertas = () => snapshot.alertas;
export const getHistorial = () => snapshot.historial;
export const getSavings = () => snapshot.savings;
export const getNotif = () => snapshot.notif;

// Acciones (estables, importables directamente)
export function etiquetarAlerta(id: string, veredicto: Veredicto) {
  const alerta = snapshot.alertas.find((a) => a.id === id);
  const alertas = snapshot.alertas.filter((a) => a.id !== id);
  const historial = snapshot.historial.map((h) => (h.id === id ? { ...h, estado: "Resuelto" as const } : h));
  let savings = snapshot.savings;
  if (alerta && veredicto === "real") {
    savings = { ahorroMes: savings.ahorroMes + AHORRO_POR_PARADA, paradasEvitadas: savings.paradasEvitadas + 1 };
  }
  set({ alertas, historial, savings });
}

export function cerrarNotif() {
  set({ notif: null });
}
