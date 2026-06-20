"use client";

// ──────────────────────────────────────────────────────────────────────────
// NOTIFICACIÓN MÓVIL SIMULADA
// La tarjeta tipo "SMS al responsable" que aparece arriba a la derecha cuando
// una máquina entra en estado crítico. Se autodescarta a los 6s.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { cerrarNotif, useNotif } from "@/lib/state/useFleet";
import { Icon } from "./ui/Icon";

export function PhoneAlert() {
  const notif = useNotif();

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(cerrarNotif, 6000);
    return () => clearTimeout(t);
  }, [notif]);

  if (!notif) return null;

  return (
    <div className="slide-in fixed right-6 top-20 z-50 w-80">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: "#ef4444" }}>
            <Icon name="alert" className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold">NEXIA</div>
            <div className="text-[10px] text-neutral-400">ahora · SMS al responsable</div>
          </div>
        </div>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-200">
          {notif.maquina}: vibración crítica detectada. Causa probable: {notif.causa.toLowerCase()}. Revisar de inmediato.
        </p>
      </div>
    </div>
  );
}
