"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña ACTIVOS (gestión de máquinas)
// Agregar, editar y quitar máquinas — el motor las toma EN VIVO. Umbral
// crítico por máquina. Persistido + auditoría.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ROL_NOMBRE, col, mix } from "@/lib/constants";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { agregarMaquina, editarMaquina, quitarMaquina, useRoster } from "@/lib/state/useFleet";
import type { Criticidad, MaquinaSeed, TipoMaquina } from "@/lib/types";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";
import { Label } from "../ui/Typo";

const TIPOS: TipoMaquina[] = ["bomba", "compresor", "motor", "ventilador"];

/** Color de la criticidad del activo (alta=rojo, media=ámbar, baja=gris). */
const critCol = (c: Criticidad) => col(c === "alta" ? "crit" : c === "media" ? "warn" : "gray");

export function AssetsBody() {
  const roster = useRoster();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const t = useT();
  const actor = ROL_NOMBRE[rol];
  const [editar, setEditar] = useState<MaquinaSeed | null>(null);
  const [nuevo, setNuevo] = useState(false);

  function borrar(s: MaquinaSeed) {
    if (typeof window !== "undefined" && !window.confirm(t("assets.removeConfirm", { id: s.id }))) return;
    quitarMaquina(s.id);
    registrar(actor, "Quitó una máquina", s.id);
    toast(t("assets.removedToast"));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{t("assets.monitored", { n: roster.length })}</p>
        <Button onClick={() => setNuevo(true)} className="shrink-0 px-4 py-2">
          <Icon name="plus" className="h-4 w-4" />
          {t("assets.add")}
        </Button>
      </div>

      <Card className="overflow-hidden">
        {roster.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-4 px-6 py-4 ${i === roster.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: mix(col("brand")), color: col("brand") }}>
              <Icon name="gauge" className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{s.id}</span>
                {s.criticidad && (
                  <span
                    className="shrink-0 rounded px-1.5 py-px text-[10px] font-medium leading-none"
                    style={{ color: critCol(s.criticidad), background: mix(critCol(s.criticidad)) }}
                    title={t("assets.criticality")}
                  >
                    {t(`crit.${s.criticidad}`)}
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-neutral-400">
                {s.sector} · {s.tipo ? t(`tipo.${s.tipo}`) : "—"} · {s.sensor}
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="font-mono text-xs text-neutral-500">{t("assets.threshold", { v: s.umbral ?? "—" })}</div>
              <div className="text-[11px] text-neutral-400">{t("assets.base", { v: s.base })}</div>
            </div>
            <button onClick={() => setEditar(s)} aria-label={t("assets.edit")} className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
              <Icon name="settings" className="h-4 w-4" />
            </button>
            <button onClick={() => borrar(s)} aria-label={t("assets.remove")} className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </Card>

      {(nuevo || editar) && (
        <AssetModal
          seed={editar}
          onClose={() => {
            setNuevo(false);
            setEditar(null);
          }}
        />
      )}
    </div>
  );
}

function AssetModal({ seed, onClose }: { seed: MaquinaSeed | null; onClose: () => void }) {
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const t = useT();
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const esEdicion = !!seed;
  const actor = ROL_NOMBRE[rol];

  const [nombre, setNombre] = useState(seed?.id ?? "");
  const [sector, setSector] = useState(seed?.sector ?? "");
  const [tipo, setTipo] = useState<TipoMaquina>(seed?.tipo ?? "bomba");
  const [sensor, setSensor] = useState(seed?.sensor ?? "vib-01");
  const [base, setBase] = useState(String(seed?.base ?? 2));
  const [umbral, setUmbral] = useState(String(seed?.umbral ?? 6.5));
  const [rpm, setRpm] = useState(String(seed?.rpm ?? ""));
  const [potencia, setPotencia] = useState(String(seed?.potenciaKw ?? ""));
  const [criticidad, setCriticidad] = useState<Criticidad>(seed?.criticidad ?? "media");
  const [costo, setCosto] = useState(String(seed?.costoParadaHora ?? ""));

  const input = "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  function guardar() {
    if (!esEdicion && !nombre.trim()) {
      toast.error(t("assets.nameRequired"));
      return;
    }
    const ficha = {
      rpm: Number(rpm) || undefined,
      potenciaKw: Number(potencia) || undefined,
      criticidad,
      costoParadaHora: Number(costo) || undefined,
    };
    if (esEdicion) {
      editarMaquina(seed!.id, { sector, tipo, sensor, base: Number(base), umbral: Number(umbral), ...ficha });
      registrar(actor, "Editó una máquina", seed!.id);
      toast(t("assets.updatedToast"));
    } else {
      const nueva: MaquinaSeed = { id: nombre.trim(), sector: sector || "Sin sector", tipo, sensor, base: Number(base) || 2, umbral: Number(umbral) || 6.5, esc: "sano", ...ficha };
      agregarMaquina(nueva);
      registrar(actor, "Agregó una máquina", nueva.id);
      toast(t("assets.addedToast"));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 px-7 pt-7 pb-5 dark:border-neutral-800">
          <Label>{t("assets.asset")}</Label>
          <h2 id="asset-title" className="mt-2 font-display text-2xl tracking-tight">{esEdicion ? t("assets.editTitle") : t("assets.addTitle")}</h2>
        </div>

        <div className="space-y-4 px-7 py-6">
          <Campo label={t("assets.name")}>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={esEdicion} placeholder={t("assets.namePlaceholder")} className={`${input} ${esEdicion ? "opacity-60" : ""}`} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label={t("assets.sector")}>
              <input value={sector} onChange={(e) => setSector(e.target.value)} placeholder={t("assets.sectorPlaceholder")} className={input} />
            </Campo>
            <Campo label={t("assets.type")}>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaquina)} className={input}>
                {TIPOS.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`tipo.${tp}`)}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Campo label={t("assets.sensor")}>
              <input value={sensor} onChange={(e) => setSensor(e.target.value)} className={input} />
            </Campo>
            <Campo label={t("assets.baseline")}>
              <input type="number" step="0.1" value={base} onChange={(e) => setBase(e.target.value)} className={input} />
            </Campo>
            <Campo label={t("assets.critThreshold")}>
              <input type="number" step="0.1" value={umbral} onChange={(e) => setUmbral(e.target.value)} className={input} disabled={Number(potencia) > 0} />
            </Campo>
          </div>

          {/* Ficha técnica — habilita umbral ISO 10816 y costo por máquina */}
          <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <Label>{t("assets.specs")}</Label>
            <p className="mt-1 mb-3 text-xs text-neutral-400">{t("assets.specsHint")}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo label={t("assets.rpm")}>
                <input type="number" step="10" value={rpm} onChange={(e) => setRpm(e.target.value)} placeholder="1450" className={input} />
              </Campo>
              <Campo label={t("assets.power")}>
                <input type="number" step="1" value={potencia} onChange={(e) => setPotencia(e.target.value)} placeholder="30" className={input} />
              </Campo>
              <Campo label={t("assets.criticality")}>
                <select value={criticidad} onChange={(e) => setCriticidad(e.target.value as Criticidad)} className={input}>
                  {(["alta", "media", "baja"] as Criticidad[]).map((c) => (
                    <option key={c} value={c}>{t(`crit.${c}`)}</option>
                  ))}
                </select>
              </Campo>
              <Campo label={t("assets.stopCost")}>
                <input type="number" step="100" value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="1500" className={input} />
              </Campo>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <Button variant="ghost" onClick={onClose}>
            {t("assets.cancel")}
          </Button>
          <Button onClick={guardar}>{esEdicion ? t("assets.saveChanges") : t("assets.addBtn")}</Button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">{label}</span>
      {children}
    </label>
  );
}
