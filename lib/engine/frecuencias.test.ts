import { describe, expect, it } from "vitest";
import { frecuenciasCaracteristicas } from "./frecuencias";

describe("frecuencias características", () => {
  it("1× es RPM/60 en Hz; 2× y 3× son múltiplos", () => {
    const f = frecuenciasCaracteristicas(1800);
    expect(f[0].hz).toBeCloseTo(30, 5); // 1800/60
    expect(f[1].hz).toBeCloseTo(60, 5);
    expect(f[2].hz).toBeCloseTo(90, 5);
  });

  it("cpm = rpm × orden", () => {
    const f = frecuenciasCaracteristicas(1450);
    expect(f[0].cpm).toBe(1450);
    expect(f[1].cpm).toBe(2900);
    expect(f[2].cpm).toBe(4350);
  });

  it("asocia cada orden con su causa típica", () => {
    const f = frecuenciasCaracteristicas(1000);
    expect(f.map((x) => x.causaKey)).toEqual(["diag.imbalance", "diag.misalignment", "diag.looseness"]);
  });
});
