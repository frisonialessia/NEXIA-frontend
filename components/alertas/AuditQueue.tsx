"use client";

// ──────────────────────────────────────────────────────────────────────────
// COLA DE AUDITORÍA (cuerpo, sin cabecera de página)
// Lista de alertas pendientes + modal human-in-the-loop. Si el rol no puede
// auditar (Solo lectura), las filas se muestran en modo consulta, sin modal.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ACCIONES, CAUSAS, col } from "@/lib/constants";
import { useFleet } from "@/lib/state/FleetProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Alerta, Veredicto } from "@/lib/types";
import { Icon } from "../ui/Icon";

export function AuditQueue() {
  const { alertas } = useFleet();
  const { dark } = useTheme();
  const { puede } = useSession();
  const [abierta, setAbierta] = useState<Alerta | null>(null);

  const puedeAuditar = puede("auditar");

  if (alertas.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <Icon name="check" className="mx-auto h-8 w-8" style={{ color: col("ok", dark) }} />
        <p className="mt-4 text-sm text-neutral-500">No hay alertas pendientes.</p>
        <p className="mt-1 text-xs text-neutral-400">Todo el trabajo está al día.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {alertas.map((a, i) => {
          const contenido = (
            <>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: col("crit", dark), opacity: 0.5 }} />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: col("crit", dark) }} />
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-serif text-base">{a.maquina}</span>
                <p className="mt-0.5 truncate text-sm text-neutral-500">{a.causa}</p>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <div className="font-mono text-sm">{Math.round(a.prob * 100)}%</div>
              </div>
              <div className="hidden shrink-0 text-right md:block">
                <div className="font-mono text-xs text-neutral-500">{a.hora}</div>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide"
                style={{ background: dark ? "#451a03" : "#fffbeb", color: col("warn", dark) }}
              >
                Pendiente
              </span>
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
  const { etiquetarAlerta } = useFleet();
  const { dark } = useTheme();
  const [veredicto, setVeredicto] = useState<Veredicto | null>(null);
  const [causaSel, setCausaSel] = useState<string | null>(null);
  const [accionSel, setAccionSel] = useState<string | null>(null);

  const causas = CAUSAS[alerta.tipo] || CAUSAS.bomba;
  const puedeGuardar = !!veredicto && (veredicto !== "real" || (!!causaSel && !!accionSel));

  function colorVeredicto(v: Veredicto): string {
    return v === "real" ? col("crit", dark) : v === "falsa" ? col("ok", dark) : col("gray", dark);
  }

  function guardar() {
    etiquetarAlerta(alerta.id, veredicto!);
    onClose();
    toast("Evento etiquetado · dataset actualizado");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 px-8 pt-8 pb-6 dark:border-neutral-800">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">Human-in-the-loop</span>
          <h2 className="mt-3 font-serif text-2xl tracking-tight">Confirmar evento</h2>
          <div className="mt-3 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800">
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">Causa probable (IA)</span>
            <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-200">{alerta.causa}</p>
          </div>
        </div>

        <div className="px-8 py-7">
          <label className="mb-3 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">¿La alerta fue correcta?</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["real", "Fallo real"],
              ["falsa", "Falsa alarma"],
              ["nc", "No concluyente"],
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
                  style={sel ? { borderColor: cc, background: `${cc}1a`, color: cc } : { borderColor: dark ? "#404040" : "#e5e5e5", color: "#737373" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {veredicto === "real" && (
            <div className="mt-6">
              <label className="mb-3 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Causa raíz</label>
              <div className="grid gap-1.5">
                {causas.map((c) => (
                  <OpcionBtn key={c} label={c} sel={causaSel === c} onClick={() => setCausaSel(c)} dark={dark} />
                ))}
              </div>
              <label className="mb-2 mt-5 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Acción tomada</label>
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
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={!puedeGuardar}
            className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:disabled:bg-neutral-700"
            style={puedeGuardar ? { background: col("brand", dark) } : undefined}
          >
            Confirmar
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
      style={sel ? { borderColor: col("brand", dark), background: `${col("brand", dark)}10` } : { borderColor: dark ? "#404040" : "#e5e5e5" }}
    >
      <span>{label}</span>
    </button>
  );
}
