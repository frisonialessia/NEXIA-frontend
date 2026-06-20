"use client";

// ──────────────────────────────────────────────────────────────────────────
// TIRA DE KPIs HERO (NEXIA Pro)
// Tiles compactos: número grande + mini-sparkline + chip de delta. La tarjeta
// de ahorro lleva un degradado azul→violeta sutil (acento de marca).
// ──────────────────────────────────────────────────────────────────────────

import { type ColorKey, col, soft } from "@/lib/constants";
import { AHORRO_SEMANAL, SALUD_SEMANAL } from "@/lib/data/trend";
import { dinero } from "@/lib/format";
import type { Maquina } from "@/lib/types";
import type { Savings } from "@/lib/state/useFleet";
import { MiniLineChart } from "../ui/MiniLineChart";

const CARD = "rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900";

interface Delta {
  texto: string;
  bueno: boolean;
}

export function KpiStrip({ maquinas, savings }: { maquinas: Maquina[]; savings: Savings }) {
  const total = maquinas.length;
  const salud = total ? Math.round((maquinas.filter((m) => m.estado === "STABLE").length / total) * 100) : 100;
  const enRiesgo = maquinas.filter((m) => m.estado !== "STABLE").length;

  const a = AHORRO_SEMANAL;
  const ahorroPct = Math.round(((a[a.length - 1] - a[a.length - 2]) / a[a.length - 2]) * 100);
  const s = SALUD_SEMANAL;
  const saludDelta = s[s.length - 1] - s[s.length - 2];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiTile
        titulo="Ahorro estimado · mes"
        valor={dinero(savings.ahorroMes)}
        sub="paradas evitadas"
        spark={{ data: AHORRO_SEMANAL, colorKey: "ok" }}
        delta={{ texto: `+${ahorroPct}%`, bueno: true }}
        accentKey="ok"
      />
      <KpiTile
        titulo="Paradas evitadas"
        valor={String(savings.paradasEvitadas)}
        sub="este mes"
        accentKey="brand"
      />
      <KpiTile
        titulo="Salud de planta"
        valor={`${salud}%`}
        sub="activos estables"
        spark={{ data: SALUD_SEMANAL, colorKey: "brand" }}
        delta={{ texto: `${saludDelta >= 0 ? "+" : ""}${saludDelta} pts`, bueno: saludDelta >= 0 }}
      />
      <KpiTile
        titulo="Requieren atención"
        valor={String(enRiesgo)}
        sub={enRiesgo === 0 ? "todo en orden" : enRiesgo === 1 ? "máquina en riesgo" : "máquinas en riesgo"}
        accentKey={enRiesgo > 0 ? "crit" : "ok"}
      />
    </div>
  );
}

function KpiTile({
  titulo,
  valor,
  sub,
  spark,
  delta,
  accentKey,
}: {
  titulo: string;
  valor: string;
  sub?: string;
  spark?: { data: number[]; colorKey: ColorKey };
  delta?: Delta;
  accentKey?: ColorKey;
}) {
  return (
    <div className={`${CARD} relative overflow-hidden px-5 py-4`}>
      {accentKey && <span className="absolute inset-y-0 left-0 w-1" style={{ background: col(accentKey) }} />}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-400">{titulo}</span>
        {delta && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
            style={{ background: soft(delta.bueno ? "ok" : "crit"), color: col(delta.bueno ? "ok" : "crit") }}
          >
            <span aria-hidden>{delta.bueno ? "▲" : "▼"}</span>
            {delta.texto}
          </span>
        )}
      </div>
      <div className="mt-1.5 font-serif text-3xl tracking-tight">{valor}</div>
      {sub && <div className="mt-0.5 text-xs text-neutral-400">{sub}</div>}
      {spark && (
        <div className="mt-2 -mb-1">
          <MiniLineChart data={spark.data} color={col(spark.colorKey)} />
        </div>
      )}
    </div>
  );
}
