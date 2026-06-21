// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · EQUIPO (usuarios) — semilla
// Color del avatar en paleta NEXIA (azul de marca, tonos de verde, gris).
// El día del backend, esto viene de la tabla de usuarios.
// ──────────────────────────────────────────────────────────────────────────

import { VERDES } from "./../constants";
import type { Rol } from "./../types";

export type EstadoUsuario = "activo" | "invitado";

export interface Usuario {
  id: string;
  n: string;
  e: string;
  rolKey: Rol;
  color: string;
  estado: EstadoUsuario;
}

export const USUARIOS: Usuario[] = [
  { id: "u1", n: "Alessia Frisoni", e: "alessia@planta.com", rolKey: "admin", color: "#3b82f6", estado: "activo" },
  { id: "u2", n: "Carlos Méndez", e: "carlos@planta.com", rolKey: "jefe", color: VERDES.oscuro, estado: "activo" },
  { id: "u3", n: "Roberto Salas", e: "roberto@planta.com", rolKey: "tecnico", color: VERDES.medio, estado: "activo" },
  { id: "u4", n: "Luis Ortega", e: "luis@planta.com", rolKey: "operador", color: VERDES.claro, estado: "activo" },
  { id: "u5", n: "Auditoría Externa", e: "audit@planta.com", rolKey: "lectura", color: "#94a3b8", estado: "activo" },
];
