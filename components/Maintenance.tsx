"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA · MANTENIMIENTO (órdenes de trabajo)
// Programar, iniciar y completar mantenimientos. Completar dispara la
// RECUPERACIÓN de la máquina — el cierre del ciclo predecir → actuar.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ROL_NOMBRE } from "@/lib/constants";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useT } from "@/lib/state/I18nProvider";
import { useMantenimiento, type NuevaOrden } from "@/lib/state/MaintenanceProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { repararMaquina, useMaquinas } from "@/lib/state/useFleet";
import type { EstadoOrden, OrdenMantenimiento, Prioridad, TipoMantenimiento } from "@/lib/types";
import { AccessDenied } from "./AccessDenied";
import { Card } from "./ui/Card";
import { Icon } from "./ui/Icon";
import { Button, Pill } from "./ui/Primitives";
import { Label, PageTitle, Stat } from "./ui/Typo";

const PRIORIDAD_COLOR: Record<Prioridad, "crit" | "brand" | "gray"> = { alta: "crit", media: "brand", baja: "gray" };
const ESTADO_COLOR: Record<EstadoOrden, "gray" | "brand" | "ok"> = { programada: "gray", en_curso: "brand", completada: "ok" };

export function Maintenance() {
  const { puede } = useSession();
  const { ordenes } = useMantenimiento();
  const t = useT();
  const [crear, setCrear] = useState(false);

  if (!puede("mantenimiento")) {
    return <AccessDenied mensaje={t("access.maintenance")} />;
  }

  const abiertas = ordenes.filter((o) => o.estado !== "completada");
  const completadas = ordenes.filter((o) => o.estado === "completada");
  const altaAbiertas = abiertas.filter((o) => o.prioridad === "alta");

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <Label>{t("maint.ops")}</Label>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <PageTitle>{t("maint.title")}</PageTitle>
            <Button onClick={() => setCrear(true)} className="shrink-0 px-4 py-2">
              <Icon name="plus" className="h-4 w-4" />
              {t("maint.newOrder")}
            </Button>
          </div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard label={t("maint.openOrders")} value={String(abiertas.length)} />
          <KpiCard label={t("maint.highPriority")} value={String(altaAbiertas.length)} colorKey={altaAbiertas.length > 0 ? "crit" : undefined} />
          <KpiCard label={t("maint.completed")} value={String(completadas.length)} colorKey="ok" />
        </div>

        {ordenes.length === 0 ? (
          <Card className="px-8 py-16 text-center">
            <Icon name="tool" className="mx-auto h-8 w-8 text-neutral-300" />
            <p className="mt-4 text-sm text-neutral-500">{t("maint.emptyTitle")}</p>
            <p className="mt-1 text-xs text-neutral-400">{t("maint.emptyDesc")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {ordenes.map((o) => (
              <OrdenRow key={o.id} orden={o} />
            ))}
          </div>
        )}
      </div>

      {crear && <CrearModal onClose={() => setCrear(false)} />}
    </main>
  );
}

function KpiCard({ label, value, colorKey }: { label: string; value: string; colorKey?: "ok" | "crit" }) {
  return (
    <Card className="px-6 py-5">
      <Label>{label}</Label>
      <Stat className="mt-1" value={value} colorKey={colorKey} />
    </Card>
  );
}

