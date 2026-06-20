// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · EQUIPO (usuarios)
// Mock del equipo. El día del backend, esto viene de la tabla de usuarios.
// El color se guarda como clave de token y la vista lo resuelve con col().
// ──────────────────────────────────────────────────────────────────────────

import type { ColorKey } from "./../constants";
import { ROL_NOMBRE } from "./../constants";

export interface Usuario {
  n: string;
  e: string;
  rol: string;
  colorKey: ColorKey;
}

export const USUARIOS: Usuario[] = [
  { n: "Alessia Frisoni", e: "alessia@planta.com", rol: ROL_NOMBRE.admin, colorKey: "brand" },
  { n: "Carlos Méndez", e: "carlos@planta.com", rol: ROL_NOMBRE.jefe, colorKey: "warn" },
  { n: "Roberto Salas", e: "roberto@planta.com", rol: ROL_NOMBRE.tecnico, colorKey: "crit" },
  { n: "Luis Ortega", e: "luis@planta.com", rol: ROL_NOMBRE.operador, colorKey: "ok" },
  { n: "Auditoría Externa", e: "audit@planta.com", rol: ROL_NOMBRE.lectura, colorKey: "gray" },
];
