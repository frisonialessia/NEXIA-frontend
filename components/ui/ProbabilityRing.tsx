"use client";

// ──────────────────────────────────────────────────────────────────────────
// ANILLO DE PROBABILIDAD — radial compacto para las tarjetas de máquina
// Verde (bajo), ámbar (medio), rojo (alto). Color por token (se adapta al tema).
// ──────────────────────────────────────────────────────────────────────────

import { col } from "@/lib/constants";

export function ProbabilityRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  const key = pct >= 60 ? "crit" : "ok";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(pct)}% de probabilidad de fallo`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--c-arc)" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={col(key)}
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
