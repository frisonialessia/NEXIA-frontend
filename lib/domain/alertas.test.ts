import { describe, expect, it } from "vitest";
import { explicarAlerta, resumirRegistro } from "./alertas";
import { DESV_ESTANDAR } from "../engine/fsm";
import type { Alerta } from "../types";

describe("explicarAlerta", () => {
  const a = { vib: 7, exp: 4, umbral: 6.5 } as Alerta;

  it("calcula la desviación porcentual respecto a lo esperado", () => {
    expect(explicarAlerta(a).desviacionPct).toBe(75); // (7-4)/4
  });

  it("expresa la desviación en sigmas", () => {
    expect(explicarAlerta(a).sigmas).toBeCloseTo((7 - 4) / DESV_ESTANDAR, 5);
  });

  it("marca si superó el umbral de fallo", () => {
    expect(explicarAlerta(a).sobreUmbral).toBe(true);
    expect(explicarAlerta({ vib: 6, exp: 4, umbral: 6.5 } as Alerta).sobreUmbral).toBe(false);
  });
});

describe("resumirRegistro (precisión del modelo)", () => {
  it("precisión = aciertos / (aciertos + falsas), ignorando no concluyentes", () => {
    const r = resumirRegistro({ real: 23, falsa: 4, nc: 3 });
    expect(r.auditadas).toBe(27);
    expect(r.precision).toBeCloseTo(23 / 27, 5);
    expect(r.nc).toBe(3); // reportadas aparte, no penalizan
  });

  it("precisión null cuando aún no hay veredictos definitivos", () => {
    expect(resumirRegistro({ real: 0, falsa: 0, nc: 2 }).precision).toBeNull();
  });
});
