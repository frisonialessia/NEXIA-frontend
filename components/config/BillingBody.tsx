"use client";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN · pestaña FACTURACIÓN (plan y pagos)
// Plan actual, uso frente a los límites, comparativa de planes, método de pago
// e historial de facturas (descarga real en CSV). Todo simulado; el día del
// backend se conecta a la pasarela de pago.
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { toast } from "sonner";
import { ROL_NOMBRE, col, mix } from "@/lib/constants";
import { DESCUENTO_ANUAL, PLANES, planPorId, type Ciclo, type MetodoPago, type PlanId } from "@/lib/data/plantas";
import { dinero } from "@/lib/format";
import { useModalA11y } from "@/lib/hooks/useModalA11y";
import { descargarCSV } from "@/lib/reports/exporter";
import { useAdmin } from "@/lib/state/AdminProvider";
import { useOrg } from "@/lib/state/OrgProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useRoster } from "@/lib/state/useFleet";
import { Card } from "../ui/Card";
import { Icon } from "../ui/Icon";
import { Button, ProgressBar } from "../ui/Primitives";
import { Label } from "../ui/Typo";

export function BillingBody() {
  const { planId, ciclo, setCiclo, cambiarPlan, metodoPago, actualizarPago, facturas, plantas } = useOrg();
  const { usuarios, registrar } = useAdmin();
  const { rol } = useSession();
  const roster = useRoster();
  const actor = ROL_NOMBRE[rol];

  const plan = planPorId(planId);
  const [editarPago, setEditarPago] = useState(false);

  const precioMes = ciclo === "anual" ? Math.round(plan.precio * (1 - DESCUENTO_ANUAL)) : plan.precio;

  function elegirPlan(id: PlanId) {
    if (id === planId) return;
    cambiarPlan(id);
    registrar(actor, "Cambió de plan", planPorId(id).nombre);
    toast(`Plan actualizado a ${planPorId(id).nombre}`);
  }

  function cambiarCiclo(c: Ciclo) {
    setCiclo(c);
    registrar(actor, "Cambió el ciclo de facturación", c);
  }

  function descargar() {
    descargarCSV(
      "facturas-nexia.csv",
      [["Factura", "Fecha", "Concepto", "Monto (USD)", "Estado"], ...facturas.map((f) => [f.id, f.fecha, f.concepto, f.monto, f.estado])]
    );
    toast("Historial descargado");
  }

  return (
    <div className="space-y-4">
      {/* Plan actual */}
      <Card className="px-7 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Label>Plan actual</Label>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-2xl tracking-tight">{plan.nombre}</span>
              <span className="font-mono text-sm text-neutral-400">
                {plan.precio === 0 ? "Gratis" : `${dinero(precioMes)} / mes · por planta`}
              </span>
            </div>
            {plan.precio > 0 && (
              <p className="mt-1 text-xs text-neutral-400">
                {plantas.length} {plantas.length === 1 ? "planta" : "plantas"} · total {dinero(precioMes * plantas.length)} / mes
              </p>
            )}
          </div>
          <div className="flex gap-1 rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
            <BotonCiclo valor="mensual" actual={ciclo} onClick={cambiarCiclo} label="Mensual" />
            <BotonCiclo valor="anual" actual={ciclo} onClick={cambiarCiclo} label="Anual −17%" />
          </div>
        </div>

        {/* Uso frente a límites */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Uso etiqueta="Máquinas" actual={roster.length} max={plan.maxMaquinas} />
          <Uso etiqueta="Usuarios" actual={usuarios.length} max={plan.maxUsuarios} />
          <Uso etiqueta="Plantas" actual={plantas.length} max={plan.maxPlantas} />
        </div>
      </Card>

      {/* Comparativa de planes */}
      <div className="grid gap-4 md:grid-cols-3">
        {PLANES.map((p) => {
          const actual = p.id === planId;
          const precio = ciclo === "anual" ? Math.round(p.precio * (1 - DESCUENTO_ANUAL)) : p.precio;
          return (
            <div key={p.id} className={`${actual ? "rounded-2xl ring-2" : ""}`} style={actual ? ({ ["--tw-ring-color"]: col("ok") } as React.CSSProperties) : undefined}>
            <Card className="flex h-full flex-col px-6 py-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl tracking-tight">{p.nombre}</span>
                {p.destacado && !actual && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: mix(col("brand")), color: col("brand") }}>
                    Popular
                  </span>
                )}
                {actual && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: mix(col("ok")), color: col("ok") }}>
                    Actual
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-sans text-3xl font-semibold tracking-tight tabular-nums">{p.precio === 0 ? "$0" : dinero(precio)}</span>
                <span className="text-xs text-neutral-400">/ mes</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    <Icon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: col("ok") }} />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {actual ? (
                  <Button variant="secondary" disabled className="w-full">
                    Plan actual
                  </Button>
                ) : (
                  <Button onClick={() => elegirPlan(p.id)} className="w-full">
                    Cambiar a {p.nombre}
                  </Button>
                )}
              </div>
            </Card>
            </div>
          );
        })}
      </div>

      {/* Método de pago */}
      <Card className="flex items-center justify-between px-7 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: mix(col("brand")), color: col("brand") }}>
            <Icon name="lock" className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-medium">
              {metodoPago.marca} ···· {metodoPago.ultimos4}
            </div>
            <div className="text-xs text-neutral-400">Expira {metodoPago.expira}</div>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditarPago(true)}>
          Actualizar
        </Button>
      </Card>

      {/* Historial de facturas */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <Label>Historial de facturas</Label>
          <button onClick={descargar} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300">
            <Icon name="download" className="h-3.5 w-3.5" />
            Descargar CSV
          </button>
        </div>
        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {facturas.map((f) => (
            <div key={f.id} className="flex items-center gap-4 px-7 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{f.concepto}</div>
                <div className="truncate text-xs text-neutral-400">
                  {f.id} · {f.fecha}
                </div>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ background: mix(col(f.estado === "pagada" ? "ok" : "crit")), color: col(f.estado === "pagada" ? "ok" : "crit") }}>
                {f.estado}
              </span>
              <span className="w-20 text-right font-mono text-sm tabular-nums">{dinero(f.monto)}</span>
            </div>
          ))}
        </div>
      </Card>

      {editarPago && <PaymentModal actual={metodoPago} onSave={(m) => { actualizarPago(m); registrar(actor, "Actualizó el método de pago", `···· ${m.ultimos4}`); toast("Método de pago actualizado"); }} onClose={() => setEditarPago(false)} />}
    </div>
  );
}

