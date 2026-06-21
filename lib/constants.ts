// ──────────────────────────────────────────────────────────────────────────
// CONSTANTES DEL DOMINIO NEXIA
// Valores fijos portados 1:1 desde la demo de referencia. Cambiar aquí cambia
// el comportamiento en toda la app.
// ──────────────────────────────────────────────────────────────────────────

import type {
  Estado,
  MaquinaSeed,
  Magnitud,
  Protocolo,
  Rol,
  TipoMaquina,
  Unidad,
} from "./types";

// ── Dinero (configurable; defaults de la demo) ─────────────────────────────
export const COSTO_HORA_PARADA = 1500;
export const HORAS_PARADA_TIPICA = 8;

/** Ahorro que aporta cada parada evitada. */
export const AHORRO_POR_PARADA = COSTO_HORA_PARADA * HORAS_PARADA_TIPICA;

// ── Umbral de fallo ────────────────────────────────────────────────────────
export const UMBRAL_CRITICO = 6.5;

// ──────────────────────────────────────────────────────────────────────────
// PALETA — Opción "Tech moderna" (9 colores), con variante clara y oscura.
// Los 5 primeros son SEMÁNTICOS (estado de máquina). Los 4 últimos solo
// para series de datos/gráficos, nunca para estados.
// ──────────────────────────────────────────────────────────────────────────

export type ColorKey =
  | "brand"
  | "ok"
  | "warn"
  | "crit"
  | "gray"
  | "cian"
  | "lima"
  | "naranja"
  | "violeta";

/**
 * Devuelve el TOKEN de color (variable CSS), no un hex. El valor real lo
 * resuelve el navegador según el tema (claro/oscuro), así que los componentes
 * ya no necesitan conocer el modo. Cambiar la marca = editar globals.css.
 *
 * El segundo parámetro queda como compatibilidad histórica y se ignora.
 */
export function col(key: ColorKey, _dark?: boolean): string {
  return `var(--c-${key})`;
}