function OrdenRow({ orden: o }: { orden: OrdenMantenimiento }) {
  const { setEstado, eliminar } = useMantenimiento();
  const { registrar } = useAdmin();
  const { rol } = useSession();
  const t = useT();
  const actor = ROL_NOMBRE[rol];

  function iniciar() {
    setEstado(o.id, "en_curso");
    registrar(actor, "Inició mantenimiento", `${o.maquina} · ${o.tipo}`);
  }
  function completar() {
    setEstado(o.id, "completada");
    repararMaquina(o.maquinaId);
    registrar(actor, "Completó mantenimiento", `${o.maquina} · ${o.tipo}`);
    toast(t("maint.completedToast"));
  }

  return (
    <Card className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-base tracking-tight">{o.maquina}</span>
          <Pill colorKey={PRIORIDAD_COLOR[o.prioridad]}>{t(`prio.${o.prioridad}`)}</Pill>
          <Pill colorKey={ESTADO_COLOR[o.estado]}>{t(`ord.${o.estado}`)}</Pill>
        </div>
        <p className="mt-0.5 text-xs text-neutral-400">
          {o.tipo === "preventivo" ? t("maint.preventive") : t("maint.corrective")} · {t("maint.createdOn", { date: o.fecha })}
          {o.programadaPara ? ` ${t("maint.forDate", { date: o.programadaPara })}` : ""}
          {o.responsable ? ` · ${o.responsable}` : ""}
        </p>
        {o.notas && <p className="mt-1 truncate text-xs text-neutral-500">{o.notas}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {o.estado === "programada" && (
          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={iniciar}>
            {t("maint.start")}
          </Button>
        )}
        {o.estado === "en_curso" && (
          <Button className="px-3 py-1.5 text-xs" onClick={completar}>
            <Icon name="check" className="h-3.5 w-3.5" />
            {t("maint.complete")}
          </Button>
        )}
        <button
          onClick={() => eliminar(o.id)}
          aria-label={t("maint.deleteOrder")}
          className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function CrearModal({ onClose }: { onClose: () => void }) {
  const maquinas = useMaquinas();
  const { usuarios } = useAdmin();
  const { crear } = useMantenimiento();
  const { rol } = useSession();
  const { registrar } = useAdmin();
  const t = useT();
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);

  const [maquinaId, setMaquinaId] = useState(maquinas[0]?.id ?? "");
  const [tipo, setTipo] = useState<TipoMantenimiento>("preventivo");
  const [prioridad, setPrioridad] = useState<Prioridad>("media");
  const [programadaPara, setProgramadaPara] = useState("");
  const [responsable, setResponsable] = useState(usuarios[0]?.n ?? "");
  const [notas, setNotas] = useState("");

  function guardar() {
    const maquina = maquinas.find((m) => m.id === maquinaId)?.id ?? maquinaId;
    const orden: NuevaOrden = { maquinaId, maquina, tipo, prioridad, programadaPara, responsable, notas };
    crear(orden);
    registrar(ROL_NOMBRE[rol], "Creó orden de mantenimiento", `${maquina} · ${tipo}`);
    toast(t("maint.createdToast"));
    onClose();
  }

  const input = "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ot-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-100 px-7 pt-7 pb-5 dark:border-neutral-800">
          <Label>{t("maint.ops")}</Label>
          <h2 id="ot-title" className="mt-2 font-display text-2xl tracking-tight">{t("maint.modalTitle")}</h2>
        </div>

        <div className="space-y-4 px-7 py-6">
          <Campo label={t("maint.machine")}>
            <select value={maquinaId} onChange={(e) => setMaquinaId(e.target.value)} className={input}>
              {maquinas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-4">
            <Campo label={t("maint.type")}>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoMantenimiento)} className={input}>
                <option value="preventivo">{t("maint.preventive")}</option>
                <option value="correctivo">{t("maint.corrective")}</option>
              </select>
            </Campo>
            <Campo label={t("maint.priority")}>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value as Prioridad)} className={input}>
                <option value="alta">{t("prio.alta")}</option>
                <option value="media">{t("prio.media")}</option>
                <option value="baja">{t("prio.baja")}</option>
              </select>
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Campo label={t("maint.scheduledFor")}>
              <input type="date" value={programadaPara} onChange={(e) => setProgramadaPara(e.target.value)} className={input} />
            </Campo>
            <Campo label={t("maint.assignee")}>
              <select value={responsable} onChange={(e) => setResponsable(e.target.value)} className={input}>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.n}>
                    {u.n}
                  </option>
                ))}
              </select>
            </Campo>
          </div>
          <Campo label={t("maint.notes")}>
            <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder={t("maint.notesPlaceholder")} className={input} />
          </Campo>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <Button variant="ghost" onClick={onClose}>
            {t("maint.cancel")}
          </Button>
          <Button onClick={guardar} disabled={!maquinaId}>
            {t("maint.createOrder")}
          </Button>
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
