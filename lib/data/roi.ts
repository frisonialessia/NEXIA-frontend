// ──────────────────────────────────────────────────────────────────────────
// CALCULADORA DE AHORRO (ROI) — pieza de venta
// Estima el ahorro de evitar paradas no planificadas. Lógica pura y testeable.
// El cliente mete SUS números → ve SU ahorro. Es una estimación honesta (se
// etiqueta como tal en la UI), no una promesa.
// ──────────────────────────────────────────────────────────────────────────

export interface EntradaROI {
  /** costo de una hora de parada no planificada (€/$) */
  costoHora: number;
  /** paradas no planificadas al mes */
  paradasMes: number;
  /** horas promedio que dura cada parada */
  horasPorParada: number;
  /** % de esas paradas que NEXIA anticipa a tiempo (0–100) */
  deteccionPct: number;
}

export interface ResultadoROI {
  /** ahorro estimado al mes */
  ahorroMes: number;
  /** ahorro estimado al año */
  ahorroAnio: number;
  /** paradas evitadas al mes (puede ser fraccional → se redondea en la UI) */
  paradasEvitadas: number;
  /** horas de producción recuperadas al mes */
  horasRecuperadas: number;
}

export const ROI_DEFAULT: EntradaROI = {
  costoHora: 1500,
  paradasMes: 3,
  horasPorParada: 8,
  deteccionPct: 70,
};

/** Presets por industria para arrancar la calculadora con números plausibles. */
export interface PresetROI {
  /** clave i18n del nombre de la industria */
  nombreKey: string;
  datos: EntradaROI;
}

export const PRESETS_ROI: PresetROI[] = [
  { nombreKey: "calc.presetBottling", datos: { costoHora: 2000, paradasMes: 4, horasPorParada: 6, deteccionPct: 75 } },
  { nombreKey: "calc.presetWater", datos: { costoHora: 1200, paradasMes: 2, horasPorParada: 10, deteccionPct: 70 } },
  { nombreKey: "calc.presetFood", datos: { costoHora: 1800, paradasMes: 3, horasPorParada: 8, deteccionPct: 72 } },
];

/** Calcula el ahorro estimado a partir de los datos del cliente. */
export function calcularROI(e: EntradaROI): ResultadoROI {
  const frac = Math.min(100, Math.max(0, e.deteccionPct)) / 100;
  const paradasEvitadas = e.paradasMes * frac;
  const horasRecuperadas = paradasEvitadas * e.horasPorParada;
  const ahorroMes = horasRecuperadas * e.costoHora;
  return {
    ahorroMes,
    ahorroAnio: ahorroMes * 12,
    paradasEvitadas,
    horasRecuperadas,
  };
}