/** Mezcla cualquier color CSS con transparente (fondos suaves). */
export function mix(color: string, pct = 12): string {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

/** Versión translúcida de un color de la paleta (para fondos suaves). */
export function soft(key: ColorKey, pct = 12): string {
  return mix(`var(--c-${key})`, pct);
}

/** Superficie semántica suave: fondo y borde tenues de un color (avisos, pronóstico). */
export function surf(key: ColorKey): { background: string; borderColor: string } {
  return { background: soft(key, 10), borderColor: soft(key, 28) };
}

/** Pista de fondo de los gauges (token, se adapta al tema). */
export const ARC = "var(--c-arc)";

// ──────────────────────────────────────────────────────────────────────────
// ESTADOS — etiquetas legibles en español (nunca jerga técnica en la UI)
// ──────────────────────────────────────────────────────────────────────────

export const ESTADOS: Record<Estado, string> = {
  STABLE: "Estable",
  WARNING_PROBATION: "En observación",
  CRITICAL_ALERT: "Alerta crítica",
  RECOVERY_PROBATION: "Recuperación",
};

/** Color semántico de cada estado. */
export function estadoColorKey(e: Estado): ColorKey {
  switch (e) {
    case "STABLE":
      return "ok";
    case "WARNING_PROBATION":
      return "warn";
    case "CRITICAL_ALERT":
      return "crit";
    case "RECOVERY_PROBATION":
      return "brand";
  }
}

/**
 * Color por VALOR: verde si está bien, rojo si está mal (sin ámbar).
 * Paleta NEXIA simplificada: verde = bien, rojo = mal.
 */
export function colorPorValor(pct: number, bueno = 60): ColorKey {
  return pct >= bueno ? "ok" : "crit";
}

/**
 * Escala de VERDES (mismo tono, distinta intensidad) para gradientes de salud
 * y series de datos. Más claro = más sano; más oscuro = más cerca de alerta.
 */
export const VERDES = {
  claro: "#6ee7b7",
  medio: "#10b981",
  oscuro: "#059669",
};

/**
 * Color del estado de una máquina (string listo para usar). Paleta NEXIA:
 * verde con tonos cuando no es crítico (más oscuro = más cerca de alerta) y
 * ROJO solo en crítico. Sin ámbar ni azul para estados.
 */
export function estadoColor(estado: Estado): string {
  switch (estado) {
    case "STABLE":
      return VERDES.medio;
    case "WARNING_PROBATION":
    case "RECOVERY_PROBATION":
      return VERDES.oscuro;
    case "CRITICAL_ALERT":
      return col("crit");
  }
}

/** Orden de prioridad para ordenar la flota (0 = más urgente). */
export const RANK_ESTADO: Record<Estado, number> = {
  CRITICAL_ALERT: 0,
  RECOVERY_PROBATION: 1,
  WARNING_PROBATION: 2,
  STABLE: 3,
};

// ──────────────────────────────────────────────────────────────────────────
// FLOTA INICIAL — las 6 máquinas simuladas de la demo
// ──────────────────────────────────────────────────────────────────────────

export const FLOTA: MaquinaSeed[] = [
  { id: "Bomba de llenado #1", sensor: "vib-eje-01", sector: "Embotelladora", base: 2.1, esc: "degradando" },
  { id: "Compresor de aire #2", sensor: "vib-01", sector: "Procesadora de alimentos", base: 3.4, esc: "sano" },
  { id: "Motor cinta transportadora", sensor: "vib-eje-02", sector: "Embotelladora", base: 1.8, esc: "sano" },
  { id: "Bomba de agua cruda", sensor: "vib-01", sector: "Tratamiento de agua", base: 2.6, esc: "critico" },
  { id: "Ventilador extractor", sensor: "vib-03", sector: "Taller mecánico", base: 1.5, esc: "sano" },
  { id: "Bomba dosificadora", sensor: "vib-02", sector: "Tratamiento de agua", base: 2.0, esc: "sano" },
];

// ── Causas raíz posibles por tipo de máquina ───────────────────────────────
export const CAUSAS: Record<TipoMaquina, string[]> = {
  bomba: ["Cavitación", "Desgaste de rodamiento", "Desalineación de eje", "Fuga en sello"],
  compresor: ["Desgaste de rodamiento", "Válvula defectuosa", "Desbalance"],
  motor: ["Desalineación de eje", "Falla de bobinado", "Rodamiento dañado"],
  ventilador: ["Desbalance de aspas", "Acumulación de suciedad", "Rodamiento dañado"],
};

/** Acciones que el técnico puede registrar al cerrar una alerta. */
export const ACCIONES = [
  "Se reemplazó la pieza",
  "Se realineó / ajustó",
  "Se programó intervención",
  "Se lubricó / limpió",
];

/** Deduce el tipo de máquina a partir de su nombre. */
export function tipoDe(id: string): TipoMaquina {
  const l = id.toLowerCase();
  if (l.includes("bomba")) return "bomba";
  if (l.includes("compresor")) return "compresor";
  if (l.includes("motor")) return "motor";
  if (l.includes("ventilador")) return "ventilador";
  return "bomba";
}

// ──────────────────────────────────────────────────────────────────────────
// ROLES
// ──────────────────────────────────────────────────────────────────────────

export const ROL_NOMBRE: Record<Rol, string> = {
  admin: "Administrador",
  jefe: "Jefe de planta",
  tecnico: "Técnico de mantenimiento",
  operador: "Operador",
  lectura: "Solo lectura",
};

export const ROLES: Rol[] = ["admin", "jefe", "tecnico", "operador", "lectura"];

// ──────────────────────────────────────────────────────────────────────────
// SISTEMA DE UNIDADES — cada magnitud con su conversión métrico/imperial
// El valor base se expresa en SI (métrico); la función `f` convierte.
// ──────────────────────────────────────────────────────────────────────────

export const UNIDADES: Record<Magnitud, { nombre: string; m: Unidad; i: Unidad }> = {
  temp: { nombre: "Temperatura", m: { u: "°C", f: (v) => v }, i: { u: "°F", f: (v) => (v * 9) / 5 + 32 } },
  pres: { nombre: "Presión", m: { u: "bar", f: (v) => v }, i: { u: "psi", f: (v) => v * 14.5038 } },
  caudal: { nombre: "Caudal", m: { u: "m³/h", f: (v) => v }, i: { u: "GPM", f: (v) => v * 4.40287 } },
  pot: { nombre: "Potencia", m: { u: "kW", f: (v) => v }, i: { u: "HP", f: (v) => v * 1.34102 } },
  par: { nombre: "Par/Torque", m: { u: "N·m", f: (v) => v }, i: { u: "lb·ft", f: (v) => v * 0.737562 } },
  vib: { nombre: "Vibración", m: { u: "mm/s", f: (v) => v }, i: { u: "in/s", f: (v) => v * 0.0393701 } },
};

/** Magnitudes universales (no cambian con el sistema). */
export const UNIDADES_UNIVERSALES: [string, string][] = [
  ["Velocidad", "RPM"],
  ["Corriente", "A"],
  ["Voltaje", "V"],
  ["Energía", "kWh"],
  ["Frecuencia", "Hz"],
  ["Nivel", "%"],
  ["Humedad", "% HR"],
  ["Ruido", "dB"],
];

// ──────────────────────────────────────────────────────────────────────────
// PROTOCOLOS INDUSTRIALES (vista Conectar)
// ──────────────────────────────────────────────────────────────────────────

export const PROTO_ESENCIAL: Protocolo[] = [
  { n: "Modbus TCP", d: "El más universal · sobre red Ethernet", estado: "conectado" },
  { n: "Modbus RTU", d: "Sobre cable serie RS-485/RS-232", estado: "disponible" },
  { n: "OPC UA", d: "Estándar moderno de interoperabilidad", estado: "disponible" },
  { n: "MQTT", d: "Nativo de NEXIA · ligero y en tiempo real", estado: "conectado" },
];

export const PROTO_VENDOR: Protocolo[] = [
  { n: "Siemens S7", d: "PLC Siemens (S7-300/400/1200/1500)", estado: "disponible" },
  { n: "Allen-Bradley · EtherNet/IP", d: "Rockwell (ControlLogix, CompactLogix)", estado: "disponible" },
  { n: "Omron FINS", d: "PLC Omron", estado: "configurar" },
  { n: "Mitsubishi MELSEC · MC", d: "PLC Mitsubishi", estado: "configurar" },
  { n: "Schneider · Modbus", d: "PLC Schneider (vía Modbus)", estado: "disponible" },
];

export const PROTO_SPECIAL: Protocolo[] = [
  { n: "PROFINET", d: "Bus industrial Siemens de alta velocidad", estado: "configurar" },
  { n: "PROFIBUS", d: "Bus de campo clásico", estado: "configurar" },
  { n: "EtherCAT", d: "Tiempo real, robótica y motion", estado: "configurar" },
  { n: "BACnet", d: "Automatización de edificios / HVAC", estado: "configurar" },
];

// La matriz de permisos (vista Admin) ahora es editable y vive en
// lib/permissions.ts (PERMISOS / PERMISO_LABEL) + el override en SessionProvider.

// El control de acceso por rol vive en lib/permissions.ts (PERMISOS / puede()).
