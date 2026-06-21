"use client";

// ──────────────────────────────────────────────────────────────────────────
// ADMINISTRACIÓN — equipo (CRUD) y registro de auditoría
// Estado de cuenta: usuarios del equipo y bitácora de acciones. Persistido en
// el navegador; el día del backend se reemplaza por la API (la UI no cambia).
// ──────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { VERDES } from "../constants";
import { USUARIOS, type Usuario } from "../data/team";
import type { Rol } from "../types";

export interface EntradaAuditoria {
  id: string;
  ts: number;
  fecha: string;
  hora: string;
  actor: string;
  accion: string;
  detalle: string;
}

interface AdminCtx {
  usuarios: Usuario[];
  invitar: (nombre: string, email: string, rol: Rol) => void;
  cambiarRol: (id: string, rol: Rol) => void;
  quitar: (id: string) => void;
  auditoria: EntradaAuditoria[];
  registrar: (actor: string, accion: string, detalle: string) => void;
}

const Ctx = createContext<AdminCtx | null>(null);

const K_USUARIOS = "nexia-equipo";
const K_AUDIT = "nexia-auditoria";
const COLORES = ["#3b82f6", VERDES.oscuro, VERDES.medio, VERDES.claro, "#94a3b8"];

function ahora() {
  const d = new Date();
  return {
    ts: d.getTime(),
    fecha: d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    hora: d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS);
  const [auditoria, setAuditoria] = useState<EntradaAuditoria[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem(K_USUARIOS);
      if (u) setUsuarios(JSON.parse(u));
      const a = localStorage.getItem(K_AUDIT);
      if (a) setAuditoria(JSON.parse(a));
    } catch {
      /* ignora estado corrupto */
    }
  }, []);

  const registrar = useCallback((actor: string, accion: string, detalle: string) => {
    setAuditoria((prev) => {
      const next = [{ id: "a" + Date.now(), ...ahora(), actor, accion, detalle }, ...prev].slice(0, 100);
      localStorage.setItem(K_AUDIT, JSON.stringify(next));
      return next;
    });
  }, []);

  const invitar = useCallback(
    (nombre: string, email: string, rol: Rol) => {
      setUsuarios((prev) => {
        const nuevo: Usuario = {
          id: "u" + Date.now(),
          n: nombre || email.split("@")[0],
          e: email,
          rolKey: rol,
          color: COLORES[prev.length % COLORES.length],
          estado: "invitado",
        };
        const next = [...prev, nuevo];
        localStorage.setItem(K_USUARIOS, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const cambiarRol = useCallback((id: string, rol: Rol) => {
    setUsuarios((prev) => {
      const next = prev.map((u) => (u.id === id ? { ...u, rolKey: rol } : u));
      localStorage.setItem(K_USUARIOS, JSON.stringify(next));
      return next;
    });
  }, []);

  const quitar = useCallback((id: string) => {
    setUsuarios((prev) => {
      const next = prev.filter((u) => u.id !== id);
      localStorage.setItem(K_USUARIOS, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AdminCtx>(
    () => ({ usuarios, invitar, cambiarRol, quitar, auditoria, registrar }),
    [usuarios, auditoria, invitar, cambiarRol, quitar, registrar]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin(): AdminCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdmin debe usarse dentro de <AdminProvider>");
  return ctx;
}
