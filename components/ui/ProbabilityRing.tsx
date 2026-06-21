"use client";

// ──────────────────────────────────────────────────────────────────────────
// ANILLO DE PROBABILIDAD — radial compacto para las tarjetas de máquina
// Tonos de verde graduados por probabilidad (más claro = más sano) y ROJO
// cuando es alta (≥ 60 %). Coherente con `tonoVerde` y el mapa de salud.
// ──────────────────────────────────────────────────────────────────────────

import { col, tonoVerde } from "@/lib/constants";

export function ProbabilityRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const stroke = pct >= 60 ? col("crit") : tonoVerde(pct / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(pct)}% de probabilidad de fallo`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-arc)" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={size * 0.28} fontWeight={600} fill="currentColor" className="font-mono">
        {Math.round(pct)}
      </text>
    </svg>
  );
}
