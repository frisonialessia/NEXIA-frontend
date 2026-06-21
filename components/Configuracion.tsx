"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · CONFIGURACIÓN (consolida Ajustes, Activos, Plantas, Notificaciones,
// Conexiones, Equipo, Facturación y Registro). Las pestañas disponibles
// dependen del rol (ver permisos).
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useSession } from "@/lib/state/SessionProvider";
import { AssetsBody } from "./config/AssetsBody";
import { AuditLogBody } from "./config/AuditLogBody";
import { BillingBody } from "./config/BillingBody";
import { ConnectBody } from "./config/ConnectBody";
import { EquipoBody } from "./config/EquipoBody";
import { NotificationsBody } from "./config/NotificationsBody";
import { PlantsBody } from "./config/PlantsBody";
import { SettingsBody } from "./config/SettingsBody";
import { Tabs, type TabDef } from "./ui/Tabs";

export function Configuracion() {
  const { puede } = useSession();

  const tabs: TabDef[] = [
    { id: "ajustes", label: "Ajustes" },
    ...(puede("activos") ? [{ id: "activos", label: "Activos" }] : []),
    ...(puede("plantas") ? [{ id: "plantas", label: "Plantas" }] : []),
    ...(puede("ajustesPlanta") ? [{ id: "notificaciones", label: "Notificaciones" }] : []),
    ...(puede("conexiones") ? [{ id: "conexiones", label: "Conexiones" }] : []),
    ...(puede("usuarios") ? [{ id: "equipo", label: "Equipo" }] : []),
    ...(puede("facturacion") ? [{ id: "facturacion", label: "Facturación" }] : []),
    ...(puede("usuarios") ? [{ id: "registro", label: "Registro" }] : []),
  ];

  const [tab, setTab] = useState("ajustes");
  const activo = tabs.some((t) => t.id === tab) ? tab : "ajustes";

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Configuración</span>
          <h1 className="mt-2 font-display text-3xl tracking-tight">Configuración</h1>
        </header>

        {tabs.length > 1 && (
          <div className="mb-5">
            <Tabs tabs={tabs} activo={activo} onChange={setTab} />
          </div>
        )}

        {activo === "ajustes" && <SettingsBody />}
        {activo === "activos" && <AssetsBody />}
        {activo === "plantas" && <PlantsBody />}
        {activo === "notificaciones" && <NotificationsBody />}
        {activo === "conexiones" && <ConnectBody />}
        {activo === "equipo" && <EquipoBody />}
        {activo === "facturacion" && <BillingBody />}
        {activo === "registro" && <AuditLogBody />}
      </div>
    </main>
  );
}
