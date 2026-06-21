"use client";

// ──────────────────────────────────────────────────────────────────────────
// MANTENIMIENTO — órdenes de trabajo
// Crea/avanza/completa/elimina órdenes. Persistido en el navegador; el día del
// backend, se reemplaza por la API (la UI no cambia). Completar una orden
// dispara la reparación de la máquina (cierre del ciclo) desde la vista.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { EstadoOrden, OrdenMantenimiento, Prioridad, TipoMantenimiento } from "../types";

export interface NuevaOrden {
  maquinaId: string;
  maquina: string;
  tipo: TipoMantenimiento;
  prioridad: Prioridad;
  programadaPara: string;
  responsable: string;
  notas: string;
}

interface MaintenanceCtx {
  ordenes: OrdenMantenimiento[];
  crear: (o: NuevaOrden) => void;
  setEstado: (id: string, estado: EstadoOrden) => void;
  eliminar: (id: string) => void;
}

const Ctx = createContext<MaintenanceCtx | null>(null);
const CLAVE = "nexia-ordenes";

function persistir(lista: OrdenMantenimiento[]) {
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>([]);

  useEffect(() => {
    try {
      const o = localStorage.getItem(CLAVE);
      if (o) setOrdenes(JSON.parse(o));
    } catch {
      /* ignora estado corrupto */
    }
  }, []);

  const crear = useCallback((o: NuevaOrden) => {
    setOrdenes((prev) => {
      const d = new Date();
      const orden: OrdenMantenimiento = {
        id: "ot" + d.getTime(),
        maquinaId: o.maquinaId,
        maquina: o.maquina,
        tipo: o.tipo,
        estado: "programada",
        prioridad: o.prioridad,
        ts: d.getTime(),
        fecha: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
        programadaPara: o.programadaPara,
        responsable: o.responsable,
        notas: o.notas,
      };
      const next = [orden, ...prev];
      persistir(next);
      return next;
    });
  }, []);

  const setEstado = useCallback((id: string, estado: EstadoOrden) => {
    setOrdenes((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, estado } : o));
      persistir(next);
      return next;
    });
  }, []);

  const eliminar = useCallback((id: string) => {
    setOrdenes((prev) => {
      const next = prev.filter((o) => o.id !== id);
      persistir(next);
      return next;
    });
  }, []);

  const value = useMemo<MaintenanceCtx>(() => ({ ordenes, crear, setEstado, eliminar }), [ordenes, crear, setEstado, eliminar]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMantenimiento(): MaintenanceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMantenimiento debe usarse dentro de <MaintenanceProvider>");
  return ctx;
}
