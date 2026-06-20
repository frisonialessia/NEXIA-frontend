"use client";

// ──────────────────────────────────────────────────────────────────────────
// SESIÓN DE USUARIO
// Estado de UI compartido entre vistas: rol activo (para control de acceso) y
// sistema de unidades (métrico/imperial). No son datos del backend de la
// planta, sino preferencias de la sesión, por eso viven aparte de la flota.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ROLES } from "../constants";
import { esModoOperador, esSoloLectura, puede as puedePermiso, type Permiso } from "../permissions";
import type { Rol, SistemaUnidades } from "../types";

const CLAVE_ROL = "nexia-rol";
const CLAVE_SISTEMA = "nexia-sistema";

interface SessionCtx {
  rol: Rol;
  setRol: (r: Rol) => void;
  sistema: SistemaUnidades;
  setSistema: (s: SistemaUnidades) => void;
  /** ¿El rol activo tiene un permiso concreto? */
  puede: (permiso: Permiso) => boolean;
  /** El operador entra en modo simplificado ("qué atender ahora"). */
  modoOperador: boolean;
  /** Solo lectura: ve todo, no ejecuta acciones. */
  soloLectura: boolean;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [rol, setRolState] = useState<Rol>("admin");
  const [sistema, setSistemaState] = useState<SistemaUnidades>("metrico");

  // Al montar, recupera las preferencias guardadas (cliente).
  useEffect(() => {
    const r = localStorage.getItem(CLAVE_ROL);
    if (r && ROLES.includes(r as Rol)) setRolState(r as Rol);
    const s = localStorage.getItem(CLAVE_SISTEMA);
    if (s === "metrico" || s === "imperial") setSistemaState(s);
  }, []);

  const setRol = useCallback((r: Rol) => {
    setRolState(r);
    localStorage.setItem(CLAVE_ROL, r);
  }, []);

  const setSistema = useCallback((s: SistemaUnidades) => {
    setSistemaState(s);
    localStorage.setItem(CLAVE_SISTEMA, s);
  }, []);

  const value = useMemo<SessionCtx>(
    () => ({
      rol,
      setRol,
      sistema,
      setSistema,
      puede: (permiso) => puedePermiso(rol, permiso),
      modoOperador: esModoOperador(rol),
      soloLectura: esSoloLectura(rol),
    }),
    [rol, sistema, setRol, setSistema]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
