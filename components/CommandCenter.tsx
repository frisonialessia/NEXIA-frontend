"use client";

// ──────────────────────────────────────────────────────────────────────────
// VISTA 1 · CENTRO DE MANDO
// La flota completa en tarjetas, ordenada por criticidad. Banner de ahorro en
// dinero y gauge de salud general de la planta. Portado de renderGrid() de la
// demo. Lee TODO a través de useFleet() (la capa de datos).
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { ESTADOS, HORAS_PARADA_TIPICA, RANK_ESTADO, col, estadoColorKey } from "@/lib/constants";
import { diasAFallo } from "@/lib/engine/fsm";
import { dinero } from "@/lib/format";
import { useFleet } from "@/lib/state/FleetProvider";
import { useSession } from "@/lib/state/SessionProvider";
import { useTheme } from "@/lib/state/ThemeProvider";
import type { Maquina } from "@/lib/types";
import { TrendCard } from "./TrendCard";
import { GaugeCircular } from "./ui/GaugeCircular";

export function CommandCenter() {
  const { maquinas, ahorroMes, paradasEvitadas } = useFleet();
  const { dark } = useTheme();
  const { puede } = useSession();

  const total = maquinas.length;
  const atencion = maquinas.filter((m) => m.estado !== "STABLE").length;
  const salud = total ? Math.round((maquinas.filter((m) => m.estado === "STABLE").length / total) * 100) : 100;

  // Orden por criticidad y, a igualdad, por probabilidad de fallo descendente.
  const orden = [...maquinas].sort(
    (a, b) => RANK_ESTADO[a.estado] - RANK_ESTADO[b.estado] || b.prob - a.prob
  );

  return (
    <main className="fade-in px-6 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">
            En vivo · actualizando cada 2s
          </span>
          <div className="mt-2 flex items-end justify-between">
            <h1 className="font-serif text-3xl tracking-tight">Centro de mando</h1>
            <p className="text-sm text-neutral-500">
              {total === 0 ? (
                "Conectando con el motor…"
              ) : atencion === 0 ? (
                <>
                  <span className="font-mono">{total}</span> activos · todo en orden
                </>
              ) : (
                <>
                  <span className="font-mono font-medium" style={{ color: col("crit", dark) }}>
                    {atencion}
                  </span>{" "}
                  {atencion === 1 ? "requiere" : "requieren"} atención{" "}
                  <span className="text-neutral-300">· de {total}</span>
                </>
              )}
            </p>
          </div>
        </header>

        {/* Banner de ahorro + salud de planta */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-800 px-7 py-6 text-white lg:col-span-2">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Ahorro estimado este mes</span>
              <div className="mt-1.5 font-serif text-5xl tracking-tight" style={{ color: "#22c55e" }}>
                {dinero(ahorroMes)}
              </div>
              <p className="mt-1.5 text-xs text-neutral-400">en paradas no planificadas evitadas</p>
            </div>
            <div className="mt-7 flex items-center gap-7 border-t border-white/10 pt-5">
              <Estadistica valor={String(paradasEvitadas)} label="paradas evitadas" />
              <span className="h-8 w-px bg-white/10" />
              <Estadistica valor={(paradasEvitadas * HORAS_PARADA_TIPICA).toLocaleString("es-ES") + " h"} label="producción recuperada" />
              <span className="h-8 w-px bg-white/10" />
              <Estadistica valor={String(total || 6)} label="activos" />
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900">
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Salud general de planta</span>
            <div className="mt-2 flex justify-center">
              <GaugeCircular pct={salud} label="salud %" />
            </div>
          </div>
        </div>

        {/* Tendencia / ROI · solo perfil gerencial */}
        {puede("tendencia") && total > 0 && (
          <div className="mb-6">
            <TrendCard />
          </div>
        )}

        {/* Rejilla de máquinas */}
        {total === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-8 py-16 text-center text-sm text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            Recopilando las primeras lecturas de la flota…
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orden.map((m) => (
              <MachineCard key={m.id} m={m} dark={dark} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Estadistica({ valor, label }: { valor: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl">{valor}</div>
      <span className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</span>
    </div>
  );
}

function MachineCard({ m, dark }: { m: Maquina; dark: boolean }) {
  const ec = col(estadoColorKey(m.estado), dark);
  const dias = diasAFallo(m);
  const pulsa = m.estado === "CRITICAL_ALERT" || m.estado === "RECOVERY_PROBATION";
  const bordeCrit = m.estado === "CRITICAL_ALERT";
  const mostrarPrediccion = m.estado !== "STABLE" && dias !== Infinity && dias < 30;
  const ultima = m.hist[m.hist.length - 1];

  return (
    <Link href={`/activo/${encodeURIComponent(m.id)}`} className="group block text-left">
      <div
        className={`rounded-2xl border bg-white px-6 py-5 transition-all duration-200 hover:border-neutral-300 dark:bg-neutral-900 ${
          bordeCrit ? "border-red-200 dark:border-red-900" : "border-neutral-200 dark:border-neutral-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {pulsa && (
                <span
                  className="ping-soft absolute inline-flex h-full w-full rounded-full"
                  style={{ background: ec, opacity: 0.6 }}
                />
              )}
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: ec }} />
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              {ESTADOS[m.estado]}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-neutral-300">IA activa</span>
        </div>

        <h3 className="mt-4 font-serif text-xl tracking-tight">{m.id}</h3>
        <p className="mt-0.5 text-xs text-neutral-400">{m.sector}</p>

        <div className="mt-5 flex items-end justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <div>
            <span className="font-mono text-lg">{Math.round(m.prob * 100)}%</span>
            <div className="text-[11px] uppercase tracking-wider text-neutral-400">prob. de fallo</div>
          </div>
          <div className="text-right">
            {mostrarPrediccion ? (
              <span className="text-[11px]" style={{ color: col("crit", dark) }}>
                falla en ~{Math.max(1, Math.ceil(dias))} días
              </span>
            ) : (
              <span className="font-mono text-xs text-neutral-400">
                {ultima ? ultima.v.toFixed(2) : "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
