"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · ALERTAS (consolida Auditoría + Historial)
// Pestañas: Pendientes (cola human-in-the-loop) e Historial (registro de
// eventos). El botón de exportar respeta el permiso del rol.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { descargarCSV } from "@/lib/reports/exporter";
import { useT } from "@/lib/state/I18nProvider";
import { useAlertas, useHistorial } from "@/lib/state/useFleet";
import { useSession } from "@/lib/state/SessionProvider";
import { AuditQueue } from "./alertas/AuditQueue";
import { HistoryList } from "./alertas/HistoryList";
import { Icon } from "./ui/Icon";
import { Button } from "./ui/Primitives";
import { Tabs } from "./ui/Tabs";
import { Label, PageTitle } from "./ui/Typo";

export function Alertas() {
  const alertas = useAlertas();
  const historial = useHistorial();
  const { puede } = useSession();
  const t = useT();
  const [tab, setTab] = useState("pendientes");

  function exportar() {
    if (historial.length === 0) {
      toast(t("alerts.noExport"));
      return;
    }
    const filas: (string | number)[][] = [
      ["Máquina", "Causa", "Probabilidad", "Fecha", "Hora", "Estado"],
      ...historial.map((h) => [h.maquina, h.causa, `${Math.round(h.prob * 100)}%`, h.fecha, h.hora, h.estado]),
    ];
    descargarCSV(`nexia-alertas-${Date.now()}.csv`, filas);
    toast(t("alerts.exported"));
  }

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <Label>{t("alerts.hitl")}</Label>
          <div className="mt-2 flex items-end justify-between">
            <PageTitle>{t("alerts.title")}</PageTitle>
            {puede("exportar") && (
              <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={exportar}>
                <Icon name="download" className="h-3.5 w-3.5" />
                {t("alerts.export")}
              </Button>
            )}
          </div>
        </header>

        <div className="mb-5">
          <Tabs
            tabs={[
              { id: "pendientes", label: t("alerts.pending"), badge: alertas.length },
              { id: "historial", label: t("alerts.history") },
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
