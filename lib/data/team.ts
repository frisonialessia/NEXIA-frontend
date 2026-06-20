// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · EQUIPO (usuarios)
// Mock del equipo. El color del avatar usa la paleta NEXIA (azul de marca,
// tonos de verde y gris) — sin ámbar ni violeta.
// ──────────────────────────────────────────────────────────────────────────

import { ROL_NOMBRE, VERDES } from "./../constants";

export interface Usuario {
  n: string;
  e: string;
  rol: string;
  color: string;
}

export const USUARIOS: Usuario[] = [
  { n: "Alessia Frisoni", e: "alessia@planta.com", rol: ROL_NOMBRE.admin, color: "#3b82f6" },
  { n: "Carlos Méndez", e: "carlos@planta.com", rol: ROL_NOMBRE.jefe, color: VERDES.oscuro },
  { n: "Roberto Salas", e: "roberto@planta.com", rol: ROL_NOMBRE.tecnico, color: VERDES.medio },
  { n: "Luis Ortega", e: "luis@planta.com", rol: ROL_NOMBRE.operador, color: VERDES.claro },
  { n: "Auditoría Externa", e: "audit@planta.com", rol: ROL_NOMBRE.lectura, color: "#94a3b8" },
];
