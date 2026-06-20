"use client";

// ──────────────────────────────────────────────────────────────────────────
// ANUNCIADOR EN VIVO (accesibilidad)
// Región aria-live que anuncia las alertas críticas a lectores de pantalla,
// sin saturar (solo cuando aparece una nueva). Invisible visualmente.
// ──────────────────────────────────────────────────────────────────────────

import { useNotif } from "@/lib/state/useFleet";

export function LiveAnnouncer() {
  const notif = useNotif();
  return (
    <div role="status" aria-live="assertive" className="sr-only">
      {notif ? `Alerta crítica en ${notif.maquina}. Causa probable: ${notif.causa}.` : ""}
    </div>
  );
}
