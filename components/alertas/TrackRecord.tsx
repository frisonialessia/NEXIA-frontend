"use client";

// ──────────────────────────────────────────────────────────────────────────
// REGISTRO DE ACIERTOS DEL MODELO (track record auditable)
// La métrica que convence a un comprador escéptico: de las alertas que tu
// equipo confirmó, cuántas eran fallos reales. Se alimenta de los veredictos
// human-in-the-loop (no es un número inventado: lo construye la auditoría).
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";
import { resumirRegistro } from "@/lib/domain/alertas";
import { useT } from "@/lib/state/I18nProvider";
import { useRegistro } from "@/lib/state/useFleet";
import { useTheme } from "@/lib/state/ThemeProvider";
import { SURFACE } from "../ui/Card";

export function TrackRecord() {
  const registro = useRegistro();
  const { dark } = useTheme();
  const t = useT();
  const r = resumirRegistro(registro);

  if (r.precision === null) {
    return (
      <div className={`${SURFACE} px-7 py-5 text-sm text-neutral-400`}>{t("track.empty")}</div>
    );
  }

  const pct = Math.round(r.precision * 100);
  const color = r.precision >= 0.8 ? col("ok", dark) : r.precision >= 0.6 ? col("warn", dark) : col("crit", dark);

  return (
    <div className={`${SURFACE} px-7 py-5`}>
      <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">{t("track.title")}</span>
      <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-4xl font-semibold" style={{ color }}>{pct}%</span>
            <span className="text-xs uppercase tracking-wider text-neutral-400">{t("track.precision")}</span>
          </div>
          <p className="mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">{t("track.sentence", { n: pct })}</p>
        </div>

        <div className="flex flex-1 flex-wrap gap-2">
          <Chip label={t("track.hits")} value={r.aciertos} color={col("ok", dark)} />
          <Chip label={t("track.false")} value={r.falsas} color={col("crit", dark)} />
          <Chip label={t("track.nc")} value={r.nc} color={col("gray", dark)} />
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-400">{t("track.basis", { n: r.auditadas })}</p>
    </div>
  );
}

function Chip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-neutral-100 px-3 py-2 dark:border-neutral-800">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="font-mono text-sm">{value}</span>
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
    </div>
  );
}
