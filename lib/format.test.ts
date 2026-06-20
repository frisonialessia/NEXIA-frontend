import { describe, expect, it } from "vitest";
import { convertir, dinero, porcentaje, uni } from "./format";

describe("conversión de unidades", () => {
  it("temperatura métrica vs imperial", () => {
    expect(convertir(100, "temp", "metrico")).toBe(100);
    expect(convertir(100, "temp", "imperial")).toBeCloseTo(212, 5);
  });

  it("presión imperial usa psi", () => {
    expect(uni("pres", "imperial").u).toBe("psi");
    expect(uni("pres", "metrico").u).toBe("bar");
  });

  it("vibración imperial convierte mm/s a in/s", () => {
    expect(convertir(25.4, "vib", "imperial")).toBeCloseTo(1, 2);
  });
});

describe("formato de presentación", () => {
  it("dinero con separador de miles", () => {
    expect(dinero(24000)).toBe("$24.000");
  });

  it("porcentaje redondea a entero", () => {
    expect(porcentaje(0.5)).toBe("50%");
    expect(porcentaje(0.999)).toBe("100%");
  });
});
