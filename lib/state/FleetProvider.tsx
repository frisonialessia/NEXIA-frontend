"use client";

// ──────────────────────────────────────────────────────────────────────────
// PROVEEDOR DE LA FLOTA — LA CAPA DE DATOS (el "seam" inviolable)
// Corre el motor simulado una sola vez y mantiene vivo el estado de la planta,
// compartido por TODAS las vistas. Las páginas NO importan el motor: consumen
// este proveedor con useFleet().
//
// 🔌  PARA CONECTAR UN BACKEND REAL: reemplazar el interior de este proveedor
//    por consultas con TanStack Query (useQuery del estado de la flota,
//    useMutation para etiquetar alertas). La firma de useFleet() no cambia, así
//    que NINGUNA vista se modifica.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AHORRO_POR_PARADA } from "../constants";
import { causaPrincipal } from "../engine/fsm";
import { aEventoHistorial, crearFlota, tickMaquina } from "../data/simulated";
import type { Alerta, EventoHistorial, Maquina, Veredicto } from "../types";

/** Notificación móvil simulada (la tarjeta tipo SMS de la demo). */
export interface NotifMovil {
  maquina: string;
  causa: string;
}

interface FleetCtx {
  maquinas: Maquina[];
  alertas: Alerta[];
  historial: EventoHistorial[];
  paradasEvitadas: number;
  ahorroMes: number;
  /** Notificación móvil pendiente de mostrar (o null). */
  notif: NotifMovil | null;
  /** Devuelve una máquina por su id (para la vista de detalle). */
  getMaquina: (id: string) => Maquina | undefined;
  /** Registra el veredicto humano de una alerta (human-in-the-loop). */
  etiquetarAlerta: (id: string, veredicto: Veredicto) => void;
  /** Cierra la notificación móvil. */
  cerrarNotif: () => void;
}

const Ctx = createContext<FleetCtx | null>(null);

/** Cuántos pasos de simulación correr antes del primer render (calentamiento). */
const TICKS_CALENTAMIENTO = 8;

export function FleetProvider({ children }: { children: React.ReactNode }) {
  // La flota mutable vive en un ref; el estado espejo dispara los renders.
  const flotaRef = useRef<Maquina[]>([]);
  const notificadasRef = useRef<Record<string, boolean>>({});

  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [historial, setHistorial] = useState<EventoHistorial[]>([]);
  const [paradasEvitadas, setParadasEvitadas] = useState(2);
  const [ahorroMes, setAhorroMes] = useState(2 * AHORRO_POR_PARADA);
  const [notif, setNotif] = useState<NotifMovil | null>(null);

  useEffect(() => {
    // ── Arranque (solo en cliente, para evitar desajustes de hidratación) ──
    const flota = crearFlota();
    flotaRef.current = flota;

    const alertasInicio: Alerta[] = [];
    // Calentamiento: avanza la simulación sin mostrar la notificación emergente,
    // pero recogiendo las alertas que ya existan al cargar (p. ej. la máquina
    // que arranca en estado crítico aparece en la cola de auditoría).
    for (let i = 0; i < TICKS_CALENTAMIENTO; i++) {
      flota.forEach((m) => {
        const a = tickMaquina(m);
        if (a) {
          alertasInicio.unshift(a);
          notificadasRef.current[a.maquina] = true;
        }
      });
    }
    setMaquinas([...flota]);
    if (alertasInicio.length) {
      setAlertas(alertasInicio);
      setHistorial(alertasInicio.map(aEventoHistorial));
    }

    // ── Bucle en vivo (cada 2s, como la demo) ──────────────────────────────
    const intervalo = setInterval(() => {
      const nuevas: Alerta[] = [];
      flotaRef.current.forEach((m) => {
        const a = tickMaquina(m);
        if (a) nuevas.push(a);
      });

      if (nuevas.length) {
        setAlertas((prev) => [...nuevas, ...prev]);
        setHistorial((prev) => [...nuevas.map(aEventoHistorial), ...prev]);
        // Notificación móvil: la primera máquina aún no notificada.
        const aNotif = nuevas.find((a) => !notificadasRef.current[a.maquina]);
        if (aNotif) {
          notificadasRef.current[aNotif.maquina] = true;
          setNotif({ maquina: aNotif.maquina, causa: causaPrincipal(aNotif.tipo) });
        }
      }

      setMaquinas([...flotaRef.current]);
    }, 2000);

    return () => clearInterval(intervalo);
  }, []);

  const getMaquina = useCallback(
    (id: string) => flotaRef.current.find((m) => m.id === id),
    []
  );

  const etiquetarAlerta = useCallback((id: string, veredicto: Veredicto) => {
    let eraReal = false;
    setAlertas((prev) => {
      const a = prev.find((x) => x.id === id);
      if (a && veredicto === "real") eraReal = true;
      return prev.filter((x) => x.id !== id);
    });
    if (veredicto === "real") {
      setParadasEvitadas((p) => p + 1);
      setAhorroMes((a) => a + AHORRO_POR_PARADA);
    }
    // Toda alerta etiquetada se marca como resuelta en el historial.
    setHistorial((prev) =>
      prev.map((h) => (h.id === id ? { ...h, estado: "Resuelto" } : h))
    );
    // `eraReal` queda disponible por si en el futuro se quiere diferenciar.
    void eraReal;
  }, []);

  const cerrarNotif = useCallback(() => setNotif(null), []);

  return (
    <Ctx.Provider
      value={{
        maquinas,
        alertas,
        historial,
        paradasEvitadas,
        ahorroMes,
        notif,
        getMaquina,
        etiquetarAlerta,
        cerrarNotif,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useFleet(): FleetCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFleet debe usarse dentro de <FleetProvider>");
  return ctx;
}
