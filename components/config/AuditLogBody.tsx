"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña REGISTRO (auditoría de cuenta)
// Bitácora de acciones administrativas: invitaciones, cambios de rol/permiso,
// alertas etiquetadas y ajustes guardados. Quién, qué y cuándo.
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { SURFACE } from "../ui/Card";
import { Icon } from "../ui/Icon";

export function AuditLogBody() {
  const { auditoria } = useAdmin();
  const t = useT();

  if (auditoria.length === 0) {
    return (
      <div className={`${SURFACE} px-8 py-16 text-center`}>
        <Icon name="clipboard" className="mx-auto h-7 w-7 text-neutral-300" />
        <p className="mt-3 text-sm text-neutral-500">{t("log.empty1")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("log.empty2")}</p>
      </div>
    );
  }

  return (
    <div className={`${SURFACE} overflow-hidden`}>
      {auditoria.map((e, i) => (
        <div key={e.id} className={`flex items-center gap-4 px-6 py-4 ${i === auditoria.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}>
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: col("brand") }} />
          <div className="min-w-0 flex-1">
            <div className="text-sm">
              <span className="font-medium">{e.actor}</span> <span className="text-neutral-500">· {e.accion.toLowerCase()}</span>
            </div>
            <p className="truncate text-xs text-neutral-400">{e.detalle}</p>
          </div>
          <div className="shrink-0 text-right font-mono text-[11px] text-neutral-400">
            {e.fecha} · {e.hora}
          </div>
        </div>
      ))}
    </div>
  );
}
