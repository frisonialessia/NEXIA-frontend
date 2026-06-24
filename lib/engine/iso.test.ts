import { describe, expect, it } from "vitest";
import { umbralISO, zonaDe, zonasISO } from "./iso";

describe("ISO 10816", () => {
  it("máquina mediana rígida usa fronteras 1.4 / 2.8 / 4.5", () => {
    expect(zonasISO(30)).toEqual({ ab: 1.4, bc: 2.8, cd: 4.5 });
  });

  it("máquina grande (>300 kW) sube las fronteras", () => {
    expect(zonasISO(500)).toEqual({ ab: 2.3, bc: 4.5, cd: 7.1 });
  });

  it("montaje flexible es más permisivo que el rígido", () => {
    expect(zonasISO(30, "flexible").cd).toBeGreaterThan(zonasISO(30, "rigido").cd);
  });

  it("clasifica la zona según el valor de vibración", () => {
    const z = zonasISO(30); // 1.4 / 2.8 / 4.5
    expect(zonaDe(1.0, z)).toBe("A");
    expect(zonaDe(2.0, z)).toBe("B");
    expect(zonaDe(3.5, z)).toBe("C");
    expect(zonaDe(6.0, z)).toBe("D");
  });

  it("el umbral ISO es la frontera C/D (inicio de daño)", () => {
    expect(umbralISO(30)).toBe(4.5);
  });
});
