"use client";

// ──────────────────────────────────────────────────────────────────────────
// SESIÓN DE USUARIO
// Rol activo, sistema de unidades y la MATRIZ DE PERMISOS editable (que el
// admin puede modificar y que gobierna de verdad el acceso). Persistido.
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ROLES } from "../constants";
import {
  esModoOperador,
  esSoloLectura,
  permisosPorDefecto,
  puede as puedePermiso,
  type MatrizPermisos,
  type Permiso,
} from "../permissions";
import type { Rol, SistemaUnidades } from "../types";

const CLAVE_ROL = "nexia-rol";
const CLAVE_SISTEMA = "nexia-sistema";
const CLAVE_MATRIZ = "nexia-matriz-permisos";

interface SessionCtx {
  rol: Rol;
  setRol: (r: Rol) => void;
  sistema: SistemaUnidades;
  setSistema: (s: SistemaUnidades) => void;
  /** ¿El rol activo tiene un permiso concreto? */
  puede: (permiso: Permiso) => boolean;
  /** Matriz de permisos efectiva (editable por el admin). */
  matriz: MatrizPermisos;
  /** Activa/desactiva un permiso para un rol. */
  togglePermiso: (permiso: Permiso, rol: Rol) => void;
  /** Restaura la matriz a los valores por defecto. */
  resetPermisos: () => void;
  modoOperador: boolean;
  soloLectura: boolean;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [rol, setRolState] = useState<Rol>("admin");
  const [sistema, setSistemaState] = useState<SistemaUnidades>("metrico");
  const [matriz, setMatriz] = useState<MatrizPermisos>(permisosPorDefecto);

  useEffect(() => {
    const r = localStorage.getItem(CLAVE_ROL);
    if (r && ROLES.includes(r as Rol)) setRolState(r as Rol);
    const s = localStorage.getItem(CLAVE_SISTEMA);
    if (s === "metrico" || s === "imperial") setSistemaState(s);
    try {
      const m = localStorage.getItem(CLAVE_MATRIZ);
      if (m) setMatriz({ ...permisosPorDefecto(), ...JSON.parse(m) });
    } catch {
      /* ignora matriz corrupta */
    }
  }, []);

  const setRol = useCallback((r: Rol) => {
    setRolState(r);
    localStorage.setItem(CLAVE_ROL, r);
  }, []);

  const setSistema = useCallback((s: SistemaUnidades) => {
    setSistemaState(s);
    localStorage.setItem(CLAVE_SISTEMA, s);
  }, []);

  const togglePermiso = useCallback((permiso: Permiso, r: Rol) => {
    setMatriz((prev) => {
      const tiene = prev[permiso].includes(r);
      const next = {
        ...prev,
        [permiso]: tiene ? prev[permiso].filter((x) => x !== r) : [...prev[permiso], r],
      };
      localStorage.setItem(CLAVE_MATRIZ, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPermisos = useCallback(() => {
    const def = permisosPorDefecto();
    setMatriz(def);
    localStorage.removeItem(CLAVE_MATRIZ);
  }, []);

  const value = useMemo<SessionCtx>(
    () => ({
      rol,
      setRol,
      sistema,
      setSistema,
      puede: (permiso) => puedePermiso(rol, permiso, matriz),
      matriz,
      togglePermiso,
      resetPermisos,
      modoOperador: esModoOperador(rol),
      soloLectura: esSoloLectura(rol),
    }),
    [rol, sistema, matriz, setRol, setSistema, togglePermiso, resetPermisos]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>");
  return ctx;
}
