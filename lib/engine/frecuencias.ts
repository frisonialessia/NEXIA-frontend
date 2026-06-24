// ──────────────────────────────────────────────────────────────────────────
// DIAGNÓSTICO POR FRECUENCIA (análisis de vibración)
// A partir de la velocidad de giro (RPM), calcula las frecuencias
// características donde aparecen las fallas típicas de maquinaria rotativa. Es la
// "tabla de referencia" que usa un técnico para interpretar un espectro:
//   1× RPM  → desbalance        2× RPM → desalineación        3× RPM → holgura
// (Las frecuencias de rodamiento —BPFO/BPFI/BSF/FTF— requieren la geometría del
//  rodamiento; se habilitarán cuando se capture el modelo del rodamiento.)
// ──────────────────────────────────────────────────────────────────────────

export interface FrecuenciaChar {
  /** orden de la frecuencia respecto a la velocidad de giro (1×, 2×, 3×) */
  orden: number;
  /** frecuencia en Hz */
  hz: number;
  /** ciclos por minuto (= rpm × orden); común en mantenimiento */
  cpm: number;
  /** clave i18n de la causa típica asociada a ese orden */
  causaKey: string;
}

/** Frecuencias características de falla para una velocidad de giro dada (rpm). */
export function frecuenciasCaracteristicas(rpm: number): FrecuenciaChar[] {
  const f1 = rpm / 60; // 1× en Hz
  return [
    { orden: 1, hz: f1, cpm: rpm, causaKey: "diag.imbalance" },
    { orden: 2, hz: 2 * f1, cpm: 2 * rpm, causaKey: "diag.misalignment" },
    { orden: 3, hz: 3 * f1, cpm: 3 * rpm, causaKey: "diag.looseness" },
  ];
}
