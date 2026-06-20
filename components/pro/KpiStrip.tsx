"use client";

// ──────────────────────────────────────────────────────────────────────────
// TIRA DE KPIs HERO (NEXIA Pro · premium expresivo)
// Chip de icono con color, número grande, chip de delta y mini-sparkline.
// Compacto y escaneable. Todo el color sale de los tokens de la paleta.
// ──────────────────────────────────────────────────────────────────────────

import type { ReactNode } from "react";
import { AHORRO_POR_PARADA, type ColorKey, col, estadoColorKey, soft } from "@/lib/constants";
import { ordenarFlota } from "@/lib/domain/flota";
import { AHORRO_SEMANAL, SALUD_SEMANAL } from "@/lib/data/trend";
import { dinero } from "@/lib/format";
import type { Maquina } from "@/lib/types";
import type { Savings } from "@/lib/state/useFleet";
import { Icon, type IconName } from "../ui/Icon";
import { MiniLineChart } from "../ui/MiniLineChart";
import { SURFACE } from "./surface";

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
  const paradasSemanal = AHORRO_SEMANAL.map((x) => Math.round(x / AHORRO_POR_PARADA));

  const dots = ordenarFlota(maquinas).map((m) => col(estadoColorKey(m.estado)));

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <KpiTile
        titulo="Ahorro · mes"
        icono="chart"
        accentKey="ok"
        valor={dinero(savings.ahorroMes)}
        sub="en paradas evitadas"
        spark={{ data: AHORRO_SEMANAL, colorKey: "ok" }}
        delta={{ texto: `+${ahorroPct}%`, bueno: true }}
      />
      <KpiTile
        titulo="Paradas evitadas"
        icono="shield"
        accentKey="brand"
        valor={String(savings.paradasEvitadas)}
        sub="este mes"
        spark={{ data: paradasSemanal, colorKey: "brand" }}
      />
      <KpiTile
        titulo="Salud de planta"
        icono="gauge"
        accentKey="brand"
        valor={`${salud}%`}
        sub="activos estables"
        spark={{ data: SALUD_SEMANAL, colorKey: "brand" }}
        delta={{ texto: `${saludDelta >= 0 ? "+" : ""}${saludDelta} pts`, bueno: saludDelta >= 0 }}
      />
      <KpiTile
        titulo="Requieren atención"
        icono={enRiesgo > 0 ? "alert" : "check"}
        accentKey={enRiesgo > 0 ? "crit" : "ok"}
        valor={String(enRiesgo)}
        sub={enRiesgo === 0 ? "todo en orden" : enRiesgo === 1 ? "máquina en riesgo" : "máquinas en riesgo"}
        extra={
          <div className="flex h-full items-center gap-1.5">
            {dots.map((c, i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
        }
      />
    </div>
  );
}

function KpiTile({
  titulo,
  icono,
  accentKey,
  valor,
  sub,
  spark,
  delta,
  extra,
}: {
  titulo: string;
  icono: IconName;
  accentKey: ColorKey;
  valor: string;
  sub?: string;
  spark?: { data: number[]; colorKey: ColorKey };
  delta?: Delta;
  extra?: ReactNode;
}) {
  return (
    <div className={`${SURFACE} px-4 py-3.5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: soft(accentKey, 16), color: col(accentKey) }}>
            <Icon name={icono} className="h-4 w-4" />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-400">{titulo}</span>
        </div>
        {delta && (
          <span
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: soft(delta.bueno ? "ok" : "crit"), color: col(delta.bueno ? "ok" : "crit") }}
          >
            <span aria-hidden>{delta.bueno ? "▲" : "▼"}</span>
            {delta.texto}
          </span>
        )}
      </div>

      <div className="mt-2.5 font-serif text-3xl leading-none tracking-tight">{valor}</div>
      {sub && <div className="mt-1 text-xs text-neutral-400">{sub}</div>}

      <div className="mt-2 h-9 overflow-hidden">{spark ? <MiniLineChart data={spark.data} color={col(spark.colorKey)} /> : extra}</div>
    </div>
  );
}
