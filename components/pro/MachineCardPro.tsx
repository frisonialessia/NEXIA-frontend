"use client";

// ──────────────────────────────────────────────────────────────────────────
// TARJETA DE MÁQUINA ENRIQUECIDA (NEXIA Pro)
// Acento de estado, sparkline de vibración, anillo de probabilidad y predicción.
// Eleva al pasar el cursor. Enlaza al detalle del activo.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { ESTADOS, col, estadoColorKey } from "@/lib/constants";
import { diasAFallo } from "@/lib/engine/fsm";
import type { Maquina } from "@/lib/types";
import { MiniLineChart } from "../ui/MiniLineChart";
import { ProbabilityRing } from "../ui/ProbabilityRing";
import { SURFACE } from "./surface";

export function MachineCardPro({ m }: { m: Maquina }) {
  const ec = col(estadoColorKey(m.estado));
  const dias = diasAFallo(m);
  const pulsa = m.estado === "CRITICAL_ALERT" || m.estado === "RECOVERY_PROBATION";
  const mostrarPrediccion = m.estado !== "STABLE" && dias !== Infinity && dias < 30;
  const serie = m.hist.map((h) => h.v);

  return (
    <Link href={`/activo/${encodeURIComponent(m.id)}`} className="group block">
      <div className={`${SURFACE} relative overflow-hidden px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}>
        <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: ec }} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {pulsa && <span className="ping-soft absolute inline-flex h-full w-full rounded-full" style={{ background: ec, opacity: 0.6 }} />}
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: ec }} />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">{ESTADOS[m.estado]}</span>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-neutral-300">IA activa</span>
        </div>

        <h3 className="mt-3 font-serif text-lg tracking-tight">{m.id}</h3>
        <p className="text-xs text-neutral-400">{m.sector}</p>

        <div className="mt-3 h-12 overflow-hidden rounded-lg opacity-90">
          {serie.length > 1 ? (
            <MiniLineChart data={serie} color={ec} />
          ) : (
            <div className="flex h-full items-center text-[11px] text-neutral-300">Recopilando…</div>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <ProbabilityRing pct={m.prob * 100} size={44} />
            <div className="text-[11px] uppercase leading-tight tracking-wider text-neutral-400">
              prob.
              <br />
              de fallo
            </div>
          </div>
          <div className="text-right">
            {mostrarPrediccion ? (
              <span className="text-xs font-medium" style={{ color: col("crit") }}>
                falla en ~{Math.max(1, Math.ceil(dias))} días
              </span>
            ) : (
              <span className="font-mono text-xs text-neutral-400">{serie.length ? serie[serie.length - 1].toFixed(2) : "—"}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
