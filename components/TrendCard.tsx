"use client";

// ──────────────────────────────────────────────────────────────────────────
// TENDENCIA · ROI (perfil gerencial)
// Ahorro acumulado y salud de planta en las últimas 8 semanas. Es la gráfica
// que justifica la renovación del contrato: muestra dirección y retorno.
// Visible solo para roles con permiso de tendencia (Admin/Jefe).
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { dinero } from "@/lib/format";
import { useTheme } from "@/lib/state/ThemeProvider";
import { MiniLineChart } from "./ui/MiniLineChart";

// Serie semanal estable (no aleatoria por render): 8 semanas.
const AHORRO_SEMANAL = [6, 9, 11, 14, 16, 19, 22, 24].map((k) => k * 1000);
const SALUD_SEMANAL = [71, 74, 73, 78, 80, 79, 82, 83];

export function TrendCard() {
  const { dark } = useTheme();
  const ahorroActual = AHORRO_SEMANAL[AHORRO_SEMANAL.length - 1];
  const saludActual = SALUD_SEMANAL[SALUD_SEMANAL.length - 1];
  const deltaAhorro = ahorroActual - AHORRO_SEMANAL[0];
  const deltaSalud = saludActual - SALUD_SEMANAL[0];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Panel
        titulo="Ahorro acumulado · 8 semanas"
        valor={dinero(ahorroActual)}
        delta={`+${dinero(deltaAhorro)}`}
        deltaColor={col("ok", dark)}
        data={AHORRO_SEMANAL}
        color={col("ok", dark)}
      />
      <Panel
        titulo="Salud de planta · 8 semanas"
        valor={`${saludActual}%`}
        delta={`${deltaSalud >= 0 ? "+" : ""}${deltaSalud} pts`}
        deltaColor={deltaSalud >= 0 ? col("ok", dark) : col("crit", dark)}
        data={SALUD_SEMANAL}
        color={col("brand", dark)}
      />
    </div>
  );
}

function Panel({ titulo, valor, delta, deltaColor, data, color }: { titulo: string; valor: string; delta: string; deltaColor: string; data: number[]; color: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">{titulo}</span>
        <span className="font-mono text-xs" style={{ color: deltaColor }}>
          {delta}
        </span>
      </div>
      <div className="mt-1 font-serif text-3xl tracking-tight">{valor}</div>
      <div className="mt-3">
        <MiniLineChart data={data} color={color} />
      </div>
    </div>
  );
}
