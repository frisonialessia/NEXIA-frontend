"use client";

// ──────────────────────────────────────────────────────────────────────────
// SESIÓN DE USUARIO
// Estado de UI compartido entre vistas: rol activo (para control de acceso) y
// sistema de unidades (métrico/imperial). No son datos del backend de la
// planta, sino preferencias de la sesión, por eso viven aparte de la flota.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useMemo, useState } from "react";
import { ACCESO_VISTA } from "../constants";
import type { Rol, SistemaUnidades } from "../types";

interface SessionCtx {
  rol: Rol;
  setRol: (r: Rol) => void;
  sistema: SistemaUnidades;
  setSistema: (s: SistemaUnidades) => void;
  /** ¿El rol activo puede acceder a una vista protegida? */
  puedeVer: (vista: keyof typeof ACCESO_VISTA) => boolean;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [rol, setRol] = useState<Rol>("admin");
  const [sistema, setSistema] = useState<SistemaUnidades>("metrico");

  const value = useMemo<SessionCtx>(
    () => ({
      rol,
      setRol,
      sistema,
      setSistema,
      puedeVer: (vista) => ACCESO_VISTA[vista].includes(rol),
    }),
    [rol, sistema]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
