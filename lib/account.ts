// ──────────────────────────────────────────────────────────────────────────
// CUENTA DE USUARIO — identidad de quien inició sesión
// En modo demo la "autenticación" resuelve la cuenta contra la semilla del
// equipo (sin contraseña real). El día del backend, esto lo devuelve el login.
// ──────────────────────────────────────────────────────────────────────────

import { USUARIOS } from "./data/team";
import type { Rol } from "./types";

export interface Cuenta {
  nombre: string;
  email: string;
  rol: Rol;
  /** Color del avatar (paleta NEXIA). */
  color: string;
}

/** Resuelve una cuenta a partir del correo, contra la semilla del equipo. */
export function resolverCuenta(email: string): Cuenta {
  const e = email.trim().toLowerCase();
  const u = USUARIOS.find((x) => x.e.toLowerCase() === e);
  if (u) return { nombre: u.n, email: u.e, rol: u.rolKey, color: u.color };
  return {
    nombre: (e.split("@")[0] || "Usuario").replace(/^\w/, (c) => c.toUpperCase()),
    email: e || "usuario@nexia.app",
    rol: "admin",
    color: "#3b82f6",
  };
}

/** Iniciales para el avatar (máx. 2 letras). */
export function iniciales(nombre: string): string {
  const p = nombre.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "U";
}
