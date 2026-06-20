"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · ALERTAS (consolida Auditoría + Historial)
// Pestañas: Pendientes (cola human-in-the-loop) e Historial (registro de
// eventos). El botón de exportar respeta el permiso del rol.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { useAlertas } from "@/lib/state/useFleet";
import { useSession } from "@/lib/state/SessionProvider";
import { AuditQueue } from "./alertas/AuditQueue";
import { HistoryList } from "./alertas/HistoryList";
import { Icon } from "./ui/Icon";
import { Tabs } from "./ui/Tabs";

export function Alertas() {
  const alertas = useAlertas();
  const { puede } = useSession();
  const [tab, setTab] = useState("pendientes");

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Human-in-the-loop</span>
          <div className="mt-2 flex items-end justify-between">
            <h1 className="font-serif text-3xl tracking-tight">Alertas</h1>
            {puede("exportar") && (
              <button
                onClick={() => toast("En la versión real: exporta un PDF para llevar a la reunión.")}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-300 dark:border-neutral-700"
              >
                <Icon name="download" className="h-3.5 w-3.5" />
                Exportar reporte
              </button>
            )}
          </div>
        </header>

        <div className="mb-5">
          <Tabs
            tabs={[
              { id: "pendientes", label: "Pendientes", badge: alertas.length },
              { id: "historial", label: "Historial" },
            ]}
            activo={tab}
            onChange={setTab}
          />
        </div>

        {tab === "pendientes" ? <AuditQueue /> : <HistoryList />}
      </div>
    </main>
  );
}
