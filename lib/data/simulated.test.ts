import { describe, expect, it } from "vitest";
import { aEventoHistorial, crearFlota, tickMaquina } from "./simulated";

describe("motor simulado", () => {
  it("crea la flota inicial en estado estable y sin historial", () => {
    const flota = crearFlota();
    expect(flota).toHaveLength(6);
    expect(flota.every((m) => m.estado === "STABLE")).toBe(true);
    expect(flota.every((m) => m.hist.length === 0)).toBe(true);
  });

  it("una máquina en escenario crítico escala a CRITICAL_ALERT y emite UNA alerta", () => {
    const m = crearFlota().find((x) => x.esc === "critico")!;
    const alertas = [];
    for (let i = 0; i < 12; i++) {
      const a = tickMaquina(m);
      if (a) alertas.push(a);
    }
    expect(m.estado).toBe("CRITICAL_ALERT");
    // La alerta se emite solo en la transición a crítico, no en cada tick.
    expect(alertas).toHaveLength(1);
    expect(alertas[0].maquina).toBe(m.id);
  });

  it("una máquina sana no genera alertas", () => {
    const m = crearFlota().find((x) => x.esc === "sano")!;
    const alertas = [];
    for (let i = 0; i < 20; i++) {
      const a = tickMaquina(m);
      if (a) alertas.push(a);
    }
    expect(m.estado).toBe("STABLE");
    expect(alertas).toHaveLength(0);
  });

  it("convierte una alerta en evento de historial pendiente", () => {
    const m = crearFlota().find((x) => x.esc === "critico")!;
    let alerta = null;
    for (let i = 0; i < 12 && !alerta; i++) alerta = tickMaquina(m);
    const evento = aEventoHistorial(alerta!);
    expect(evento.estado).toBe("Pendiente");
    expect(evento.maquina).toBe(m.id);
    expect(typeof evento.fecha).toBe("string");
  });
});
