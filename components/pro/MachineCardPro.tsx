"use client";

// ──────────────────────────────────────────────────────────────────────────
// TARJETA DE MÁQUINA ENRIQUECIDA (NEXIA Pro)
// Acento de estado, sparkline de vibración, anillo de probabilidad y predicción.
// Eleva al pasar el cursor. Enlaza al detalle del activo.
// ──────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { col, colorSalud, colorZonaISO } from "@/lib/constants";
import { estaCalibrando, progresoCalibracion, zonaISOActiva } from "@/lib/domain/flota";
import { diasAFallo, rangoDiasRedondeado } from "@/lib/engine/fsm";
import { useT } from "@/lib/state/I18nProvider";
import type { Maquina } from "@/lib/types";
import { MiniLineChart } from "../ui/MiniLineChart";
import { ProbabilityRing } from "../ui/ProbabilityRing";
import { SURFACE } from "./surface";

export function MachineCardPro({ m }: { m: Maquina }) {
  const t = useT();
  const calibrando = estaCalibrando(m);
  const calibPct = Math.round(progresoCalibracion(m) * 100);
  const ec = calibrando ? col("brand") : colorSalud(m.estado, m.prob);
  const dias = diasAFallo(m);
  const pulsa = !calibrando && (m.estado === "CRITICAL_ALERT" || m.estado === "RECOVERY_PROBATION");
  const mostrarPrediccion = !calibrando && m.estado !== "STABLE" && dias !== Infinity && dias < 30;
  const serie = m.hist.map((h) => h.v);
  const zonaISO = calibrando ? null : zonaISOActiva(m);

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
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              {calibrando ? t("card.calibrating") : t(`estados.${m.estado}`)}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-neutral-300">{t("card.aiActive")}</span>
        </div>

        <h3 className="mt-3 font-display text-lg tracking-tight">{m.id}</h3>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-xs text-neutral-400">{m.sector}</p>
          {zonaISO && (
            <span
              className="rounded border px-1.5 py-px text-[10px] font-medium leading-none"
              style={{ color: colorZonaISO(zonaISO), borderColor: colorZonaISO(zonaISO) }}
              title={`ISO 10816 · zona ${zonaISO}`}
            >
              ISO {zonaISO}
            </span>
          )}
        </div>

        <div className="mt-3 h-12 overflow-hidden rounded-lg opacity-90">
          {serie.length > 1 ? (
            <MiniLineChart data={serie} color={ec} />
          ) : (
            <div className="flex h-full items-center text-[11px] text-neutral-300">{t("card.collecting")}</div>
          )}
        </div>

        {calibrando ? (
          <div className="mt-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="uppercase tracking-wider">{t("card.calibrating")}</span>
              <span className="font-mono" style={{ color: ec }}>{calibPct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <span className="block h-full rounded-full transition-all duration-500" style={{ width: `${calibPct}%`, background: ec }} />
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-neutral-300">{t("card.calibratingHint")}</p>
          </div>
        ) : (
        <div className="mt-2 flex items-end justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <ProbabilityRing pct={m.prob * 100} size={44} />
            <div className="text-[11px] uppercase leading-tight tracking-wider text-neutral-400">
              {t("card.prob")}
              <br />
              {t("card.ofFailure")}
            </div>
          </div>
          <div className="text-right">
            {mostrarPrediccion ? (
              <span className="text-xs font-medium" style={{ color: col("crit") }}>
                {(() => {
                  const r = rangoDiasRedondeado(m);
                  return r.esRango ? t("card.failsInRange", { a: r.a, b: r.b }) : t("card.failsIn", { n: r.a });
                })()}
              </span>
            ) : (
              <span className="font-mono text-xs text-neutral-400">{serie.length ? serie[serie.length - 1].toFixed(2) : "—"}</span>
            )}
          </div>
        </div>
        )}
      </div>
    </Link>
  );
}
