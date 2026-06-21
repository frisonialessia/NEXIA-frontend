// ──────────────────────────────────────────────────────────────────────────
// CAPA DE DATOS · ANALÍTICA (histórico)
// Series para la vista de Reportes. Hoy simuladas; el día del backend, vienen
// de la base de datos histórica (la UI no cambia).
// ──────────────────────────────────────────────────────────────────────────

import { AHORRO_POR_PARADA, VERDES } from "../constants";
import { AHORRO_SEMANAL, SALUD_SEMANAL } from "./trend";

export const SEMANAS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];

export { AHORRO_SEMANAL, SALUD_SEMANAL };

/** Alertas detectadas por semana. */
export const ALERTAS_SEMANAL = [5, 4, 6, 3, 4, 2, 3, 2];

/** Ahorro atribuible por máquina (paradas evitadas × costo). */
export const ROI_POR_MAQUINA: { maquina: string; ahorro: number }[] = [
  { maquina: "Bomba de agua cruda", ahorro: 12000 },
  { maquina: "Bomba de llenado #1", ahorro: 6000 },
  { maquina: "Compresor de aire #2", ahorro: 3000 },
  { maquina: "Motor cinta transportadora", ahorro: 1500 },
  { maquina: "Ventilador extractor", ahorro: 1000 },
  { maquina: "Bomba dosificadora", ahorro: 500 },
];

/** Causas raíz más frecuentes (conteo). */
export const CAUSAS_FRECUENTES: { causa: string; n: number }[] = [
  { causa: "Desgaste de rodamiento", n: 9 },
  { causa: "Cavitación", n: 6 },
  { causa: "Desalineación de eje", n: 4 },
  { causa: "Desbalance", n: 3 },
  { causa: "Fuga en sello", n: 2 },
];

/** KPIs resumen del periodo. */
export const ANALYTICS_KPIS = {
  ahorroAcumulado: AHORRO_SEMANAL[AHORRO_SEMANAL.length - 1],
  paradasEvitadas: Math.round(AHORRO_SEMANAL[AHORRO_SEMANAL.length - 1] / AHORRO_POR_PARADA),
  mtbf: "182 h",
  disponibilidad: 87.5,
};

export const VERDE = VERDES.medio;
