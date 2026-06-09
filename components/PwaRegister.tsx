"use client";

// ──────────────────────────────────────────────────────────────────────────
// REGISTRO DEL SERVICE WORKER
// Activa el cascarón offline en producción. Silencioso si no hay soporte.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencioso: la app funciona igual sin offline */
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
