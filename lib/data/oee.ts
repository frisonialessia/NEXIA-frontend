"use client";

// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · PRODUCCIÓN / OEE
// Antes vivía dentro de la vista. Ahora es parte de la capa de datos: el día
// del backend se reemplaza useOee() por una consulta, sin tocar la vista.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { VERDES } from "../constants";

export interface OeeState {
  dispo: number;
  rend: number;
  cal: number;
  buenas: number;
  malas: number;
  ritmo: number;
}

export const OEE_INICIAL: OeeState = {
  dispo: 0.875,
  rend: 0.905,
  cal: 0.979,
  buenas: 3720,
  malas: 80,
  ritmo: 9,
};

/** Avanza el turno un paso (piezas y ritmo en vivo). */
export function tickOee(s: OeeState): OeeState {
  return {
    ...s,
    buenas: s.buenas + Math.floor(Math.random() * 6),
    malas: s.malas + (Math.random() < 0.3 ? 1 : 0),
    ritmo: +(8 + Math.random() * 2).toFixed(1),
  };
}

/** Tiempos de inactividad por causa (minutos). Verdes + rojo para el fallo. */
export const DOWNTIME: { c: string; m: number; color: string }[] = [
  { c: "Falta de material", m: 28, color: VERDES.medio },
  { c: "Fallo mecánico", m: 18, color: "#ef4444" },
  { c: "Cambio de formato", m: 9, color: VERDES.claro },
  { c: "Error de operador", m: 5, color: VERDES.oscuro },
];

/** Consumo energético del turno (tonos de verde, dato neutro). */
export const ENERGIA: { n: string; v: number; u: string; max: number; color: string }[] = [
  { n: "Energía eléctrica", v: 842, u: "kWh", max: 1000, color: VERDES.oscuro },
  { n: "Aire comprimido", v: 310, u: "m³", max: 500, color: VERDES.medio },
  { n: "Agua de proceso", v: 128, u: "m³", max: 200, color: VERDES.claro },
];

/** Hook: estado de OEE en vivo (se actualiza cada 2s). */
export function useOee(): OeeState {
  const [oee, setOee] = useState<OeeState>(OEE_INICIAL);
  useEffect(() => {
    const t = setInterval(() => setOee(tickOee), 2000);
    return () => clearInterval(t);
  }, []);
  return oee;
}
