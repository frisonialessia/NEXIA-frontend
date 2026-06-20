import { describe, expect, it } from "vitest";
import { ordenarConPreferencias, ordenarFlota } from "./flota";
import type { Maquina } from "../types";

const m = (id: string, estado: Maquina["estado"], prob: number): Maquina =>
  ({ id, estado, prob }) as unknown as Maquina;

describe("orden estable de la flota", () => {
  it("crítico primero; dentro del mismo estado, por nombre", () => {
    const flota = [m("Zeta", "STABLE", 0.9), m("Alfa", "STABLE", 0.1), m("Beta", "CRITICAL_ALERT", 0.5)];
    expect(ordenarFlota(flota).map((x) => x.id)).toEqual(["Beta", "Alfa", "Zeta"]);
  });

  it("la probabilidad NO altera el orden (evita el 'salto' cada 2s)", () => {
    const antes = ordenarFlota([m("A", "STABLE", 0.2), m("B", "STABLE", 0.3)]).map((x) => x.id);
    const despues = ordenarFlota([m("A", "STABLE", 0.95), m("B", "STABLE", 0.1)]).map((x) => x.id);
    expect(antes).toEqual(despues);
  });
});

describe("orden con preferencias (arrastre + pin)", () => {
  it("críticas arriba, luego fijadas, luego el orden del usuario", () => {
    const flota = [
      m("Ventilador", "STABLE", 0.1),
      m("Bomba", "CRITICAL_ALERT", 0.99),
      m("Motor", "STABLE", 0.2),
      m("Compresor", "STABLE", 0.1),
    ];
    // El usuario arrastró: Motor antes que Ventilador; fijó "Compresor".
    const orden = ["Motor", "Ventilador", "Compresor"];
    const pins = ["Compresor"];
    expect(ordenarConPreferencias(flota, orden, pins).map((x) => x.id)).toEqual([
      "Bomba", // crítica siempre arriba
      "Compresor", // fijada
      "Motor", // orden del usuario
      "Ventilador",
    ]);
  });
});
