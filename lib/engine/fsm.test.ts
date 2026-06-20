import { describe, expect, it } from "vitest";
import { causaPrincipal, diasAFallo, esAlta, probabilidadFallo, transicion } from "./fsm";
import { UMBRAL_CRITICO } from "../constants";
import type { Estado, Maquina } from "../types";

// Simula una secuencia de lecturas (true = alta) sobre la FSM y devuelve el estado final.
function correr(altas: boolean[], inicial: Estado = "STABLE") {
  let estado = inicial;
  let cSube = 0;
  let cBaja = 0;
  for (const alto of altas) {
    const t = transicion(estado, cSube, cBaja, alto);
    estado = t.estado;
    cSube = t.cSube;
    cBaja = t.cBaja;
  }
  return estado;
}

describe("FSM con histéresis", () => {
  it("STABLE pasa a observación con una lectura alta", () => {
    expect(correr([true])).toBe("WARNING_PROBATION");
  });

  it("escala a crítico solo tras 3 lecturas altas consecutivas (anti-flapping)", () => {
    expect(correr([true, true])).toBe("WARNING_PROBATION"); // aún no
    expect(correr([true, true, true])).toBe("CRITICAL_ALERT");
  });

  it("una lectura aislada NO dispara crítico (evita falsas alarmas)", () => {
    expect(correr([true, false, true, false, true])).toBe("WARNING_PROBATION");
  });

  it("vuelve a estable desde observación tras 2 lecturas bajas", () => {
    expect(correr([true, false, false])).toBe("STABLE");
  });

  it("de crítico baja a recuperación con una lectura baja, y a estable tras 5", () => {
    expect(correr([true, true, true, false])).toBe("RECOVERY_PROBATION");
    expect(correr([true, true, true, false, false, false, false, false])).toBe("STABLE");
  });

  it("recae a crítico si vuelve una lectura alta durante la recuperación", () => {
    expect(correr([true, true, true, false, true])).toBe("CRITICAL_ALERT");
  });
});

describe("probabilidad de fallo", () => {
  it("queda acotada en [0.02, 0.99]", () => {
    expect(probabilidadFallo(0, 0)).toBeGreaterThanOrEqual(0.02);
    expect(probabilidadFallo(100, 0)).toBeLessThanOrEqual(0.99);
  });

  it("crece con la desviación respecto a lo esperado", () => {
    const baja = probabilidadFallo(2, 2);
    const alta = probabilidadFallo(6, 2);
    expect(alta).toBeGreaterThan(baja);
  });

  it("esAlta() usa el umbral de 0.6", () => {
    expect(esAlta(0.59)).toBe(false);
    expect(esAlta(0.6)).toBe(true);
  });
});

describe("días a fallo", () => {
  const base = (v: number, ritmoDia: number): Maquina =>
    ({ hist: [{ t: 0, v, exp: 2 }], ritmoDia } as unknown as Maquina);

  it("es Infinity si no hay degradación", () => {
    expect(diasAFallo(base(3, 0))).toBe(Infinity);
  });

  it("es 0 si ya superó el umbral crítico", () => {
    expect(diasAFallo(base(UMBRAL_CRITICO + 1, 0.7))).toBe(0);
  });

  it("proyecta (umbral - actual) / ritmo", () => {
    expect(diasAFallo(base(4.5, 0.5))).toBeCloseTo((UMBRAL_CRITICO - 4.5) / 0.5, 5);
  });
});

describe("causa principal", () => {
  it("devuelve la primera causa del tipo", () => {
    expect(causaPrincipal("bomba")).toBe("Cavitación");
    expect(causaPrincipal("ventilador")).toBe("Desbalance de aspas");
  });
});