function Uso({ etiqueta, actual, max }: { etiqueta: string; actual: number; max: number }) {
  const ilimitado = max >= 999;
  const pct = ilimitado ? 0 : Math.min(1, actual / max);
  const cerca = !ilimitado && pct >= 0.85;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-neutral-500">{etiqueta}</span>
        <span className="font-mono text-xs text-neutral-400">
          {actual} / {ilimitado ? "∞" : max}
        </span>
      </div>
      <div className="mt-2">
        <ProgressBar value={ilimitado ? 0.04 : pct} colorKey={cerca ? "crit" : "ok"} />
      </div>
      {cerca && <p className="mt-1 text-[11px]" style={{ color: col("crit") }}>Cerca del límite del plan</p>}
    </div>
  );
}

function BotonCiclo({ valor, actual, onClick, label }: { valor: Ciclo; actual: Ciclo; onClick: (c: Ciclo) => void; label: string }) {
  const activo = actual === valor;
  return (
    <button onClick={() => onClick(valor)} className="rounded-md px-3 py-1 text-xs font-medium" style={activo ? { background: col("brand"), color: "#fff" } : { color: "#737373" }}>
      {label}
    </button>
  );
}

function PaymentModal({ actual, onSave, onClose }: { actual: MetodoPago; onSave: (m: MetodoPago) => void; onClose: () => void }) {
  const dialogRef = useModalA11y<HTMLDivElement>(onClose);
  const [marca, setMarca] = useState(actual.marca);
  const [ultimos4, setUltimos4] = useState(actual.ultimos4);
  const [expira, setExpira] = useState(actual.expira);
  const input = "w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800";

  function guardar() {
    if (!/^\d{4}$/.test(ultimos4)) {
      toast.error("Escribe los últimos 4 dígitos");
      return;
    }
    onSave({ marca: marca.trim() || "Tarjeta", ultimos4, expira: expira.trim() || "—" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 px-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="pay-title" tabIndex={-1} className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-xl outline-none dark:border-neutral-700 dark:bg-neutral-900" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-neutral-100 px-7 pt-7 pb-5 dark:border-neutral-800">
          <Label>Método de pago</Label>
          <h2 id="pay-title" className="mt-2 font-display text-2xl tracking-tight">Actualizar tarjeta</h2>
        </div>
        <div className="space-y-4 px-7 py-6">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Marca</span>
            <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Visa" className={input} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Últimos 4</span>
              <input value={ultimos4} maxLength={4} inputMode="numeric" onChange={(e) => setUltimos4(e.target.value.replace(/\D/g, ""))} placeholder="4242" className={input} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">Expira</span>
              <input value={expira} onChange={(e) => setExpira(e.target.value)} placeholder="08/27" className={input} />
            </label>
          </div>
          <p className="text-xs text-neutral-400">Modo demostración · no se procesan pagos reales.</p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-7 py-5 dark:border-neutral-800">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar}>Guardar</Button>
        </div>
      </div>
    </div>
  );
}
