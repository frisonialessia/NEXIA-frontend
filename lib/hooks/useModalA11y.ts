"use client";

// ──────────────────────────────────────────────────────────────────────────
// ACCESIBILIDAD DE DIÁLOGOS
// Cierra con ESC, atrapa el foco dentro del modal (Tab cicla) y restaura el
// foco al elemento previo al cerrar. Devuelve el ref para el contenedor.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

const SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useModalA11y<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null;
    const node = ref.current;

    const focusables = () =>
      node
        ? Array.from(node.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => !el.hasAttribute("disabled"))
        : [];

    (focusables()[0] ?? node)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const idx = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && idx === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previo?.focus?.();
    };
  }, [onClose]);

  return ref;
}
