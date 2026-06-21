"use client";

// ──────────────────────────────────────────────────────────────────────────
// COLA DE AUDITORÍA (cuerpo, sin cabecera de página)
// Lista de alertas pendientes + modal human-in-the-loop. Si el rol no puede
// auditar (Solo lectura), las filas se muestran en modo consulta, sin modal.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ACCIONES, ARC, CAUSAS, ROL_NOMBRE, col, mix, soft } from "@/lib/constants";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { etiquetarAlerta, useAlertas } from "@/lib/state/useFleet";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useT } from "@/lib/state/I18nProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Alerta, Veredicto } from "@/lib/types";
import { SURFACE } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Pill } from "../ui/Primitives";

export function AuditQueue() {
  const alertas = useAlertas();
  const { dark } = useTheme();
  const { puede } = useSession();
  const t = useT();
  const [abierta, setAbierta] = useState<Alerta | null>(null);

  const puedeAuditar = puede("auditar");

  if (alertas.length === 0) {
    return (
      <div className={`${SURFACE} px-8 py-16 text-center`}>
        <Icon name="check" className="mx-auto h-8 w-8" style={{ color: col("ok", dark) }} />
        <p className="mt-4 text-sm text-neutral-500">{t("audit.empty1")}</p>
        <p className="mt-1 text-xs text-neutral-400">{t("audit.empty2")}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${SURFACE} overflow-hidden`}>
        {alertas.map((a, i) => {
          const contenido = (
            <>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: col("crit", dark), opacity: 0.5 }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: col("crit", dark) }} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-display text-base">{a.maquina}</span>
                <p className="mt-0.5 truncate text-sm text-neutral-500">{a.causa}</p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <div className="font-mono text-sm">{Math.round(a.prob * 100)}%</div>
              </div>
              <div className="hidden shrink-0 text-right md:block">
                <div className="font-mono text-xs text-neutral-500">{a.hora}</div>
              </div>
              <Pill colorKey="crit">{t("audit.pendingPill")}</Pill>
            </>
          );
          const borde = i === alertas.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800";

          return puedeAuditar ? (
            <button
              key={a.id}
              onClick={() => setAbierta(a)}
              className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800 ${borde}`}
            >
              {contenido}
            </button>
          ) : (
            <div key={a.id} className={`flex w-full items-center gap-4 px-6 py-4 ${borde}`}>
              {contenido}
            </div>
          );
        })}
      </div>

      {abierta && <AuditModal alerta={abierta} onClose={() => setAbierta(null)} />}
    </>
  );
}

function AuditModal({ alerta, onClose }: { alerta: Alerta; onClose: () => void }) {
  const { dark } = useTheme();
  const { rol } = useSession();
  const { registrar } = useAdmin();
  const t = useT();
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [causaSel, setCausaSel] = useState<string | null>(null);
  const [accionSel, setAccionSel] = useState<string | null>(null);

  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const causas = CAUSAS[alerta.tipo] || CAUSAS.bomba;
  const puedeGuardar = !!veredicto && (veredicto !== "real" || (!!causaSel && !!accionSel));

  function colorVeredicto(v: Veredicto): string {
    return v === "real" ? col("crit", dark) : v === "falsa" ? col("ok", dark) : col("gray", dark);
  }

  function guardar() {
    const etiqueta = veredicto === "real" ? "fallo real" : veredicto === "falsa" ? "falsa alarma" : "no concluyente";
    etiquetarAlerta(alerta.id, veredicto!);
    registrar(ROL_NOMBRE[rol], "Etiquetó una alerta", `${alerta.maquina} · ${etiqueta}`);
    onClose();
    toast(t("audit.labeled"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 px-8 pt-8 pb-6 dark:border-neutral-800">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{t("alerts.hitl")}</span>
          <h2 id="audit-modal-title" className="mt-3 font-display text-2xl tracking-tight">{t("audit.confirmTitle")}</h2>
          <div className="mt-3 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">{t("audit.probableCause")}</span>
            <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-200">{alerta.causa}</p>
          </div>
        </div>

        <div className="px-8 py-7">
          <label className="mb-3 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("audit.wasCorrect")}</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {([
              ["real", t("audit.real")],
              ["falsa", t("audit.false")],
              ["nc", t("audit.nc")],
            ] as [Veredicto, string][]).map(([v, label]) => {
              const sel = veredicto === v;
              const cc = colorVeredicto(v);
              return (
                <button
                  key={v}
                  onClick={() => {
                    setVeredicto(v);
                    setCausaSel(null);
                    setAccionSel(null);
                  }}
                  className="rounded-xl border px-3 py-3 text-sm font-medium transition-all"
                  style={sel ? { borderColor: cc, background: mix(cc), color: cc } : { borderColor: ARC, color: "#737373" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {veredicto === "real" && (
            <div className="mt-6">
              <label className="mb-3 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("audit.rootCause")}</label>
              <div className="grid gap-1.5">
                {causas.map((c) => (
                  <OpcionBtn key={c} label={c} sel={causaSel === c} onClick={() => setCausaSel(c)} dark={dark} />
                ))}
              </div>
              <label className="mb-2 mt-5 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{t("audit.actionTaken")}</label>
              <div className="grid gap-1.5">
                {ACCIONES.map((a) => (
                  <OpcionBtn key={a} label={a} sel={accionSel === a} onClick={() => setAccionSel(a)} dark={dark} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-8 py-5 dark:border-neutral-800">
          <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800">
            {t("audit.cancel")}
          </button>
          <button
            onClick={guardar}
            disabled={!puedeGuardar}
            className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700"
            style={puedeGuardar ? { background: col("brand", dark) } : undefined}
          >
            {t("audit.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

function OpcionBtn({ label, sel, onClick, dark }: { label: string; sel: boolean; onClick: () => void; dark: boolean }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors dark:border-neutral-700"
      style={sel ? { borderColor: col("brand", dark), background: soft("brand", 6) } : { borderColor: ARC }}
    >
      <span>{label}</span>
    </button>
  );
}
