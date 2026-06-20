"use client";

// ──────────────────────────────────────────────────────────────────────────
// PREFERENCIAS DE ORDEN DE LA FLOTA (arrastre + fijar)
// Persiste el orden manual del usuario y las máquinas fijadas. Hoy en
// localStorage; el día del backend, por usuario. Las vistas no cambian.
// ──────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";

const K_ORDEN = "nexia-orden";
const K_PINS = "nexia-pins";

function leer(clave: string): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(clave) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function useFleetOrder() {
  const [orden, setOrdenState] = useState<string[]>([]);
  const [pins, setPinsState] = useState<string[]>([]);

  useEffect(() => {
    setOrdenState(leer(K_ORDEN));
    setPinsState(leer(K_PINS));
  }, []);

  const setOrden = useCallback((ids: string[]) => {
    setOrdenState(ids);
    localStorage.setItem(K_ORDEN, JSON.stringify(ids));
  }, []);

  const togglePin = useCallback((id: string) => {
    setPinsState((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(K_PINS, JSON.stringify(next));
      return next;
    });
  }, []);

  return { orden, pins, setOrden, togglePin };
}
