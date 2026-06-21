"use client";

// ──────────────────────────────────────────────────────────────────────────
// ORGANIZACIÓN — plantas y facturación de la cuenta
// Lista de plantas + planta activa (el contexto con el que se ve el dashboard)
// y el estado de suscripción (plan, ciclo, método de pago, facturas). Persistido
// en el navegador; el día del backend se reemplaza por la API (la UI no cambia).
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  FACTURAS,
  METODO_PAGO,
  PLANTAS,
  type Ciclo,
  type Factura,
  type MetodoPago,
  type Planta,
  type PlanId,
} from "../data/plantas";

interface OrgCtx {
  // Plantas
  plantas: Planta[];
  plantaActivaId: string;
  plantaActiva: Planta;
  setPlantaActiva: (id: string) => void;
  agregarPlanta: (p: Omit<Planta, "id">) => void;
  editarPlanta: (id: string, parcial: Partial<Omit<Planta, "id">>) => void;
  quitarPlanta: (id: string) => void;
  // Facturación
  planId: PlanId;
  ciclo: Ciclo;
  metodoPago: MetodoPago;
  facturas: Factura[];
  cambiarPlan: (id: PlanId) => void;
  setCiclo: (c: Ciclo) => void;
  actualizarPago: (m: MetodoPago) => void;
}

const Ctx = createContext<OrgCtx | null>(null);

const K_PLANTAS = "nexia-plantas";
const K_ACTIVA = "nexia-planta-activa";
const K_PLAN = "nexia-plan";
const K_CICLO = "nexia-ciclo";
const K_PAGO = "nexia-metodo-pago";

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [plantas, setPlantas] = useState<Planta[]>(PLANTAS);
  const [plantaActivaId, setPlantaActivaId] = useState<string>(PLANTAS[0].id);
  const [planId, setPlanId] = useState<PlanId>("pro");
  const [ciclo, setCicloState] = useState<Ciclo>("mensual");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(METODO_PAGO);
  const [facturas] = useState<Factura[]>(FACTURAS);

  useEffect(() => {
    try {
      const p = localStorage.getItem(K_PLANTAS);
      if (p) setPlantas(JSON.parse(p));
      const a = localStorage.getItem(K_ACTIVA);
      if (a) setPlantaActivaId(a);
      const pl = localStorage.getItem(K_PLAN);
      if (pl === "starter" || pl === "pro" || pl === "enterprise") setPlanId(pl);
      const c = localStorage.getItem(K_CICLO);
      if (c === "mensual" || c === "anual") setCicloState(c);
      const pg = localStorage.getItem(K_PAGO);
      if (pg) setMetodoPago(JSON.parse(pg));
    } catch {
      /* ignora estado corrupto */
    }
  }, []);

  const persistPlantas = (next: Planta[]) => localStorage.setItem(K_PLANTAS, JSON.stringify(next));

  const setPlantaActiva = useCallback((id: string) => {
    setPlantaActivaId(id);
    localStorage.setItem(K_ACTIVA, id);
  }, []);

  const agregarPlanta = useCallback((p: Omit<Planta, "id">) => {
    setPlantas((prev) => {
      const next = [...prev, { ...p, id: "p" + Date.now() }];
      persistPlantas(next);
      return next;
    });
  }, []);

  const editarPlanta = useCallback((id: string, parcial: Partial<Omit<Planta, "id">>) => {
    setPlantas((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...parcial } : p));
      persistPlantas(next);
      return next;
    });
  }, []);

  const quitarPlanta = useCallback(
    (id: string) => {
      setPlantas((prev) => {
        if (prev.length <= 1) return prev; // siempre queda al menos una
        const next = prev.filter((p) => p.id !== id);
        persistPlantas(next);
        if (id === plantaActivaId) setPlantaActiva(next[0].id);
        return next;
      });
    },
    [plantaActivaId, setPlantaActiva]
  );

  const cambiarPlan = useCallback((id: PlanId) => {
    setPlanId(id);
    localStorage.setItem(K_PLAN, id);
  }, []);

  const setCiclo = useCallback((c: Ciclo) => {
    setCicloState(c);
    localStorage.setItem(K_CICLO, c);
  }, []);

  const actualizarPago = useCallback((m: MetodoPago) => {
    setMetodoPago(m);
    localStorage.setItem(K_PAGO, JSON.stringify(m));
  }, []);

  const plantaActiva = useMemo(
    () => plantas.find((p) => p.id === plantaActivaId) ?? plantas[0],
    [plantas, plantaActivaId]
  );

  const value = useMemo<OrgCtx>(
    () => ({
      plantas,
      plantaActivaId,
      plantaActiva,
      setPlantaActiva,
      agregarPlanta,
      editarPlanta,
      quitarPlanta,
      planId,
      ciclo,
      metodoPago,
      facturas,
      cambiarPlan,
      setCiclo,
      actualizarPago,
    }),
    [plantas, plantaActivaId, plantaActiva, setPlantaActiva, agregarPlanta, editarPlanta, quitarPlanta, planId, ciclo, metodoPago, facturas, cambiarPlan, setCiclo, actualizarPago]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOrg(): OrgCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOrg debe usarse dentro de <OrgProvider>");
  return ctx;
}
