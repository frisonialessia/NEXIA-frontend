import { describe, expect, it } from "vitest";
import { calcularROI } from "./roi";

describe("calculadora de ahorro (ROI)", () => {
  it("ahorro = paradas × detección × horas × costo", () => {
    const r = calcularROI({ costoHora: 1500, paradasMes: 3, horasPorParada: 8, deteccionPct: 70 });
    expect(r.paradasEvitadas).toBeCloseTo(2.1, 5); // 3 × 0.7
    expect(r.horasRecuperadas).toBeCloseTo(16.8, 5); // 2.1 × 8
    expect(r.ahorroMes).toBeCloseTo(25200, 5); // 16.8 × 1500
    expect(r.ahorroAnio).toBeCloseTo(25200 * 12, 5);
  });

  it("detección 0% → sin ahorro; 100% → todas las paradas", () => {
    expect(calcularROI({ costoHora: 1000, paradasMes: 5, horasPorParada: 4, deteccionPct: 0 }).ahorroMes).toBe(0);
    expect(calcularROI({ costoHora: 1000, paradasMes: 5, horasPorParada: 4, deteccionPct: 100 }).paradasEvitadas).toBe(5);
  });

  it("acota la detección fuera de rango (0–100)", () => {
    expect(calcularROI({ costoHora: 100, paradasMes: 1, horasPorParada: 1, deteccionPct: 150 }).paradasEvitadas).toBe(1);
  });
});
