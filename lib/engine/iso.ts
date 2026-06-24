// ──────────────────────────────────────────────────────────────────────────
// SEVERIDAD DE VIBRACIÓN · ISO 10816-3 (RMS de velocidad, mm/s)
// Clasifica una máquina en zonas A/B/C/D según su potencia y montaje, y deriva
// el umbral crítico (frontera C/D = inicio de daño) sin tener que ponerlo a
// mano. Lenguaje que un jefe de mantenimiento reconoce al instante.
//   A = buena (máquina nueva) · B = aceptable (operación prolongada)
//   C = insatisfactoria (solo corto plazo) · D = daño (intervenir)
// ──────────────────────────────────────────────────────────────────────────

export type Montaje = "rigido" | "flexible";
export type ZonaISO = "A" | "B" | "C" | "D";

export interface ZonasISO {
  /** frontera A/B */
  ab: number;
  /** frontera B/C */
  bc: number;
  /** frontera C/D (umbral de daño) */
  cd: number;
}

/**
 * Fronteras de zona (mm/s RMS) según ISO 10816-3. Se distingue máquina mediana
 * (15–300 kW) de grande (>300 kW), y soporte rígido vs. flexible.
 */
export function zonasISO(potenciaKw: number, montaje: Montaje = "rigido"): ZonasISO {
  const grande = potenciaKw > 300;
  if (montaje === "flexible") {
    return grande ? { ab: 3.5, bc: 7.1, cd: 11.0 } : { ab: 2.3, bc: 4.5, cd: 7.1 };
  }
  return grande ? { ab: 2.3, bc: 4.5, cd: 7.1 } : { ab: 1.4, bc: 2.8, cd: 4.5 };
}

/** Zona ISO de un valor de vibración dado el juego de fronteras. */
export function zonaDe(vib: number, z: ZonasISO): ZonaISO {
  if (vib < z.ab) return "A";
  if (vib < z.bc) return "B";
  if (vib < z.cd) return "C";
  return "D";
}

/** Umbral crítico derivado de ISO (frontera C/D) para una potencia/montaje. */
export function umbralISO(potenciaKw: number, montaje: Montaje = "rigido"): number {
  return zonasISO(potenciaKw, montaje).cd;
}
