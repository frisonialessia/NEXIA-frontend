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
import { useAdmin } from "@/lib/state/AdminProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { agregarMaquina, editarMaquina, quitarMaquina, useRoster } from "@/lib/state/useFleet";
import type { MaquinaSeed, TipoMaquina } from "@/lib/types";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";
import { Label } from "../ui/Typo";

const TIPOS: TipoMaquina[] = ["bomba", "compresor", "motor", "ventilador"];

export function AssetsBody() {
  const roster = useRoster();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const actor = ROL_NOMBRE[rol];
  const [editar, setEditar] = useState<MaquinaSeed | null>(null);
  const [nuevo, setNuevo] = useState(false);

  function borrar(s: MaquinaSeed) {
    if (typeof window !== "undefined" && !window.confirm(`¿Quitar "${s.id}" del monitoreo?`)) return;
    quitarMaquina(s.id);
    registrar(actor, "Quitó una máquina", s.id);
    toast("Máquina eliminada");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">{roster.length} máquinas monitoreadas. Los cambios se aplican al motor en vivo.</p>
        <Button onClick={() => setNuevo(true)} className="px-4 py-2">
          <Icon name="plus" className="h-4 w-4" />
          Agregar máquina
        </Button>
      </div>

      <Card className="overflow-hidden">
        {roster.map((s, i) => (
          <div key={s.id} className={`flex items-center gap-4 px-6 py-4 ${i === roster.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: mix(col("brand")), color: col("brand") }}>
              <Icon name="gauge" className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.id}</div>
              <div className="truncate text-xs text-neutral-400">
                {s.sector} · {s.tipo ?? "—"} · {s.sensor}
              </div>
            </div>
            <div className="hidden text-right sm:block">
              <div className="font-mono text-xs text-neutral-500">umbral {s.umbral ?? "—"}</div>
              <div className="text-[11px] text-neutral-400">base {s.base}</div>
            </div>
            <button onClick={() => setEditar(s)} aria-label="Editar" className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
              <Icon name="settings" className="h-4 w-4" />
            </button>
            <button onClick={() => borrar(s)} aria-label="Quitar" className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
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
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const esEdicion = !!seed;
  const actor = ROL_NOMBRE[rol];

  const [nombre, setNombre] = useState(seed?.id ?? "");
  const [sector, setSector] = useState(seed?.sector ?? "");
  const [tipo, setTipo] = useState<TipoMaquina>(seed?.tipo ?? "bomba");
  const [sensor, setSensor] = useState(seed?.sensor ?? "vib-01");
  const [base, setBase] = useState(String(seed?.base ?? 2));
  const [umbral, setUmbral] = useState(String(seed?.umbral ?? 6.5));

  const input = "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  function guardar() {
    if (!esEdicion && !nombre.trim()) {
      toast.error("Ponle un nombre a la máquina");
      return;
    }
    if (esEdicion) {
      editarMaquina(seed!.id, { sector, tipo, sensor, base: Number(base), umbral: Number(umbral) });
      registrar(actor, "Editó una máquina", seed!.id);
      toast("Máquina actualizada");
    } else {
      const nueva: MaquinaSeed = { id: nombre.trim(), sector: sector || "Sin sector", tipo, sensor, base: Number(base) || 2, umbral: Number(umbral) || 6.5, esc: "sano" };
      agregarMaquina(nueva);
      registrar(actor, "Agregó una máquina", nueva.id);
      toast("Máquina agregada al monitoreo");
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
          <Label>Activo</Label>
          <h2 id="asset-title" className="mt-2 font-display text-2xl tracking-tight">{esEdicion ? "Editar máquina" : "Agregar máquina"}</h2>
        </div>

        <div className="space-y-4 px-7 py-6">
          <Campo label="Nombre">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={esEdicion} placeholder="Bomba de llenado #2" className={`${input} ${esEdicion ? "opacity-60" : ""}`} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Sector">
              <input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Embotelladora" className={input} />
            </Campo>
            <Campo label="Tipo">
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMaquina)} className={input}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Campo label="Sensor">
              <input value={sensor} onChange={(e) => setSensor(e.target.value)} className={input} />
            </Campo>
            <Campo label="Baseline (mm/s)">
              <input type="number" step="0.1" value={base} onChange={(e) => setBase(e.target.value)} className={input} />
            </Campo>
            <Campo label="Umbral crítico">
              <input type="number" step="0.1" value={umbral} onChange={(e) => setUmbral(e.target.value)} className={input} />
            </Campo>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={guardar}>{esEdicion ? "Guardar cambios" : "Agregar"}</Button>
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
