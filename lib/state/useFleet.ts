"use client";

// ──────────────────────────────────────────────────────────────────────────
// HOOKS DE LA FLOTA (el "seam" que consumen las vistas)
// Cada hook se suscribe a UN slice del store. Un componente que solo lee el
// ahorro no se re-renderiza cuando cambian las máquinas, y viceversa.
// ──────────────────────────────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import {
  getAlertas,
  getEventos,
  getHistorial,
  getMaquinas,
  getNotif,
  getSavings,
  subscribe,
} from "./fleetStore";

export { etiquetarAlerta, cerrarNotif, repararMaquina } from "./fleetStore";
export type { NotifMovil, Savings } from "./fleetStore";

export function useEventos() {
  return useSyncExternalStore(subscribe, getEventos, getEventos);
}

export function useMaquinas() {
  return useSyncExternalStore(subscribe, getMaquinas, getMaquinas);
}
export function useAlertas() {
  return useSyncExternalStore(subscribe, getAlertas, getAlertas);
}
export function useHistorial() {
  return useSyncExternalStore(subscribe, getHistorial, getHistorial);
}
export function useSavings() {
  return useSyncExternalStore(subscribe, getSavings, getSavings);
}
export function useNotif() {
  return useSyncExternalStore(subscribe, getNotif, getNotif);
}
