"use client";

// ──────────────────────────────────────────────────────────────────────────
// GAUGE CIRCULAR (anillo de progreso)
// Para la "salud general de planta" y el OEE global. Color semántico según el
// porcentaje (verde ≥85, ámbar ≥60, rojo por debajo). Portado de la función
// gaugeCircular() de la demo.
// ──────────────────────────────────────────────────────────────────────────

import { ARC, col } from "@/lib/constants";
import { useTheme } from "@/lib/state/ThemeProvider";

interface GaugeCircularProps {
  /** Porcentaje 0..100. */
  pct: number;
  label: string;
}

const R = 46;

export function GaugeCircular({ pct, label }: GaugeCircularProps) {
  const { dark } = useTheme();
  const c = 2 * Math.PI * R;
  const off = c * (1 - pct / 100);
  const color = pct >= 60 ? col("ok", dark) : col("crit", dark);
  const fondo = ARC;

  return (
    <svg viewBox="0 0 120 120" width={120} height={120} role="img" aria-label={`${Math.round(pct)} ${label}`}>
      <circle cx={60} cy={60} r={R} fill="none" stroke={fondo} strokeWidth={9} />
      <circle
        cx={60}
        cy={60}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 60 60)"
      />
      <text x={60} y={58} textAnchor="middle" fontSize={26} fontWeight={600} fill="currentColor" className="font-sans tabular-nums">
        {Math.round(pct)}
      </text>
      <text x={60} y={76} textAnchor="middle" fontSize={10} fill="#9ca3af">
        {label}
      </text>
    </svg>
  );
}
