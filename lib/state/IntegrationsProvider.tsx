"use client";

// ──────────────────────────────────────────────────────────────────────────
// INTEGRACIONES Y NOTIFICACIONES
// Estado de las conexiones industriales (configurar/disponible/conectado) y las
// preferencias de notificación (canales, severidad, escalado, horario).
// Persistido; el día del backend se reemplaza por la API (la UI no cambia).
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PROTO_ESENCIAL, PROTO_SPECIAL, PROTO_VENDOR } from "../constants";
import type { EstadoProtocolo, Rol } from "../types";

export interface Conexion {
  estado: EstadoProtocolo;
  host?: string;
  puerto?: string;
  intervalo?: string;
}

export interface NotifPrefs {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  emailDest: string;
  telDest: string;
  critico: boolean;
  advertencia: boolean;
  escaladoMin: number;
  escalarA: Rol;
  silencioInicio: string;
  silencioFin: string;
}

const NOTIF_DEFAULT: NotifPrefs = {
  inApp: true,
  email: true,
  sms: false,
  whatsapp: false,
  emailDest: "alessia@planta.com",
  telDest: "",
  critico: true,
  advertencia: true,
  escaladoMin: 15,
  escalarA: "jefe",
  silencioInicio: "",
  silencioFin: "",
};

function conexionesPorDefecto(): Record<string, Conexion> {
  const todos = [...PROTO_ESENCIAL, ...PROTO_VENDOR, ...PROTO_SPECIAL];
  return Object.fromEntries(todos.map((p) => [p.n, { estado: p.estado }]));
}

interface IntegracionesCtx {
  conexiones: Record<string, Conexion>;
  configurar: (nombre: string, cfg: { host: string; puerto: string; intervalo: string }) => void;
  conectar: (nombre: string) => void;
  desconectar: (nombre: string) => void;
  notif: NotifPrefs;
  setNotif: (parcial: Partial<NotifPrefs>) => void;
}

const Ctx = createContext<IntegracionesCtx | null>(null);
const K_CONEX = "nexia-conexiones";
const K_NOTIF = "nexia-notif";

export function IntegrationsProvider({ children }: { children: React.ReactNode }) {
  const [conexiones, setConexiones] = useState<Record<string, Conexion>>(conexionesPorDefecto);
  const [notif, setNotifState] = useState<NotifPrefs>(NOTIF_DEFAULT);

  useEffect(() => {
    try {
      const c = localStorage.getItem(K_CONEX);
      if (c) setConexiones({ ...conexionesPorDefecto(), ...JSON.parse(c) });
      const n = localStorage.getItem(K_NOTIF);
      if (n) setNotifState({ ...NOTIF_DEFAULT, ...JSON.parse(n) });
    } catch {
      /* ignora estado corrupto */
    }
  }, []);

  const configurar = useCallback((nombre: string, cfg: { host: string; puerto: string; intervalo: string }) => {
    setConexiones((prev) => {
      const next = { ...prev, [nombre]: { estado: "disponible" as EstadoProtocolo, ...cfg } };
      localStorage.setItem(K_CONEX, JSON.stringify(next));
      return next;
    });
  }, []);

  const conectar = useCallback((nombre: string) => {
    setConexiones((prev) => {
      const next = { ...prev, [nombre]: { ...prev[nombre], estado: "conectado" as EstadoProtocolo } };
      localStorage.setItem(K_CONEX, JSON.stringify(next));
      return next;
    });
  }, []);

  const desconectar = useCallback((nombre: string) => {
    setConexiones((prev) => {
      const next = { ...prev, [nombre]: { ...prev[nombre], estado: "disponible" as EstadoProtocolo } };
      localStorage.setItem(K_CONEX, JSON.stringify(next));
      return next;
    });
  }, []);

  const setNotif = useCallback((parcial: Partial<NotifPrefs>) => {
    setNotifState((prev) => {
      const next = { ...prev, ...parcial };
      localStorage.setItem(K_NOTIF, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<IntegracionesCtx>(
    () => ({ conexiones, configurar, conectar, desconectar, notif, setNotif }),
    [conexiones, configurar, conectar, desconectar, notif, setNotif]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIntegraciones(): IntegracionesCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useIntegraciones debe usarse dentro de <IntegrationsProvider>");
  return ctx;
}
