// ──────────────────────────────────────────────────────────────────────────
// PERMISOS POR ROL — fuente única de "quién puede qué"
// Gobierna tanto la visibilidad de vistas como la habilitación de acciones.
// Coherente con la matriz que se muestra en la vista de Equipo (Admin).
// ──────────────────────────────────────────────────────────────────────────

import type { Rol } from "./types";

export type Permiso =
  | "produccion" // ver Producción / OEE
  | "auditar" // etiquetar alertas (human-in-the-loop)
  | "mantenimiento" // marcar mantenimiento hecho
  | "conexiones" // configurar protocolos
  | "usuarios" // gestionar usuarios y permisos
  | "ajustesPlanta" // cambiar ajustes de planta (umbrales, etc.)
  | "exportar" // exportar reportes
  | "tendencia"; // ver la tendencia/ROI (perfil gerencial)

export const PERMISOS: Record<Permiso, Rol[]> = {
  produccion: ["admin", "jefe", "tecnico"],
  auditar: ["admin", "jefe", "tecnico", "operador"],
  mantenimiento: ["admin", "jefe", "tecnico"],
  conexiones: ["admin", "tecnico"],
  usuarios: ["admin"],
  ajustesPlanta: ["admin", "jefe"],
  exportar: ["admin", "jefe", "tecnico", "lectura"],
  tendencia: ["admin", "jefe"],
};

export function puede(rol: Rol, permiso: Permiso): boolean {
  return PERMISOS[permiso].includes(rol);
}

/**
 * "Casa" de cada rol: la pantalla y el enfoque con que entra.
 * - operador → modo simple centrado en "qué atender ahora"
 * - el resto → centro de mando completo
 */
export function esModoOperador(rol: Rol): boolean {
  return rol === "operador";
}

/** Solo lectura: ve todo, no ejecuta ninguna acción. */
export function esSoloLectura(rol: Rol): boolean {
  return rol === "lectura";
}
