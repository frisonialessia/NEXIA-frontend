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

/** Etiqueta legible de cada permiso (para la matriz editable del Admin). */
export const PERMISO_LABEL: Record<Permiso, string> = {
  produccion: "Ver producción / OEE",
  auditar: "Auditar y etiquetar alertas",
  mantenimiento: "Marcar mantenimiento hecho",
  exportar: "Exportar reportes",
  conexiones: "Configurar conexiones",
  ajustesPlanta: "Cambiar ajustes de planta",
  tendencia: "Ver tendencia / ROI",
  usuarios: "Gestionar usuarios y permisos",
};

/** Orden de los permisos en la matriz. */
export const PERMISOS_ORDEN: Permiso[] = [
  "produccion",
  "auditar",
  "mantenimiento",
  "exportar",
  "conexiones",
  "ajustesPlanta",
  "tendencia",
  "usuarios",
];

/** Tipo de la matriz efectiva (puede venir editada por el admin). */
export type MatrizPermisos = Record<Permiso, Rol[]>;

/** Copia profunda de los permisos por defecto. */
export function permisosPorDefecto(): MatrizPermisos {
  return Object.fromEntries(Object.entries(PERMISOS).map(([k, v]) => [k, [...v]])) as MatrizPermisos;
}

export function puede(rol: Rol, permiso: Permiso, matriz: MatrizPermisos = PERMISOS): boolean {
  return (matriz[permiso] ?? []).includes(rol);
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
