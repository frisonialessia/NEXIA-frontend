"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña PLANTAS (organización)
// Alta/edición/baja de plantas y selección de la planta activa (el contexto con
// el que se ve el dashboard). En modo demo el motor en vivo representa la planta
// activa; el día del backend, las máquinas se filtran por planta.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ROL_NOMBRE, col, mix } from "@/lib/constants";
import type { Planta } from "@/lib/data/plantas";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { useT } from "@/lib/state/I18nProvider";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useOrg } from "@/lib/state/OrgProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Button } from "../ui/Primitives";
import { Label } from "../ui/Typo";

export function PlantsBody() {
  const { plantas, plantaActivaId, setPlantaActiva, quitarPlanta } = useOrg();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const t = useT();
  const actor = ROL_NOMBRE[rol];
  const [editar, setEditar] = useState<Planta | null>(null);
  const [nuevo, setNuevo] = useState(false);

  function activar(p: Planta) {
    setPlantaActiva(p.id);
    toast(t("plant.activeToast", { name: p.nombre }));
  }

  function borrar(p: Planta) {
    if (plantas.length <= 1) {
      toast.error(t("plant.atLeastOne"));
      return;
    }
    if (typeof window !== "undefined" && !window.confirm(t("plant.removeConfirm", { name: p.nombre }))) return;
    quitarPlanta(p.id);
    registrar(actor, "Quitó una planta", p.nombre);
    toast(t("plant.removedToast"));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{t("plant.count", { n: plantas.length })}</p>
        <Button onClick={() => setNuevo(true)} className="shrink-0 px-4 py-2">
          <Icon name="plus" className="h-4 w-4" />
          {t("plant.add")}
        </Button>
      </div>

      <Card className="overflow-hidden">
        {plantas.map((p, i) => {
          const activa = p.id === plantaActivaId;
          return (
            <div key={p.id} className={`flex items-center gap-4 px-6 py-4 ${i === plantas.length - 1 ? "" : "border-b border-neutral-100 dark:border-neutral-800"}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: mix(col(activa ? "ok" : "brand")), color: col(activa ? "ok" : "brand") }}>
                <Icon name="gauge" className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{p.nombre}</span>
                  {activa && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: mix(col("ok")), color: col("ok") }}>
                      {t("plant.active")}
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-neutral-400">
                  {p.ubicacion} · {p.zona} · {p.lineas} {t("plant.lines")} · {p.maquinas} {t("plant.machines")}
                </div>
              </div>
              {!activa && (
                <button onClick={() => activar(p)} className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300">
                  {t("plant.activate")}
                </button>
              )}
              <button onClick={() => setEditar(p)} aria-label={t("plant.edit")} className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
                <Icon name="settings" className="h-4 w-4" />
              </button>
              <button onClick={() => borrar(p)} aria-label={t("plant.remove")} className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200">
                <Icon name="x" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </Card>

      {(nuevo || editar) && (
        <PlantModal
          planta={editar}
          onClose={() => {
            setNuevo(false);
            setEditar(null);
          }}
        />
      )}
    </div>
  );
}

function PlantModal({ planta, onClose }: { planta: Planta | null; onClose: () => void }) {
  const { agregarPlanta, editarPlanta } = useOrg();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const t = useT();
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const esEdicion = !!planta;
  const actor = ROL_NOMBRE[rol];

  const [nombre, setNombre] = useState(planta?.nombre ?? "");
  const [ubicacion, setUbicacion] = useState(planta?.ubicacion ?? "");
  const [zona, setZona] = useState(planta?.zona ?? "GMT-6");
  const [lineas, setLineas] = useState(String(planta?.lineas ?? 1));
  const [maquinas, setMaquinas] = useState(String(planta?.maquinas ?? 0));

  const input = "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  function guardar() {
    if (!nombre.trim()) {
      toast.error(t("plant.nameRequired"));
      return;
    }
    const datos = { nombre: nombre.trim(), ubicacion: ubicacion.trim() || "Sin ubicación", zona, lineas: Number(lineas) || 1, maquinas: Number(maquinas) || 0 };
    if (esEdicion) {
      editarPlanta(planta!.id, datos);
      registrar(actor, "Editó una planta", datos.nombre);
      toast(t("plant.updatedToast"));
    } else {
      agregarPlanta(datos);
      registrar(actor, "Agregó una planta", datos.nombre);
      toast(t("plant.addedToast"));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plant-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 px-7 pt-7 pb-5 dark:border-neutral-800">
          <Label>{t("plant.plant")}</Label>
          <h2 id="plant-title" className="mt-2 font-display text-2xl tracking-tight">{esEdicion ? t("plant.editTitle") : t("plant.addTitle")}</h2>
        </div>

        <div className="space-y-4 px-7 py-6">
          <Campo label={t("plant.name")}>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Planta Norte" className={input} />
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label={t("plant.location")}>
              <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Monterrey, MX" className={input} />
            </Campo>
            <Campo label={t("plant.timezone")}>
              <input value={zona} onChange={(e) => setZona(e.target.value)} className={input} />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Campo label={t("plant.linesField")}>
              <input type="number" min="0" value={lineas} onChange={(e) => setLineas(e.target.value)} className={input} />
            </Campo>
            <Campo label={t("plant.machinesField")}>
              <input type="number" min="0" value={maquinas} onChange={(e) => setMaquinas(e.target.value)} className={input} />
            </Campo>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <Button variant="ghost" onClick={onClose}>
            {t("plant.cancel")}
          </Button>
          <Button onClick={guardar}>{esEdicion ? t("plant.saveChanges") : t("plant.addBtn")}</Button>
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
