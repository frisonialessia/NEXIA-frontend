"use client";

// ──────────────────────────────────────────────────────────────────────────
// CENTRO DE NOTIFICACIONES (campana)
// Muestra las alertas pendientes con un indicador de conteo y un panel con las
// más recientes. En producción, este mismo punto recibe los avisos que también
// salen por SMS/WhatsApp/correo con escalado.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { col } from "@/lib/constants";
import { useFleet } from "@/lib/state/FleetProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import { Icon } from "./ui/Icon";

export function NotificationBell() {
  const { alertas } = useFleet();
  const { dark } = useTheme();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el panel al hacer clic fuera.
  useEffect(() => {
    if (!abierto) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierto]);

  const recientes = alertas.slice(0, 6);
  const crit = col("crit", dark);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        aria-label="Notificaciones"
        className="relative rounded-lg border border-neutral-200 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        <Icon name="bell" className="h-4 w-4" />
        {alertas.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white" style={{ background: crit }}>
            {alertas.length}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Notificaciones</span>
            <span className="font-mono text-xs text-neutral-400">{alertas.length} pendientes</span>
          </div>

          {recientes.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Icon name="check" className="mx-auto h-6 w-6" style={{ color: col("ok", dark) }} />
              <p className="mt-3 text-sm text-neutral-500">Sin alertas pendientes.</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {recientes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setAbierto(false);
                    router.push("/alertas");
                  }}
                  className="flex w-full items-start gap-3 border-b border-neutral-100 px-4 py-3 text-left transition-colors last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                >
                  <span className="relative mt-1 flex h-2 w-2 shrink-0">
                    <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: crit, opacity: 0.5 }} />
                    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: crit }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.maquina}</div>
                    <p className="mt-0.5 truncate text-xs text-neutral-500">{a.causa}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-neutral-400">{a.hora}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setAbierto(false);
              router.push("/alertas");
            }}
            className="block w-full border-t border-neutral-100 px-4 py-3 text-center text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
          >
            Ver todas las alertas
          </button>
        </div>
      )}
    </div>
  );
}
