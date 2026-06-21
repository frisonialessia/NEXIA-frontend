"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · CONFIGURACIÓN (consolida Ajustes + Conexiones + Equipo)
// Las pestañas disponibles dependen del rol: Ajustes (todos), Conexiones
// (Admin/Técnico), Equipo (solo Admin).
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useSession } from "@/lib/state/SessionProvider";
import { AssetsBody } from "./config/AssetsBody";
import { AuditLogBody } from "./config/AuditLogBody";
import { ConnectBody } from "./config/ConnectBody";
import { EquipoBody } from "./config/EquipoBody";
import { NotificationsBody } from "./config/NotificationsBody";
import { SettingsBody } from "./config/SettingsBody";
import { Tabs, type TabDef } from "./ui/Tabs";

export function Configuracion() {
  const { puede } = useSession();

  const tabs: TabDef[] = [
    { id: "ajustes", label: "Ajustes" },
    ...(puede("activos") ? [{ id: "activos", label: "Activos" }] : []),
    ...(puede("ajustesPlanta") ? [{ id: "notificaciones", label: "Notificaciones" }] : []),
    ...(puede("conexiones") ? [{ id: "conexiones", label: "Conexiones" }] : []),
    ...(puede("usuarios") ? [{ id: "equipo", label: "Equipo" }] : []),
    ...(puede("usuarios") ? [{ id: "registro", label: "Registro" }] : []),
  ];

  const [tab, setTab] = useState("ajustes");
  const activo = tabs.some((t) => t.id === tab) ? tab : "ajustes";

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Configuración</span>
          <h1 className="mt-2 font-serif text-3xl tracking-tight">Configuración</h1>
        </header>

        {tabs.length > 1 && (
          <div className="mb-5">
            <Tabs tabs={tabs} activo={activo} onChange={setTab} />
          </div>
        )}

        {activo === "ajustes" && <SettingsBody />}
        {activo === "activos" && <AssetsBody />}
        {activo === "notificaciones" && <NotificationsBody />}
        {activo === "conexiones" && <ConnectBody />}
        {activo === "equipo" && <EquipoBody />}
        {activo === "registro" && <AuditLogBody />}
      </div>
    </main>
  );
}
